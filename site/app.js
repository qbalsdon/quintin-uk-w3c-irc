'use strict';

// ---------- icons (24x24 stroke) ----------
const I = {
  invite: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  listPlus: '<path d="M11 12H3M16 6H3M16 18H3M18 9v6M21 12h-6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  next: '<path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="16" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  penUser: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4z"/><path d="M3 21h8"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
  heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
  action: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  gavel: '<path d="M14 13l-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
  handUp: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  handDown: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/><path d="M2 2l20 20"/>',
  queue: '<path d="M3 6h18M3 12h12M3 18h6"/><circle cx="19" cy="17" r="3"/><path d="M19 15.5V17l1 1"/>',
  ack: '<path d="M7 10v12M15 5.9L14 10h5.8a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.5 22H7V10l4-8a3 3 0 0 1 4 3.9z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
  bye: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${I[k]}</svg>`;

// ---------- quick actions (W3C meeting commands: https://www.w3.org/2001/12/zakim-irc-bot.html) ----------
// mode: 'send' sends immediately, 'insert' puts text in the composer for you to finish.
// Placeholders: {channel} {group} {date} {nick}
// admin: true groups are one-off chair actions, shown in the collapsed Admin panel.
const QUICK = [
  { group: 'Start meeting', admin: true, items: [
    { label: 'Invite Zakim', icon: 'invite', cmd: '/invite zakim {channel}', mode: 'send' },
    { label: 'Invite RRSAgent', icon: 'invite', cmd: '/invite rrsagent {channel}', mode: 'send' },
    { label: 'Start meeting', icon: 'play', cmd: 'Zakim, start meeting', mode: 'send' },
    { label: 'This is', icon: 'tag', cmd: 'Zakim, this is {group} {date}', mode: 'send' },
    { label: 'Meeting:', icon: 'calendar', cmd: 'Meeting: {group} {date}', mode: 'send' },
  ]},
  { group: 'Agenda', items: [
    { label: 'Agenda+', icon: 'listPlus', cmd: 'agenda+ ', mode: 'insert' },
    { label: 'Show agenda', icon: 'list', cmd: 'zakim, agenda?', mode: 'send' },
    { label: 'Next item', icon: 'next', cmd: 'move to next agendum', mode: 'send' },
    { label: 'Open item #', icon: 'hash', cmd: 'open agendum ', mode: 'insert' },
  ]},
  { group: 'Scribe', items: [
    { label: 'Nominate', icon: 'dice', cmd: 'Zakim, nominate a scribe', mode: 'send' },
    { label: 'I’ll scribe', icon: 'penUser', cmd: 'scribe: {nick}', mode: 'send' },
    { label: 'Scribe:', icon: 'pen', cmd: 'scribe: ', mode: 'insert' },
  ]},
  { group: 'Attendance', items: [
    { label: 'Present+', icon: 'check', cmd: 'present+', mode: 'send' },
    { label: 'Present+ who', icon: 'users', cmd: 'present+ ', mode: 'insert' },
    { label: 'Regrets+', icon: 'xCircle', cmd: 'regrets+ ', mode: 'insert' },
  ]},
  { group: 'Record', items: [
    { label: 'Topic', icon: 'heading', cmd: 'TOPIC: ', mode: 'insert' },
    { label: 'Action', icon: 'action', cmd: 'ACTION: ', mode: 'insert' },
    { label: 'Resolution', icon: 'gavel', cmd: 'RESOLUTION: ', mode: 'insert' },
  ]},
  { group: 'Queue', items: [
    { label: 'q+', icon: 'handUp', cmd: 'q+', mode: 'send' },
    { label: 'q-', icon: 'handDown', cmd: 'q-', mode: 'send' },
    { label: 'q*', icon: 'handUp', cmd: 'q+ to ', mode: 'insert' },
    { label: 'q?', icon: 'queue', cmd: 'q?', mode: 'send' },
    { label: 'Ack', icon: 'ack', cmd: 'ack ', mode: 'insert' },
    { label: 'Close queue', icon: 'lock', cmd: 'close the queue', mode: 'send' },
    { label: 'Open queue', icon: 'unlock', cmd: 'open the queue', mode: 'send' },
  ]},
  { group: 'Finish meeting', admin: true, items: [
    { label: 'Participants', icon: 'users', cmd: 'Zakim, list participants', mode: 'send' },
    { label: 'Make minutes', icon: 'file', cmd: 'rrsagent, make minutes', mode: 'send' },
    { label: 'Logs public', icon: 'globe', cmd: 'rrsagent, set logs public', mode: 'send' },
    { label: 'RRSAgent bye', icon: 'bye', cmd: 'rrsagent, bye', mode: 'send', confirm: true },
    { label: 'Zakim bye', icon: 'bye', cmd: 'zakim, bye', mode: 'send', confirm: true },
  ]},
];

// ---------- state ----------
const state = {
  settings: null,
  status: { connected: false, nick: '' },
  serverBuffer: '*server*',
  buffers: new Map(), // key -> {name,type,topic,joined,users,messages,unread,hl}
  active: null,
  showUsers: loadPref('showUsers', true),
  sideView: null, // 'channels' when the channel list is opened manually while in a joined channel
  showAdmin: loadPref('showAdmin', false),
  scribe: false,
  speaker: '',
};
const key = (n) => n.toLowerCase();
function loadPref(k, d) { try { const v = localStorage.getItem('irc.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } }
function savePref(k, v) { try { localStorage.setItem('irc.' + k, JSON.stringify(v)); } catch {} }

const $ = (id) => document.getElementById(id);
const els = {
  status: $('status'), statusText: $('status-text'),
  saved: $('saved-list'), other: $('other-list'),
  addForm: $('add-channel'), addInput: $('add-channel-input'),
  name: $('buf-name'), topic: $('buf-topic'),
  join: $('join-btn'), part: $('part-btn'), close: $('close-btn'),
  usersToggle: $('users-toggle'), userCount: $('user-count'),
  quickGroups: $('quick-groups'),
  sideChannels: $('side-channels'), sideControls: $('side-controls'), sideBack: $('side-back'), sideBackBadge: $('side-back-badge'),
  sideChanName: $('side-chan-name'), sideLeave: $('side-leave'),
  log: $('log'), userlist: $('userlist'), users: $('users'),
  composer: $('composer'), input: $('composer-input'), composerNick: $('composer-nick'),
  mentionList: $('mention-list'), mentionStatus: $('mention-status'),
  scribeToggle: $('scribe-toggle'), speakerWrap: $('scribe-speaker-wrap'), speaker: $('scribe-speaker'), speakers: $('scribe-speakers'),
  dialog: $('settings'), settingsForm: $('settings-form'), settingsBtn: $('settings-btn'), reconnect: $('reconnect-btn'),
  connCount: $('conn-count'), disconnect: $('disconnect-btn'),
  connectDialog: $('connect'), connectForm: $('connect-form'), connectCount: $('connect-count'), connectError: $('connect-error'), connectBtn: $('connect-btn'),
};

// ---------- preferences cookie ----------
// The nickname, full name and saved channels live only in this cookie on the visitor's browser.
const PREFS_COOKIE = 'w3circ_prefs';
const NICK_RE = /^[A-Za-z[\]\\`_^{|}][A-Za-z0-9[\]\\`_^{|}-]{0,29}$/;
const cookiePath = () => location.pathname.replace(/[^/]*$/, '') || '/';
function readPrefs() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${PREFS_COOKIE}=([^;]*)`));
  if (!m) return null;
  try { const p = JSON.parse(decodeURIComponent(m[1])); return p && typeof p === 'object' ? p : null; } catch { return null; }
}
function writePrefs(p) {
  const v = encodeURIComponent(JSON.stringify({ nick: p.nick || '', realname: p.realname || '', channels: p.channels || [] }));
  document.cookie = `${PREFS_COOKIE}=${v}; Path=${cookiePath()}; Max-Age=31536000; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`;
}

