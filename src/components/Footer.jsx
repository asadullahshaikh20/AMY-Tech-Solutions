import { MapPin } from 'lucide-react';
import Logo from './Logo.jsx';
import { COMPANY, SERVICES } from '../data/content.js';
import { NAV_LINKS } from './Navbar.jsx';

export default function Footer({ onNavigate, onPortal, onOpenChat }) {
  return (
    <footer className="on-navy bg-navy pb-24 pt-16 sm:pb-14">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 sm:px-6 xl:px-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">"{COMPANY.pitch}"</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <MapPin size={15} className="text-orbit-400" /> {COMPANY.city}
          </p>
        </div>
        <nav aria-label="Footer: company">
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <button onClick={() => (l.id === 'dashboard' ? onPortal() : onNavigate(l.id))} className="text-slate-400 hover:text-white">
                  {l.label}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => onNavigate('roadmap')} className="text-slate-400 hover:text-white">Roadmap</button>
            </li>
          </ul>
        </nav>
        <nav aria-label="Footer: services">
          <h3 className="text-sm font-semibold">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.key}>
                <button onClick={() => onNavigate('services')} className="text-left text-slate-400 hover:text-white">{s.title}</button>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="text-sm font-semibold">Get started</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><button onClick={() => onNavigate('contact')} className="text-slate-400 hover:text-white">Book a free consultation</button></li>
            <li><button onClick={onOpenChat} className="text-slate-400 hover:text-white">Chat with AMY AI</button></li>
            <li><button onClick={onPortal} className="text-slate-400 hover:text-white">Client portal demo</button></li>
            <li><button onClick={() => onNavigate('pricing')} className="text-slate-400 hover:text-white">Pricing calculator</button></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[90rem] flex-col gap-2 border-t border-white/10 px-4 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 xl:px-10">
        <p>© {new Date().getFullYear()} AMY Tech Solutions. Asadullah · Mukesh · Yakoob.</p>
        <p>Built for the Technology Entrepreneurship Course · Sukkur, Sindh</p>
      </div>
    </footer>
  );
}
