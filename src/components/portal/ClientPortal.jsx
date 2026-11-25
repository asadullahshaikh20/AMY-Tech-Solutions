import { useEffect, useRef, useState } from 'react';
import { CircleCheck, Clock, Inbox, Layers, RefreshCw, RotateCcw, UserCircle2 } from 'lucide-react';
import { PLANS, PLAN_BY_KEY } from '../../data/content.js';
import { STATUS_LABEL } from '../../data/tasks.js';
import { api } from '../../lib/api.js';
import useTasks from './useTasks.js';
import TaskBoard from './TaskBoard.jsx';
import TaskModal from './TaskModal.jsx';
import NewRequestForm from './NewRequestForm.jsx';
import ActivityFeed from './ActivityFeed.jsx';
import TaskFilters, { useTaskFilters } from './TaskFilters.jsx';
import AccountModal from './AccountModal.jsx';
import { FullPageLoader, StatCard } from './ui.jsx';

const ACTIVE = new Set(['progress', 'review']);

export default function ClientPortal({ user, setUser, notify, onLogout, onUnauthorized, isDemo }) {
  const { tasks, setTasks, error, reload, update, create, comment, remove, busyIds } = useTasks({ notify, onUnauthorized });
  const f = useTaskFilters(tasks);
  const [openId, setOpenId] = useState(null);
  const [account, setAccount] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 4000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  if (!tasks) return error ? <LoadError message={error} onRetry={() => reload()} /> : <FullPageLoader label="Loading your requests…" />;

  const plan = PLAN_BY_KEY[user.plan];
  const activeCount = tasks.filter((t) => ACTIVE.has(t.status)).length;
  const openTask = tasks.find((t) => t.id === openId);

  const changePlan = async (key) => {
    try {
      const { user: u } = await api.updateMe({ plan: key });
      setUser(u);
      notify({ title: `Switched to the ${PLAN_BY_KEY[key].name} plan` });
      reload(true);
    } catch (err) {
      notify({ type: 'error', title: err.message });
    }
  };

  const move = async (task, status) => {
    const saved = await update(task, { status });
    if (saved) notify({ title: status === 'done' ? `${task.ref} approved` : `${task.ref}: ${STATUS_LABEL[status]}`, message: task.title });
  };

  const resetDemo = async () => {
    if (!confirmReset) return setConfirmReset(true);
    setConfirmReset(false);
    try {
      const { tasks: fresh } = await api.resetDemo();
      setTasks(fresh);
      const { user: u } = await api.me();
      if (u) setUser(u);
      notify({ type: 'info', title: 'Demo workspace reset', message: 'Sample tickets restored.' });
    } catch (err) {
      notify({ type: 'error', title: err.message });
    }
  };

  return (
    <section className="min-h-screen pb-16 pt-24 sm:pt-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold sm:text-3xl">Client Request Dashboard</h1>
              {isDemo && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">Demo account</span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Welcome, <span className="font-semibold text-slate-200">{user.name}</span> · {user.business}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:gap-5">
              <div>
                <label htmlFor="plan-select" className="label">Your plan</label>
                <select id="plan-select" value={user.plan} onChange={(e) => changePlan(e.target.value)} className="input min-w-36 !py-2">
                  {PLANS.map((p) => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-48 flex-1">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Active slots</span>
                  <span className={activeCount >= plan.activeLimit ? 'font-semibold text-orbit-300' : 'text-slate-300'}>
                    {activeCount} / {plan.activeLimit}
                  </span>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  {Array.from({ length: plan.activeLimit }).map((_, i) => (
                    <span key={i} className={`h-2 flex-1 rounded-full ${i < activeCount ? 'bg-gradient-to-r from-orbit-600 to-orbit-400' : 'bg-ink-700'}`} />
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Turnaround: {plan.turnaround}</p>
              </div>
            </div>
            <button onClick={() => setAccount(true)} className="btn-secondary">
              <UserCircle2 size={18} /> Account
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Layers} label="Total requests" value={tasks.length} tone="bg-brand-600/20 text-brand-300" />
          <StatCard icon={Inbox} label="Waiting in queue" value={tasks.filter((t) => t.status === 'submitted').length} tone="bg-slate-500/20 text-slate-300" />
          <StatCard icon={Clock} label="Active now" value={activeCount} tone="bg-orbit-500/20 text-orbit-300" />
          <StatCard icon={CircleCheck} label="Completed" value={tasks.filter((t) => t.status === 'done').length} tone="bg-emerald-500/20 text-emerald-300" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="space-y-6">
            <NewRequestForm
              ref={titleRef}
              turnaround={plan.turnaround}
              onCreate={async (data) => {
                const task = await create(data);
                if (task) notify({ title: `Request ${task.ref} submitted`, message: `Assigned to the team. Expected turnaround: ${plan.turnaround}.` });
                return task;
              }}
            />
            <ActivityFeed tasks={tasks} onOpen={setOpenId} />
          </div>

          <div className="min-w-0">
            <TaskFilters f={f}>
              <button onClick={() => reload()} className="btn-secondary !py-2.5" title="Refresh">
                <RefreshCw size={15} /> Refresh
              </button>
              {isDemo && (
                <button onClick={resetDemo} className={`btn-secondary !py-2.5 ${confirmReset ? '!border-orbit-500 !text-orbit-300' : ''}`}>
                  <RotateCcw size={15} /> {confirmReset ? 'Click to confirm' : 'Reset demo'}
                </button>
              )}
            </TaskFilters>
            <p className="mt-3 text-xs text-slate-500">
              The AMY team moves your requests through the pipeline. When work reaches Quality Review, approve it or request changes. Updates refresh automatically.
            </p>
            <TaskBoard
              tasks={f.filtered}
              mode="client"
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
      </div>

      {openTask && (
        <TaskModal
          task={openTask}
          mode="client"
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => (patch.status ? move(openTask, patch.status) : update(openTask, patch))}
          onComment={(text) => comment(openTask, text)}
          onDelete={async () => {
            if (await remove(openTask)) {
              setOpenId(null);
              notify({ type: 'info', title: `${openTask.ref} withdrawn` });
            }
          }}
        />
      )}
      {account && <AccountModal user={user} notify={notify} onClose={() => setAccount(false)} onLogout={onLogout} />}
    </section>
  );
}

export function LoadError({ message, onRetry }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 pt-20">
      <div className="glass max-w-md rounded-2xl p-6 text-center">
        <p className="font-semibold text-white">Couldn't load the dashboard</p>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
        <button onClick={onRetry} className="btn-primary mt-5">
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    </div>
  );
}
