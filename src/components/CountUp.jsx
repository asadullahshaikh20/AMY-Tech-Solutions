import { useEffect, useRef, useState } from 'react';

/**
 * Counts the first number in `value` up from 0 the first time it scrolls into view,
 * keeping any surrounding text ("Rs 1,500" → "Rs 0" … "Rs 1,500"). Non-numeric values render as-is.
 */
export default function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null);
  const match = String(value).match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, '')) : null;
  const [current, setCurrent] = useState(null); // null = show the final value (SSR, reduced motion, no JS observer)

  useEffect(() => {
    const el = ref.current;
    if (target == null || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    let frame = 0;
    setCurrent(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          setCurrent(t < 1 ? Math.round(target * eased) : null);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  const text = match && current != null ? `${match[1]}${current.toLocaleString('en-US')}${match[3]}` : value;

  return (
    <span ref={ref}>
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
