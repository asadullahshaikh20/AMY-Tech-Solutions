import { useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, Globe, LifeBuoy, Lightbulb, Network, Package, Presentation } from 'lucide-react';
import { SERVICES, TEAM_BY_KEY } from '../data/content.js';

export const SERVICE_ICONS = { Globe, Bot, Presentation, Network, LifeBuoy };

const SERVICE_TO_REQUEST = {
  web: 'Web & Web App Development',
  ai: 'AI & ML Chatbot',
  deck: 'Pitch-Deck Design',
  network: 'Office Networking & IT',
  support: 'Ongoing Support & Maintenance',
};

export default function Services({ onRequest }) {
  const [activeKey, setActiveKey] = useState('web');
  const active = SERVICES.find((s) => s.key === activeKey);
  const ActiveIcon = SERVICE_ICONS[active.icon];
  const owner = TEAM_BY_KEY[active.owner];

  return (
    <section id="services" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="max-w-2xl">
          <span className="section-eyebrow">5 Core Service Pillars</span>
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">Everything a small business needs, from one team.</h2>
          <p className="mt-4 text-slate-400">
            A website, automated customer support and a working office network are now basic requirements, not extras. Pick a pillar to
            see exactly what you get.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div role="tablist" aria-label="Services" className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin lg:flex-col lg:overflow-visible lg:pb-0">
            {SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[s.icon];
              const selected = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  role="tab"
                  id={`tab-${s.key}`}
                  aria-selected={selected}
                  aria-controls="service-panel"
                  onClick={() => setActiveKey(s.key)}
                  className={`group flex min-w-[15rem] items-start gap-3 rounded-2xl border p-4 text-left transition lg:min-w-0 ${
                    selected
                      ? 'border-brand-500 bg-gradient-to-br from-brand-600/20 to-ink-800/60 shadow-lg shadow-brand-600/10'
                      : 'border-ink-700 bg-ink-800/40 hover:border-ink-700 hover:bg-ink-800/80'
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
                      selected ? 'bg-brand-600 text-snow' : 'bg-ink-900 text-brand-400 group-hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="text-[11px] font-semibold text-orbit-400">0{i + 1}</span>
                    <span className="block font-display text-sm font-bold text-white sm:text-base">{s.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">{s.short}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <article
            id="service-panel"
            role="tabpanel"
            aria-labelledby={`tab-${active.key}`}
            key={active.key}
            className="glass relative overflow-hidden rounded-3xl p-6 animate-fade-up sm:p-8"
          >
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-snow shadow-lg shadow-brand-600/30">
                  <ActiveIcon size={26} />
                </span>
                <div>
                  <h3 className="text-xl font-bold sm:text-2xl">{active.title}</h3>
                  <p className="text-sm text-slate-400">
                    Led by <span className="font-semibold text-orbit-400">{owner.name}</span> · {owner.role}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {active.stack.map((t) => (
                  <span key={t} className="rounded-full border border-ink-700 bg-ink-900/70 px-3 py-1 text-xs text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  <CheckCircle2 size={16} className="text-brand-400" /> Features
                </h4>
                <ul className="space-y-3">
                  {active.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-slate-200">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orbit-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    <Package size={16} className="text-brand-400" /> Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {active.deliverables.map((d) => (
                      <li key={d} className="rounded-xl border border-ink-700 bg-ink-900/60 px-3.5 py-2.5 text-sm text-slate-200">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-orbit-500/30 bg-orbit-500/10 p-4">
                  <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-orbit-300">
                    <Lightbulb size={16} /> Sample use case
                  </h4>
                  <p className="text-sm text-slate-300">{active.useCase}</p>
                </div>
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-3 border-t border-ink-700 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Included in subscription plans or available as a one-time project.</p>
              <button onClick={() => onRequest(SERVICE_TO_REQUEST[active.key])} className="btn-primary">
                Request this service <ArrowRight size={16} />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
