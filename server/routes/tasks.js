import { Router } from 'express';
import { db, DEMO_EMAIL, resetDemoTasks, transaction } from '../db.js';
import { requireAuth } from '../auth.js';
import { HttpError, nowIso, oneOf, str } from '../util.js';
import { PLAN_BY_KEY, TEAM_BY_KEY } from '../../src/data/content.js';
import { CATEGORY_BY_KEY, PRIORITIES, STATUSES, STATUS_LABEL } from '../../src/data/tasks.js';

const router = Router();
router.use(requireAuth);

const STATUS_KEYS = STATUSES.map((s) => s.key);
const CATEGORY_KEYS = Object.keys(CATEGORY_BY_KEY);
const PRIORITY_KEYS = PRIORITIES.map((p) => p.key);
const TEAM_KEYS = Object.keys(TEAM_BY_KEY);
const ACTIVE = new Set(['progress', 'review']);

const TASK_SELECT = `
  SELECT t.*, u.name AS client_name, u.business AS client_business, u.plan AS client_plan
  FROM tasks t JOIN users u ON u.id = t.client_id`;

function serialize(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const events = db
    .prepare(`SELECT task_id, at, text, kind, author FROM task_events WHERE task_id IN (${ids.map(() => '?').join(',')}) ORDER BY at, id`)
    .all(...ids);
  const byTask = new Map(ids.map((id) => [id, []]));
  for (const e of events) byTask.get(e.task_id).push({ at: e.at, text: e.text, kind: e.kind, author: e.author });
  return rows.map((r) => ({
    id: r.id,
    ref: `AMY-${r.id}`,
    title: r.title,
    description: r.description,
    category: r.category,
    priority: r.priority,
    status: r.status,
    assignee: r.assignee,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    client: { id: r.client_id, name: r.client_name, business: r.client_business, plan: r.client_plan },
    history: byTask.get(r.id),
  }));
}

function loadTask(id, user) {
  const row = db.prepare(`${TASK_SELECT} WHERE t.id = ?`).get(id);
  if (!row || (user.role !== 'team' && row.client_id !== user.id)) throw new HttpError(404, 'Task not found.');
  return row;
}

const addEvent = (taskId, text, kind = 'event', author = null) =>
  db.prepare('INSERT INTO task_events (task_id, at, text, kind, author) VALUES (?, ?, ?, ?, ?)').run(taskId, nowIso(), text, kind, author);

const touch = (taskId) => db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(nowIso(), taskId);

const actorName = (user) => (user.role === 'team' ? user.name : 'client');

router.get('/', (req, res) => {
  const rows =
    req.user.role === 'team'
      ? db.prepare(`${TASK_SELECT} ORDER BY t.updated_at DESC`).all()
      : db.prepare(`${TASK_SELECT} WHERE t.client_id = ? ORDER BY t.updated_at DESC`).all(req.user.id);
  res.json({ tasks: serialize(rows) });
});

router.post('/', (req, res) => {
  const b = req.body || {};
  let clientId = req.user.id;
  if (req.user.role === 'team') {
    clientId = Number(b.clientId);
    const client = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'client'").get(clientId);
    if (!client) throw new HttpError(400, 'Choose which client this request is for.');
  }
  const category = oneOf(b.category, CATEGORY_KEYS, 'Category');
  const data = {
    title: str(b.title, { field: 'Title', min: 4, max: 80 }),
    description: str(b.description, { field: 'Description', min: 10, max: 500 }),
    category,
    priority: oneOf(b.priority || 'medium', PRIORITY_KEYS, 'Priority'),
    assignee: b.assignee ? oneOf(b.assignee, TEAM_KEYS, 'Assignee') : CATEGORY_BY_KEY[category].assignee,
  };
  const id = transaction(() => {
    const now = nowIso();
    const r = db
      .prepare(
        `INSERT INTO tasks (client_id, title, description, category, priority, status, assignee, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?)`
      )
      .run(clientId, data.title, data.description, data.category, data.priority, data.assignee, now, now);
    const taskId = Number(r.lastInsertRowid);
    addEvent(taskId, req.user.role === 'team' ? `Request logged by ${req.user.name}` : 'Request submitted by client');
    addEvent(taskId, `${b.assignee ? 'Assigned' : 'Auto-assigned'} to ${TEAM_BY_KEY[data.assignee].name}`);
    return taskId;
  });
  res.status(201).json({ task: serialize([loadTask(id, req.user)])[0] });
});

