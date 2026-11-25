import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireTeam } from '../auth.js';
import { HttpError, oneOf, phone, rateLimit, str } from '../util.js';
import { BUSINESS_TYPES, CONTACT_TIMES, REQUESTED_SERVICES } from '../../src/data/content.js';

const router = Router();
const bookingLimiter = rateLimit({ windowMs: 10 * 60_000, max: 8, message: 'Too many requests from your network. Please try again later.' });

const STATUSES = ['new', 'contacted', 'converted', 'closed'];
const SOURCES = ['Website form', 'AMY AI chatbot'];
const EXTRA_SERVICES = ['Free consultation (booked via AMY AI)'];

const serialize = (r) => ({
  id: r.id,
  ref: r.ref,
  name: r.name,
  businessType: r.business_type,
  phone: r.phone,
  service: r.service,
  time: r.contact_time,
  message: r.message,
  source: r.source,
  status: r.status,
  createdAt: r.created_at,
});

function newRef() {
  for (;;) {
    const ref = `CON-${crypto.randomInt(10000, 99999)}`;
    if (!db.prepare('SELECT 1 FROM bookings WHERE ref = ?').get(ref)) return ref;
  }
}

router.post('/', bookingLimiter, (req, res) => {
  const b = req.body || {};
  if (b.website) throw new HttpError(400, 'Invalid submission.'); // honeypot field for bots
  const data = {
    name: str(b.name, { field: 'Name', min: 2, max: 60 }),
    businessType: oneOf(b.businessType || 'Other', [...BUSINESS_TYPES, 'Not specified'], 'Business type'),
    phone: phone(b.phone),
    service: oneOf(b.service, [...REQUESTED_SERVICES, ...EXTRA_SERVICES], 'Service'),
    time: str(b.time, { field: 'Preferred contact time', max: 60 }),
    message: str(b.message, { field: 'Message', max: 500, required: false }),
    source: oneOf(b.source || 'Website form', SOURCES, 'Source'),
  };
  if (!CONTACT_TIMES.includes(data.time) && data.source !== 'AMY AI chatbot') {
    throw new HttpError(400, 'Choose a preferred contact time.');
  }
  const ref = newRef();
  const r = db
    .prepare(
      `INSERT INTO bookings (ref, name, business_type, phone, service, contact_time, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(ref, data.name, data.businessType, data.phone, data.service, data.time, data.message, data.source);
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(r.lastInsertRowid));
  console.log(`[booking] ${ref} ${data.name} · ${data.service} · ${data.time}`);
  // Only echo back non-sensitive fields to the public client.
  res.status(201).json({ booking: { ref: row.ref, name: row.name, service: row.service, time: row.contact_time, source: row.source, createdAt: row.created_at } });
});

router.get('/', requireTeam, (_req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500').all();
  res.json({ bookings: rows.map(serialize) });
});

router.patch('/:id', requireTeam, (req, res) => {
  const status = oneOf(req.body?.status, STATUSES, 'Status');
  const r = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  if (r.changes === 0) throw new HttpError(404, 'Booking not found.');
  res.json({ booking: serialize(db.prepare('SELECT * FROM bookings WHERE id = ?').get(Number(req.params.id))) });
});

router.delete('/:id', requireTeam, (req, res) => {
  const r = db.prepare('DELETE FROM bookings WHERE id = ?').run(Number(req.params.id));
  if (r.changes === 0) throw new HttpError(404, 'Booking not found.');
  res.json({ ok: true });
});

export default router;
