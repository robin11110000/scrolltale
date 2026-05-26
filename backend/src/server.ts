import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

// ── Database ────────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Prevent unhandled 'error' events from crashing the process when DB is
// unavailable in the preview sandbox (no Postgres addon wired yet).
pool.on('error', (err) => {
  console.error('pg pool error (non-fatal in preview):', err.message);
});

// Create waitlist table on startup
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        role TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(email)
      )
    `);
    console.log('Waitlist table ready.');
  } catch (err) {
    console.error('DB init error (non-fatal in preview):', (err as Error).message);
  }
})();

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'scrolltale-api' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'scrolltale-api' });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'Scrolltale API',
    routes: [
      { method: 'POST', path: '/api/waitlist', description: 'Join the waitlist', body: '{ email, role? }' },
      { method: 'GET',  path: '/api/health',   description: 'Health check' },
    ],
  });
});

app.post('/api/waitlist', async (req, res) => {
  const { email, role } = req.body as { email?: string; role?: string };

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'email is required' });
    return;
  }
  const trimmed = email.trim().toLowerCase();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(trimmed)) {
    res.status(400).json({ error: 'invalid email address' });
    return;
  }

  const validRole = role === 'reader' || role === 'creator' ? role : null;

  try {
    await pool.query(
      `INSERT INTO waitlist (email, role) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role`,
      [trimmed, validRole]
    );
    res.json({ ok: true, message: "you're on the list" });
  } catch (err) {
    console.error('Waitlist insert error:', err);
    res.status(500).json({ error: 'something went wrong, please try again' });
  }
});

// Add your /api/* routes above this line.

// In the deployed container the frontend's production build is copied to
// ./public next to the server (see the root Dockerfile), so this Express
// server is the single origin for both the UI and /api — the browser calls
// /api/... with relative paths. During preview ./public does not exist (the
// Vite dev server serves the UI and proxies /api here); the existsSync guards
// make the static handler and SPA fallback no-op in that case.
const publicDir = path.join(process.cwd(), 'public');
const indexHtml = path.join(publicDir, 'index.html');

if (fs.existsSync(publicDir)) {
	app.use(express.static(publicDir));
}

app.use((req, res, next) => {
	if (req.method !== 'GET' || req.path.startsWith('/api/')) {
		next();
		return;
	}
	if (fs.existsSync(indexHtml)) {
		res.sendFile(indexHtml);
		return;
	}
	next();
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log(`API listening on ${port}`);
});
