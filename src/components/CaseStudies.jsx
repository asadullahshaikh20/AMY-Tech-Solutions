import { ArrowRight, Briefcase, Rocket, ShoppingBag } from 'lucide-react';
import { CASE_STUDIES, SERVICES } from '../data/content.js';
import { SERVICE_ICONS } from './Services.jsx';

const SECTOR_ICON = { Retail: ShoppingBag, Startup: Rocket, Consultancy: Briefcase };
const SERVICE_BY_KEY = Object.fromEntries(SERVICES.map((s) => [s.key, s]));

export default function CaseStudies({ onStart }) {
  return (
    <section id="case-studies" className="relative bg-ink-900 py-20 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="max-w-2xl">
          <span className="section-eyebrow">Case studies</span>
          <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">How AMY works for businesses like yours.</h2>
          <p className="mt-4 text-slate-400">
            Example engagements for our three core client types, showing how the team splits the work and which plan fits.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {CASE_STUDIES.map((c) => {
            const Icon = SECTOR_ICON[c.sector];
            return (
              <article key={c.title} className="glass flex flex-col rounded-3xl p-6 transition hover:border-brand-500/60 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold text-slate-300">
                    <Icon size={14} className="text-orbit-400" /> {c.sector}
                  </span>
                  <span className="rounded-full border border-brand-600/50 px-3 py-1 text-xs font-semibold text-brand-300">{c.plan}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{c.challenge}</p>

                <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Our approach</h4>
                <ul className="mt-2 space-y-2">
                  {c.approach.map((a) => (
                    <li key={a} className="flex gap-2.5 text-sm text-slate-300">
                      <ArrowRight size={14} className="mt-1 shrink-0 text-orbit-400" /> {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {c.services.map((key) => {
                    const S = SERVICE_ICONS[SERVICE_BY_KEY[key].icon];
                    return (
                      <span key={key} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600/15 px-2.5 py-1 text-xs text-brand-300">
                        <S size={12} /> {SERVICE_BY_KEY[key].title.split(' &')[0]}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-auto pt-6">
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Outcome</h4>
                    <ul className="mt-2 space-y-1">
                      {c.outcomes.map((o) => (
                        <li key={o} className="text-sm text-slate-200">✓ {o}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button onClick={onStart} className="btn-primary">
            Discuss your project <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
