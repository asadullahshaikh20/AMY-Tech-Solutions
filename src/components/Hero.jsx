import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatMoney } from '../lib/format.js';
import CountUp from './CountUp.jsx';

const SECTIONS = [
  { id: 'services', label: 'Our services' },
  { id: 'pricing', label: 'Plans & pricing' },
  { id: 'demo', label: 'Live demos' },
  { id: 'about', label: 'Our team & values' },
  { id: 'roadmap', label: 'Our roadmap' },
  { id: 'case-studies', label: 'Case studies' },
  { id: 'contact', label: 'Book a consultation' },
];

const HEADLINE = 'text-[clamp(2.6rem,8.6vw,8.25rem)] font-light leading-[1.04] tracking-[-0.02em]';

export default function Hero({ currency, onPlans, onDemo, onNavigate }) {
  const facts = [
    { value: 'Sukkur', label: 'Headquartered in Sindh, Pakistan' },
    { value: '3', label: 'Co-founders, one accountable team' },
    { value: '5', label: 'Core services under one plan' },
    { value: formatMoney(currency === 'USD' ? 15 : 1500, currency), label: 'Subscriptions start per month' },
  ];

  return (
    <section id="top" className="relative">
      {/* Navy block */}
      <div className="on-navy relative overflow-hidden bg-navy pt-16 lg:pt-[5.25rem]">
        <div className="hero-grid" aria-hidden="true" />
        <div aria-hidden="true" className="hero-glow -right-24 -top-24 h-[28rem] w-[28rem] bg-orbit-600/25" />
        <div aria-hidden="true" className="hero-glow bottom-0 left-1/4 h-80 w-80 bg-brand-600/25 [animation-delay:-9s]" />
        <div className="relative mx-auto grid max-w-[90rem] gap-12 px-4 pt-20 sm:px-6 sm:pt-28 lg:grid-cols-[1fr_auto] lg:items-end lg:pt-36 xl:px-10">
          <h1 className={`${HEADLINE} text-white`}>
            <span className="line-mask">
              <span className="line-rise">Your remote</span>
            </span>
            <span className="line-mask">
              <span className="line-rise [--line-delay:120ms]">tech department</span>
            </span>
            <span className="sr-only"> for one fixed monthly rate.</span>
          </h1>

          <nav aria-label="Page sections" className="fade-in-late hidden gap-8 pb-8 [--line-delay:500ms] lg:flex">
            <span className="hidden pt-0.5 text-base text-slate-500 sm:block">Sections</span>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:block sm:space-y-2.5">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onNavigate(s.id)}
                    className="group inline-flex items-center gap-1.5 text-left text-base text-slate-200 transition hover:text-white lg:text-lg"
                  >
                    <span className="bg-gradient-to-r from-orbit-500 to-orbit-500 bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-all duration-300 group-hover:bg-[length:100%_1px]">
                      {s.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* White continuation, like the headline running past the navy band */}
      <div className="bg-snow">
        <div className="mx-auto max-w-[90rem] px-4 pb-20 sm:px-6 lg:pb-28 xl:px-10">
          <p aria-hidden="true" className={`${HEADLINE} -mt-[0.02em] text-navy`}>
            <span className="line-mask">
              <span className="line-rise [--line-delay:240ms]">
                for one <span className="draw-underline text-orbit-600">fixed rate.</span>
              </span>
            </span>
          </p>

          <div className="fade-in-late mt-12 grid gap-10 border-t [--line-delay:600ms] border-ink-700 pt-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
                No more chasing unreliable freelancers or paying overpriced software houses. One unified team from Sukkur handles your{' '}
                <span className="text-white">website, AI chatbots, pitch decks and office networking</span>, with a live dashboard to track
                every request.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={onPlans} className="btn-primary !px-7 !py-4 text-base">
                  Explore subscription plans <ArrowRight size={18} />
                </button>
                <button onClick={onDemo} className="btn-secondary !px-7 !py-4 text-base">
                  Launch interactive demo <ArrowUpRight size={18} />
                </button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-lg border border-ink-700 bg-ink-700">
              {facts.map((f) => (
                <div key={f.label} className="bg-snow p-5 sm:p-6">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-light text-navy tabular-nums sm:text-4xl">
                      <CountUp value={f.value} />
                    </span>
                    <span className="mt-1.5 block text-sm text-slate-400">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
