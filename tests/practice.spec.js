import { test, expect, rememberPrefs } from './fixtures.js';

const log = (page) => page.locator('#log');
async function say(page, text) {
  await page.locator('#composer-input').fill(text);
  await page.locator('#composer-input').press('Enter');
}
async function practise(page, context, baseURL, nick, channels = ['#practice']) {
  await rememberPrefs(context, baseURL, { nick, realname: '', channels, practice: true });
  await page.goto('./');
  await expect(page.locator('#status-text')).toHaveText(`${nick} @ practice server`);
  await expect(page.locator('#practice-badge')).toBeVisible();
  await expect(page.locator('#side-chan-name')).toHaveText(channels[0]);
}

test.describe('practice mode', () => {
  test('the connect form offers practice mode and joins #practice with the bots', async ({ page }) => {
    await page.goto('./');
    const dialog = page.getByRole('dialog', { name: 'Connect to W3C IRC' });
    await dialog.getByRole('textbox', { name: /^Nickname/ }).fill('rehearser');
    await dialog.getByRole('checkbox', { name: 'Practice mode' }).check();
    await dialog.getByRole('button', { name: 'Connect' }).click();

    await expect(page.locator('#practice-badge')).toHaveText('Practice mode — not connected to W3C');
    await expect(page.locator('#side-chan-name')).toHaveText('#practice');
    const users = page.locator('#users');
    await expect(users).toContainText('Zakim');
    await expect(users).toContainText('RRSAgent');
  });

  test('Zakim runs the queue and the agenda, RRSAgent answers', async ({ page, context, baseURL, ircSent, axe }) => {
    await practise(page, context, baseURL, 'chairperson');

    await page.locator('#quick-groups').getByRole('button', { name: /^q\*/ }).click();
    await page.locator('#composer-input').pressSequentially('ask about dates');
    await page.locator('#composer-input').press('Enter');
    await say(page, 'q?');
    await expect(log(page)).toContainText('I see chairperson (to ask about dates) on the speaker queue');

    await say(page, 'ack chairperson');
    await expect(log(page)).toContainText('chairperson, you wanted to ask about dates');
    await expect(log(page)).toContainText('I see no one on the speaker queue');

    await say(page, 'agenda+ Budget review');
    await expect(log(page)).toContainText('agendum 1 added');
    await page.locator('#quick-groups').getByRole('button', { name: /^Next item$/ }).click();
    await expect(log(page)).toContainText('agendum 1 -- Budget review -- taken up [from chairperson]');

    await page.locator('details.qadmin summary').click();
    await page.getByRole('button', { name: /^Make minutes$/ }).click();
    await expect(log(page)).toContainText('I have made the request to generate the minutes, chairperson (practice server: nothing is published)');
    await axe('practice conversation');

    // Nothing went to the real IRC server.
    expect((await ircSent()).join('\n')).not.toContain('chairperson');
  });

  test('bots can be invited to another practice channel', async ({ page, context, baseURL }) => {
    await practise(page, context, baseURL, 'inviter', ['#practice-two']);
    await expect(page.locator('#users')).not.toContainText('Zakim');
    await page.locator('details.qadmin summary').click();
    await page.getByRole('button', { name: /^Invite Zakim$/ }).click();
    await expect(page.locator('#users')).toContainText('Zakim');
    await say(page, 'zakim, start meeting');
    await expect(log(page)).toContainText('please title this meeting ("meeting: ..."), inviter');
    await expect(page.locator('#users')).toContainText('RRSAgent');
  });

  test('two people in practice mode see each other', async ({ page, context, baseURL, browser }) => {
    await practise(page, context, baseURL, 'alpha');
    const otherContext = await browser.newContext({ baseURL });
    const other = await otherContext.newPage();
    try {
      await practise(other, otherContext, baseURL, 'beta');
      await expect(page.locator('#users')).toContainText('beta');
      await say(other, 'hello from beta');
      await expect(log(page)).toContainText('hello from beta');
    } finally {
      await other.request.post('api/forget').catch(() => {});
      await otherContext.close();
    }
  });
});
