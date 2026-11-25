import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { timeAgo } from '../../lib/format.js';
import { Avatar } from './ui.jsx';

export default function ActivityFeed({ tasks, onOpen, limit = 7 }) {
  const items = useMemo(
    () =>
      tasks
        .flatMap((t) => t.history.map((h) => ({ ...h, task: t })))
        .sort((a, b) => new Date(b.at) - new Date(a.at))
        .slice(0, limit),
    [tasks, limit]
  );

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <Activity size={17} className="text-brand-400" /> Recent activity
      </h2>
      <ol className="mt-4 space-y-3">
        {items.length === 0 && <li className="text-sm text-slate-500">No activity yet. Submit your first request.</li>}
        {items.map((a, i) => (
          <li key={`${a.task.id}-${a.at}-${i}`} className="flex gap-3 text-sm">
            <Avatar memberKey={a.task.assignee} size="h-6 w-6 text-[9px]" />
            <div className="min-w-0">
              <button onClick={() => onOpen(a.task.id)} className="block w-full truncate text-left text-slate-200 hover:text-white">
                <span className="font-semibold text-orbit-300">{a.task.ref}</span>{' '}
                {a.kind === 'comment' ? `${a.author}: “${a.text}”` : a.text}
              </button>
              <span className="text-xs text-slate-500">{timeAgo(a.at)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
