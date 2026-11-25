import { useEffect, useState } from 'react';

const PREFIX = 'amy-tech:';

/** useState that survives page reloads via localStorage; falls back silently when storage is blocked. */
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      /* storage unavailable or corrupt: use the initial value */
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable: state still works for this session */
    }
  }, [key, value]);

  return [value, setValue];
}