// ---------- server connection (one IRC session per browser, live updates over Server-Sent Events) ----------
let events = null;
let retry = 0;

async function api(path, body) {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), credentials: 'same-origin' });
  let data = null;
  try { data = res.status === 204 ? null : await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}
const send = (obj) => api('api/cmd', obj).then((r) => { if (r.status === 404) startSession(); });

// Starts (or resumes) this browser's IRC connection using the remembered preferences.
async function startSession(prefs = readPrefs()) {
  if (!prefs || !NICK_RE.test(prefs.nick || '')) return showConnect();
  let r;
  try { r = await api('api/session', prefs); } catch { return retryLater(); }
  if (r.ok) { hideConnect(); return openEvents(); }
  if (r.status === 503 && r.data?.error === 'full') { renderCount(r.data); return showConnect(`All ${r.data.max} connections are in use. Try again in a few minutes.`); }
  if (r.status === 400) return showConnect(r.data?.message || 'Check your nickname.');
  return retryLater();
}
function retryLater() {
  setStatus({ connected: false, nick: state.status.nick }, 'Server unreachable — retrying…');
  setTimeout(() => startSession(), Math.min(1000 * 2 ** retry++, 15000));
}
function openEvents() {
  if (events) events.close();
  events = new EventSource('api/events');
  events.onopen = () => { retry = 0; };
  events.onmessage = (ev) => handle(JSON.parse(ev.data));
  events.onerror = () => {
    // A closed stream means the session is gone (server restarted or it timed out): start a new one.
    if (events.readyState === EventSource.CLOSED) { events = null; retryLater(); }
  };
}
function endedLocally(message) {
  if (events) { events.close(); events = null; }
  state.buffers.clear();
  state.settings = { ...(readPrefs() || {}), channels: (readPrefs() || {}).channels || [] };
  state.active = null;
  setStatus({ connected: false, nick: '' }, 'Not connected');
  els.name.textContent = 'Not connected'; els.topic.textContent = '';
  renderSidebar(); renderLog(); renderUsers();
  showConnect(message);
}

// ---------- connection count ----------
function renderCount(c) {
  if (!c || typeof c.count !== 'number') return;
  const text = `${c.count} of ${c.max} connections in use`;
  els.connCount.textContent = text;
  els.connCount.classList.toggle('full', c.count >= c.max);
  els.connectCount.textContent = text;
}
async function pollCount() {
  try { renderCount(await (await fetch('api/status', { cache: 'no-store' })).json()); } catch {}
}
let countTimer = null;

