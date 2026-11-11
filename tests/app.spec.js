import { test, expect, openChannel, load, showChannelList } from './fixtures.js';

const composer = (page) => page.locator('#composer-input');
const log = (page) => page.locator('#log');

async function say(page, text) {
  await composer(page).fill(text);
  await composer(page).press('Enter');
}

test.describe('sidebar', () => {
  test('shows the channel list until a channel is joined, then its controls', async ({ page, axe }) => {
    await load(page);
    await showChannelList(page);
    await page.getByRole('button', { name: /^Server/ }).click();
    await expect(page.locator('#side-channels')).toBeVisible();
    await expect(page.locator('#side-controls')).toBeHidden();
    await axe('channel list');

    await openChannel(page, '#test-a');
    await expect(page.locator('#side-channels')).toBeHidden();
    await expect(page.locator('#quick-groups').getByRole('button', { name: /^Present\+$/ })).toBeEnabled();
  });

  test('All channels shows the list without leaving', async ({ page }) => {
    await openChannel(page, '#test-a');
    await page.getByRole('button', { name: /^All channels/ }).click();
    await expect(page.locator('#side-channels')).toBeVisible();
    await page.locator('#saved-list').getByRole('button', { name: /^#test-a/ }).click();
    await expect(page.locator('#side-controls')).toBeVisible();
  });

  test('Leave goes back to the channel list', async ({ page, ircSent }) => {
    await openChannel(page, '#test-b');
    await page.locator('#side-leave').click();
    await expect(page.locator('#side-channels')).toBeVisible();
    await expect.poll(ircSent).toContain('PART #test-b');
  });

  test('admin actions are in a panel that is collapsed by default', async ({ page, axe }) => {
    await openChannel(page);
    const admin = page.locator('details.qadmin');
    await expect(admin).not.toHaveAttribute('open', '');
    await expect(page.getByRole('button', { name: /^Start meeting$/ })).toBeHidden();
    await admin.locator('summary').click();
    await expect(page.getByRole('button', { name: /^Start meeting$/ })).toBeVisible();
    await axe('admin panel open');
  });
});

test.describe('scribe mode', () => {
  test('prefixes typed lines with the speaker but not commands or quick actions', async ({ page, ircSent, axe }) => {
    await openChannel(page);
    await page.getByRole('button', { name: 'Scribe', exact: true }).click();
    const speaker = page.getByRole('combobox', { name: 'Speaker' });
    await expect(speaker).toBeFocused();
    await axe('scribe mode on');
    await speaker.fill('judy');
    await speaker.press('Enter');
    await expect(composer(page)).toBeFocused();

    await say(page, 'we should ship it');
    await say(page, 'TOPIC: Budget');
    await say(page, 'q+ to ask about dates');
    await page.locator('#quick-groups').getByRole('button', { name: /^Present\+$/ }).click();

    await expect(log(page)).toContainText('judy: we should ship it');
    await expect.poll(ircSent).toEqual(expect.arrayContaining([
      'PRIVMSG #test-a :judy: we should ship it',
      'PRIVMSG #test-a :TOPIC: Budget',
      'PRIVMSG #test-a :q+ to ask about dates',
      'PRIVMSG #test-a :present+',
    ]));
  });

  test('clears the speaker when scribing stops and starts', async ({ page, ircSent }) => {
    await openChannel(page);
    await page.getByRole('button', { name: 'Scribe', exact: true }).click();
    await page.getByRole('combobox', { name: 'Speaker' }).fill('alice');
    await page.getByRole('combobox', { name: 'Speaker' }).press('Enter');
    await page.getByRole('button', { name: 'Stop scribing' }).click();
    await expect(page.getByRole('combobox', { name: 'Speaker' })).toBeHidden();

    await say(page, 'just me talking');
    await expect.poll(ircSent).toContain('PRIVMSG #test-a :just me talking');

    await page.getByRole('button', { name: 'Scribe', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Speaker' })).toHaveValue('');
  });
});

test.describe('@ mentions', () => {
  test('typing filters the list, arrows select, Enter fills in', async ({ page, axe }) => {
    await openChannel(page);
    const input = composer(page);
    const list = page.getByRole('listbox', { name: 'Matching names' });

    await input.pressSequentially('thanks @al');
    await expect(list).toBeVisible();
    await expect(list.getByRole('option')).toHaveText(['alice', 'albert'].sort());
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await axe('mention list open');

    await input.pressSequentially('b');
    await expect(list.getByRole('option')).toHaveText(['albert']);
    await input.press('Backspace');
    await input.press('ArrowDown');
    await expect(list.getByRole('option', { selected: true })).toHaveText('alice');
    await input.press('Enter');
    await expect(list).toBeHidden();
    await expect(input).toHaveValue('thanks alice ');
  });

  test('at the start of a message Tab fills in "name: "', async ({ page }) => {
    await openChannel(page);
    const input = composer(page);
    await input.pressSequentially('@ju');
    await input.press('Tab');
    await expect(input).toHaveValue('judy: ');
  });

  test('Escape closes the list and Enter then sends', async ({ page, ircSent }) => {
    await openChannel(page);
    const input = composer(page);
    await input.pressSequentially('ping @bo');
    await expect(page.getByRole('listbox')).toBeVisible();
    await input.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await input.press('Enter');
    await expect.poll(ircSent).toContain('PRIVMSG #test-a :ping @bo');
  });
});

test.describe('quick actions', () => {
  test('q* inserts "q+ to " for the reason to be typed', async ({ page, ircSent }) => {
    await openChannel(page);
    await page.locator('#quick-groups').getByRole('button', { name: /^q\*/ }).click();
    await expect(composer(page)).toHaveValue('q+ to ');
    await expect(composer(page)).toBeFocused();
    await composer(page).pressSequentially('ask about testing');
    await composer(page).press('Enter');
    await expect.poll(ircSent).toContain('PRIVMSG #test-a :q+ to ask about testing');
  });
});
