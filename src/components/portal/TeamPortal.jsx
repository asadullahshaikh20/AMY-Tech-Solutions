import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2, CalendarCheck, CircleCheck, Clock, Inbox, KanbanSquare, Layers, MessageCircle, Phone, RefreshCw, Trash2, UserCircle2, Users,
} from 'lucide-react';
import { PLAN_BY_KEY, TEAM_BY_KEY } from '../../data/content.js';
import { STATUS_LABEL } from '../../data/tasks.js';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/format.js';
import useTasks from './useTasks.js';
import TaskBoard from './TaskBoard.jsx';
import TaskModal from './TaskModal.jsx';
import NewRequestForm from './NewRequestForm.jsx';
import ActivityFeed from './ActivityFeed.jsx';
import TaskFilters, { useTaskFilters } from './TaskFilters.jsx';
import AccountModal from './AccountModal.jsx';
import { LoadError } from './ClientPortal.jsx';
import { Avatar, FullPageLoader, StatCard, whatsappLink } from './ui.jsx';

const BOOKING_STATUSES = [
  { key: 'new', label: 'New', tone: 'bg-orbit-500/20 text-orbit-300' },
  { key: 'contacted', label: 'Contacted', tone: 'bg-brand-600/20 text-brand-300' },
  { key: 'converted', label: 'Converted', tone: 'bg-emerald-500/20 text-emerald-300' },
  { key: 'closed', label: 'Closed', tone: 'bg-slate-500/20 text-slate-300' },
];
const BOOKING_TONE = Object.fromEntries(BOOKING_STATUSES.map((s) => [s.key, s.tone]));

