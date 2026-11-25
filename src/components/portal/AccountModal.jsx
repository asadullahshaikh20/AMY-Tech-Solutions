import { useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Modal, Spinner } from './ui.jsx';

export default function AccountModal({ user, onClose, onLogout, notify }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 8) return setError('New password must be at least 8 characters.');
    setSaving(true);
    setError('');
    try {
      await api.changePassword(current, next);
      notify({ title: 'Password updated' });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      labelledBy="acct-title"
      onClose={onClose}
      title={
        <>
          <h2 id="acct-title" className="text-lg font-bold">{user.name}</h2>
          <p className="text-sm text-slate-400">{user.email}</p>
        </>
      }
      footer={
        <>
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:text-rose-300">
            <LogOut size={15} /> Sign out
          </button>
          <button onClick={onClose} className="btn-secondary !py-2">Close</button>
        </>
      }
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-ink-800/70 p-3">
          <dt className="text-xs text-slate-500">Account type</dt>
          <dd className="font-semibold capitalize text-white">{user.role === 'team' ? 'AMY team' : 'Client'}</dd>
        </div>
        <div className="rounded-xl bg-ink-800/70 p-3">
          <dt className="text-xs text-slate-500">{user.role === 'team' ? 'Organisation' : 'Business'}</dt>
          <dd className="truncate font-semibold text-white">{user.business}</dd>
        </div>
      </dl>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          <KeyRound size={15} /> Change password
        </h3>
        {error && <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
        <div>
          <label htmlFor="pw-cur" className="label">Current password</label>
          <input id="pw-cur" type="password" autoComplete="current-password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pw-new" className="label">New password</label>
          <input id="pw-new" type="password" autoComplete="new-password" className="input" value={next} onChange={(e) => setNext(e.target.value)} placeholder="8+ characters" />
        </div>
        <button type="submit" disabled={saving || !current || !next} className="btn-primary w-full">
          {saving && <Spinner className="h-4 w-4" />} Update password
        </button>
      </form>
    </Modal>
  );
}
