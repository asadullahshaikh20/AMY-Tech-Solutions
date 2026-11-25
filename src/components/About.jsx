import { Check, Compass, GraduationCap, IdCard, Minus, Target } from 'lucide-react';
import { COMPANY, COMPARISON, CORE_VALUES, TEAM } from '../data/content.js';

function Cell({ value }) {
  if (value === true) return <Check size={18} className="mx-auto text-emerald-400" aria-label="Yes" />;
  if (value === false) return <Minus size={18} className="mx-auto text-slate-600" aria-label="No" />;
  return <span className="text-xs text-slate-400">{value}</span>;
}

export default function About() {
  return (
    <section id="about" className="relative bg-ink-900 py-20 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        {/* Story */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="section-eyebrow">About & Team</span>
            <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">
              <span className="text-orbit-500">A</span>sadullah, <span className="text-orbit-500">M</span>ukesh,{' '}
              <span className="text-orbit-500">Y</span>akoob.
            </h2>
            <p className="mt-5 leading-relaxed text-slate-400">
              AMY started as a project for the <strong className="text-slate-200">Technology Entrepreneurship Course</strong>. The three of us saw
              the same problem across Sindh: small businesses need a website, automated customer support and a working office network, but they
              can't afford an in-house IT team. Freelance platforms don't guarantee follow-through, and local software houses are slow, expensive and
              rigid.
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              So we combined our skills into one subscription: one accountable team with fixed pricing and support that continues after delivery,
              helping businesses across Sindh close the digital gap.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <Compass className="text-brand-400" size={22} />
              <h3 className="mt-3 font-bold">Vision</h3>
              <p className="mt-1.5 text-sm text-slate-400">{COMPANY.vision}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <Target className="text-orbit-400" size={22} />
              <h3 className="mt-3 font-bold">Mission</h3>
              <p className="mt-1.5 text-sm text-slate-400">{COMPANY.mission}</p>
            </div>
            {CORE_VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-ink-700 bg-ink-900/50 p-5">
                <h3 className="text-sm font-bold">{v.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {TEAM.map((m) => (
            <article key={m.key} className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-brand-500/60">
              <div className="relative flex items-center gap-4">
                <span className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br font-display text-xl font-extrabold text-snow shadow-lg ${m.gradient}`}>
                  {m.initials}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{m.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <IdCard size={13} /> Student ID {m.studentId}
                  </p>
                </div>
              </div>
              <p className="relative mt-5 font-semibold text-brand-300">{m.role}</p>
              <p className="relative text-sm text-orbit-300">{m.tagline}</p>
              <ul className="relative mt-4 space-y-2">
                {m.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2.5 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orbit-500" /> {r}
                  </li>
                ))}
              </ul>
              <div className="relative mt-5 flex flex-wrap gap-1.5">
                {m.skills.map((s) => (
                  <span key={s} className="rounded-md bg-ink-900/80 px-2 py-1 text-[11px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          <GraduationCap size={16} /> Flat structure: Mukesh is the main client contact, and pricing and direction are decided together.
        </p>

        {/* Comparison */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-bold">Why one team beats five freelancers</h3>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-700 scrollbar-thin">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="bg-ink-800/80">
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-300">
                    <span className="sr-only">Feature</span>
                  </th>
                  {COMPARISON.columns.map((c, i) => (
                    <th key={c} scope="col" className={`px-4 py-3 text-center font-semibold ${i === 0 ? 'text-orbit-400' : 'text-slate-300'}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((r) => (
                  <tr key={r.label} className="border-t border-ink-700">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-slate-200">{r.label}</th>
                    {r.values.map((v, i) => (
                      <td key={i} className={`px-4 py-3 text-center ${i === 0 ? 'bg-orbit-500/5' : ''}`}>
                        <Cell value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
