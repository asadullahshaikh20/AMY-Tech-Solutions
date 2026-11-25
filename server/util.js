/** Small validation helpers and an in-memory rate limiter (no external deps). */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function str(value, { field, min = 0, max = 500, required = true } = {}) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v && required) throw new HttpError(400, `${field} is required.`);
  if (v && v.length < min) throw new HttpError(400, `${field} must be at least ${min} characters.`);
  if (v.length > max) throw new HttpError(400, `${field} must be at most ${max} characters.`);
  return v;
}

export function oneOf(value, allowed, field) {
  if (!allowed.includes(value)) throw new HttpError(400, `${field} must be one of: ${allowed.join(', ')}.`);
  return value;
}

export function email(value) {
  const v = str(value, { field: 'Email', max: 120 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new HttpError(400, 'Enter a valid email address.');
  return v;
}

export function phone(value, { required = true } = {}) {
  const v = str(value, { field: 'Phone number', max: 20, required });
  if (!v) return v;
  const digits = v.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{10,15}$/.test(digits)) throw new HttpError(400, 'Enter a valid phone number, e.g. 0300 1234567.');
  return v;
}

export function rateLimit({ windowMs, max, message = 'Too many requests. Please try again in a few minutes.' }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

export const nowIso = () => new Date().toISOString();
