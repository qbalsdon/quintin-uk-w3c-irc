// Started by Playwright's webServer: a fake IRC server, a control endpoint and the app itself.
import http from 'node:http';
import { startFakeIrc } from './fake-irc.js';

const IRC_PORT = Number(process.env.TEST_IRC_PORT || 16667);
const CONTROL_PORT = Number(process.env.TEST_CONTROL_PORT || 16668);

const { received } = await startFakeIrc(IRC_PORT);

// GET /sent → every line the app sent to the IRC server (for asserting on what went over the wire).
http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(req.url === '/sent' ? received : []));
}).listen(CONTROL_PORT, '127.0.0.1');

Object.assign(process.env, {
  IRC_HOST: '127.0.0.1',
  IRC_PORT: String(IRC_PORT),
  IRC_TLS: 'false',
  BASE_PATH: '/w3c-irc',
  MAX_CONNECTIONS: '3',
  IDLE_MINUTES: '0.05',
  ADMIN_CODE: process.env.TEST_ADMIN_CODE || 'test-admin-code-0123456789',
});
await import('../../server.js');
