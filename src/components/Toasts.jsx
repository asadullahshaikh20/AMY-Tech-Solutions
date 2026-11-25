import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-ink-700 bg-ink-900/95 p-4 shadow-2xl shadow-black/40 backdrop-blur animate-fade-up"
        >
          {t.type === 'error' ? (
            <AlertCircle className="mt-0.5 shrink-0 text-rose-400" size={20} />
          ) : t.type === 'info' ? (
            <Info className="mt-0.5 shrink-0 text-brand-400" size={20} />
          ) : (
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={20} />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{t.title}</p>
            {t.message && <p className="mt-0.5 text-sm text-slate-400">{t.message}</p>}
          </div>
          <button onClick={() => onDismiss(t.id)} className="text-slate-500 hover:text-white" aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