// ---------- connect screen ----------
function showConnect(message = '') {
  const p = readPrefs() || {};
  const f = els.connectForm.elements;
  if (!f.nick.value) f.nick.value = p.nick || '';
  if (!f.realname.value) f.realname.value = p.realname || '';
  if (!f.channels.value) f.channels.value = (p.channels || []).join(' ');
  els.connectError.textContent = message;
  f.nick.setAttribute('aria-invalid', String(!!message && /nick/i.test(message)));
  pollCount();
  clearInterval(countTimer);
  countTimer = setInterval(pollCount, 15000);
  if (!els.connectDialog.open) els.connectDialog.showModal();
  (message && /nick/i.test(message) ? f.nick : (f.nick.value ? els.connectBtn : f.nick)).focus();
}
function hideConnect() {
  clearInterval(countTimer);
  if (els.connectDialog.open) els.connectDialog.close();
}
els.connectDialog.addEventListener('cancel', (e) => e.preventDefault()); // nothing works without connecting
els.connectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = els.connectForm.elements;
  const nick = f.nick.value.trim();
  if (!NICK_RE.test(nick)) return showConnect('That nickname can’t be used. Use letters, digits and - _ [ ] { } | ^ `, up to 30 characters, not starting with a digit or -.');
  const channels = f.channels.value.split(/[\s,]+/).map((c) => c.trim()).filter(Boolean).map((c) => (/^[#&]/.test(c) ? c : '#' + c));
  const prefs = { nick, realname: f.realname.value.trim(), channels };
  writePrefs(prefs);
  els.connectBtn.disabled = true;
  try { await startSession(prefs); } finally { els.connectBtn.disabled = false; }
});

els.disconnect.onclick = async () => {
  await api('api/cmd', { type: 'quit' }).catch(() => {});
  endedLocally('You disconnected. Connect again whenever you like.');
};

function handle(m) {
  switch (m.type) {
    case 'init': {
      state.settings = m.settings;
      writePrefs(m.settings);
      state.serverBuffer = m.serverBuffer;
      const prevActive = state.active || loadPref('active', null);
      state.buffers.clear();
      for (const b of m.buffers) state.buffers.set(key(b.name), { ...b, unread: 0, hl: 0 });
      setStatus(m.status);
      const first = (prevActive && state.buffers.get(key(prevActive))) ? prevActive : (state.settings.channels[0] || state.serverBuffer);
      state.active = null;
      renderSidebar();
      activate(first);
      break;
    }
    case 'status': setStatus(m); break;
    case 'settings':
      state.settings = m.settings;
      writePrefs(m.settings);
      renderSidebar();
      break;
    case 'buffer': {
      const ex = state.buffers.get(key(m.buffer.name));
      if (ex) Object.assign(ex, { name: m.buffer.name, type: m.buffer.type, topic: m.buffer.topic, joined: m.buffer.joined });
      else state.buffers.set(key(m.buffer.name), { ...m.buffer, unread: 0, hl: 0 });
      renderSidebar();
      if (state.active && key(state.active) === key(m.buffer.name)) renderHeader();
      break;
    }
    case 'buffer-removed':
      state.buffers.delete(key(m.buffer));
      if (state.active && key(state.active) === key(m.buffer)) activate(state.settings.channels[0] || state.serverBuffer);
      renderSidebar();
      break;
    case 'joined':
    case 'focus':
      if (m.type === 'focus' || (state.pendingFocus && key(state.pendingFocus) === key(m.buffer))) {
        state.pendingFocus = null;
        activate(m.buffer);
      }
      break;
    case 'cleared': {
      const b = state.buffers.get(key(m.buffer));
      if (b) { b.messages = []; if (isActive(b.name)) renderLog(); }
      break;
    }
    case 'users': {
      const b = state.buffers.get(key(m.buffer));
      if (!b) break;
      b.users = m.users;
      if (isActive(b.name)) { renderUsers(); if (mention.open) updateMention(); }
      break;
    }
    case 'message': onMessage(m.buffer, m.message); break;
    case 'count': renderCount(m); break;
    case 'ended': endedLocally(`${m.reason}. Connect again whenever you like.`); break;
  }
}

function setStatus(s, override) {
  state.status = { ...state.status, ...s };
  els.status.classList.toggle('on', !!s.connected);
  els.statusText.textContent = override || (s.connected ? `${s.nick} @ ${s.host || state.settings?.host || ''}` : 'Connecting…');
  els.composerNick.textContent = s.nick || '';
  renderQuickState();
}

const isActive = (name) => state.active && key(state.active) === key(name);

function onMessage(bufName, msg) {
  let b = state.buffers.get(key(bufName));
  if (!b) { b = { name: bufName, type: /^[#&]/.test(bufName) ? 'channel' : 'query', topic: '', joined: false, users: [], messages: [], unread: 0, hl: 0 }; state.buffers.set(key(bufName), b); }
  b.messages.push(msg);
  if (b.messages.length > 2000) b.messages.shift();
  const chatty = ['privmsg', 'action', 'notice'].includes(msg.kind) && !msg.self;
  if (isActive(bufName) && document.hasFocus()) {
    appendMessage(msg, b.messages[b.messages.length - 2]);
  } else {
    if (isActive(bufName)) appendMessage(msg, b.messages[b.messages.length - 2]);
    else if (chatty) b.unread++;
    if (msg.highlight && !msg.self) { if (!isActive(bufName)) b.hl++; notify(bufName, msg); }
    renderSidebar();
  }
}

function notify(bufName, msg) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || (document.hasFocus() && isActive(bufName))) return;
  const n = new Notification(`${msg.nick} in ${bufName}`, { body: msg.text, tag: bufName });
  n.onclick = () => { window.focus(); activate(bufName); n.close(); };
}

// ---------- sidebar ----------
function renderSidebar() {
  if (!state.settings) return;
  const savedKeys = new Set(state.settings.channels.map(key));
  els.saved.replaceChildren(...state.settings.channels.map((c) => bufferItem(state.buffers.get(key(c)) || { name: c, type: 'channel', joined: false, unread: 0, hl: 0 }, true)));
  const others = [...state.buffers.values()].filter((b) => !savedKeys.has(key(b.name)));
  others.sort((a, b) => (a.type === 'server' ? -1 : b.type === 'server' ? 1 : a.name.localeCompare(b.name)));
  els.other.replaceChildren(...others.map((b) => bufferItem(b, false)));
  renderSideMode();
  document.title = (totalUnread() ? `(${totalUnread()}) ` : '') + (state.active && state.active !== state.serverBuffer ? state.active + ' — ' : '') + 'W3C IRC';
}
const totalUnread = () => [...state.buffers.values()].reduce((n, b) => n + (b.hl || 0), 0);

function bufferItem(b, saved) {
  const li = document.createElement('li');
  if (isActive(b.name)) li.classList.add('active');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'buf-btn' + (b.type === 'channel' && !b.joined ? ' parted' : '');
  const label = b.type === 'server' ? 'Server' : b.name;
  btn.innerHTML = `<span class="name"></span>`;
  btn.querySelector('.name').textContent = label;
  if (isActive(b.name)) btn.setAttribute('aria-current', 'page');
  let desc = label;
  if (b.type === 'channel' && !b.joined) desc += ', not joined';
  if (b.unread) {
    const badge = document.createElement('span');
    badge.className = 'badge' + (b.hl ? ' hl' : '');
    badge.textContent = b.unread > 99 ? '99+' : b.unread;
    btn.append(badge);
    desc += `, ${b.unread} unread${b.hl ? `, ${b.hl} mentioning you` : ''}`;
    badge.setAttribute('aria-hidden', 'true');
  }
  btn.setAttribute('aria-label', desc);
  btn.onclick = () => activate(b.name);
  li.append(btn);

  if (saved) {
    li.append(iconBtn('pencil', `Edit ${b.name}`, () => startRename(li, b.name)));
    li.append(iconBtn('trash', `Remove ${b.name} from saved channels`, () => {
      if (!confirm(`Remove ${b.name} from your saved channels and leave it?`)) return;
      send({ type: 'unsave-channel', channel: b.name });
      send({ type: 'close', buffer: b.name });
    }));
  } else if (b.type !== 'server') {
    if (b.type === 'channel') li.append(iconBtn('check', `Save ${b.name} to channels`, () => send({ type: 'save-channel', channel: b.name, join: false })));
    li.append(iconBtn('x', `Close ${b.name}`, () => send({ type: 'close', buffer: b.name })));
  }
  return li;
}

function iconBtn(icon, label, fn) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'icon-btn';
  b.innerHTML = svg(icon);
  b.setAttribute('aria-label', label);
  b.title = label;
  b.onclick = (e) => { e.stopPropagation(); fn(); };
  return b;
}

function startRename(li, name) {
  const input = document.createElement('input');
  input.className = 'rename';
  input.value = name;
  input.setAttribute('aria-label', `Rename ${name}`);
  li.replaceChildren(input);
  input.focus();
  input.select();
  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    const v = input.value.trim();
    if (commit && v && v.toLowerCase() !== name.toLowerCase()) send({ type: 'rename-channel', from: name, to: v });
    renderSidebar();
  };
  input.onkeydown = (e) => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); };
  input.onblur = () => finish(true);
}

