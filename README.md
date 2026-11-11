# W3C IRC

[![Test and deploy](https://github.com/qbalsdon/quintin-uk-w3c-irc/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/qbalsdon/quintin-uk-w3c-irc/actions/workflows/deploy.yml)
[![Last commit](https://img.shields.io/github/last-commit/qbalsdon/quintin-uk-w3c-irc/main)](https://github.com/qbalsdon/quintin-uk-w3c-irc/commits/main)

A web IRC client for W3C meetings on **irc.w3.org**, with one-click Zakim and RRSAgent actions. It runs at **[quintin.uk/w3c-irc](https://quintin.uk/w3c-irc/)**.

- Each visitor gets their own IRC connection. At most **10** people can be connected at once, and the number in use is shown at the top of the sidebar.
- Only irc.w3.org can be used.
- Your nickname, full name and channels are remembered in a cookie on your browser. The cookie icon in the bottom-left corner opens [what the cookies are for](https://quintin.uk/w3c-irc/cookies). There's no telemetry.
- A connection closes when you click **Disconnect**, or when no page has been open for 10 minutes.

## Using it

- **Sidebar:** while you're not in a joined channel, the sidebar lists your channels. Once you're in a joined channel it switches to that channel's controls: **Leave**, **← All channels** (shows the list again without leaving, with a count of unread messages elsewhere) and the quick actions. Leaving the channel, or losing the connection, brings the channel list back.
- **Quick actions:** a click sends the command. Buttons with a label ending in "…" put the text into the message box for you to finish. Shift+click any button to edit its text before sending. `{channel}`, `{group}` (the channel name in capitals), `{date}` and `{nick}` are filled in for you. One-off chair actions (inviting the bots, starting the meeting, making minutes, dismissing the bots) are in the **Admin** panel at the end, which is collapsed until you open it.
- **q\*** puts `q+ to ` in the message box so you can add what your question is about, for example `q+ to ask about the timeline`.
- **Scribe mode:** click **Scribe** next to the message box and enter the speaker's name (it suggests channel members). Every line you type is sent as `Speaker: text` until you click **Stop scribing**. Quick actions, `/commands` and meeting commands you type (`TOPIC:`, `ACTION:`, `RESOLUTION:`, `present+`, `q+`, `ack`, `zakim, …`, `rrsagent, …`, `s/old/new/` and so on) are sent unchanged. While scribing, clicking a nickname makes that person the speaker. The speaker box is emptied each time you start or stop scribing.
- **Mentions:** type `@` to pick a nickname from the people in the channel. Typing more letters filters the list, Up and Down move through it, Enter or Tab fills in the selected name (`name: ` at the start of a message, otherwise `name `), and Escape closes it.
- Slash commands: `/me /join /part /msg /query /notice /nick /topic /invite /whois /away /back /kick /quote /clear /reconnect /help`.
- Tab completes nicknames. Up and Down step through your sent messages. Alt+Up and Alt+Down switch between channels. Click a nickname to mention that person, or double-click a name in the user list to message them privately.

## Managing connections

Open `https://quintin.uk/w3c-irc/<ADMIN_CODE>`, where `ADMIN_CODE` is the repository secret of that name. The page lists who is connected (nickname, channels, open tabs, how long they've been connected and when they were last active) and can disconnect one person or everyone. Any other code gets the normal 404 page.

## Running it locally

```sh
npm install
npm start        # → http://localhost:8787
```

| Environment variable | Default | |
|---|---|---|
| `PORT` | `8787` | |
| `BASE_PATH` | none | The path the app is served under, e.g. `/w3c-irc` |
| `MAX_CONNECTIONS` | `10` | |
| `IDLE_MINUTES` | `10` | Close a connection after this long with no page open |
| `ADMIN_CODE` | none | Enables the management page. At least 16 characters |
| `IRC_HOST`, `IRC_PORT`, `IRC_TLS` | `irc.w3.org`, `6679`, `true` | Only for tests |

## Testing

The tests use [Playwright](https://playwright.dev) with [axe-core](https://github.com/dequelabs/axe-core) (`@axe-core/playwright`). Every test ends with an axe scan, and some also scan the page while something is open, such as the Admin panel or the mention list. A test fails if axe finds any **critical** or **serious** WCAG 2.2 A or AA violation. The tests run against a small fake IRC server under `/w3c-irc`, with a limit of 3 connections, so they never connect to irc.w3.org.

```sh
npx playwright install chromium   # once
npm test
```

The axe results are attached to each test. Open them with `npx playwright show-report`.

## Deployment

Every push to `main` runs the tests. If they pass, the app is deployed to quintin.uk (Krystal cPanel, Passenger) and the deploy checks `/w3c-irc/api/health`.

| Name | Kind | Value |
|---|---|---|
| `SSH_USER` | variable | the cPanel user |
| `PUBLIC_URL` | variable | `https://quintin.uk/w3c-irc` |
| `ADMIN_CODE` | secret | the code for the management page, at least 16 characters (a secret, because variables are printed in workflow logs) |
| `SSH_HOST`, `SSH_PORT` | secrets | the server and its SSH port |
| `SSH_PRIVATE_KEY` | secret | the deploy key |
| `SSH_KNOWN_HOSTS` | secret | `ssh-keyscan -p <port> <host>` |

The server must be allowed to make outgoing connections to `irc.w3.org` on port 6679.

## Feature requests

Add new requests at the bottom with `- [ ]`, and tick them off when they're done.

- [x] Scribe mode: prefix everything typed with `Speaker: ` until scribing stops; quick actions and meeting commands are sent unchanged.
- [x] `@` opens a list of nicknames; typing filters it, arrow keys select, Enter or Tab fills it in.
- [x] Clear the speaker name when scribe mode is started or stopped.
- [x] **q\*** quick action that inserts `q+ to ` so a reason can be added to the queue request.
- [x] Move the one-off start and finish meeting actions into an Admin panel that is collapsed by default.
- [x] Show the channel list in the sidebar only when not in a joined channel; otherwise show the quick actions there, and go back to the list on Leave.
- [x] Build status badges in the README.
- [x] Playwright accessibility tests (axe) that run locally and block the deploy.
- [x] Run as a web app at quintin.uk/w3c-irc instead of a desktop app.
- [x] Nothing personal built in: nickname and channels come from each visitor and are remembered in a cookie.
- [x] Cookie icon with a page explaining the cookies; no telemetry.
- [x] At most 10 connections at once, only to irc.w3.org, with the count shown at the top.
- [x] Management page at `/w3c-irc/<ADMIN_CODE>` to see and disconnect connections.
