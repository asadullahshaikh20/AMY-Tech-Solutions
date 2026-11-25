import { Router } from 'express';
import { db, DEMO_EMAIL, DEMO_PASSWORD } from '../db.js';
import { clearSessionCookie, hashPassword, publicUser, requireAuth, setSessionCookie, verifyPassword } from '../auth.js';
import { HttpError, email, oneOf, phone, rateLimit, str } from '../util.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60_000, max: 20, message: 'Too many sign-in attempts. Please wait 15 minutes.' });

const PLANS = ['basic', 'growth', 'pro'];
const BUSINESS_TYPES = ['Retail', 'Startup', 'Consultancy', 'Other'];

router.get('/me', (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.get('/demo', (_req, res) => {
  res.json({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
});

router.post('/register', authLimiter, (req, res) => {
  const b = req.body || {};
  const data = {
    name: str(b.name, { field: 'Name', min: 2, max: 60 }),
    email: email(b.email),
    password: str(b.password, { field: 'Password', min: 8, max: 100 }),
    phone: phone(b.phone),
    business: str(b.business, { field: 'Business name', min: 2, max: 80 }),
    businessType: oneOf(b.businessType || 'Other', BUSINESS_TYPES, 'Business type'),
    plan: oneOf(b.plan || 'basic', PLANS, 'Plan'),
  };
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(data.email)) {
    throw new HttpError(409, 'An account with this email already exists. Please sign in.');
  }
  const result = db
    .prepare(
      `INSERT INTO users (name, email, phone, business, business_type, role, plan, password_hash)
       VALUES (?, ?, ?, ?, ?, 'client', ?, ?)`
    )
    .run(data.name, data.email, data.phone, data.business, data.businessType, data.plan, hashPassword(data.password));
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
  setSessionCookie(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', authLimiter, (req, res) => {
  const b = req.body || {};
  const mail = email(b.email);
  const password = str(b.password, { field: 'Password', max: 100 });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(mail);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, 'Incorrect email or password.');
  }
  setSessionCookie(res, user.id);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.patch('/me', requireAuth, (req, res) => {
  const b = req.body || {};
  const u = req.user;
  const next = {
    name: b.name !== undefined ? str(b.name, { field: 'Name', min: 2, max: 60 }) : u.name,
    phone: b.phone !== undefined ? phone(b.phone, { required: false }) : u.phone,
    business: b.business !== undefined ? str(b.business, { field: 'Business name', min: 2, max: 80 }) : u.business,
    plan: b.plan !== undefined ? oneOf(b.plan, PLANS, 'Plan') : u.plan,
  };
  if (u.role === 'team') next.plan = u.plan;
  db.prepare('UPDATE users SET name = ?, phone = ?, business = ?, plan = ? WHERE id = ?').run(next.name, next.phone, next.business, next.plan, u.id);
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(u.id)) });
});

router.post('/password', requireAuth, (req, res) => {
  const b = req.body || {};
  const current = str(b.currentPassword, { field: 'Current password', max: 100 });
  const next = str(b.newPassword, { field: 'New password', min: 8, max: 100 });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(current, row.password_hash)) throw new HttpError(400, 'Current password is incorrect.');
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), req.user.id);
  res.json({ ok: true });
});

export default router;
