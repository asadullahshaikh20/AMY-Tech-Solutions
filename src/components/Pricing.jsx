import { useMemo, useState } from 'react';
import { Calculator, Check, Crown, Minus, Plus, Zap } from 'lucide-react';
import { ONE_TIME, PLANS, PLAN_BY_KEY } from '../data/content.js';
import { formatMoney, priceOf } from '../lib/format.js';
import CurrencyToggle from './CurrencyToggle.jsx';

const ONE_TIME_TO_SERVICE = {
  chatbot: 'AI & ML Chatbot',
  deck: 'Pitch-Deck Design',
  website: 'Web & Web App Development',
  network: 'Office Networking & IT',
};

export default function Pricing({ currency, onCurrency, onChoosePlan }) {
  const [planKey, setPlanKey] = useState('growth');
  const [includePlan, setIncludePlan] = useState(true);
  const [months, setMonths] = useState(3);
  const [extras, setExtras] = useState({ chatbot: false, deck: false, website: false, network: false });

  const toggleExtra = (key) => setExtras((e) => ({ ...e, [key]: !e[key] }));

  const quote = useMemo(() => {
    const plan = PLAN_BY_KEY[planKey];
    const monthly = includePlan ? priceOf(plan, currency) : 0;
    const chosen = ONE_TIME.filter((p) => extras[p.key]);
    const oneTime = chosen.reduce((sum, p) => sum + priceOf(p, currency), 0);
    return {
      plan,
      monthly,
      chosen,
      oneTime,
      firstMonth: monthly + oneTime,
      total: monthly * months + oneTime,
      hardware: chosen.some((p) => p.plusHardware),
    };
  }, [planKey, includePlan, months, extras, currency]);

  const summaryLabel = [includePlan && `${quote.plan.name} plan (${months} mo)`, ...quote.chosen.map((c) => c.name)]
    .filter(Boolean)
    .join(' + ');

  return (
    <section id="pricing" className="relative bg-ink-900 py-20 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Transparent pricing</span>
            <h2 className="text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">One fixed monthly rate. No surprise quotes.</h2>
            <p className="mt-4 text-slate-400">Subscribe to a tier, or pay once for a single deliverable. Switch currency for international pricing.</p>
          </div>
          <CurrencyToggle currency={currency} onChange={onCurrency} />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.key}
              className={`relative flex flex-col rounded-3xl border p-6 transition sm:p-8 ${
                p.popular
                  ? 'border-orbit-500/70 bg-gradient-to-b from-orbit-500/15 via-ink-800/70 to-ink-800/40 shadow-2xl shadow-orbit-600/15 lg:-translate-y-3'
                  : 'border-ink-700 bg-ink-800/40 hover:border-brand-600/60'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-orbit-500 px-3 py-1 text-xs font-bold text-ink-950">
                  <Crown size={12} /> Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-2 min-h-[3rem] text-sm text-slate-400">{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-light text-white">{formatMoney(priceOf(p, currency), currency)}</span>
                <span className="text-sm text-slate-400">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-slate-200">
                    <Check size={18} className={`shrink-0 ${p.popular ? 'text-orbit-400' : 'text-brand-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onChoosePlan(`${p.name} plan subscription`)}
                className={`mt-8 w-full ${p.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                Choose {p.name}
              </button>
            </article>
          ))}
        </div>

        {/* Interactive calculator */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_24rem]">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Calculator size={22} className="text-orbit-400" /> Build your quote
            </h3>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="label !mb-0">1 · Monthly subscription</span>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={includePlan}
                    onChange={(e) => setIncludePlan(e.target.checked)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  Include a plan
                </label>
              </div>
              <div className={`mt-3 grid grid-cols-3 gap-2 transition ${includePlan ? '' : 'pointer-events-none opacity-40'}`}>
                {PLANS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPlanKey(p.key)}
                    aria-pressed={planKey === p.key}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      planKey === p.key ? 'border-brand-500 bg-brand-600/20' : 'border-ink-700 bg-ink-900/60 hover:border-ink-700'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-white">{p.name}</span>
                    <span className="block text-xs text-slate-400">{formatMoney(priceOf(p, currency), currency)}/mo</span>
                  </button>
                ))}
              </div>
              <div className={`mt-4 flex items-center gap-4 ${includePlan ? '' : 'pointer-events-none opacity-40'}`}>
                <span className="text-sm text-slate-300">Duration</span>
                <div className="flex items-center rounded-xl border border-ink-700 bg-ink-900">
                  <button onClick={() => setMonths((m) => Math.max(1, m - 1))} className="p-2.5 text-slate-300 hover:text-white" aria-label="Fewer months">
                    <Minus size={16} />
                  </button>
                  <span className="w-20 text-center text-sm font-semibold text-white" aria-live="polite">
                    {months} month{months > 1 ? 's' : ''}
                  </span>
                  <button onClick={() => setMonths((m) => Math.min(12, m + 1))} className="p-2.5 text-slate-300 hover:text-white" aria-label="More months">
                    <Plus size={16} />
                  </button>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="hidden flex-1 accent-orange-500 sm:block"
                  aria-label="Subscription months"
                />
              </div>
            </div>

            <div className="mt-8">
              <span className="label">2 · One-time fixed-scope projects</span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ONE_TIME.map((p) => {
                  const on = extras[p.key];
                  return (
                    <button
                      key={p.key}
                      role="switch"
                      aria-checked={on}
                      onClick={() => toggleExtra(p.key)}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                        on ? 'border-orbit-500 bg-orbit-500/10' : 'border-ink-700 bg-ink-900/60 hover:border-ink-700'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-white">{p.name}</span>
                        <span className="block text-xs text-slate-400">{p.note}</span>
                        <span className="mt-1 block text-sm font-semibold text-orbit-300">
                          {formatMoney(priceOf(p, currency), currency)}
                          {p.plusHardware && <span className="font-normal text-slate-400"> + hardware</span>}
                        </span>
                      </span>
                      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-orbit-500' : 'bg-ink-700'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-snow shadow transition-all ${on ? 'left-[1.375rem]' : 'left-0.5'}`} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-3xl border border-brand-600/50 bg-gradient-to-b from-brand-700/40 to-ink-900 p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <h3 className="relative flex items-center gap-2 text-lg font-bold">
              <Zap size={18} className="text-orbit-400" /> Your estimate
            </h3>
            <dl className="relative mt-6 space-y-3 text-sm">
              {includePlan && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-300">
                    {quote.plan.name} × {months} mo
                  </dt>
                  <dd className="font-semibold text-white">{formatMoney(quote.monthly * months, currency)}</dd>
                </div>
              )}
              {quote.chosen.map((c) => (
                <div key={c.key} className="flex justify-between gap-4">
                  <dt className="text-slate-300">{c.name}</dt>
                  <dd className="font-semibold text-white">{formatMoney(priceOf(c, currency), currency)}</dd>
                </div>
              ))}
              {!includePlan && quote.chosen.length === 0 && (
                <p className="text-slate-400">Select a plan or a one-time project to see your estimate.</p>
              )}
              <div className="border-t border-ink-700 pt-3">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">First month payment</dt>
                  <dd className="font-semibold text-white">{formatMoney(quote.firstMonth, currency)}</dd>
                </div>
                {includePlan && (
                  <div className="mt-2 flex justify-between gap-4">
                    <dt className="text-slate-400">Then monthly</dt>
                    <dd className="font-semibold text-white">{formatMoney(quote.monthly, currency)}</dd>
                  </div>
                )}
              </div>
            </dl>
            <div className="relative mt-6 rounded-2xl bg-ink-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Total estimate</p>
              <p className="font-display text-3xl font-light text-white" aria-live="polite">
                {formatMoney(quote.total, currency)}
              </p>
              {quote.hardware && <p className="mt-1 text-xs text-orbit-300">Network hardware is billed at cost after the site survey.</p>}
            </div>
            <button
              disabled={!includePlan && quote.chosen.length === 0}
              onClick={() =>
                onChoosePlan(
                  includePlan ? `${quote.plan.name} plan subscription` : ONE_TIME_TO_SERVICE[quote.chosen[0].key],
                  `Quote: ${summaryLabel} = ${formatMoney(quote.total, currency)}${quote.hardware ? ' + hardware' : ''}`
                )
              }
              className="btn-primary relative mt-6 w-full"
            >
              Book a call with this quote
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
