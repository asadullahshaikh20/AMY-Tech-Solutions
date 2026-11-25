import { useState } from 'react';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Plus, Undo2 } from 'lucide-react';
import { CATEGORY_BY_KEY, PRIORITY_BY_KEY, STATUSES } from '../../data/tasks.js';
import { timeAgo } from '../../lib/format.js';
import { Avatar } from './ui.jsx';

/**
 * Kanban board shared by both portals.
 * mode="team": drag-and-drop and arrows move any task.
 * mode="client": cards in Quality Review get Approve / Request changes buttons.
 */
export default function TaskBoard({ tasks, mode, busyIds, onMove, onOpen, onNewRequest, showClient = false }) {
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const isTeam = mode === 'team';

  const step = (task, dir) => {
    const idx = STATUSES.findIndex((s) => s.key === task.status) + dir;
    if (idx >= 0 && idx < STATUSES.length) onMove(task, STATUSES[idx].key);
  };

  return (
    <div className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-thin lg:grid lg:snap-none lg:grid-cols-4 lg:overflow-visible">
      {STATUSES.map((col) => {
        const items = tasks.filter((t) => t.status === col.key).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const dropProps = isTeam
          ? {
              onDragOver: (e) => {
                e.preventDefault();
                setDropTarget(col.key);
              },
              onDragLeave: (e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null);
              },
              onDrop: (e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData('text/plain')) || dragId;
                const task = tasks.find((t) => t.id === id);
                if (task) onMove(task, col.key);
                setDropTarget(null);
                setDragId(null);
              },
            }
          : {};
        return (
          <div
            key={col.key}
            {...dropProps}
            className={`flex min-h-[20rem] w-[82vw] max-w-[22rem] shrink-0 snap-start flex-col rounded-2xl border bg-ink-900/60 p-3 transition sm:w-80 lg:w-auto lg:max-w-none ${
              dropTarget === col.key ? 'border-brand-500 bg-brand-600/10' : 'border-ink-700'
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} /> {col.label}
              </h3>
              <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs font-semibold text-slate-300">{items.length}</span>
            </div>
            <ul className="flex flex-1 flex-col gap-3">
              {items.length === 0 && (
                <li className="grid flex-1 place-items-center rounded-xl border border-dashed border-ink-700 p-6 text-center text-xs text-slate-500">
                  {col.key === 'submitted' ? 'No requests waiting' : isTeam ? 'Drop a task here' : 'Nothing here yet'}
                </li>
              )}
              {items.map((t) => {
                const cat = CATEGORY_BY_KEY[t.category];
                const pri = PRIORITY_BY_KEY[t.priority];
                const idx = STATUSES.findIndex((s) => s.key === t.status);
                const busy = busyIds.has(t.id);
                return (
                  <li
                    key={t.id}
                    draggable={isTeam && !busy}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(t.id));
                      e.dataTransfer.effectAllowed = 'move';
                      setDragId(t.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDropTarget(null);
                    }}
                    className={`group rounded-xl border bg-surface p-3.5 shadow-sm transition hover:border-brand-500/60 ${col.ring} ${
                      isTeam ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${dragId === t.id || busy ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cat.badge}`}>{cat.label}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${pri.badge}`}>
                        {t.priority === 'urgent' && <AlertTriangle size={10} className="mr-1 inline" />}
                        {pri.label}
                      </span>
                    </div>
                    <button onClick={() => onOpen(t.id)} className="mt-2.5 block w-full text-left">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {t.ref}
                        {showClient && <span className="text-orbit-300/80"> · {t.client.business}</span>}
                      </span>
                      <span className="block text-sm font-semibold leading-snug text-white group-hover:text-brand-300">{t.title}</span>
                      <span className="mt-1 line-clamp-2 block text-xs text-slate-400">{t.description}</span>
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <Avatar memberKey={t.assignee} />
                        <span className="truncate text-xs text-slate-400">{timeAgo(t.updatedAt)}</span>
                      </span>
                      {isTeam && (
                        <span className="flex gap-1">
                          <button
                            onClick={() => step(t, -1)}
                            disabled={idx === 0 || busy}
                            aria-label={`Move ${t.ref} back`}
                            className="rounded-lg border border-ink-700 p-1.5 text-slate-400 transition hover:text-white disabled:opacity-30"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => step(t, 1)}
                            disabled={idx === STATUSES.length - 1 || busy}
                            aria-label={`Move ${t.ref} forward`}
                            className="rounded-lg border border-ink-700 p-1.5 text-slate-400 transition hover:border-brand-500 hover:text-white disabled:opacity-30"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                    {!isTeam && t.status === 'review' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-700 pt-3">
                        <button
                          onClick={() => onMove(t, 'progress')}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-ink-700 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:border-orbit-500 hover:text-orbit-300"
                        >
                          <Undo2 size={13} /> Changes
                        </button>
                        <button
                          onClick={() => onMove(t, 'done')}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600/80 px-2 py-1.5 text-xs font-semibold text-snow hover:bg-emerald-600"
                        >
                          <Check size={13} /> Approve
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {col.key === 'submitted' && onNewRequest && (
              <button
                onClick={onNewRequest}
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-700 py-2 text-xs font-semibold text-slate-400 hover:border-brand-500 hover:text-white"
              >
                <Plus size={14} /> New request
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
