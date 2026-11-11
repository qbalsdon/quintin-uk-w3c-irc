// A small IRC server inside the app for practice mode: nothing leaves this process.
// Real users connected to it can talk to each other, and practice versions of Zakim and
// RRSAgent respond to the common W3C meeting commands. Nothing is logged or published.
import net from 'node:net';

const SERVER = 'practice.invalid';
export const PRACTICE_CHANNEL = '#practice';
const BOTS = { zakim: 'Zakim', rrsagent: 'RRSAgent' };
const lc = (s) => String(s).toLowerCase();

export function startPracticeIrc({ port = 0 } = {}) {
  /** @type {Map<string, Conn>} nick (lower case) → connection */
  const users = new Map();
  /** @type {Map<string, Channel>} */
  const channels = new Map();

  function channel(name) {
    let c = channels.get(lc(name));
    if (!c) {
      c = { name, members: new Set(), bots: new Set(), topic: '', queue: [], queueClosed: false, agenda: [], current: 0, present: new Set(), regrets: new Set() };
      if (lc(name) === PRACTICE_CHANNEL) { c.bots.add(BOTS.zakim); c.bots.add(BOTS.rrsagent); }
      channels.set(lc(name), c);
    }
    return c;
  }
  const names = (c) => [...c.bots, ...[...c.members].map((m) => m.nick)];
  const toChannel = (c, line, except) => { for (const m of c.members) if (m !== except) m.send(line); };
  const botSay = (c, bot, text) => setTimeout(() => toChannel(c, `:${bot}!${lc(bot)}@${SERVER} PRIVMSG ${c.name} :${text}`), 120);
  function botJoin(c, bot) {
    if (c.bots.has(bot)) return;
    c.bots.add(bot);
    toChannel(c, `:${bot}!${lc(bot)}@${SERVER} JOIN ${c.name}`);
  }
  function botPart(c, bot, msg) {
    if (!c.bots.has(bot)) return;
    c.bots.delete(bot);
    setTimeout(() => toChannel(c, `:${bot}!${lc(bot)}@${SERVER} PART ${c.name} :${msg}`), 250);
  }

  // ---------- Zakim ----------
  const queueText = (c) => (c.queue.length ? `I see ${c.queue.map((q) => q.nick + (q.reason ? ` (to ${q.reason})` : '')).join(', ')} on the speaker queue` : 'I see no one on the speaker queue');
  function takeUp(c, n, by) {
    const item = c.agenda[n - 1];
    if (!item) return botSay(c, BOTS.zakim, `I don't see agendum ${n}, ${by}`);
    c.current = n;
    botSay(c, BOTS.zakim, `agendum ${n} -- ${item.text} -- taken up [from ${item.from}]`);
  }

  function zakim(c, from, text) {
    let m;
    const t = text.trim();
    // Not addressed to Zakim
    if ((m = t.match(/^q\+(?:\s+to\s+(.+))?$/i))) {
      if (c.queueClosed) return botSay(c, BOTS.zakim, `${from}, the speaker queue is closed`);
      if (!c.queue.some((q) => lc(q.nick) === lc(from))) c.queue.push({ nick: from, reason: m[1] || '' });
      return;
    }
    if (/^q-$/i.test(t)) { c.queue = c.queue.filter((q) => lc(q.nick) !== lc(from)); return; }
    if (/^q\?$/i.test(t)) return botSay(c, BOTS.zakim, queueText(c));
    if ((m = t.match(/^ack\s+(\S+)/i))) {
      const who = m[1].replace(/[:,]$/, '');
      const q = c.queue.find((x) => lc(x.nick) === lc(who));
      c.queue = c.queue.filter((x) => x !== q);
      botSay(c, BOTS.zakim, `ack ${who}`);
      if (q?.reason) botSay(c, BOTS.zakim, `${who}, you wanted to ${q.reason}`);
      return botSay(c, BOTS.zakim, queueText(c));
    }
    if ((m = t.match(/^present\+\s*(.*)$/i))) { for (const n of (m[1] ? m[1].split(/[\s,]+/) : [from])) if (n) c.present.add(n); return; }
    if ((m = t.match(/^present-\s*(.*)$/i))) { for (const n of (m[1] ? m[1].split(/[\s,]+/) : [from])) c.present.delete(n); return; }
    if ((m = t.match(/^regrets\+\s*(.*)$/i))) { for (const n of (m[1] ? m[1].split(/[\s,]+/) : [from])) if (n) c.regrets.add(n); return; }
    if ((m = t.match(/^agenda\+\s+(.+)$/i))) {
      c.agenda.push({ text: m[1], from });
      return botSay(c, BOTS.zakim, `agendum ${c.agenda.length} added`);
    }
    if (/^(move to |take up )?next agend(um|a item)$/i.test(t)) return takeUp(c, c.current + 1, from);
    if ((m = t.match(/^(?:open|take up) agend(?:um|a item)\s+(\d+)$/i))) return takeUp(c, Number(m[1]), from);
    if ((m = t.match(/^close agend(?:um|a item)\s+(\d+)$/i))) {
      const item = c.agenda[Number(m[1]) - 1];
      return botSay(c, BOTS.zakim, item ? `agendum ${m[1]}, ${item.text}, closed` : `I don't see agendum ${m[1]}, ${from}`);
    }
    if (/^close the queue$/i.test(t)) { c.queueClosed = true; return botSay(c, BOTS.zakim, `ok, ${from}, the speaker queue is closed`); }
    if (/^open the queue$/i.test(t)) { c.queueClosed = false; return botSay(c, BOTS.zakim, `ok, ${from}, the speaker queue is open`); }

    // Addressed to Zakim
    if (!(m = t.match(/^zakim\s*[,:]\s*(.*)$/i))) return;
    const cmd = m[1].trim();
    if (/^start (the )?meeting$/i.test(cmd)) {
      botSay(c, BOTS.zakim, 'inviting RRSAgent');
      setTimeout(() => botJoin(c, BOTS.rrsagent), 200);
      botSay(c, BOTS.zakim, 'RRSAgent, make logs Public');
      botSay(c, BOTS.zakim, `please title this meeting ("meeting: ..."), ${from}`);
      return;
    }
    if (/^this (is|will be)\s+.+/i.test(cmd)) return botSay(c, BOTS.zakim, `got it, ${from}`);
    if (/^agenda\??$/i.test(cmd)) {
      if (!c.agenda.length) return botSay(c, BOTS.zakim, 'I see nothing on the agenda');
      botSay(c, BOTS.zakim, `I see ${c.agenda.length} item${c.agenda.length === 1 ? '' : 's'} on the agenda:`);
      c.agenda.forEach((a, i) => botSay(c, BOTS.zakim, `${i + 1}. ${a.text} [from ${a.from}]`));
      return;
    }
    if (/^(list (participants|attendees)|who is (here|present)\??)$/i.test(cmd)) {
      const present = [...c.present];
      botSay(c, BOTS.zakim, present.length ? `As of this point the attendees have been ${present.join(', ')}` : 'I see no one present yet. Use present+');
      if (c.regrets.size) botSay(c, BOTS.zakim, `Regrets: ${[...c.regrets].join(', ')}`);
      return;
    }
    if (/^(nominate|pick|choose) a scribe$/i.test(cmd)) {
      const pool = [...c.members].map((x) => x.nick);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return botSay(c, BOTS.zakim, `${pick}, please scribe`);
    }
    if (/^(bye|excuse us)$/i.test(cmd)) {
      botSay(c, BOTS.zakim, `leaving. As of this point the attendees have been ${[...c.present].join(', ') || 'no one'}`);
      return botPart(c, BOTS.zakim, 'Practice meeting ended');
    }
    if (/^help\??$/i.test(cmd)) return botSay(c, BOTS.zakim, 'Practice Zakim understands: start meeting, this is …, agenda?, list participants, nominate a scribe, bye; and q+, q+ to …, q-, q?, ack …, present+, regrets+, agenda+ …, next agendum, open agendum N, close agendum N, close/open the queue');
    return botSay(c, BOTS.zakim, `I don't understand '${cmd}', ${from}. Try "zakim, help"`);
  }

  // ---------- RRSAgent ----------
  function rrsagent(c, from, text) {
    const m = text.trim().match(/^rrsagent\s*[,:]\s*(.*)$/i);
    if (!m) return;
    const cmd = m[1].trim();
    if (/^(make|draft|generate) (the )?minutes/i.test(cmd)) return botSay(c, BOTS.rrsagent, `I have made the request to generate the minutes, ${from} (practice server: nothing is published)`);
    if (/^(set|make) logs?\b/i.test(cmd)) return botSay(c, BOTS.rrsagent, `I have made the request, ${from}`);
    if (/^bye$/i.test(cmd)) { botSay(c, BOTS.rrsagent, 'I see no action items'); return botPart(c, BOTS.rrsagent, 'Practice meeting ended'); }
    if (/^help\??$/i.test(cmd)) return botSay(c, BOTS.rrsagent, 'Practice RRSAgent understands: make minutes, set logs public, bye');
    return botSay(c, BOTS.rrsagent, `I'm logging. I don't understand '${cmd}', ${from}. Try "rrsagent, help"`);
  }

  // ---------- connections ----------
  const server = net.createServer((sock) => {
    /** @typedef {{nick:string, user:string, registered:boolean, send:(l:string)=>void, chans:Set<Channel>}} Conn */
    const conn = { nick: '*', user: 'user', registered: false, chans: new Set(), send: (l) => { if (!sock.destroyed) sock.write(l + '\r\n'); } };
    const prefix = () => `${conn.nick}!${conn.user}@practice`;
    const num = (code, text) => conn.send(`:${SERVER} ${code} ${conn.nick} ${text}`);
    let buf = '';

    function register() {
      if (conn.registered || conn.nick === '*' || !conn.gotUser) return;
      conn.registered = true;
      users.set(lc(conn.nick), conn);
      num('001', `:Welcome to the practice IRC server, ${conn.nick}. Nothing here reaches W3C.`);
      num('002', `:Your host is ${SERVER}`);
      num('003', ':This server was created for practice');
      num('004', `${SERVER} practice-1 o o`);
      num('005', 'PREFIX=(ov)@+ CHANTYPES=#& NETWORK=Practice CASEMAPPING=ascii :are supported by this server');
      num('422', ':Practice server: join #practice, where Zakim and RRSAgent are waiting');
    }
    function leaveAll(line) {
      for (const c of conn.chans) {
        c.members.delete(conn);
        toChannel(c, line);
        c.queue = c.queue.filter((q) => lc(q.nick) !== lc(conn.nick));
        if (!c.members.size && lc(c.name) !== PRACTICE_CHANNEL) channels.delete(lc(c.name));
      }
      conn.chans.clear();
    }

    function handle(line) {
      const [head, ...restParts] = line.split(' :');
      const params = head.split(' ').filter(Boolean);
      const cmd = (params.shift() || '').toUpperCase();
      const trailing = restParts.length ? restParts.join(' :') : undefined;
      const args = trailing !== undefined ? [...params, trailing] : params;

      switch (cmd) {
        case 'CAP': if (/^LS/i.test(args[0] || '')) conn.send(`:${SERVER} CAP * LS :`); return;
        case 'PING': return conn.send(`:${SERVER} PONG ${SERVER} :${args[0] || ''}`);
        case 'NICK': {
          const nick = args[0] || '';
          if (!/^[A-Za-z[\]\\`_^{|}][A-Za-z0-9[\]\\`_^{|}-]{0,29}$/.test(nick)) return num('432', `${nick} :Erroneous nickname`);
          const taken = users.get(lc(nick));
          if ((taken && taken !== conn) || Object.keys(BOTS).includes(lc(nick))) return num('433', `${nick} :Nickname is already in use`);
          if (conn.registered) {
            const line = `:${prefix()} NICK ${nick}`;
            const seen = new Set([conn]);
            conn.send(line);
            for (const c of conn.chans) for (const m of c.members) if (!seen.has(m)) { seen.add(m); m.send(line); }
            users.delete(lc(conn.nick));
            conn.nick = nick;
            users.set(lc(nick), conn);
          } else {
            conn.nick = nick;
            register();
          }
          return;
        }
        case 'USER': conn.user = (args[0] || 'user').replace(/[^A-Za-z0-9]/g, '').slice(0, 10) || 'user'; conn.gotUser = true; return register();
        case 'QUIT': leaveAll(`:${prefix()} QUIT :${args[0] || 'Quit'}`); users.delete(lc(conn.nick)); return sock.end();
      }
      if (!conn.registered) return num('451', ':You have not registered');

      switch (cmd) {
        case 'JOIN':
          for (const name of (args[0] || '').split(',')) {
            if (!/^[#&][^\s,\x07]{1,49}$/.test(name)) { num('403', `${name} :No such channel`); continue; }
            const c = channel(name);
            if (c.members.has(conn)) continue;
            c.members.add(conn);
            conn.chans.add(c);
            const join = `:${prefix()} JOIN ${c.name}`;
            for (const m of c.members) m.send(join);
            if (c.topic) num('332', `${c.name} :${c.topic}`); else num('331', `${c.name} :No topic is set`);
            num('353', `= ${c.name} :${names(c).join(' ')}`);
            num('366', `${c.name} :End of /NAMES list.`);
          }
          return;
        case 'PART':
          for (const name of (args[0] || '').split(',')) {
            const c = channels.get(lc(name));
            if (!c || !c.members.has(conn)) { num('442', `${name} :You're not on that channel`); continue; }
            const part = `:${prefix()} PART ${c.name}${args[1] ? ' :' + args[1] : ''}`;
            for (const m of c.members) m.send(part);
            c.members.delete(conn);
            conn.chans.delete(c);
            c.queue = c.queue.filter((q) => lc(q.nick) !== lc(conn.nick));
          }
          return;
        case 'PRIVMSG': case 'NOTICE': {
          const [target, text = ''] = args;
          if (!target) return;
          if (/^[#&]/.test(target)) {
            const c = channels.get(lc(target));
            if (!c || !c.members.has(conn)) return num('404', `${target} :Cannot send to channel`);
            toChannel(c, `:${prefix()} ${cmd} ${c.name} :${text}`, conn);
            if (cmd === 'PRIVMSG') {
              if (c.bots.has(BOTS.zakim)) zakim(c, conn.nick, text);
              if (c.bots.has(BOTS.rrsagent)) rrsagent(c, conn.nick, text);
            }
            return;
          }
          const bot = BOTS[lc(target)];
          if (bot) return cmd === 'PRIVMSG' && conn.send(`:${bot}!${lc(bot)}@${SERVER} NOTICE ${conn.nick} :I only respond in channels. Invite me with /invite ${bot}`);
          const to = users.get(lc(target));
          if (!to) return num('401', `${target} :No such nick`);
          return to.send(`:${prefix()} ${cmd} ${to.nick} :${text}`);
        }
        case 'INVITE': {
          const [who, name] = args;
          const c = channels.get(lc(name || ''));
          if (!c || !c.members.has(conn)) return num('442', `${name} :You're not on that channel`);
          const bot = BOTS[lc(who || '')];
          num('341', `${who} ${c.name}`);
          if (bot) return setTimeout(() => botJoin(c, bot), 150);
          const to = users.get(lc(who || ''));
          if (!to) return num('401', `${who} :No such nick`);
          return to.send(`:${prefix()} INVITE ${to.nick} :${c.name}`);
        }
        case 'TOPIC': {
          const c = channels.get(lc(args[0] || ''));
          if (!c) return num('403', `${args[0]} :No such channel`);
          if (args.length < 2) return c.topic ? num('332', `${c.name} :${c.topic}`) : num('331', `${c.name} :No topic is set`);
          c.topic = args[1];
          for (const m of c.members) m.send(`:${prefix()} TOPIC ${c.name} :${c.topic}`);
          return;
        }
        case 'NAMES': {
          const c = channels.get(lc(args[0] || ''));
          if (c) num('353', `= ${c.name} :${names(c).join(' ')}`);
          return num('366', `${args[0] || '*'} :End of /NAMES list.`);
        }
        case 'WHOIS': {
          const who = args[args.length - 1] || '';
          const u = users.get(lc(who));
          const bot = BOTS[lc(who)];
          if (u) num('311', `${u.nick} ${u.user} practice * :${u.nick}`);
          else if (bot) num('311', `${bot} ${lc(bot)} ${SERVER} * :Practice ${bot}`);
          else num('401', `${who} :No such nick`);
          return num('318', `${who} :End of /WHOIS list.`);
        }
        case 'MODE': return /^[#&]/.test(args[0] || '') && args.length === 1 ? num('324', `${args[0]} +nt`) : undefined;
        case 'WHO': return num('315', `${args[0] || '*'} :End of /WHO list.`);
        case 'AWAY': return args[0] ? num('306', ':You have been marked as being away') : num('305', ':You are no longer marked as being away');
        case 'PONG': return;
        default: return num('421', `${cmd} :Unknown command (practice server)`);
      }
    }

    sock.setEncoding('utf8');
    sock.on('data', (chunk) => {
      buf += chunk;
      if (buf.length > 64_000) return sock.destroy();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).replace(/\r$/, '');
        buf = buf.slice(i + 1);
        if (line) handle(line);
      }
    });
    const gone = () => {
      if (conn.registered && users.get(lc(conn.nick)) === conn) users.delete(lc(conn.nick));
      leaveAll(`:${prefix()} QUIT :Connection closed`);
    };
    sock.on('close', gone);
    sock.on('error', () => {});
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}
