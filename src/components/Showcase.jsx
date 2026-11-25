import { ArrowRight, Bot, KanbanSquare, MessageSquareText } from 'lucide-react';
import { STATUSES } from '../data/tasks.js';

const PROMPTS = [
  'How much for a website and a chatbot?',
  'Do you do office network setup in Sukkur?',
  'Quote for Growth plan for 3 months plus a pitch deck',
  'Book a consultation with Mukesh',
];

const STAGE_TEXT = {
  submitted: 'You describe the task and its priority',
  progress: 'The right founder picks it up',
  review: 'Internal check, then you approve',
  done: 'Delivered, with ongoing support',
};

export default function Showcase({ onAsk, onOpenDashboard }) {
  return (
    <section id="demo" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Try it live</span>
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">Don't take our word for it. Use it.</h2>
          <p className="mt-4 text-slate-400">Two working demos of what AMY delivers: an AI assistant for your customers and a dashboard for your requests.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orbit-500 to-orbit-600 text-snow">
              <Bot size={24} />
            </span>
            <h3 className="relative mt-5 text-xl font-bold sm:text-2xl">AMY AI chatbot</h3>
            <p className="relative mt-2 text-sm text-slate-400">
              Mukesh's showcase bot. It answers questions about plans, calculates quotes in PKR or USD and books consultations, just like the bots
              we build for clients. Pick a question to start:
            </p>
            <ul className="relative mt-6 space-y-2">
              {PROMPTS.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => onAsk(p)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-orbit-500"
                  >
                    <MessageSquareText size={16} className="shrink-0 text-orbit-400" />
                    <span className="flex-1">"{p}"</span>
                    <ArrowRight size={16} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-orbit-300" />
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-snow">
              <KanbanSquare size={24} />
            </span>
            <h3 className="relative mt-5 text-xl font-bold sm:text-2xl">Client request dashboard</h3>
            <p className="relative mt-2 text-sm text-slate-400">
              Every subscriber gets a dashboard to submit tasks and watch them move through the pipeline, with the responsible team member on every card.
            </p>
            <ol className="relative mt-6 grid gap-3 sm:grid-cols-2">
              {STATUSES.map((s, i) => (
                <li key={s.key} className="rounded-xl border border-ink-700 bg-ink-900/60 p-3.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-ink-950 ${s.dot}`}>{i + 1}</span>
                    {s.label}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">{STAGE_TEXT[s.key]}</span>
                </li>
              ))}
            </ol>
            <button onClick={onOpenDashboard} className="btn-primary relative mt-8 w-full sm:w-auto">
              Open the live dashboard <ArrowRight size={16} />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
