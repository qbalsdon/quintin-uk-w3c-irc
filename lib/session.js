// One visitor's IRC connection: its buffers, its IRC client and the browser tabs listening to it.
import crypto from 'node:crypto';
import IRC from 'irc-framework';

const MAX_HISTORY = 2000;
export const SERVER = '*server*';

const keyOf = (name) => String(name).toLowerCase();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rank = (p) => (p === '@' ? 0 : p === '%' ? 1 : p === '+' ? 2 : 3);

export const NICK_RE = /^[A-Za-z[\]\\`_^{|}][A-Za-z0-9[\]\\`_^{|}-]{0,29}$/;
export const CHANNEL_RE = /^[#&][^\s,\x07]{1,49}$/;

export function normChannel(c) {
  c = String(c || '').trim().split(/\s+/)[0];
  if (!c) return '';
  if (!/^[#&]/.test(c)) c = '#' + c;
  return CHANNEL_RE.test(c) ? c : '';
}

// Cleans preferences that come from the visitor's cookie or the settings form.
export function cleanPrefs(p = {}) {
  const nick = String(p.nick || '').trim();
  const realname = String(p.realname || '').trim().slice(0, 100);
  const channels = [];
  for (const c of Array.isArray(p.channels) ? p.channels : []) {
    const n = normChannel(c);
    if (n && !channels.some((x) => keyOf(x) === keyOf(n))) channels.push(n);
    if (channels.length >= 20) break;
  }
  const practice = p.practice === true;
  if (practice && !channels.length) channels.push('#practice');
  return { nick: NICK_RE.test(nick) ? nick : '', realname, channels, practice };
}

function prefixFromModes(modes = []) {
  if (modes.includes('o')) return '@';
  if (modes.includes('h')) return '%';
  if (modes.includes('v')) return '+';
  return '';
}

export class Session {
  /**
   * @param {{nick:string, realname:string, channels:string[]}} prefs
   * @param {{host:string, port:number, tls:boolean, label?:string}} irc
   * @param {(s: Session, reason: string) => void} onEnd
   */
  constructor(prefs, irc, onEnd) {
    this.id = crypto.randomBytes(24).toString('base64url');
    this.publicId = crypto.randomBytes(6).toString('hex'); // shown on the management page instead of the cookie value
    this.prefs = prefs;
    this.irc = irc;
    this.onEnd = onEnd;
    this.createdAt = Date.now();
    this.lastSeen = Date.now();
    this.listeners = new Set(); // functions that deliver an event to one browser tab
    this.buffers = new Map();
    this.msgId = 0;
    this.client = null;
    this.connected = false;
    this.ended = false;
    this.currentNick = prefs.nick;
    this.nickAttempt = 0;
    this.getBuffer(SERVER, 'server');
    for (const c of prefs.channels) this.getBuffer(c, 'channel');
  }

  // ---------- fan-out to this visitor's tabs ----------
  emit(obj) {
    for (const deliver of this.listeners) deliver(obj);
  }
  addListener(deliver) {
    this.listeners.add(deliver);
    this.lastSeen = Date.now();
    deliver(this.snapshot());
    return () => { this.listeners.delete(deliver); this.lastSeen = Date.now(); };
  }

  snapshot() {
    return {
      type: 'init',
      settings: this.prefsPayload(),
      status: this.statusPayload(),
      serverBuffer: SERVER,
      buffers: [...this.buffers.values()].map((b) => this.serializeBuffer(b)),
    };
  }
  get serverLabel() { return this.irc.label || this.irc.host; }
  prefsPayload() { return { ...this.prefs, host: this.serverLabel }; }
  statusPayload() { return { type: 'status', connected: this.connected, nick: this.currentNick, host: this.serverLabel, practice: !!this.prefs.practice }; }

  // ---------- buffers ----------
  getBuffer(name, type) {
    const k = keyOf(name);
    let b = this.buffers.get(k);
    if (!b) {
      b = { name, type, messages: [], users: new Map(), topic: '', joined: false };
      this.buffers.set(k, b);
      this.emit({ type: 'buffer', buffer: this.serializeBuffer(b, false) });
    }
    return b;
  }
  addMessage(bufName, msg, type) {
    const b = this.getBuffer(bufName, type || (/^[#&]/.test(bufName) ? 'channel' : 'query'));
    const m = { id: ++this.msgId, time: Date.now(), ...msg };
    b.messages.push(m);
    if (b.messages.length > MAX_HISTORY) b.messages.shift();
    this.emit({ type: 'message', buffer: b.name, message: m });
  }
  serverMsg(text, kind = 'info') { this.addMessage(SERVER, { kind, text }, 'server'); }
  usersOf(b) {
    return [...b.users.entries()]
      .map(([nick, prefix]) => ({ nick, prefix }))
      .sort((a, c) => rank(a.prefix) - rank(c.prefix) || a.nick.localeCompare(c.nick, undefined, { sensitivity: 'base' }));
  }
  serializeBuffer(b, withMessages = true) {
    return { name: b.name, type: b.type, topic: b.topic, joined: b.joined, users: this.usersOf(b), messages: withMessages ? b.messages : [] };
  }
  pushUsers(b) { this.emit({ type: 'users', buffer: b.name, users: this.usersOf(b) }); }
  pushBufferMeta(b) { this.emit({ type: 'buffer', buffer: this.serializeBuffer(b, false) }); }
  pushSettings() { this.emit({ type: 'settings', settings: this.prefsPayload() }); }
  joinedChannels() { return [...this.buffers.values()].filter((b) => b.type === 'channel' && b.joined).map((b) => b.name); }

  // ---------- IRC ----------
  connect() {
    if (this.ended) return;
    if (this.client) {
      this.client.removeAllListeners();
      try { this.client.quit('Reconnecting'); } catch {}
    }
    const { nick, realname } = this.prefs;
    const { host, port, tls } = this.irc;
    this.connected = false;
    this.nickAttempt = 0;
    this.currentNick = nick;
    this.emit(this.statusPayload());
    this.serverMsg(this.irc.label ? `Connecting to the ${this.irc.label} as ${nick}…` : `Connecting to ${host}:${port}${tls ? ' (TLS)' : ''} as ${nick}…`);

    const client = (this.client = new IRC.Client());
    client.connect({
      host, port, tls, nick,
      username: nick.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'user',
      gecos: realname || nick,
      auto_reconnect: true,
      auto_reconnect_max_wait: 30000,
      auto_reconnect_max_retries: 20,
      version: 'quintin.uk W3C IRC',
    });

    client.on('nick in use', (e) => {
      if (this.connected) return this.serverMsg(`Nick ${e.nick} is already in use.`, 'error');
      this.nickAttempt += 1;
      const next = nick + this.nickAttempt;
      this.serverMsg(`Nick ${e.nick} is in use, trying ${next}…`);
      client.changeNick(next);
    });
    client.on('registered', (e) => {
      this.connected = true;
      this.currentNick = e.nick || client.user.nick;
      this.emit(this.statusPayload());
      this.serverMsg(`Connected as ${this.currentNick}`);
      const want = new Set(this.prefs.channels.map(keyOf));
      for (const c of this.prefs.channels) client.join(c);
      for (const b of this.buffers.values()) if (b.type === 'channel' && b.joined && !want.has(keyOf(b.name))) client.join(b.name);
    });
    client.on('reconnecting', (e) => {
      this.connected = false;
      for (const b of this.buffers.values()) if (b.type === 'channel') { b.joined = false; b.users.clear(); this.pushBufferMeta(b); this.pushUsers(b); }
      this.emit(this.statusPayload());
      this.serverMsg(`Disconnected. Reconnecting (attempt ${e.attempt})…`, 'error');
    });
    client.on('close', () => {
      this.connected = false;
      this.emit(this.statusPayload());
      this.serverMsg('Connection closed.', 'error');
    });
    client.on('socket close', () => { this.connected = false; this.emit(this.statusPayload()); });
    client.on('motd', (e) => e.motd && this.serverMsg(e.motd.trim(), 'motd'));
    client.on('irc error', (e) => {
      const where = e.channel && this.buffers.has(keyOf(e.channel)) ? e.channel : SERVER;
      this.addMessage(where, { kind: 'error', text: `${e.error}${e.reason ? ': ' + e.reason : ''}` });
    });

    client.on('message', (e) => {
      const isChannel = /^[#&]/.test(e.target);
      const fromServer = !e.nick || e.nick.includes('.');
      let bufName;
      if (isChannel) bufName = e.target;
      else if (fromServer || (e.type === 'notice' && !this.buffers.has(keyOf(e.nick)))) bufName = SERVER;
      else bufName = e.nick === this.currentNick ? e.target : e.nick;
      const kind = e.type === 'action' ? 'action' : e.type === 'notice' ? 'notice' : 'privmsg';
      const highlight = e.nick !== this.currentNick && new RegExp(`\\b${escapeRe(this.currentNick)}\\b`, 'i').test(e.message);
      this.addMessage(bufName, { kind, nick: e.nick || e.hostname || 'server', text: e.message, highlight: highlight || (!isChannel && bufName !== SERVER) });
    });

    client.on('join', (e) => {
      const b = this.getBuffer(e.channel, 'channel');
      if (e.nick === this.currentNick) {
        b.joined = true;
        b.users.clear();
        this.pushBufferMeta(b);
        this.emit({ type: 'joined', buffer: b.name });
      }
      b.users.set(e.nick, b.users.get(e.nick) || '');
      this.pushUsers(b);
      this.addMessage(b.name, { kind: 'join', nick: e.nick, text: `${e.nick} joined` });
    });
    const leave = (channel, who, text) => {
      const b = this.buffers.get(keyOf(channel));
      if (!b) return;
      b.users.delete(who);
      if (who === this.currentNick) { b.joined = false; b.users.clear(); this.pushBufferMeta(b); }
      this.pushUsers(b);
      this.addMessage(b.name, { kind: 'part', nick: who, text });
    };
    client.on('part', (e) => leave(e.channel, e.nick, `${e.nick} left${e.message ? ' (' + e.message + ')' : ''}`));
    client.on('kick', (e) => leave(e.channel, e.kicked, `${e.kicked} was kicked by ${e.nick}${e.message ? ' (' + e.message + ')' : ''}`));
    client.on('quit', (e) => {
      for (const b of this.buffers.values()) if (b.users.has(e.nick)) leave(b.name, e.nick, `${e.nick} quit${e.message ? ' (' + e.message + ')' : ''}`);
    });
    client.on('nick', (e) => {
      if (e.nick === this.currentNick) {
        this.currentNick = e.new_nick;
        this.emit(this.statusPayload());
        this.serverMsg(`You are now known as ${e.new_nick}`);
      }
      for (const b of this.buffers.values()) {
        if (!b.users.has(e.nick)) continue;
        const p = b.users.get(e.nick);
        b.users.delete(e.nick);
        b.users.set(e.new_nick, p);
        this.pushUsers(b);
        this.addMessage(b.name, { kind: 'nick', text: `${e.nick} is now known as ${e.new_nick}` });
      }
    });
    client.on('userlist', (e) => {
      const b = this.getBuffer(e.channel, 'channel');
      b.users.clear();
      for (const u of e.users) b.users.set(u.nick, prefixFromModes(u.modes));
      this.pushUsers(b);
    });
    client.on('mode', (e) => {
      const b = e.target && this.buffers.get(keyOf(e.target));
      if (!b || b.type !== 'channel') return;
      const map = { o: '@', h: '%', v: '+' };
      let changed = false;
      for (const m of e.modes || []) {
        if (!m.param || !b.users.has(m.param) || !map[m.mode[1]]) continue;
        b.users.set(m.param, m.mode[0] === '+' ? map[m.mode[1]] : '');
        changed = true;
      }
      if (changed) this.pushUsers(b);
      this.addMessage(b.name, { kind: 'mode', text: `${e.nick} sets mode ${(e.modes || []).map((m) => m.mode + (m.param ? ' ' + m.param : '')).join(' ')}` });
    });
    client.on('topic', (e) => {
      const b = this.getBuffer(e.channel, 'channel');
      b.topic = e.topic || '';
      this.pushBufferMeta(b);
      this.addMessage(b.name, { kind: 'topic', text: e.nick ? `${e.nick} changed the topic to: ${b.topic}` : `Topic: ${b.topic}` });
    });
    client.on('invite', (e) => this.serverMsg(`${e.nick} invited you to ${e.channel}`, 'notice'));
    client.on('away', (e) => e.message && this.serverMsg(`${e.nick} is away: ${e.message}`));
    client.on('whois', (e) => {
      const lines = [`${e.nick} (${e.ident}@${e.hostname}) — ${e.real_name || ''}`];
      if (e.channels) lines.push(`Channels: ${e.channels}`);
      if (e.server) lines.push(`Server: ${e.server}`);
      if (e.idle) lines.push(`Idle: ${e.idle}s`);
      this.serverMsg(lines.join('\n'));
    });
  }

  /** Ends the session: quits IRC, tells every tab, and frees the slot. */
  end(reason = 'Disconnected') {
    if (this.ended) return;
    this.ended = true;
    if (this.client) {
      this.client.removeAllListeners();
      try { this.client.quit(reason); } catch {}
      // quit() waits for the server; make sure the socket goes away.
      setTimeout(() => { try { this.client.connection?.end(); } catch {} }, 2000).unref();
    }
    this.emit({ type: 'ended', reason });
    this.listeners.clear();
    this.onEnd(this, reason);
  }

  // ---------- from the browser ----------
  sendText(bufName, text) {
    if (!text) return;
    if (text.startsWith('/') && !text.startsWith('//')) return this.runCommand(bufName, text.slice(1));
    if (text.startsWith('//')) text = text.slice(1);
    if (bufName === SERVER) return this.serverMsg('Cannot send messages to the server window. Use /commands.', 'error');
    if (!this.connected) return this.addMessage(bufName, { kind: 'error', text: 'Not connected.' });
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      this.client.say(bufName, line);
      this.addMessage(bufName, { kind: 'privmsg', nick: this.currentNick, text: line, self: true });
    }
  }

  runCommand(bufName, cmdline) {
    const [cmdRaw, ...rest] = cmdline.split(' ');
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(' ').trim();
    const client = this.client;
    const needConn = () => { if (!this.connected) { this.addMessage(bufName, { kind: 'error', text: 'Not connected.' }); return true; } return false; };
    const isChan = /^[#&]/.test(bufName);

    switch (cmd) {
      case 'me':
        if (needConn()) return;
        client.action(bufName, arg);
        return this.addMessage(bufName, { kind: 'action', nick: this.currentNick, text: arg, self: true });
      case 'join': case 'j': {
        if (needConn()) return;
        const [ch, key] = arg.split(' ');
        const c = normChannel(ch);
        if (!c) return;
        this.getBuffer(c, 'channel');
        client.join(c, key);
        return this.emit({ type: 'focus', buffer: c });
      }
      case 'part': case 'leave': {
        if (needConn()) return;
        let target = bufName, reason = arg;
        if (/^[#&]/.test(arg)) { [target, ...reason] = arg.split(' '); reason = reason.join(' '); }
        return client.part(target, reason);
      }
      case 'msg': case 'query': case 'q': {
        if (needConn()) return;
        const [target, ...m] = arg.split(' ');
        if (!target) return;
        const text = m.join(' ');
        this.getBuffer(target, /^[#&]/.test(target) ? 'channel' : 'query');
        this.emit({ type: 'focus', buffer: target });
        if (text) { client.say(target, text); this.addMessage(target, { kind: 'privmsg', nick: this.currentNick, text, self: true }); }
        return;
      }
      case 'notice': {
        if (needConn()) return;
        const [target, ...m] = arg.split(' ');
        client.notice(target, m.join(' '));
        return this.addMessage(bufName, { kind: 'notice', nick: `→${target}`, text: m.join(' '), self: true });
      }
      case 'nick':
        if (needConn()) return;
        if (!NICK_RE.test(arg)) return this.addMessage(bufName, { kind: 'error', text: 'That is not a valid nickname.' });
        this.prefs.nick = arg;
        this.pushSettings();
        return client.changeNick(arg);
      case 'topic':
        if (needConn() || !isChan) return;
        if (arg) client.setTopic(bufName, arg); else client.raw('TOPIC', bufName);
        return;
      case 'invite': {
        if (needConn()) return;
        const [who, ch] = arg.split(' ');
        const target = ch || bufName;
        client.raw('INVITE', who, target);
        return this.addMessage(bufName, { kind: 'info', text: `Invited ${who} to ${target}` });
      }
      case 'whois':
        if (needConn()) return;
        return client.whois(arg);
      case 'away':
        if (needConn()) return;
        return arg ? client.raw('AWAY', arg) : client.raw('AWAY');
      case 'back':
        if (needConn()) return;
        return client.raw('AWAY');
      case 'kick': {
        if (needConn()) return;
        const [who, ...r] = arg.split(' ');
        return client.raw('KICK', bufName, who, r.join(' '));
      }
      case 'quote': case 'raw':
        if (needConn()) return;
        return client.raw(arg);
      case 'clear': {
        const b = this.buffers.get(keyOf(bufName));
        if (b) { b.messages = []; this.emit({ type: 'cleared', buffer: b.name }); }
        return;
      }
      case 'reconnect':
        return this.connect();
      case 'help':
        return this.addMessage(bufName, { kind: 'info', text: 'Commands: /me, /join #chan, /part [reason], /msg nick text, /notice, /nick, /topic [text], /invite nick [#chan], /whois nick, /away [msg], /back, /kick, /quote RAW, /clear, /reconnect. Start a line with // to send a literal "/".' });
      default:
        if (needConn()) return;
        client.raw(cmdRaw.toUpperCase() + (arg ? ' ' + arg : ''));
    }
  }

  handle(m) {
    this.lastSeen = Date.now();
    const has = (c) => this.prefs.channels.some((x) => keyOf(x) === keyOf(c));
    switch (m.type) {
      case 'send':
        return this.sendText(String(m.buffer || ''), String(m.text || '').slice(0, 4000));
      case 'join': {
        const c = normChannel(m.channel);
        if (!c) return;
        this.getBuffer(c, 'channel');
        if (this.connected) this.client.join(c);
        return;
      }
      case 'part': {
        const b = this.buffers.get(keyOf(m.buffer || ''));
        if (b && b.type === 'channel' && this.connected && b.joined) this.client.part(b.name);
        return;
      }
      case 'close': {
        const b = this.buffers.get(keyOf(m.buffer || ''));
        if (!b || b.type === 'server') return;
        if (b.type === 'channel' && this.connected && b.joined) this.client.part(b.name);
        if (b.type === 'channel' && has(b.name)) return; // saved channels stay listed
        this.buffers.delete(keyOf(b.name));
        return this.emit({ type: 'buffer-removed', buffer: b.name });
      }
      case 'save-channel': {
        const c = normChannel(m.channel);
        if (!c) return;
        if (!has(c) && this.prefs.channels.length < 20) this.prefs.channels.push(c);
        this.pushSettings();
        this.getBuffer(c, 'channel');
        if (this.connected && m.join !== false) this.client.join(c);
        return;
      }
      case 'unsave-channel':
        this.prefs.channels = this.prefs.channels.filter((x) => keyOf(x) !== keyOf(m.channel || ''));
        return this.pushSettings();
      case 'rename-channel': {
        const from = String(m.from || ''), to = normChannel(m.to);
        if (!to) return;
        const i = this.prefs.channels.findIndex((x) => keyOf(x) === keyOf(from));
        if (i === -1) return;
        if (this.prefs.channels.some((x, j) => j !== i && keyOf(x) === keyOf(to))) this.prefs.channels.splice(i, 1);
        else this.prefs.channels[i] = to;
        this.pushSettings();
        const old = this.buffers.get(keyOf(from));
        if (old && old.joined && this.connected) this.client.part(old.name);
        if (old) { this.buffers.delete(keyOf(from)); this.emit({ type: 'buffer-removed', buffer: old.name }); }
        this.getBuffer(to, 'channel');
        if (this.connected) this.client.join(to);
        return this.emit({ type: 'focus', buffer: to });
      }
      case 'settings': {
        const s = cleanPrefs({ ...this.prefs, ...(m.settings || {}), channels: this.prefs.channels, practice: this.prefs.practice });
        if (!s.nick) return this.serverMsg('That is not a valid nickname.', 'error');
        const changed = s.nick !== this.prefs.nick || s.realname !== this.prefs.realname;
        this.prefs = s;
        this.pushSettings();
        if (changed) this.connect();
        return;
      }
      case 'reconnect':
        return this.connect();
    }
  }
}