els.addForm.onsubmit = (e) => {
  e.preventDefault();
  let v = els.addInput.value.trim();
  if (!v) return;
  if (!/^[#&]/.test(v)) v = '#' + v;
  state.pendingFocus = v;
  send({ type: 'save-channel', channel: v });
  els.addInput.value = '';
  setTimeout(() => { if (state.buffers.has(key(v))) activate(v); }, 150);
};

// ---------- main view ----------
function activate(name) {
  const b = state.buffers.get(key(name));
  if (!b) {
    if (state.settings?.channels.some((c) => key(c) === key(name))) {
      state.buffers.set(key(name), { name, type: 'channel', joined: false, users: [], messages: [], topic: '', unread: 0, hl: 0 });
      return activate(name);
    }
    return;
  }
  state.active = b.name;
  state.sideView = null;
  savePref('active', b.name);
  closeMention();
  b.unread = 0; b.hl = 0;
  renderSidebar();
  renderHeader();
  renderLog();
  renderUsers();
  renderQuickState();
  els.input.focus();
}

function current() { return state.active && state.buffers.get(key(state.active)); }

function renderHeader() {
  const b = current();
  if (!b) return;
  els.name.textContent = b.type === 'server' ? `Server — ${state.settings?.host || ''}` : b.name;
  els.topic.textContent = b.topic || (b.type === 'query' ? 'Private conversation' : '');
  els.topic.title = b.topic || '';
  els.join.hidden = !(b.type === 'channel' && !b.joined);
  els.part.hidden = !(b.type === 'channel' && b.joined);
  els.close.hidden = b.type === 'server' || (b.type === 'channel' && state.settings.channels.some((c) => key(c) === key(b.name)));
  const showUsers = b.type === 'channel';
  els.usersToggle.hidden = !showUsers;
  els.userlist.hidden = !(showUsers && state.showUsers);
  els.usersToggle.setAttribute('aria-expanded', String(!!state.showUsers));
  renderQuickState();
}

els.join.onclick = () => current() && send({ type: 'join', channel: current().name });
els.part.onclick = () => current() && send({ type: 'part', buffer: current().name });
els.close.onclick = () => current() && send({ type: 'close', buffer: current().name });
els.usersToggle.onclick = () => { state.showUsers = !state.showUsers; savePref('showUsers', state.showUsers); renderHeader(); };

const fmtTime = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dayOf = (t) => new Date(t).toDateString();

function renderLog() {
  const b = current();
  els.log.replaceChildren();
  if (!b) return;
  if (!b.messages.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = b.type === 'channel' && !b.joined ? 'Not joined yet.' : 'No messages yet.';
    els.log.append(p);
    return;
  }
  const frag = document.createDocumentFragment();
  let prev;
  for (const m of b.messages) { frag.append(...messageNodes(m, prev)); prev = m; }
  // avoid announcing the entire backlog to screen readers
  els.log.setAttribute('aria-live', 'off');
  els.log.append(frag);
  els.log.scrollTop = els.log.scrollHeight;
  requestAnimationFrame(() => els.log.setAttribute('aria-live', 'polite'));
}

function appendMessage(m, prev) {
  const atBottom = els.log.scrollHeight - els.log.scrollTop - els.log.clientHeight < 60;
  els.log.querySelector('.empty')?.remove();
  els.log.append(...messageNodes(m, prev));
  if (atBottom || m.self) els.log.scrollTop = els.log.scrollHeight;
}

const EVENT_KINDS = new Set(['join', 'part', 'nick', 'mode', 'topic', 'info', 'error', 'motd']);

function messageNodes(m, prev) {
  const out = [];
  if (!prev || dayOf(prev.time) !== dayOf(m.time)) {
    const sep = document.createElement('div');
    sep.className = 'day-sep';
    sep.textContent = new Date(m.time).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    out.push(sep);
  }
  const row = document.createElement('div');
  row.className = `msg ${m.kind}` + (EVENT_KINDS.has(m.kind) ? ' event' : '') + (m.highlight && !m.self ? ' highlight' : '') + (m.self ? ' self' : '');
  const time = document.createElement('time');
  time.className = 'time';
  time.dateTime = new Date(m.time).toISOString();
  time.textContent = fmtTime(m.time);
  let nickEl;
  if (m.nick && !EVENT_KINDS.has(m.kind)) {
    nickEl = document.createElement('button');
    nickEl.type = 'button';
    nickEl.className = 'nick';
    nickEl.textContent = m.kind === 'action' ? `* ${m.nick}` : m.nick;
    nickEl.style.color = m.self ? '' : nickColor(m.nick);
    nickEl.title = `Mention ${m.nick}`;
    nickEl.onclick = () => (state.scribe ? setSpeaker(m.nick) : insertText(`${m.nick}: `, true));
  } else {
    nickEl = document.createElement('span');
    nickEl.className = 'nick';
    nickEl.textContent = m.kind === 'error' ? '!' : m.kind === 'join' ? '→' : m.kind === 'part' ? '←' : '•';
    nickEl.setAttribute('aria-hidden', 'true');
  }
  const text = document.createElement('div');
  text.className = 'text';
  text.append(linkify(m.text || ''));
  if (/^(TOPIC|ACTION|RESOLUTION|scribe|Meeting):/i.test(m.text || '')) row.classList.add('cmd');
  row.append(time, nickEl, text);
  out.push(row);
  return out;
}

function linkify(s) {
  const frag = document.createDocumentFragment();
  const re = /\bhttps?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    frag.append(s.slice(last, m.index));
    const a = document.createElement('a');
    a.href = m[0]; a.textContent = m[0]; a.target = '_blank'; a.rel = 'noopener noreferrer';
    frag.append(a);
    last = m.index + m[0].length;
  }
  frag.append(s.slice(last));
  return frag;
}

function nickColor(n) {
  let h = 0;
  for (const c of n.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  return `hsl(${h % 360} 65% ${dark ? 68 : 36}%)`;
}

function renderUsers() {
  const b = current();
  const users = (b && b.users) || [];
  els.userCount.textContent = b && b.type === 'channel' ? `(${users.length})` : '';
  els.users.replaceChildren(...users.map((u) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = `<span class="prefix" aria-hidden="true"></span><span class="n"></span>`;
    btn.querySelector('.prefix').textContent = u.prefix || '';
    btn.querySelector('.n').textContent = u.nick;
    if (u.nick === state.status.nick) btn.classList.add('me');
    const role = u.prefix === '@' ? ' (operator)' : u.prefix === '+' ? ' (voiced)' : '';
    btn.setAttribute('aria-label', `${u.nick}${role}. Click to mention, double-click for private message`);
    btn.onclick = () => (state.scribe ? setSpeaker(u.nick) : insertText(`${u.nick}: `, true));
    btn.ondblclick = () => send({ type: 'send', buffer: state.active, text: `/query ${u.nick}` });
    li.append(btn);
    return li;
  }));
  els.speakers.replaceChildren(...users.filter((u) => !/^(zakim|rrsagent)$/i.test(u.nick)).map((u) => new Option(u.nick)));
}

// ---------- quick actions ----------
function fillTemplate(cmd) {
  const b = current();
  const chan = b && b.type === 'channel' ? b.name : '';
  const group = chan.replace(/^[#&]/, '').toUpperCase();
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return cmd.replaceAll('{channel}', chan).replaceAll('{group}', group).replaceAll('{date}', date).replaceAll('{nick}', state.status.nick || state.settings?.nick || '');
}

function renderQuick() {
  const group = (g) => {
    const fs = document.createElement('fieldset');
    fs.className = 'qgroup';
    const lg = document.createElement('legend');
    lg.textContent = g.group;
    const row = document.createElement('div');
    row.className = 'qbtns';
    for (const it of g.items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qbtn' + (it.mode === 'insert' ? ' insert' : '') + (it.confirm ? ' danger' : '');
      btn.innerHTML = `${svg(it.icon)}<span class="qlabel"></span>`;
      btn.querySelector('.qlabel').textContent = it.label;
      btn.dataset.cmd = it.cmd;
      btn.addEventListener('mouseenter', () => { btn.title = (it.mode === 'insert' ? 'Insert: ' : 'Send: ') + fillTemplate(it.cmd); });
      btn.addEventListener('focus', () => { btn.title = (it.mode === 'insert' ? 'Insert: ' : 'Send: ') + fillTemplate(it.cmd); });
      btn.setAttribute('aria-description', it.mode === 'insert' ? `Inserts "${it.cmd.trim()}" into the message box` : `Sends "${it.cmd}"`);
      btn.onclick = (e) => runQuick(it, e.shiftKey, btn);
      row.append(btn);
    }
    fs.append(lg, row);
    return fs;
  };
  const admin = document.createElement('details');
  admin.className = 'qadmin';
  admin.open = state.showAdmin;
  const sum = document.createElement('summary');
  sum.textContent = 'Admin';
  const adminGroups = document.createElement('div');
  adminGroups.className = 'qadmin-groups';
  adminGroups.append(...QUICK.filter((g) => g.admin).map(group));
  admin.append(sum, adminGroups);
  admin.addEventListener('toggle', () => { state.showAdmin = admin.open; savePref('showAdmin', admin.open); });
  els.quickGroups.replaceChildren(...QUICK.filter((g) => !g.admin).map(group), admin);
}

function renderQuickState() {
  renderSideMode();
  const b = current();
  const ok = !!(b && b.type === 'channel' && b.joined && state.status.connected);
  for (const btn of els.quickGroups.querySelectorAll('.qbtn')) btn.disabled = !ok;
  els.quickGroups.title = ok ? '' : 'Join a channel to use quick actions';
}

function runQuick(it, forceInsert, btn) {
  const text = fillTemplate(it.cmd);
  if (it.mode === 'insert' || forceInsert) { insertText(text, false); actionInComposer = true; return; }
  if (it.confirm && !confirm(`Send "${text}" to ${state.active}?`)) return;
  send({ type: 'send', buffer: state.active, text });
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 400);
}

// ---------- sidebar mode ----------
// Not in a joined channel → channel list. In a joined channel → channel controls + quick actions.
// Leaving the channel (or the IRC connection dropping) goes back to the channel list.
function renderSideMode() {
  const b = current();
  const controls = !!(b && b.type === 'channel' && b.joined && state.status.connected) && state.sideView !== 'channels';
  const wasControls = !els.sideControls.hidden;
  const hadFocus = (controls ? els.sideChannels : els.sideControls).contains(document.activeElement);
  els.sideControls.hidden = !controls;
  els.sideChannels.hidden = controls;
  if (controls) els.sideChanName.textContent = b.name;
  if (hadFocus && controls !== wasControls) {
    (controls ? els.sideBack : (els.saved.querySelector('li.active .buf-btn') || els.saved.querySelector('.buf-btn') || els.addInput)).focus();
  }
  const others = [...state.buffers.values()].filter((x) => !isActive(x.name)).reduce((n, x) => n + (x.unread || 0), 0);
  els.sideBackBadge.hidden = !others;
  els.sideBackBadge.textContent = others > 99 ? '99+' : others;
  els.sideBack.setAttribute('aria-label', others ? `All channels, ${others} unread` : 'All channels');
}
els.sideBack.onclick = () => { state.sideView = 'channels'; renderSideMode(); };
els.sideLeave.onclick = () => current() && send({ type: 'part', buffer: current().name });

// ---------- composer ----------
function insertText(text, atCursor) {
  const ta = els.input;
  if (atCursor) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length;
  } else {
    ta.value = text;
    ta.selectionStart = ta.selectionEnd = text.length;
  }
  autoSize();
  ta.focus();
}

// ---------- scribe mode ----------
// While on, every line typed in the composer is sent as "<speaker>: <text>".
// Quick actions, slash commands and meeting/bot commands are sent unchanged.
let actionInComposer = false; // composer text came from a quick action
const MEETING_CMD = /^\s*(?:\/|(?:topic|subtopic|action|resolution|resolved|summary|scribe|scribenick|chair|chairs|meeting|date|agenda|info|present|regrets)\s*[:+-]|(?:agenda|present|regrets|q)\s*[+\-?]|q\?|ack\b|zakim\b|rrsagent\b|open agendum\b|close agendum\b|move to next agendum\b|next agendum\b|take up\b|(?:open|close) the queue\b|s\/)/i;

function setScribe(on) {
  state.scribe = on;
  els.scribeToggle.setAttribute('aria-pressed', String(on));
  els.scribeToggle.textContent = on ? 'Stop scribing' : 'Scribe';
  els.composer.classList.toggle('scribing', on);
  els.speakerWrap.hidden = !on;
  // each scribe session starts with an empty speaker
  state.speaker = '';
  els.speaker.value = '';
  els.input.placeholder = on ? 'Scribing… (actions and /commands are sent as-is)' : 'Message… (/help for commands, @ or Tab completes nicks)';
  (on ? els.speaker : els.input).focus();
}
function setSpeaker(name) {
  state.speaker = name.trim().replace(/:\s*$/, '');
  els.speaker.value = state.speaker;
  els.input.focus();
}
function scribeLine(line) {
  const sp = state.speaker;
  if (!state.scribe || !sp || !line.trim() || MEETING_CMD.test(line)) return line;
  if (line.toLowerCase().startsWith(sp.toLowerCase() + ':')) return line;
  return `${sp}: ${line}`;
}
els.scribeToggle.onclick = () => setScribe(!state.scribe);
els.speaker.addEventListener('change', () => setSpeaker(els.speaker.value));
els.speaker.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); setSpeaker(els.speaker.value); }
  if (e.key === 'Escape') { els.speaker.value = state.speaker; els.input.focus(); }
});

