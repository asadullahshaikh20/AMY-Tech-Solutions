# AMY Tech Solutions: Website, Client Portal & API

Full-stack web app for AMY Tech Solutions (Sukkur, Sindh).

- **Frontend:** React 18, Vite 6, Tailwind CSS v4, lucide-react
- **Backend:** Node.js 22.5+ (built-in `node:sqlite`), Express 5
- **Database:** SQLite file at `data/amy.db`, created and seeded on first start

## Run

```bash
npm install          # first time only
npm run dev          # API on :3001 + website on http://localhost:5173 (Vite proxies /api)
```

Production (one process serves the API and the built site):

```bash
npm run build
npm start            # http://localhost:3001
```

## Accounts created on first start

| Who | Email | Password |
|---|---|---|
| Demo client | `demo@amy-demo.local` | `demo12345` (also the "Explore with the demo account" button) |
| Mukesh (team) | `mukesh@amy-team.local` | value of `TEAM_PASSWORD`, default `amy-team-2026` |
| Yakoob (team) | `yakoob@amy-team.local` | same |
| Asadullah (team) | `asadullah@amy-team.local` | same |

Change the team passwords from **Account → Change password** after the first sign-in, or set `TEAM_PASSWORD` before the database is first created.

## What the backend does

- **Auth:** register, sign in and sign out with httpOnly signed session cookies (7 days), scrypt password hashing, password change, and rate-limited login/registration.
- **Clients** submit requests, see only their own tasks, comment, change priority, withdraw requests that haven't started, and approve work or request changes once it reaches Quality Review.
- **Team members** see every client's tasks, move them through the pipeline (drag-and-drop), reassign, delete, log requests on a client's behalf, manage consultation requests (New → Contacted → Converted/Closed, with call and WhatsApp links), and view the client list with each plan's usage.
- **Plan limits** are enforced on the server: Basic 1, Growth 2, Pro 3 active tasks per client.
- **Consultation bookings** from the website form and the AMY AI chatbot are stored for the team. Public submissions are rate-limited and have a honeypot field to block spam bots.
- The portal refreshes every 15 seconds, so clients see the team's updates without reloading.

## API

| Method | Path | Access |
|---|---|---|
| GET | `/api/health` | public |
| GET/PATCH | `/api/auth/me` | signed in |
| POST | `/api/auth/register`, `/login`, `/logout`, `/password` | public / signed in |
| GET | `/api/auth/demo` | public (demo credentials) |
| GET/POST | `/api/tasks` | client: own · team: all |
| PATCH/DELETE | `/api/tasks/:id` | role-checked |
| POST | `/api/tasks/:id/comments` | owner or team |
| POST | `/api/tasks/reset-demo` | demo account only |
| POST | `/api/bookings` | public, rate-limited |
| GET/PATCH/DELETE | `/api/bookings[/:id]` | team |
| GET | `/api/clients` | team |

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 3001) |
| `NODE_ENV=production` | Marks cookies `Secure` (serve over HTTPS) |
| `SESSION_SECRET` | Cookie signing secret (otherwise generated into `data/.session-secret`) |
| `TEAM_PASSWORD` | Initial password for the three team accounts |
| `DEMO_EMAIL`, `DEMO_PASSWORD` | Demo client credentials |
| `DATA_DIR` / `DB_FILE` | Where the SQLite database lives |
| `TRUST_PROXY` | Set to `1` behind a reverse proxy so rate limits see real client IPs |

To start from a clean database, stop the server and delete the `data/` folder.

## Structure

```
server/
  index.js            Express app, security headers, static hosting of dist/
  config.js           demo/team credentials from env
  db.js               SQLite schema, seed data, transactions
  auth.js             password hashing, signed session cookies, role guards
  util.js             validation helpers, rate limiter
  routes/             auth, tasks, bookings, clients
src/
  App.jsx             site shell, session user, bookings, chat
  lib/api.js          fetch wrapper for the API
  lib/chatbot.js      AMY AI intent engine and quote calculator
  data/               business content and task constants (shared with the server)
  components/         public site sections, chat widget, toasts
  components/portal/  sign-in, client portal, team workspace, task board/modal
```
