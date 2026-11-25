import { forwardRef, useState } from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';
import { TEAM, TEAM_BY_KEY } from '../../data/content.js';
import { CATEGORIES, CATEGORY_BY_KEY, PRIORITIES } from '../../data/tasks.js';
import { Spinner } from './ui.jsx';

const EMPTY = { category: 'web', title: '', description: '', priority: 'medium', assignee: '', clientId: '' };

/** Task submission form. Pass `clients` (team mode) to choose which client the request is for. */
const NewRequestForm = forwardRef(function NewRequestForm({ onCreate, clients, turnaround }, titleRef) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (clients && !form.clientId) errs.clientId = 'Choose a client.';
    if (form.title.trim().length < 4) errs.title = 'Give the task a short title (at least 4 characters).';
    if (form.description.trim().length < 10) errs.description = 'Describe what you need (at least 10 characters).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const task = await onCreate({
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      assignee: form.assignee || undefined,
      clientId: clients ? Number(form.clientId) : undefined,
    });
    setSaving(false);
    if (task) setForm((f) => ({ ...EMPTY, clientId: f.clientId }));
  };

  const auto = TEAM_BY_KEY[CATEGORY_BY_KEY[form.category].assignee];
  const handler = form.assignee ? TEAM_BY_KEY[form.assignee] : auto;

  return (
    <form onSubmit={submit} noValidate className="glass rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <MessageSquarePlus size={18} className="text-orbit-400" /> {clients ? 'Log a client request' : 'New request'}
      </h2>
      <div className="mt-4 space-y-4">
        {clients && (
          <div>
            <label htmlFor="nr-client" className="label">Client</label>
            <select id="nr-client" className="input" value={form.clientId} onChange={(e) => set('clientId', e.target.value)} aria-invalid={!!errors.clientId}>
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.business} ({c.name})</option>
              ))}
            </select>
            {errors.clientId && <p className="mt-1 text-xs text-rose-400">{errors.clientId}</p>}
          </div>
        )}
        <div>
          <span className="label">Service category</span>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                aria-pressed={form.category === c.key}
                onClick={() => set('category', c.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  form.category === c.key ? 'border-brand-500 bg-brand-600/25 text-white' : 'border-ink-700 bg-ink-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="nr-title" className="label">Task title</label>
          <input
            id="nr-title"
            ref={titleRef}
            className="input"
            value={form.title}
            maxLength={80}
            aria-invalid={!!errors.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Add a contact form to the homepage"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="nr-desc" className="label">Description</label>
          <textarea
            id="nr-desc"
            rows={3}
            className="input resize-none"
            value={form.description}
            maxLength={500}
            aria-invalid={!!errors.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What should change, where, and by when?"
          />
          {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nr-priority" className="label">Priority</label>
            <select id="nr-priority" className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nr-assignee" className="label">Assign to</label>
            <select id="nr-assignee" className="input" value={form.assignee} onChange={(e) => set('assignee', e.target.value)}>
              <option value="">Auto</option>
              {TEAM.map((m) => (
                <option key={m.key} value={m.key}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="-mt-1 text-xs text-slate-500">
          Handled by <span className="font-semibold text-slate-300">{handler.name}</span>
          {!form.assignee && ' (auto-assigned by category)'}
          {turnaround && ` · ${turnaround} turnaround`}
        </p>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner className="h-4 w-4" /> : <Send size={16} />} Submit request
        </button>
      </div>
    </form>
  );
});

export default NewRequestForm;
