import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, LayoutDashboard, Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import CurrencyToggle from './CurrencyToggle.jsx';

export const NAV_LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'dashboard', label: 'Client Dashboard' },
  { id: 'about', label: 'About & Team' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar({ view, user, activeSection, onNavigate, onPortal, onBook, currency, onCurrency }) {
  const portalLabel = user ? (user.role === 'team' ? 'Team Workspace' : 'My Dashboard') : 'Client Portal';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      // Write the progress straight to a CSS variable so scrolling doesn't re-render the navbar.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty('--progress', max > 0 ? String(Math.min(window.scrollY / max, 1)) : '0');
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [view]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    if (id === 'dashboard') onPortal();
    else onNavigate(id);
  };

  const isActive = (id) => (id === 'dashboard' ? view === 'dashboard' : view === 'site' && activeSection === id);

  return (
    <header
      className={`on-navy fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-navy transition-shadow ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}
    >
      {view === 'site' && <span ref={progressRef} className="scroll-progress" aria-hidden="true" />}
      <nav className="mx-auto flex h-16 max-w-[90rem] items-stretch justify-between gap-4 pl-4 sm:pl-6 lg:h-[5.25rem] xl:pl-10" aria-label="Main">
        <button onClick={() => onNavigate('top')} className="self-center rounded-lg" aria-label="AMY Tech Solutions home">
          <Logo />
        </button>

        <ul className="hidden items-stretch gap-1 xl:ml-6 xl:flex 2xl:gap-3">
          {NAV_LINKS.map((l) => (
            <li key={l.id} className="flex">
              <button
                onClick={() => go(l.id)}
                aria-current={isActive(l.id) ? 'page' : undefined}
                className={`relative whitespace-nowrap px-3 text-[15px] font-medium transition after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:transition ${
                  isActive(l.id) ? 'text-white after:bg-orbit-500' : 'text-slate-300 after:bg-transparent hover:text-white'
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-stretch whitespace-nowrap xl:flex">
          <div className="hidden items-center border-l border-white/10 px-5 2xl:flex">
            <CurrencyToggle currency={currency} onChange={onCurrency} size="sm" />
          </div>
          <button
            onClick={onPortal}
            className="flex items-center gap-2 border-l border-white/10 px-6 text-[15px] font-medium text-white transition hover:bg-white/5"
          >
            <LayoutDashboard size={17} /> {portalLabel}
          </button>
          <button
            onClick={onBook}
            className="flex items-center gap-2 bg-orbit-600 px-6 text-[15px] font-semibold text-white transition hover:bg-orbit-500"
          >
            <CalendarCheck size={17} /> Book Free Consultation
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center border-l border-white/10 px-5 text-white xl:hidden"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu size={24} />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-[#0b1020]/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] flex-col gap-6 border-l border-ink-700 bg-ink-900 p-5 animate-fade-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-lg border border-ink-700 p-2 text-white" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => go(l.id)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                      isActive(l.id) ? 'bg-ink-800 text-white' : 'text-slate-300 hover:bg-ink-800'
                    }`}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl border border-ink-700 px-4 py-3">
                <span className="text-sm text-slate-400">Currency</span>
                <CurrencyToggle currency={currency} onChange={onCurrency} size="sm" />
              </div>
              <button onClick={() => { setOpen(false); onPortal(); }} className="btn-secondary w-full">
                <LayoutDashboard size={16} /> {portalLabel}
              </button>
              <button onClick={() => { setOpen(false); onBook(); }} className="btn-primary w-full">
                <CalendarCheck size={16} /> Book Free Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
