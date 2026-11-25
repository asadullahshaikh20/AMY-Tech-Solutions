import { useState } from 'react';
import { Flag, Rocket, TrendingUp } from 'lucide-react';
import { MILESTONES } from '../data/content.js';

const PHASES = [
  { key: 'Launch', Icon: Rocket, color: 'text-brand-400' },
  { key: 'Traction', Icon: Flag, color: 'text-orbit-400' },
  { key: 'Scale', Icon: TrendingUp, color: 'text-emerald-400' },
];

export default function Roadmap() {
  const [active, setActive] = useState(1);
  const m = MILESTONES[active];
  const progress = (active / (MILESTONES.length - 1)) * 100;

  return (
    <section id="roadmap" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="max-w-2xl">
          <span className="section-eyebrow">3-year roadmap</span>
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">From Sukkur launch to international clients.</h2>
          <p className="mt-4 text-slate-400">Milestones from our business plan. Select a milestone to see the details.</p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="mt-14 hidden lg:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-[1.1rem] h-1 rounded-full bg-ink-800" />
            <div className="absolute left-0 top-[1.1rem] h-1 rounded-full bg-gradient-to-r from-brand-600 to-orbit-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            <ol className="relative grid grid-cols-8">
              {MILESTONES.map((ms, i) => (
                <li key={ms.title} className="flex flex-col items-center">
                  <button
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    aria-label={`${ms.when}: ${ms.title}`}
                    className={`grid h-9 w-9 place-items-center rounded-full border-4 border-ink-950 text-xs font-bold transition ${
                      i <= active ? 'bg-orbit-500 text-ink-950' : 'bg-ink-700 text-slate-300 hover:bg-ink-700/70'
                    } ${active === i ? 'scale-125 shadow-lg shadow-orbit-500/50' : ''}`}
                  >
                    {i + 1}
                  </button>
                  <button onClick={() => setActive(i)} className="mt-3 px-1 text-center">
                    <span className={`block text-xs font-semibold ${active === i ? 'text-orbit-300' : 'text-slate-500'}`}>{ms.when}</span>
                    <span className={`mt-1 block text-xs leading-snug ${active === i ? 'text-white' : 'text-slate-400'}`}>{ms.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div key={active} className="glass mx-auto mt-10 max-w-3xl rounded-3xl p-8 text-center animate-fade-up">
            <span className="text-xs font-semibold uppercase tracking-widest text-orbit-400">
              {m.phase} phase · {m.when}
            </span>
            <h3 className="mt-2 text-2xl font-bold">{m.title}</h3>
            <p className="mt-3 text-slate-400">{m.detail}</p>
            <span className="mt-5 inline-block rounded-full bg-brand-600/20 px-4 py-1.5 text-sm font-semibold text-brand-300">{m.metric}</span>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="mt-10 space-y-8 lg:hidden">
          {PHASES.map(({ key, Icon, color }) => (
            <div key={key}>
              <h3 className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${color}`}>
                <Icon size={16} /> {key}
              </h3>
              <ol className="relative space-y-3 border-l-2 border-ink-700 pl-6">
                {MILESTONES.map((ms, i) =>
                  ms.phase !== key ? null : (
                    <li key={ms.title} className="relative">
                      <span className={`absolute -left-[2.05rem] top-4 h-3.5 w-3.5 rounded-full border-2 border-ink-950 ${active === i ? 'bg-orbit-500' : 'bg-ink-700'}`} />
                      <button
                        onClick={() => setActive(i)}
                        aria-expanded={active === i}
                        className={`w-full rounded-2xl border p-4 text-left transition ${active === i ? 'border-orbit-500/60 bg-ink-800/80' : 'border-ink-700 bg-ink-900/50'}`}
                      >
                        <span className="text-xs font-semibold text-orbit-300">{ms.when}</span>
                        <span className="block font-semibold text-white">{ms.title}</span>
                        {active === i && (
                          <span className="mt-2 block animate-fade-up text-sm text-slate-400">
                            {ms.detail}
                            <span className="mt-2 block font-semibold text-brand-300">{ms.metric}</span>
                          </span>
                        )}
                      </button>
                    </li>
                  )
                )}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
