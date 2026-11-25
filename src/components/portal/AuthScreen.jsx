import { useState } from 'react';
import { ArrowLeft, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { LogoMark } from '../Logo.jsx';
import { BUSINESS_TYPES, PLANS } from '../../data/content.js';
import { api } from '../../lib/api.js';
import { isValidPhone } from '../../lib/format.js';
import { Spinner } from './ui.jsx';

const EMPTY_REG = { name: '', business: '', businessType: 'Retail', email: '', phone: '', plan: 'growth', password: '' };

export default function AuthScreen({ onAuthed, onBack }) {
  const [tab, setTab] = useState('login');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [reg, setReg] = useState(EMPTY_REG);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(null); // 'login' | 'register' | 'demo'

  const run = async (kind, fn) => {
    setError('');
    setLoading(kind);
    try {
      const { user } = await fn();
      onAuthed(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const submitLogin = (e) => {
    e.preventDefault();
    if (!login.email || !login.password) return setError('Enter your email and password.');
    run('login', () => api.login(login.email.trim(), login.password));
  };

  const submitRegister = (e) => {
    e.preventDefault();
    if (reg.name.trim().length < 2) return setError('Please enter your name.');
    if (reg.business.trim().length < 2) return setError('Please enter your business name.');
    if (!isValidPhone(reg.phone)) return setError('Enter a valid phone number, e.g. 0300 1234567.');
    if (reg.password.length < 8) return setError('Password must be at least 8 characters.');
    run('register', () => api.register({ ...reg, name: reg.name.trim(), business: reg.business.trim(), email: reg.email.trim() }));
  };

  const demo = () =>
    run('demo', async () => {
      const creds = await api.demoCredentials();
      return api.login(creds.email, creds.password);
    });

  const setR = (k) => (e) => setReg((r) => ({ ...r, [k]: e.target.value }));

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-24 sm:pt-28">
      <div className={`relative mx-auto transition-all ${tab === 'register' ? 'max-w-xl' : 'max-w-md'}`}>
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to website
        </button>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="h-14 w-14" />
            <h1 className="mt-3 text-2xl font-bold">Client Portal</h1>
            <p className="mt-1 text-sm text-slate-400">Submit requests and track every task with the AMY team.</p>
          </div>

          <button onClick={demo} disabled={!!loading} className="btn-primary mt-6 w-full">
            {loading === 'demo' ? <Spinner className="h-4 w-4" /> : <Sparkles size={16} />} Explore with the demo account
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-ink-700" /> or use your account <span className="h-px flex-1 bg-ink-700" />
          </div>

          <div role="tablist" className="grid grid-cols-2 rounded-xl border border-ink-700 bg-ink-900 p-1">
            {[
              ['login', 'Sign in'],
              ['register', 'Create account'],
            ].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  setError('');
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${tab === key ? 'bg-brand-600 text-snow' : 'text-slate-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}

          {tab === 'login' ? (
            <form onSubmit={submitLogin} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="l-email" className="label">Email</label>
                <input id="l-email" type="email" autoComplete="email" className="input" value={login.email} onChange={(e) => setLogin((l) => ({ ...l, email: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="l-pass" className="label">Password</label>
                <input id="l-pass" type="password" autoComplete="current-password" className="input" value={login.password} onChange={(e) => setLogin((l) => ({ ...l, password: e.target.value }))} />
              </div>
              <button type="submit" disabled={!!loading} className="btn-secondary w-full">
                {loading === 'login' ? <Spinner className="h-4 w-4" /> : <LogIn size={16} />} Sign in
              </button>
              <p className="text-center text-xs text-slate-500">AMY team members sign in here too.</p>
            </form>
          ) : (
            <form onSubmit={submitRegister} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="r-name" className="label">Your name</label>
                <input id="r-name" autoComplete="name" className="input" value={reg.name} onChange={setR('name')} maxLength={60} />
              </div>
              <div>
                <label htmlFor="r-business" className="label">Business name</label>
                <input id="r-business" autoComplete="organization" className="input" value={reg.business} onChange={setR('business')} maxLength={80} />
              </div>
              <div>
                <label htmlFor="r-type" className="label">Business type</label>
                <select id="r-type" className="input" value={reg.businessType} onChange={setR('businessType')}>
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="r-plan" className="label">Plan</label>
                <select id="r-plan" className="input" value={reg.plan} onChange={setR('plan')}>
                  {PLANS.map((p) => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="r-email" className="label">Email</label>
                <input id="r-email" type="email" autoComplete="email" className="input" value={reg.email} onChange={setR('email')} maxLength={120} />
              </div>
              <div>
                <label htmlFor="r-phone" className="label">Phone / WhatsApp</label>
                <input id="r-phone" type="tel" autoComplete="tel" className="input" value={reg.phone} onChange={setR('phone')} placeholder="0300 1234567" maxLength={20} />
              </div>
              <div>
                <label htmlFor="r-pass" className="label">Password</label>
                <input id="r-pass" type="password" autoComplete="new-password" className="input" value={reg.password} onChange={setR('password')} placeholder="8+ characters" maxLength={100} />
              </div>
              <button type="submit" disabled={!!loading} className="btn-secondary w-full sm:col-span-2">
                {loading === 'register' ? <Spinner className="h-4 w-4" /> : <UserPlus size={16} />} Create my account
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
