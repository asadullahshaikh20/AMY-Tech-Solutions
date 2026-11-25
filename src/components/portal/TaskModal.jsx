import { useState } from 'react';
import { Building2, Check, MessageSquare, Send, Trash2, Undo2 } from 'lucide-react';
import { TEAM, TEAM_BY_KEY } from '../../data/content.js';
import { CATEGORY_BY_KEY, PRIORITIES, STATUSES, STATUS_LABEL } from '../../data/tasks.js';
import { Avatar, Modal, Spinner } from './ui.jsx';

export default function TaskModal({ task, mode, onClose, onUpdate, onComment, onDelete }) {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isTeam = mode === 'team';
  const cat = CATEGORY_BY_KEY[task.category];
  const member = TEAM_BY_KEY[task.assignee];
  const canDelete = isTeam || task.status === 'submitted';

  const send = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    const ok = await onComment(comment.trim());
    setSending(false);
    if (ok) setComment('');
  };

  return (
    <Modal
      wide
      labelledBy="task-modal-title"
      onClose={onClose}
      title={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{task.ref}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cat.badge}`}>{cat.label}</span>
            <span className="rounded-md bg-ink-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">{STATUS_LABEL[task.status]}</span>
          </div>
          <h2 id="task-modal-title" className="mt-1.5 text-lg font-bold sm:text-xl">{task.title}</h2>
        </>
      }
      footer={
        <>
          {canDelete ? (
            <button
              onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                confirmDelete ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <Trash2 size={15} /> {confirmDelete ? 'Confirm' : isTeam ? 'Delete' : 'Withdraw request'}
            </button>
          ) : (
            <span />
          )}
          <button onClick={onClose} className="btn-secondary !py-2">Done</button>
        </>
      }
    >
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{task.description}</p>

      {isTeam && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-ink-800/70 px-3 py-2 text-sm text-slate-300">
          <Building2 size={15} className="text-orbit-400" />
          <span>
            <strong className="text-white">{task.client.business}</strong> · {task.client.name} · {task.client.plan} plan
          </span>
        </p>
      )}

      {isTeam ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="m-status" className="label">Status</label>
            <select id="m-status" className="input" value={task.status} onChange={(e) => onUpdate({ status: e.target.value })}>
              {STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="m-assignee" className="label">Assigned to</label>
            <select id="m-assignee" className="input" value={task.assignee} onChange={(e) => onUpdate({ assignee: e.target.value })}>
              {TEAM.map((m) => (
                <option key={m.key} value={m.key}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="m-priority" className="label">Priority</label>
            <select id="m-priority" className="input" value={task.priority} onChange={(e) => onUpdate({ priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/50 p-3">
            <Avatar memberKey={task.assignee} size="h-9 w-9 text-xs" />
            <div className="text-sm">
              <p className="font-semibold text-white">{member.name}</p>
              <p className="text-xs text-slate-400">{member.role}</p>
            </div>
          </div>
          <div>
            <label htmlFor="m-priority" className="label">Priority</label>
            <select id="m-priority" className="input" value={task.priority} onChange={(e) => onUpdate({ priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!isTeam && task.status === 'review' && (
        <div className="mt-4 rounded-2xl border border-orbit-500/40 bg-orbit-500/10 p-4">
          <p className="text-sm text-orbit-100">This work is ready for your review. Approve it, or send it back with a comment explaining what to change.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => onUpdate({ status: 'done' })} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-snow hover:bg-emerald-500">
              <Check size={15} /> Approve & complete
            </button>
            <button onClick={() => onUpdate({ status: 'progress' })} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-orbit-500">
              <Undo2 size={15} /> Request changes
            </button>
          </div>
        </div>
      )}

      <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-slate-400">Timeline</h3>
      <ol className="relative space-y-3 border-l border-ink-700 pl-5">
        {[...task.history].reverse().map((h, i) => (
          <li key={`${h.at}-${i}`} className="relative">
            <span className={`absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-ink-900 ${i === 0 ? 'bg-orbit-500' : 'bg-ink-700'}`} />
            {h.kind === 'comment' ? (
              <div className="rounded-lg bg-ink-800 px-3 py-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                  <MessageSquare size={12} /> {h.author}
                </p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-slate-200">{h.text}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-300">{h.text}</p>
            )}
            <p className="text-xs text-slate-500">{new Date(h.at).toLocaleString()}</p>
          </li>
        ))}
      </ol>

      <form onSubmit={send} className="mt-5 flex gap-2">
        <input
          className="input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={isTeam ? 'Reply to the client…' : 'Add a comment for the team…'}
          aria-label="Comment"
          maxLength={300}
        />
        <button type="submit" className="btn-secondary !px-4" disabled={!comment.trim() || sending} aria-label="Post comment">
          {sending ? <Spinner className="h-4 w-4" /> : <Send size={16} />}
        </button>
      </form>
    </Modal>
  );
}
