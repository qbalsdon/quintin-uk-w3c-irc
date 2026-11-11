// W3C IRC: a web IRC client for irc.w3.org. Each visitor gets their own IRC connection,
// up to MAX_CONNECTIONS at a time. Nothing is written to disk and nothing is tracked.
import './lib/env.js'; // must be first: loads .env before the settings below are read
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Session, cleanPrefs } from './lib/session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, 'site');

const env = process.env;
const PORT = Number(env.PORT || 8787);
// Passenger provides the socket itself; locally, listen on loopback only.
const HOST = env.HOST || (env.PASSENGER_APP_ENV ? undefined : '127.0.0.1');
const BASE_PATH = normalizeBasePath(env.BASE_PATH || env.PASSENGER_BASE_URI || '');
const MAX_CONNECTIONS = Math.max(1, Number(env.MAX_CONNECTIONS || 10));
const IDLE_MS = Number(env.IDLE_MINUTES || 10) * 60_000; // no tab open for this long → disconnect
// Only this IRC server can be used. Overridable for tests only.
const IRC = { host: env.IRC_HOST || 'irc.w3.org', port: Number(env.IRC_PORT || 6679), tls: (env.IRC_TLS ?? 'true') !== 'false' };
const ADMIN_CODE = env.ADMIN_CODE || '';
const SID = 'w3circ_sid';
const NOT_FOUND = fs.readFileSync(path.join(SITE, '404.html'), 'utf8').replaceAll('{{BASE}}', BASE_PATH);

function normalizeBasePath(p) {
  p = String(p).trim().replace(/\/+$/, '');
  if (!p || p === '/') return '';
  return p.startsWith('/') ? p : '/' + p;
}

// ---------- sessions ----------
/** @type {Map<string, Session>} */
const sessions = new Map();

function counts() { return { count: sessions.size, max: MAX_CONNECTIONS }; }
function announceCount() {
  const c = { type: 'count', ...counts() };
  for (const s of sessions.values()) s.emit(c);
}
function removeSession(s) {
  sessions.delete(s.id);
  announceCount();
}

setInterval(() => {
  const now = Date.now();
  for (const s of sessions.values()) {
    if (s.listeners.size === 0 && now - s.lastSeen > IDLE_MS) s.end('Disconnected after being idle');
  }
}, Math.min(30_000, Math.max(1000, IDLE_MS / 4))).unref();

// ---------- helpers ----------
function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
const isHttps = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https' || env.COOKIE_SECURE === '1';
function sidCookie(req, value, clear = false) {
  return [
    `${SID}=${clear ? '' : value}`,
    `Path=${BASE_PATH || '/'}`,
    'HttpOnly',
    'SameSite=Strict',
    ...(isHttps(req) ? ['Secure'] : []),
    ...(clear ? ['Max-Age=0'] : []),
  ].join('; ');
}
const sessionOf = (req) => sessions.get(parseCookies(req)[SID] || '');

function codeMatches(code) {
  if (!ADMIN_CODE || ADMIN_CODE.length < 16 || !code) return false;
  const a = crypto.createHash('sha256').update(String(code)).digest();
  const b = crypto.createHash('sha256').update(ADMIN_CODE).digest();
  return crypto.timingSafeEqual(a, b);
}
const isAdmin = (req) => codeMatches(req.get('x-admin-code'));

// ---------- web ----------
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});

const notFound = (req, res) => res.status(404).set('Cache-Control', 'no-store').type('html').send(NOT_FOUND);
const router = express.Router();
router.use(express.json({ limit: '32kb' }));

const page = (file) => (req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(SITE, file));
router.get('/', page('index.html'));
router.get('/cookies', page('cookies.html'));
// The HTML pages are only served through their routes (the admin page needs its code).
router.get(/\.html$/i, (req, res) => notFound(req, res));
router.use(express.static(SITE, { index: false, setHeaders: (res) => res.set('Cache-Control', 'no-cache') }));

// Can this server reach the IRC server? (Hosting firewalls often block IRC ports.) Cached for a minute.
let ircProbe = { at: 0, result: 'unknown' };
function probeIrc() {
  if (Date.now() - ircProbe.at < 60_000) return Promise.resolve(ircProbe.result);
  return new Promise((resolve) => {
    const sock = net.connect({ host: IRC.host, port: IRC.port });
    const done = (result) => { sock.destroy(); ircProbe = { at: Date.now(), result }; resolve(result); };
    sock.setTimeout(5000, () => done('timeout'));
    sock.once('connect', () => done('reachable'));
    sock.once('error', (e) => done(`blocked (${e.code || e.message})`));
  });
}
router.get('/api/health', async (req, res) => res.json({ status: 'ok', ...counts(), irc: `${IRC.host}:${IRC.port}`, ircReachable: await probeIrc() }));
router.get('/api/status', (req, res) => res.json(counts()));

