import { useId } from 'react';

const RINGS = [
  { cy: 22, rx: 26, ry: 5 },
  { cy: 33, rx: 28, ry: 5.5 },
  { cy: 43, rx: 23, ry: 4.5 },
];
// sweep 1 = upper half of the ring (behind the globe), sweep 0 = lower half (in front)
const arc = ({ cy, rx, ry }, sweep) => `M${32 - rx} ${cy}A${rx} ${ry} 0 0 ${sweep} ${32 + rx} ${cy}`;

/** SVG recreation of the AMY globe: a blue sphere wrapped in orange orbital rings. */
export function LogoMark({ className = 'h-10 w-10' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`globe-${id}`} cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#60A5FA" />
          <stop offset=".55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E3A8A" />
        </radialGradient>
        <linearGradient id={`ring-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#EA580C" />
          <stop offset="1" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <g transform="rotate(-22 32 32)" fill="none" strokeLinecap="round">
        {RINGS.map((r, i) => (
          <path key={i} d={arc(r, 1)} stroke="#C2410C" strokeWidth="3.2" />
        ))}
      </g>
      <circle cx="32" cy="32" r="19" fill={`url(#globe-${id})`} />
      <ellipse cx="26" cy="24" rx="7" ry="3.5" fill="#fff" opacity=".18" transform="rotate(-30 26 24)" />
      <g transform="rotate(-22 32 32)" fill="none" strokeLinecap="round">
        {RINGS.map((r, i) => (
          <g key={i}>
            <path d={arc(r, 0)} stroke="#020617" strokeWidth="6" />
            <path d={arc(r, 0)} stroke={`url(#ring-${id})`} strokeWidth="3.2" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-10 w-10 shrink-0 drop-shadow-[0_0_12px_rgba(37,99,235,.45)]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight text-orbit-500">AMY</span>
        <span className="font-display text-[10px] font-bold tracking-[.2em] text-brand-400">TECH SOLUTIONS</span>
      </span>
    </span>
  );
}