router.patch('/:id', (req, res) => {
  const task = loadTask(Number(req.params.id), req.user);
  const b = req.body || {};
  const isTeam = req.user.role === 'team';
  const who = actorName(req.user);

  transaction(() => {
    if (b.status !== undefined && b.status !== task.status) {
      const to = oneOf(b.status, STATUS_KEYS, 'Status');
      if (!isTeam) {
        // Clients review delivered work: approve it or send it back for changes.
        const allowed = task.status === 'review' && (to === 'done' || to === 'progress');
        if (!allowed) throw new HttpError(403, 'The AMY team moves tasks through the pipeline. You can approve or request changes once a task is in Quality Review.');
      }
      if (ACTIVE.has(to) && !ACTIVE.has(task.status)) {
        const plan = PLAN_BY_KEY[task.client_plan];
        const active = db
          .prepare("SELECT COUNT(*) AS n FROM tasks WHERE client_id = ? AND status IN ('progress', 'review')")
          .get(task.client_id).n;
        if (active >= plan.activeLimit) {
          throw new HttpError(
            409,
            `${plan.name} plan limit reached: ${plan.activeLimit} active task${plan.activeLimit > 1 ? 's' : ''} at a time. Finish one first or upgrade the plan.`
          );
        }
      }
      db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(to, task.id);
      const label =
        !isTeam && to === 'done' ? 'Approved by client' : !isTeam && to === 'progress' ? 'Client requested changes' : `Moved to ${STATUS_LABEL[to]} by ${who}`;
      addEvent(task.id, label);
    }
    if (b.assignee !== undefined && b.assignee !== task.assignee) {
      if (!isTeam) throw new HttpError(403, 'Only the AMY team can reassign tasks.');
      const to = oneOf(b.assignee, TEAM_KEYS, 'Assignee');
      db.prepare('UPDATE tasks SET assignee = ? WHERE id = ?').run(to, task.id);
      addEvent(task.id, `Reassigned to ${TEAM_BY_KEY[to].name} by ${who}`);
    }
    if (b.priority !== undefined && b.priority !== task.priority) {
      const to = oneOf(b.priority, PRIORITY_KEYS, 'Priority');
      db.prepare('UPDATE tasks SET priority = ? WHERE id = ?').run(to, task.id);
      addEvent(task.id, `Priority set to ${to[0].toUpperCase()}${to.slice(1)} by ${who}`);
    }
    touch(task.id);
  });
  res.json({ task: serialize([loadTask(task.id, req.user)])[0] });
});

router.post('/:id/comments', (req, res) => {
  const task = loadTask(Number(req.params.id), req.user);
  const text = str(req.body?.text, { field: 'Comment', max: 300 });
  transaction(() => {
    addEvent(task.id, text, 'comment', req.user.role === 'team' ? req.user.name : req.user.name || 'Client');
    touch(task.id);
  });
  res.status(201).json({ task: serialize([loadTask(task.id, req.user)])[0] });
});

router.delete('/:id', (req, res) => {
  const task = loadTask(Number(req.params.id), req.user);
  if (req.user.role !== 'team' && task.status !== 'submitted') {
    throw new HttpError(403, 'You can only withdraw a request before work starts. Add a comment to ask the team instead.');
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
  res.json({ ok: true });
});

/** Demo account only: restore the sample tickets. */
router.post('/reset-demo', (req, res) => {
  if (req.user.email.toLowerCase() !== DEMO_EMAIL) throw new HttpError(403, 'Only the demo account can be reset.');
  transaction(() => resetDemoTasks(req.user.id));
  db.prepare("UPDATE users SET plan = 'growth' WHERE id = ?").run(req.user.id);
  const rows = db.prepare(`${TASK_SELECT} WHERE t.client_id = ? ORDER BY t.updated_at DESC`).all(req.user.id);
  res.json({ tasks: serialize(rows) });
});

export default router;
