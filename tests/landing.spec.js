// The public homepage at / and its links into the reader at /app/.
const { test, expect } = require('@playwright/test');

let pageErrors;
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
});
test.afterEach(() => {
  expect(pageErrors, 'JavaScript errors on the page').toEqual([]);
});

test('homepage shows the name and both ways into the app', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('1000 Monkeys');
  await expect(page.locator('.wordmark')).toHaveText('1000 Monkeys');
  await expect(page.locator('#loginLink')).toBeVisible();
  await expect(page.locator('#openReader')).toBeVisible();
});

for (const [name, selector] of [['Log in', '#loginLink'], ['Open the reader', '#openReader']]) {
  test(`"${name}" opens the reader`, async ({ page }) => {
    await page.goto('/');
    await page.click(selector);
    await expect(page).toHaveURL(/\/app\/(#login)?$/);
    await expect(page.locator('#library')).toBeVisible();
  });
}

test('homepage fits a phone screen with no sideways scrolling', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('library saved in the app is still there after visiting the homepage', async ({ page }) => {
  await page.goto('/app/');
  await page.click('#addTextBtn');
  await page.fill('#titleInput', 'Hildur');
  await page.fill('#textInput', 'Once upon a time.');
  await page.click('#saveAddBtn');
  await page.goto('/');
  await page.click('#openReader');
  await expect(page.locator('.piece-title', { hasText: 'Hildur' })).toBeVisible();
});

test('/app without a trailing slash still reaches the reader', async ({ page }) => {
  await page.goto('/app');
  await expect(page.locator('#library')).toBeVisible();
});
