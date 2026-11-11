import { test, expect, load, rememberPrefs, ADMIN_CODE } from './fixtures.js';

const connectDialog = (page) => page.getByRole('dialog', { name: 'Connect to W3C IRC' });

test.describe('connecting', () => {
  test('first visit asks for a nickname, then remembers it in a cookie', async ({ page, context }) => {
    await page.goto('./');
    const dialog = connectDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('irc.w3.org');
    await expect(dialog.getByRole('textbox', { name: /^Nickname/ })).toBeFocused();

    await dialog.getByRole('textbox', { name: /^Nickname/ }).fill('newcomer');
    await dialog.getByRole('textbox', { name: /^Channels to join/ }).fill('#test-a test-b');
    await dialog.getByRole('button', { name: 'Connect' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.locator('#status')).toHaveClass(/\bon\b/);
    await expect(page.locator('#status-text')).toContainText('newcomer');

    const prefs = (await context.cookies()).find((c) => c.name === 'w3circ_prefs');
    expect(JSON.parse(decodeURIComponent(prefs.value))).toMatchObject({ nick: 'newcomer', channels: ['#test-a', '#test-b'] });
    const sid = (await context.cookies()).find((c) => c.name === 'w3circ_sid');
    expect(sid.httpOnly).toBe(true);
    expect(sid.sameSite).toBe('Strict');

    // Reloading resumes the same connection without asking again.
    await page.reload();
    await expect(page.locator('#status-text')).toContainText('newcomer');
    await expect(connectDialog(page)).toBeHidden();
  });

  test('a new browser session with the remembered cookie connects straight away', async ({ page, context, baseURL }) => {
    await rememberPrefs(context, baseURL, { nick: 'returning', realname: '', channels: ['#test-a'] });
    await page.goto('./');
    await expect(page.locator('#status-text')).toContainText('returning');
    await expect(connectDialog(page)).toBeHidden();
  });

  test('an invalid nickname is explained', async ({ page }) => {
    await page.goto('./');
    const dialog = connectDialog(page);
    await dialog.getByRole('textbox', { name: /^Nickname/ }).fill('9 bad nick');
    await dialog.getByRole('button', { name: 'Connect' }).click();
    await expect(dialog.getByRole('alert')).toContainText('nickname');
    await expect(dialog.getByRole('textbox', { name: /^Nickname/ })).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows how many connections are in use', async ({ page }) => {
    await load(page, { nick: 'counter' });
    await expect(page.locator('#conn-count')).toHaveText('1 of 3 connections in use');
  });

  test('when every connection is in use, new visitors are told to wait', async ({ page, playwright, baseURL }) => {
    const others = await Promise.all([1, 2, 3].map(async (i) => {
      const ctx = await playwright.request.newContext({ baseURL });
      const r = await ctx.post('api/session', { data: { nick: `filler${i}`, channels: [] } });
      expect(r.status()).toBe(201);
      return ctx;
    }));
    try {
      await page.goto('./');
      const dialog = connectDialog(page);
      await dialog.getByRole('textbox', { name: /^Nickname/ }).fill('latecomer');
      await dialog.getByRole('button', { name: 'Connect' }).click();
      await expect(dialog.getByRole('alert')).toHaveText('All 3 connections are in use. Try again in a few minutes.');
      await expect(dialog).toContainText('3 of 3 connections in use');
    } finally {
      for (const ctx of others) { await ctx.post('api/forget'); await ctx.dispose(); }
    }
  });

  test('Disconnect frees the connection and shows the connect screen', async ({ page }) => {
    await load(page, { nick: 'leaver' });
    await page.getByRole('button', { name: 'Disconnect' }).click();
    const dialog = connectDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('alert')).toContainText('You disconnected');
    await expect(dialog).toContainText('0 of 3 connections in use');
    await expect(dialog.getByRole('textbox', { name: /^Nickname/ })).toHaveValue('leaver');
  });
});

test.describe('cookies and privacy', () => {
  test('the cookie icon opens a page explaining the cookies and that there is no telemetry', async ({ page }) => {
    await load(page, { nick: 'reader' });
    await page.getByRole('link', { name: 'Cookies and privacy' }).first().click();
    await expect(page).toHaveURL(/\/w3c-irc\/cookies$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cookies and privacy');
    await expect(page.locator('main')).toContainText('no telemetry');
    await expect(page.getByRole('cell', { name: 'w3circ_sid' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'w3circ_prefs' })).toBeVisible();
  });

  test('Forget me disconnects and removes the cookies', async ({ page, context }) => {
    await load(page, { nick: 'forgetful' });
    await page.goto('cookies');
    await page.getByRole('button', { name: 'Forget me' }).click();
    await expect(page.getByRole('status')).toContainText('no longer remembers you');
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).not.toContain('w3circ_prefs');
    expect(names).not.toContain('w3circ_sid');
    await page.goto('./');
    await expect(connectDialog(page)).toBeVisible();
  });
});

test.describe('managing connections', () => {
  test('the page only exists for the right code', async ({ page }) => {
    const res = await page.goto('not-the-code-0123456789');
    expect(res.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    const api = await page.request.get('api/admin/sessions', { headers: { 'x-admin-code': 'wrong' } });
    expect(api.status()).toBe(404);
  });

  test('lists connections and can disconnect one', async ({ page, browser }) => {
    const userContext = await browser.newContext();
    const user = await userContext.newPage();
    try {
      await load(user, { nick: 'managed' });

      await page.goto(ADMIN_CODE);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connections');
      await expect(page.locator('#meter')).toHaveText('1 of 3 connections in use');
      const row = page.getByRole('row', { name: /managed/ });
      await expect(row).toContainText('#test-a');
      await row.getByRole('button', { name: 'Disconnect managed' }).click();
      await expect(page.locator('#meter')).toHaveText('0 of 3 connections in use');

      const dialog = connectDialog(user);
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('alert')).toContainText('Disconnected by the administrator');
    } finally {
      await userContext.close();
    }
  });
});

test('unknown pages show a 404 page', async ({ page }) => {
  const res = await page.goto('no/such/page');
  expect(res.status()).toBe(404);
  await page.getByRole('link', { name: 'Go to W3C IRC' }).click();
  await expect(connectDialog(page)).toBeVisible();
});
