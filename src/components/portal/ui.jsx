import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { TEAM_BY_KEY } from '../../data/content.js';

export function Avatar({ memberKey, size = 'h-7 w-7 text-[10px]' }) {
  const m = TEAM_BY_KEY[memberKey];
  if (!m) return null;
  return (
    <span
      title={`${m.name} · ${m.role}`}
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-bold text-snow ring-2 ring-ink-900 ${m.gradient} ${size}`}
    >
      {m.initials}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-none text-white">{value}</p>
        <p className="mt-1 truncate text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`} aria-hidden="true" />;
}

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="grid min-h-[70vh] place-items-center pt-20">
      <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
        <Spinner className="h-8 w-8" />
        {label}
      </div>
    </div>
  );
}

/** Accessible modal shell: Escape/backdrop closes, focus moves into the dialog, body scroll locked. */
export function Modal({ title, labelledBy, onClose, children, footer, wide = false }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.activeElement;
    (panelRef.current?.querySelector('[data-autofocus]') || panelRef.current)?.focus();
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-[#0b1020]/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-ink-700 bg-ink-900 shadow-2xl outline-none animate-fade-up sm:rounded-3xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-700 p-5 sm:p-6">
          <div className="min-w-0">{title}</div>
          <button data-autofocus onClick={onClose} className="rounded-lg border border-ink-700 p-2 text-slate-400 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 scrollbar-thin sm:p-6">{children}</div>
        {footer && <div className="flex items-center justify-between gap-3 border-t border-ink-700 p-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

export function whatsappLink(phone) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}
