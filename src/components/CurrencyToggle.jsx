export default function CurrencyToggle({ currency, onChange, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';
  return (
    <div role="radiogroup" aria-label="Currency" className="inline-flex rounded-full border border-ink-700 bg-ink-900 p-1">
      {['PKR', 'USD'].map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={currency === c}
          onClick={() => onChange(c)}
          className={`rounded-full font-semibold transition ${pad} ${
            currency === c ? 'bg-brand-600 text-snow shadow shadow-brand-600/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