const history = [];
let histIdx = -1;
let tabState = null;

els.composer.onsubmit = (e) => {
  e.preventDefault();
  const text = els.input.value;
  if (!text.trim() || !state.active) return;
  const out = actionInComposer ? text : text.split('\n').map(scribeLine).join('\n');
  actionInComposer = false;
  send({ type: 'send', buffer: state.active, text: out });
  history.unshift(text);
  if (history.length > 100) history.pop();
  histIdx = -1;
  els.input.value = '';
  autoSize();
};

// ---------- @ mention autocomplete ----------
// Typing "@" opens a list of channel members; more letters filter it,
// Up/Down move, Enter/Tab fill the selection, Escape closes.
const mention = { open: false, start: 0, end: 0, items: [], i: 0, frag: '' };

function mentionQuery() {
  const ta = els.input;
  if (ta.selectionStart !== ta.selectionEnd) return null;
  const pos = ta.selectionStart;
  const m = /(^|\s)@([^\s@]*)$/.exec(ta.value.slice(0, pos));
  return m ? { start: pos - m[2].length - 1, end: pos, frag: m[2].toLowerCase() } : null;
}

function updateMention() {
  const b = current();
  const q = b && b.users?.length ? mentionQuery() : null;
  if (!q) return closeMention();
  const me = (state.status.nick || '').toLowerCase();
  const all = b.users.filter((u) => u.nick.toLowerCase() !== me);
  const starts = all.filter((u) => u.nick.toLowerCase().startsWith(q.frag));
  const contains = q.frag ? all.filter((u) => !u.nick.toLowerCase().startsWith(q.frag) && u.nick.toLowerCase().includes(q.frag)) : [];
  const items = [...starts.sort((a, c) => a.nick.localeCompare(c.nick, undefined, { sensitivity: 'base' })), ...contains];
  if (!items.length) return closeMention();
  const prevNick = mention.open ? mention.items[mention.i]?.nick : null;
  Object.assign(mention, { open: true, start: q.start, end: q.end, items, frag: q.frag });
  mention.i = Math.max(0, items.findIndex((u) => u.nick === prevNick));
  renderMention();
  els.mentionStatus.textContent = `${items.length} name${items.length === 1 ? '' : 's'} available`;
}

