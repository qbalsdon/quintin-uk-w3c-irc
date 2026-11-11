// A tiny IRC server for tests, so the app never connects to irc.w3.org.
// It registers the client, answers JOIN/PART with a fixed member list and records every line it receives.
import net from 'node:net';

export const MEMBERS = ['@judy', 'alice', 'albert', 'bob', 'Zakim', 'RRSAgent'];

export function startFakeIrc(port) {
  const received = [];
  const server = net.createServer((sock) => {
    let nick = '*';
    let buf = '';
    const send = (line) => sock.write(line + '\r\n');
    const me = () => `:${nick}!user@test`;
    sock.setEncoding('utf8');
    sock.on('data', (chunk) => {
      buf += chunk;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).replace(/\r$/, '');
        buf = buf.slice(i + 1);
        if (!line) continue;
        const [cmd, ...rest] = line.split(' ');
        // Record PRIVMSG/NOTICE in one form: a one-word message may be sent without the leading ':'.
        received.push(/^(PRIVMSG|NOTICE)$/i.test(cmd) && rest[1] && !rest[1].startsWith(':')
          ? `${cmd} ${rest[0]} :${rest.slice(1).join(' ')}` : line);
        const arg = rest.join(' ');
        switch (cmd.toUpperCase()) {
          case 'CAP': if (/^LS/i.test(arg)) send(':irc.test CAP * LS :'); break;
          case 'NICK': nick = rest[0].replace(/^:/, ''); break;
          case 'USER':
            send(`:irc.test 001 ${nick} :Welcome to the test network ${nick}`);
            send(`:irc.test 005 ${nick} PREFIX=(ov)@+ CHANTYPES=#& NETWORK=Test :are supported`);
            send(`:irc.test 376 ${nick} :End of MOTD`);
            break;
          case 'PING': send(`:irc.test PONG irc.test ${arg}`); break;
          case 'JOIN':
            for (const ch of rest[0].split(',')) {
              send(`${me()} JOIN ${ch}`);
              send(`:irc.test 332 ${nick} ${ch} :Test topic for ${ch}`);
              send(`:irc.test 353 ${nick} = ${ch} :${nick} ${MEMBERS.join(' ')}`);
              send(`:irc.test 366 ${nick} ${ch} :End of /NAMES list.`);
            }
            break;
          case 'PART':
            for (const ch of rest[0].split(',')) send(`${me()} PART ${ch}`);
            break;
          case 'QUIT': sock.end(); break;
        }
      }
    });
    sock.on('error', () => {});
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, received })));
}
