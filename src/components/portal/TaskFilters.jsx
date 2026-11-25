import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { TEAM } from '../../data/content.js';
import { CATEGORIES } from '../../data/tasks.js';

export function useTaskFilters(tasks) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [member, setMember] = useState('all');
  const [client, setClient] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tasks || []).filter(
      (t) =>
        (category === 'all' || t.category === category) &&
        (member === 'all' || t.assignee === member) &&
        (client === 'all' || String(t.client.id) === client) &&
        (!q || `${t.title} ${t.description} ${t.ref} ${t.client.business}`.toLowerCase().includes(q))
    );
  }, [tasks, query, category, member, client]);

  return { filtered, query, setQuery, category, setCategory, member, setMember, client, setClient };
}

export default function TaskFilters({ f, clients, children }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <div className="relative min-w-56 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input !pl-9" placeholder="Search tasks or reference (e.g. AMY-1043)" value={f.query} onChange={(e) => f.setQuery(e.target.value)} aria-label="Search tasks" />
      </div>
      <div className={`grid gap-3 md:flex ${clients ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {clients && (
          <select className="input md:w-44" value={f.client} onChange={(e) => f.setClient(e.target.value)} aria-label="Filter by client">
            <option value="all">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.business}</option>
            ))}
          </select>
        )}
        <select className="input md:w-40" value={f.category} onChange={(e) => f.setCategory(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <select className="input md:w-36" value={f.member} onChange={(e) => f.setMember(e.target.value)} aria-label="Filter by team member">
          <option value="all">Whole team</option>
          {TEAM.map((m) => (
            <option key={m.key} value={m.key}>{m.name}</option>
          ))}
        </select>
      </div>
      {children}
    </div>
  );
}