function renderMention() {
  els.mentionList.replaceChildren(...mention.items.map((u, idx) => {
    const li = document.createElement('li');
    li.id = `mention-opt-${idx}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(idx === mention.i));
    if (u.prefix) { const p = document.createElement('span'); p.className = 'prefix'; p.textContent = u.prefix; p.setAttribute('aria-hidden', 'true'); li.append(p); }
    const n = u.nick, at = mention.frag ? n.toLowerCase().indexOf(mention.frag) : -1;
    if (at >= 0) {
      const mk = document.createElement('mark');
      mk.textContent = n.slice(at, at + mention.frag.length);
      li.append(n.slice(0, at), mk, n.slice(at + mention.frag.length));
    } else li.append(n);
    li.addEventListener('mousedown', (e) => { e.preventDefault(); mention.i = idx; acceptMention(); });
    return li;
  }));
  els.mentionList.hidden = false;
  els.input.setAttribute('aria-expanded', 'true');
  els.input.setAttribute('aria-activedescendant', `mention-opt-${mention.i}`);
  els.mentionList.children[mention.i]?.scrollIntoView({ block: 'nearest' });
}

function closeMention() {
  if (!mention.open) return;
  mention.open = false;
  els.mentionList.hidden = true;
  els.mentionList.replaceChildren();
  els.input.setAttribute('aria-expanded', 'false');
  els.input.removeAttribute('aria-activedescendant');
}

function acceptMention() {
  const ta = els.input;
  const nick = mention.items[mention.i].nick;
  const before = ta.value.slice(0, mention.start);
  const after = ta.value.slice(mention.end);
  // "nick: " at the start of a message (IRC convention), "nick " elsewhere
  const suffix = before.trim() === '' ? ': ' : ' ';
  const ins = nick + (after.startsWith(' ') ? suffix.trimEnd() : suffix);
  ta.value = before + ins + after;
  ta.selectionStart = ta.selectionEnd = before.length + ins.length;
  closeMention();
  autoSize();
}

els.input.addEventListener('input', updateMention);
els.input.addEventListener('click', updateMention);
els.input.addEventListener('blur', () => setTimeout(closeMention, 0));

els.input.addEventListener('keydown', (e) => {
  if (mention.open) {
    const n = mention.items.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      mention.i = (mention.i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
      return renderMention();
    }
    if ((e.key === 'Enter' && !e.shiftKey && !e.isComposing) || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); return acceptMention(); }
    if (e.key === 'Escape') { e.preventDefault(); return closeMention(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') setTimeout(updateMention, 0);
  }
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); els.composer.requestSubmit(); return; }
  if (e.key === 'ArrowUp' && !els.input.value.includes('\n') && (els.input.selectionStart === 0 || histIdx >= 0 || !els.input.value)) {
    if (histIdx < history.length - 1) { histIdx++; els.input.value = history[histIdx]; e.preventDefault(); autoSize(); }
    return;
  }
  if (e.key === 'ArrowDown' && histIdx >= 0) {
    histIdx--; els.input.value = histIdx >= 0 ? history[histIdx] : ''; e.preventDefault(); autoSize();
    return;
  }
  if (e.key === 'Tab' && !e.shiftKey) {
    const b = current();
    if (!b || !b.users?.length) return;
    const v = els.input.value;
    const pos = els.input.selectionStart;
    if (!tabState) {
      const start = v.slice(0, pos).search(/\S*$/);
      const frag = v.slice(start, pos).toLowerCase();
      if (!frag) return;
      const matches = b.users.map((u) => u.nick).filter((n) => n.toLowerCase().startsWith(frag) && n !== state.status.nick);
      if (!matches.length) return;
      tabState = { start, end: pos, matches, i: 0, after: v.slice(pos) };
    } else {
      tabState.i = (tabState.i + 1) % tabState.matches.length;
    }
    e.preventDefault();
    const nick = tabState.matches[tabState.i];
    const suffix = tabState.start === 0 ? ': ' : ' ';
    const before = els.input.value.slice(0, tabState.start);
    els.input.value = before + nick + suffix + tabState.after;
    const caret = before.length + nick.length + suffix.length;
    els.input.selectionStart = els.input.selectionEnd = caret;
    return;
  }
  tabState = null;
});

function autoSize() {
  els.input.style.height = 'auto';
  els.input.style.height = Math.min(els.input.scrollHeight, 160) + 'px';
}
els.input.addEventListener('input', () => { autoSize(); if (!els.input.value) actionInComposer = false; });

// Ctrl/Cmd+K or Alt+Up/Down: switch buffers
document.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    const order = [...state.settings.channels, ...[...state.buffers.values()].filter((b) => !state.settings.channels.some((c) => key(c) === key(b.name))).map((b) => b.name)];
    const i = order.findIndex((n) => isActive(n));
    const next = order[(i + (e.key === 'ArrowDown' ? 1 : -1) + order.length) % order.length];
    if (next) { e.preventDefault(); activate(next); }
  }
});

window.addEventListener('focus', () => {
  const b = current();
  if (b && (b.unread || b.hl)) { b.unread = 0; b.hl = 0; renderSidebar(); }
});

// ---------- settings ----------
els.settingsBtn.onclick = () => {
  const s = state.settings || {};
  const f = els.settingsForm.elements;
  f.nick.value = s.nick || '';
  f.realname.value = s.realname || '';
  els.dialog.showModal();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
};
els.dialog.addEventListener('close', () => {
  if (els.dialog.returnValue !== 'save') return;
  const f = els.settingsForm.elements;
  const nick = f.nick.value.trim();
  if (!NICK_RE.test(nick)) return;
  send({ type: 'settings', settings: { nick, realname: f.realname.value.trim() } });
});
els.reconnect.onclick = () => { send({ type: 'reconnect' }); els.dialog.close('cancel'); };

renderQuick();
startSession();
