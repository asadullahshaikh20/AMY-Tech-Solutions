import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './auth.js';
import { TEAM } from '../src/data/content.js';
import { createSampleTasks } from '../src/data/tasks.js';
import { DEMO_EMAIL, DEMO_PASSWORD, TEAM_PASSWORD } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Kept outside server/ so the dev file-watcher doesn't restart on every database write.
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const dbFile = process.env.DB_FILE || path.join(DATA_DIR, 'amy.db');
export const db = new DatabaseSync(dbFile);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone         TEXT NOT NULL DEFAULT '',
    business      TEXT NOT NULL DEFAULT '',
    business_type TEXT NOT NULL DEFAULT 'Other',
    role          TEXT NOT NULL CHECK (role IN ('client', 'team')),
    team_key      TEXT,
    plan          TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'growth', 'pro')),
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    category    TEXT NOT NULL,
    priority    TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'submitted',
    assignee    TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);

  CREATE TABLE IF NOT EXISTS task_events (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id   INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    at        TEXT NOT NULL,
    text      TEXT NOT NULL,
    kind      TEXT NOT NULL DEFAULT 'event' CHECK (kind IN ('event', 'comment')),
    author    TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_events_task ON task_events(task_id);

  CREATE TABLE IF NOT EXISTS bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ref           TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    business_type TEXT NOT NULL,
    phone         TEXT NOT NULL,
    service       TEXT NOT NULL,
    contact_time  TEXT NOT NULL,
    message       TEXT NOT NULL DEFAULT '',
    source        TEXT NOT NULL DEFAULT 'Website form',
    status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);

// Tasks start at AMY-1041 so references look like real ticket numbers.
const seq = db.prepare("SELECT seq FROM sqlite_sequence WHERE name = 'tasks'").get();
if (!seq) db.exec("INSERT INTO sqlite_sequence (name, seq) VALUES ('tasks', 1040)");

export { DEMO_EMAIL, DEMO_PASSWORD, usingDefaultTeamPassword } from './config.js';

export function teamEmail(key) {
  return `${key}@amy-team.local`;
}

/** Inserts the three founder accounts and a demo client with sample tickets, once. */
export function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) return false;

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, phone, business, business_type, role, team_key, plan, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const teamHash = hashPassword(TEAM_PASSWORD);
  for (const m of TEAM) {
    insertUser.run(m.name, teamEmail(m.key), '', 'AMY Tech Solutions', 'Other', 'team', m.key, 'pro', teamHash);
  }
  const demo = insertUser.run('Demo Client', DEMO_EMAIL, '', 'Indus Crafts Store (demo)', 'Retail', 'client', null, 'growth', hashPassword(DEMO_PASSWORD));
  seedDemoTasks(Number(demo.lastInsertRowid));
  return true;
}

export function seedDemoTasks(clientId) {
  const insertTask = db.prepare(
    `INSERT INTO tasks (id, client_id, title, description, category, priority, status, assignee, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertEvent = db.prepare('INSERT INTO task_events (task_id, at, text, kind) VALUES (?, ?, ?, ?)');
  for (const t of createSampleTasks()) {
    insertTask.run(t.id, clientId, t.title, t.description, t.category, t.priority, t.status, t.assignee, t.createdAt, t.updatedAt);
    for (const h of t.history) insertEvent.run(t.id, h.at, h.text, 'event');
  }
}

/** Restores the demo client's tickets to the original sample set. */
export function resetDemoTasks(clientId) {
  db.prepare('DELETE FROM tasks WHERE client_id = ?').run(clientId);
  seedDemoTasks(clientId);
}

export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
