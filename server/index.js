import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, seed, DEMO_EMAIL, DEMO_PASSWORD, teamEmail, usingDefaultTeamPassword } from './db.js';
import { sessionMiddleware } from './auth.js';
import { HttpError } from './util.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import bookingRoutes from './routes/bookings.js';
import clientRoutes from './routes/clients.js';
import { TEAM } from '../src/data/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

const seeded = seed();

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
// Send the bare domain to the canonical one (e.g. example.tech -> www.example.tech).
// Only the bare form of CANONICAL_HOST is redirected, so the host's own *.up.railway.app URL and health checks keep working.
const CANONICAL_HOST = (process.env.CANONICAL_HOST || '').toLowerCase();
const BARE_HOST = CANONICAL_HOST.startsWith('www.') ? CANONICAL_HOST.slice(4) : '';
if (BARE_HOST) {
  app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase().split(':')[0];
    if (host !== BARE_HOST) return next();
    res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  });
}

app.use(express.json({ limit: '50kb' }));
app.use(sessionMiddleware(db));

// Basic CSRF defence: state-changing API calls must come from our own pages as JSON.
app.use('/api', (req, res, next) => {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'Requests must be sent as JSON.' });
  }
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// In production, serve the built frontend and let the SPA handle routing.
const dist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: isProd ? '1h' : 0 }));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`\n  AMY Tech API listening on http://localhost:${PORT}`);
  if (seeded) {
    console.log('\n  Database created and seeded:');
    console.log(`    Demo client  ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    for (const m of TEAM) console.log(`    Team         ${teamEmail(m.key)}`);
  }
  if (usingDefaultTeamPassword) {
    console.log('\n  ⚠ Team accounts use the default password from server/config.js. Set TEAM_PASSWORD before the first run in production,');
    console.log('    or change each password after signing in.\n');
  }
});