export default function TeamPortal({ user, notify, onLogout, onUnauthorized }) {
  const { tasks, error, reload, update, create, comment, remove, busyIds } = useTasks({ notify, onUnauthorized });
  const f = useTaskFilters(tasks);
  const [tab, setTab] = useState('board');
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [account, setAccount] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const titleRef = useRef(null);

  const loadSide = useCallback(async () => {
    try {
      const [{ clients }, { bookings }] = await Promise.all([api.clients(), api.bookings()]);
      setClients(clients);
      setBookings(bookings);
    } catch (err) {
      if (err.status === 401) onUnauthorized();
      else notify({ type: 'error', title: err.message });
    }
  }, [notify, onUnauthorized]);

  useEffect(() => {
    loadSide();
    const id = setInterval(() => document.visibilityState === 'visible' && loadSide(), 30000);
    return () => clearInterval(id);
  }, [loadSide]);

  const boardTasks = useMemo(() => (mineOnly ? f.filtered.filter((t) => t.assignee === user.teamKey) : f.filtered), [f.filtered, mineOnly, user.teamKey]);

  if (!tasks) return error ? <LoadError message={error} onRetry={() => reload()} /> : <FullPageLoader label="Loading the team workspace…" />;

  const openTask = tasks.find((t) => t.id === openId);
  const newBookings = (bookings || []).filter((b) => b.status === 'new').length;
  const me = TEAM_BY_KEY[user.teamKey];

  const move = async (task, status) => {
    const saved = await update(task, { status });
    if (saved) {
      notify({ title: `${task.ref} → ${STATUS_LABEL[status]}`, message: task.title });
      loadSide();
    }
  };

  const setBookingStatus = async (b, status) => {
    setBookings((all) => all.map((x) => (x.id === b.id ? { ...x, status } : x)));
    try {
      await api.updateBooking(b.id, status);
    } catch (err) {
      setBookings((all) => all.map((x) => (x.id === b.id ? b : x)));
      notify({ type: 'error', title: err.message });
    }
  };

  const deleteBooking = async (b) => {
    try {
      await api.deleteBooking(b.id);
      setBookings((all) => all.filter((x) => x.id !== b.id));
      notify({ type: 'info', title: `${b.ref} deleted` });
    } catch (err) {
      notify({ type: 'error', title: err.message });
    }
  };

  const TABS = [
    { key: 'board', label: 'Task board', Icon: KanbanSquare, count: tasks.filter((t) => t.status !== 'done').length },
    { key: 'bookings', label: 'Consultations', Icon: CalendarCheck, count: newBookings, highlight: newBookings > 0 },
    { key: 'clients', label: 'Clients', Icon: Users, count: clients.length },
  ];

  return (
    <section className="min-h-screen pb-16 pt-24 sm:pt-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar memberKey={user.teamKey} size="h-14 w-14 text-base" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">Team Workspace</h1>
                <span className="rounded-full border border-orbit-500/40 bg-orbit-500/10 px-2.5 py-0.5 text-xs font-semibold text-orbit-300">AMY team</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Signed in as <span className="font-semibold text-slate-200">{user.name}</span>
                {me && ` · ${me.role}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                reload();
                loadSide();
              }}
              className="btn-secondary"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button onClick={() => setAccount(true)} className="btn-secondary">
              <UserCircle2 size={18} /> Account
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Layers} label="Open tasks" value={tasks.filter((t) => t.status !== 'done').length} tone="bg-brand-600/20 text-brand-300" />
          <StatCard icon={Clock} label="My active tasks" value={tasks.filter((t) => t.assignee === user.teamKey && ['progress', 'review'].includes(t.status)).length} tone="bg-orbit-500/20 text-orbit-300" />
          <StatCard icon={Inbox} label="New consultations" value={newBookings} tone="bg-rose-500/20 text-rose-300" />
          <StatCard icon={CircleCheck} label="Completed tasks" value={tasks.filter((t) => t.status === 'done').length} tone="bg-emerald-500/20 text-emerald-300" />
        </div>

        <div role="tablist" className="mt-6 flex gap-2 overflow-x-auto border-b border-ink-700 scrollbar-thin">
          {TABS.map(({ key, label, Icon, count, highlight }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === key ? 'border-orbit-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} /> {label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${highlight ? 'bg-orbit-500 text-ink-950' : 'bg-ink-800 text-slate-300'}`}>{count}</span>
            </button>
          ))}
        </div>

        {tab === 'board' && (
          <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
            <div className="space-y-6">
              <NewRequestForm
                ref={titleRef}
                clients={clients}
                onCreate={async (data) => {
                  const task = await create(data);
                  if (task) {
                    notify({ title: `${task.ref} logged for ${task.client.business}` });
                    loadSide();
                  }
                  return task;
                }}
              />
              <ActivityFeed tasks={tasks} onOpen={setOpenId} limit={10} />
            </div>
            <div className="min-w-0">
              <TaskFilters f={f} clients={clients}>
                <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-ink-700 px-3 py-2.5 text-sm text-slate-300">
                  <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Only mine
                </label>
              </TaskFilters>
              <p className="mt-3 text-xs text-slate-500">Drag cards between columns or use the arrows. Plan limits are enforced per client.</p>
              <TaskBoard
                tasks={boardTasks}
                mode="team"
                showClient
                busyIds={busyIds}
                onMove={move}
                onOpen={setOpenId}
                onNewRequest={() => {
                  titleRef.current?.focus();
                  titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />
            </div>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="mt-6">
            {!bookings ? (
              <FullPageLoader label="Loading consultations…" />
            ) : bookings.length === 0 ? (
              <EmptyState title="No consultation requests yet" text="Requests from the website form and the AMY AI chatbot appear here." />
            ) : (
              <ul className="grid gap-4 lg:grid-cols-2">
                {bookings.map((b) => (
                  <li key={b.id} className="glass rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                          {b.ref} · {timeAgo(b.createdAt)} · via {b.source}
                        </p>
                        <h3 className="mt-1 text-lg font-bold">{b.name}</h3>
                        <p className="text-sm text-slate-400">{b.businessType} · {b.service}</p>
                      </div>
                      <select
                        value={b.status}
                        onChange={(e) => setBookingStatus(b, e.target.value)}
                        className={`input !w-auto !rounded-full !border-0 !py-1.5 !pl-3 text-xs font-semibold ${BOOKING_TONE[b.status]}`}
                        aria-label={`Status of ${b.ref}`}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                      <Clock size={14} className="text-orbit-400" /> Prefers: {b.time}
                    </p>
                    {b.message && <p className="mt-2 rounded-xl bg-ink-900/70 px-3 py-2 text-sm text-slate-300">{b.message}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="btn-secondary !px-3 !py-2 text-xs">
                        <Phone size={14} /> {b.phone}
                      </a>
                      <a href={whatsappLink(b.phone)} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-2 text-xs">
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                      <DeleteButton onConfirm={() => deleteBooking(b)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'clients' && (
          <div className="mt-6">
            {clients.length === 0 ? (
              <EmptyState title="No clients yet" text="Clients appear here when they create a portal account." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-ink-700 scrollbar-thin">
                <table className="w-full min-w-[48rem] text-sm">
                  <thead className="bg-ink-800/80 text-left text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Business</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3 text-center">Queued</th>
                      <th className="px-4 py-3 text-center">Active</th>
                      <th className="px-4 py-3 text-center">Done</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => {
                      const plan = PLAN_BY_KEY[c.plan];
                      return (
                        <tr key={c.id} className="border-t border-ink-700">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                f.setClient(String(c.id));
                                setTab('board');
                              }}
                              className="flex items-center gap-2 text-left font-semibold text-white hover:text-brand-300"
                            >
                              <Building2 size={15} className="text-orbit-400" /> {c.business}
                            </button>
                            <span className="text-xs text-slate-500">{c.businessType}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {c.name}
                            <span className="block text-xs text-slate-500">{c.email}{c.phone && ` · ${c.phone}`}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-brand-600/20 px-2.5 py-1 text-xs font-semibold text-brand-300">{plan.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-300">{c.tasks.queued}</td>
                          <td className={`px-4 py-3 text-center ${c.tasks.active >= plan.activeLimit ? 'font-semibold text-orbit-300' : 'text-slate-300'}`}>
                            {c.tasks.active}/{plan.activeLimit}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-300">{c.tasks.done}</td>
                          <td className="px-4 py-3 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {openTask && (
        <TaskModal
          task={openTask}
          mode="team"
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => (patch.status ? move(openTask, patch.status) : update(openTask, patch))}
          onComment={(text) => comment(openTask, text)}
          onDelete={async () => {
            if (await remove(openTask)) {
              setOpenId(null);
              notify({ type: 'info', title: `${openTask.ref} deleted` });
              loadSide();
            }
          }}
        />
      )}
      {account && <AccountModal user={user} notify={notify} onClose={() => setAccount(false)} onLogout={onLogout} />}
    </section>
  );
}

function DeleteButton({ onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${armed ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500 hover:text-rose-300'}`}
    >
      <Trash2 size={14} /> {armed ? 'Confirm' : 'Delete'}
    </button>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}
