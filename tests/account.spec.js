// The owner login (Phase 1: one owner, no sign-up). The test server uses the
// password in tests/fixtures/config.test.php.
const { test, expect } = require('@playwright/test');

const PASSWORD = 'test-owner-password';

let pageErrors;
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
});
test.afterEach(() => {
  expect(pageErrors, 'JavaScript errors on the page').toEqual([]);
});

async function signIn(page) {
  await page.click('#accountBtn');
  await page.fill('#passwordInput', PASSWORD);
  await page.click('#submitLoginBtn');
  await expect(page.locator('#accountBtn')).toHaveText('Sign out');
}

test('the reader works without signing in', async ({ page }) => {
  await page.goto('/app/');
  await expect(page.locator('#accountBtn')).toHaveText('Sign in');
  await expect(page.locator('#loginScrim')).not.toHaveClass(/open/);
  await page.click('#addTextBtn');
  await page.fill('#titleInput', 'No account needed');
  await page.fill('#textInput', 'Just reading.');
  await page.click('#saveAddBtn');
  await expect(page.locator('.piece-title', { hasText: 'No account needed' })).toBeVisible();
});

test('a wrong password is refused with a plain message', async ({ page }) => {
  await page.goto('/app/');
  await page.click('#accountBtn');
  await page.fill('#passwordInput', 'not-the-password');
  await page.click('#submitLoginBtn');
  await expect(page.locator('#loginStatus')).toHaveText("That password didn't match.");
  await expect(page.locator('#loginScrim')).toHaveClass(/open/);
  await page.click('#cancelLoginBtn');
  await expect(page.locator('#accountBtn')).toHaveText('Sign in');
});

test('the right password signs in, and it sticks after a reload', async ({ page }) => {
  await page.goto('/app/');
  await signIn(page);
  await expect(page.locator('#loginScrim')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#accountBtn')).toHaveText('Sign out');
  await expect(page.locator('#accountLabel')).toContainText('Signed in');
});

test('signing out ends the session on the server', async ({ page }) => {
  await page.goto('/app/');
  await signIn(page);
  await page.click('#accountBtn');
  await expect(page.locator('#accountBtn')).toHaveText('Sign in');
  await page.reload();
  await expect(page.locator('#accountBtn')).toHaveText('Sign in');
  const session = await (await page.request.get('/app/api/session.php')).json();
  expect(session.owner).toBe(false);
});

test('"Log in" on the homepage opens the sign-in sheet', async ({ page }) => {
  await page.goto('/');
  await page.click('#loginLink');
  await expect(page.locator('#loginScrim')).toHaveClass(/open/);
  await expect(page.locator('#passwordInput')).toBeFocused();
});

test('the session cookie is hidden from page scripts', async ({ page, context }) => {
  await page.goto('/app/');
  await signIn(page);
  const cookie = (await context.cookies()).find((c) => c.name === 'monkeys');
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Lax');
  expect(await page.evaluate(() => document.cookie)).not.toContain('monkeys');
});

test('sign-in requests from another site are turned away', async ({ request }) => {
  const res = await request.post('/app/api/login.php', {
    headers: { Origin: 'https://elsewhere.example', 'Content-Type': 'application/json' },
    data: { password: PASSWORD },
  });
  expect(res.status()).toBe(403);
});

test('pages and server answers ask search engines to stay away', async ({ page, request }) => {
  for (const url of ['/', '/app/']) {
    await page.goto(url);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  }
  const res = await request.get('/app/api/session.php');
  expect(res.headers()['x-robots-tag']).toContain('noindex');
});

test('server-only files cannot be fetched from the web', async ({ request }) => {
  for (const url of ['/server/bootstrap.php', '/config.local.php', '/config.example.php', '/storage/login-attempts.json', '/tests/fixtures/config.test.php']) {
    expect((await request.get(url)).status(), url).toBe(404);
  }
});
