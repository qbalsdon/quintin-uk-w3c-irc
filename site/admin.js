'use strict';
// The page's own URL ends with the admin code; it is sent in a header, never in a query string.
const CODE = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
const $ = (id) => document.getElementById(id);
const rows = $('rows');
const actionStatus = $('action-status');

const call = (path, method = 'GET') => fetch(path, { method, headers: { 'x-admin-code': CODE }, cache: 'no-store', credentials: 'same-origin' });

function ago(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

function cell(text, cls) {
  const td = document.createElement('td');
  td.textContent = text;
  if (cls) td.className = cls;
  return td;
}

function render(data) {
  $('meter').textContent = `${data.count} of ${data.max} connections in use`;
  $('meta').textContent = `IRC server ${data.irc} · idle connections close after ${data.idleMinutes} min with no open tabs`;
  $('end-all').disabled = data.count === 0;
  if (!data.sessions.length) {
    const tr = document.createElement('tr');
    const td = cell('Nobody is connected.', 'muted');
    td.colSpan = 7;
    tr.append(td);
    rows.replaceChildren(tr);
    return;
  }
  const now = Date.now();
  rows.replaceChildren(...data.sessions.map((s) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = s.nick;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn danger';
    btn.textContent = 'Disconnect';
    btn.setAttribute('aria-label', `Disconnect ${s.nick}`);
    btn.onclick = async () => {
      btn.disabled = true;
      const r = await call(`api/admin/sessions/${encodeURIComponent(s.id)}/end`, 'POST');
      actionStatus.textContent = r.ok ? `Disconnected ${s.nick}.` : `Could not disconnect ${s.nick}.`;
      refresh();
    };
    const act = document.createElement('td');
    act.append(btn);
    tr.append(
      th,
      cell(s.ircConnected ? 'Connected' : 'Connecting…', s.ircConnected ? 'status-ok' : 'status-bad'),
      cell(s.channels.join(', ') || '—'),
      cell(String(s.tabs)),
      cell(ago(now - s.since)),
      cell(s.tabs ? 'Now' : `${ago(now - s.lastSeen)} ago`),
      act,
    );
    return tr;
  }));
}

async function refresh() {
  try {
    const r = await call('api/admin/sessions');
    if (!r.ok) { $('meter').textContent = 'Not available.'; return; }
    render(await r.json());
  } catch {
    $('meter').textContent = 'The server is not reachable. Retrying…';
  }
}

$('end-all').addEventListener('click', async () => {
  if (!confirm('Disconnect everyone who is connected?')) return;
  const r = await call('api/admin/end-all', 'POST');
  actionStatus.textContent = r.ok ? 'Everyone has been disconnected.' : 'Could not disconnect everyone.';
  refresh();
});

refresh();
setInterval(refresh, 3000);
