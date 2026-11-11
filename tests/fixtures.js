import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility violations with these impacts fail the test.
const BLOCKING = new Set(['critical', 'serious']);
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const CONTROL = `http://127.0.0.1:${process.env.TEST_CONTROL_PORT || 16668}`;

// Runs axe on the page as it is now and fails on critical or serious WCAG 2.2 A/AA violations.
// The full axe results are attached to the test.
export async function expectAccessible(page, testInfo, label = 'end of test') {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  await testInfo.attach(`axe results (${label})`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  const blocking = results.violations
    .filter((v) => BLOCKING.has(v.impact))
    .map((v) => `${v.impact}: ${v.id} (${v.help}) — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(blocking, `axe found ${blocking.length} critical or serious accessibility issue(s) at ${label}`).toEqual([]);
}

export const test = base.extend({
  // Every test ends with an axe scan of the page.
  axe: [async ({ page }, use, testInfo) => {
    await use(async (label) => expectAccessible(page, testInfo, label));
    if (testInfo.status === testInfo.expectedStatus && page.url().startsWith('http')) await expectAccessible(page, testInfo);
    // Free this test's IRC connection so the next test isn't blocked by the connection limit.
    await page.request.post('api/forget').catch(() => {});
  }, { auto: true }],

  // Lines the app has sent to the fake IRC server.
  ircSent: async ({ request }, use) => {
    await use(async () => (await request.get(`${CONTROL}/sent`)).json());
  },
});

export { expect };

export const ADMIN_CODE = process.env.TEST_ADMIN_CODE || 'test-admin-code-0123456789';
export const CHANNELS = ['#test-a', '#test-b'];

// Remembers a nickname and channels the way the connect form does (the w3circ_prefs cookie).
export async function rememberPrefs(context, baseURL, prefs) {
  const url = new URL(baseURL);
  await context.addCookies([{
    name: 'w3circ_prefs', value: encodeURIComponent(JSON.stringify(prefs)),
    domain: url.hostname, path: url.pathname, sameSite: 'Strict',
  }]);
}

// Loads the app already connected (via the prefs cookie) and waits until the channels are joined.
export async function load(page, { nick = 'tester', channels = CHANNELS } = {}) {
  await rememberPrefs(page.context(), test.info().project.use.baseURL, { nick, realname: 'Test User', channels });
  await page.goto('./');
  await expect(page.locator('#status')).toHaveClass(/\bon\b/);
  if (channels[0]) await expect(page.locator(`#saved-list .buf-btn[aria-label="${channels[0]}"]`)).toBeAttached();
}

// Shows the channel list in the sidebar (it is replaced by channel controls while in a joined channel).
export async function showChannelList(page) {
  if (await page.locator('#side-controls').isVisible()) await page.locator('#side-back').click();
  await expect(page.locator('#side-channels')).toBeVisible();
}

// Opens a channel and makes sure it is joined, so the sidebar shows its controls.
export async function openChannel(page, name = CHANNELS[0]) {
  await load(page);
  if (!(await page.locator('#side-controls').isVisible()) || (await page.locator('#side-chan-name').textContent()) !== name) {
    await showChannelList(page);
    await page.locator('#saved-list').getByRole('button', { name: new RegExp(`^${name}\\b`) }).click();
    const join = page.locator('#join-btn');
    if (await join.isVisible()) await join.click();
  }
  await expect(page.locator('#side-controls')).toBeVisible();
  await expect(page.locator('#side-chan-name')).toHaveText(name);
}