// Start (or resume) this browser's IRC connection with the preferences from its cookie.
router.post('/api/session', (req, res) => {
  const existing = sessionOf(req);
  if (existing) return res.json({ ok: true, resumed: true, ...counts() });
  const prefs = cleanPrefs(req.body || {});
  if (!prefs.nick) return res.status(400).json({ error: 'nick', message: 'Choose a nickname: letters, digits and - _ [ ] { } | ^ `, up to 30 characters, not starting with a digit or -.' });
  if (sessions.size >= MAX_CONNECTIONS) return res.status(503).json({ error: 'full', ...counts() });
  const s = new Session(prefs, IRC, removeSession);
  sessions.set(s.id, s);
  res.set('Set-Cookie', sidCookie(req, s.id));
  s.connect();
  announceCount();
  res.status(201).json({ ok: true, ...counts() });
});

// Live updates for this browser's connection (Server-Sent Events).
router.get('/api/events', (req, res) => {
  const s = sessionOf(req);
  if (!s) return res.status(404).json({ error: 'no-session' });
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write('retry: 3000\n\n');
  const deliver = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
    if (obj.type === 'ended') res.end();
  };
  const off = s.addListener(deliver);
  deliver({ type: 'count', ...counts() });
  const ping = setInterval(() => res.write(': ping\n\n'), 25_000); // keeps proxies from closing the stream
  req.on('close', () => { clearInterval(ping); off(); });
});

router.post('/api/cmd', (req, res) => {
  const s = sessionOf(req);
  if (!s) return res.status(404).json({ error: 'no-session' });
  const m = req.body || {};
  if (m.type === 'quit') {
    s.end('Disconnected');
    res.set('Set-Cookie', sidCookie(req, '', true));
  } else {
    s.handle(m);
  }
  res.status(204).end();
});

// Disconnects (if connected) and removes the session cookie. Used by "Forget me" on the cookies page.
router.post('/api/forget', (req, res) => {
  sessionOf(req)?.end('Disconnected');
  res.set('Set-Cookie', sidCookie(req, '', true)).status(204).end();
});

// ---------- management (needs the admin code) ----------
router.get('/api/admin/sessions', (req, res) => {
  if (!isAdmin(req)) return res.status(404).json({ error: 'not-found' });
  res.json({
    ...counts(),
    irc: `${IRC.host}:${IRC.port}`,
    idleMinutes: IDLE_MS / 60_000,
    sessions: [...sessions.values()].map((s) => ({
      id: s.publicId,
      nick: s.currentNick,
      ircConnected: s.connected,
      channels: s.joinedChannels(),
      tabs: s.listeners.size,
      since: s.createdAt,
      lastSeen: s.listeners.size ? Date.now() : s.lastSeen,
    })),
  });
});
router.post('/api/admin/sessions/:id/end', (req, res) => {
  if (!isAdmin(req)) return res.status(404).json({ error: 'not-found' });
  const s = [...sessions.values()].find((x) => x.publicId === req.params.id);
  if (!s) return res.status(404).json({ error: 'gone' });
  s.end('Disconnected by the administrator');
  res.status(204).end();
});
router.post('/api/admin/end-all', (req, res) => {
  if (!isAdmin(req)) return res.status(404).json({ error: 'not-found' });
  for (const s of [...sessions.values()]) s.end('Disconnected by the administrator');
  res.status(204).end();
});
// quintin.uk/w3c-irc/<admin code> → the management page. Anything else → 404.
router.get('/:code', (req, res, next) => (codeMatches(req.params.code) ? page('admin.html')(req, res) : next()));

router.use(notFound);

if (BASE_PATH) {
  // /w3c-irc → /w3c-irc/ so relative URLs resolve under the base path.
  app.use((req, res, next) => (req.path === BASE_PATH ? res.redirect(301, BASE_PATH + '/' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')) : next()));
  app.use(BASE_PATH, router);
  app.use(notFound);
} else {
  app.use(router);
}

const server = http.createServer(app);

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.once(sig, () => {
    for (const s of [...sessions.values()]) s.end('Server restarting');
    setTimeout(() => process.exit(0), 500).unref();
  });
}

// Resolves with the port once the server is listening (PORT=0 picks a free port).
export const ready = new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(PORT, HOST, () => {
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : PORT;
    console.log(`W3C IRC listening on ${HOST || '*'}:${port}${BASE_PATH} (IRC ${IRC.host}:${IRC.port}, max ${MAX_CONNECTIONS})`);
    resolve(port);
  });
});
