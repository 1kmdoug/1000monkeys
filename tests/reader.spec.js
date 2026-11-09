// Smoke tests for the reader. Each test starts with an empty library.
const { test, expect } = require('@playwright/test');

const para = (n) => Array(n).fill('word').join(' ');

async function addPiece(page, title, paragraphs) {
  await page.click('#addTextBtn');
  await page.fill('#titleInput', title);
  await page.fill('#textInput', paragraphs.join('\n\n'));
  await page.click('#saveAddBtn');
  await expect(page.locator('.piece-title', { hasText: title })).toBeVisible();
}

async function switchMode(page, mode) {
  await page.click('#settingsBtn');
  await page.click(`#modeSeg button[data-mode=${mode}]`);
  await page.click('#drawerCloseBtn');
  // The drawer slides out over ~0.25s; wait until it's fully off-screen
  // so it doesn't swallow taps on the right edge.
  const width = page.viewportSize().width;
  await expect.poll(async () => (await page.locator('#drawer').boundingBox()).x).toBeGreaterThanOrEqual(width);
}

let pageErrors;
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto('/app/');
});
test.afterEach(() => {
  expect(pageErrors, 'JavaScript errors on the page').toEqual([]);
});

test('library opens empty', async ({ page }) => {
  await expect(page.locator('#empty')).toBeVisible();
  await expect(page.locator('.piece')).toHaveCount(0);
});

test('pasted text appears in the library and opens in the reader', async ({ page }) => {
  await addPiece(page, 'Hildur', ['First paragraph here.', 'Second paragraph here.', 'Third.']);
  await page.click('.piece');
  await expect(page.locator('#reader')).toHaveClass(/open/);
  await expect(page.locator('.piece-headline')).toHaveText('Hildur');
  await expect(page.locator('#articleBody p')).toHaveCount(3);
});

test('library and settings survive a reload', async ({ page }) => {
  await addPiece(page, 'Saved piece', ['Some text.']);
  await page.click('.piece');
  await page.click('#settingsBtn');
  await page.click('#themeSeg button[data-theme=night]');
  await page.reload();
  await expect(page.locator('.piece-title', { hasText: 'Saved piece' })).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'night');
});

test('page mode turns pages from the right and left edges', async ({ page }) => {
  await addPiece(page, 'Long one', Array(30).fill(para(60)));
  await page.click('.piece');
  await switchMode(page, 'pages');
  const counter = page.locator('#pageCounter');
  await expect(counter).toHaveText(/^1 \/ \d+$/);

  const { width, height } = page.viewportSize();
  await page.mouse.click(width - 10, height / 2);
  await expect(counter).toHaveText(/^2 \/ /);
  await page.mouse.click(10, height / 2);
  await expect(counter).toHaveText(/^1 \/ /);
});

test('reading position is remembered', async ({ page }) => {
  await addPiece(page, 'Bookmark', Array(30).fill(para(60)));
  await page.click('.piece');
  await switchMode(page, 'pages');
  const { width, height } = page.viewportSize();
  for (let i = 0; i < 3; i++) await page.mouse.click(width - 10, height / 2);
  await expect(page.locator('#pageCounter')).toHaveText(/^4 \/ /);
  await page.click('#backBtn');
  await expect(page.locator('.piece-meta')).not.toContainText('unread');
  await page.click('.piece');
  await expect(page.locator('#pageCounter')).toHaveText(/^4 \/ /);
});

// Known bug, issue #1: a paragraph taller than the screen is clipped.
// Marked as an expected failure. When #1 is fixed this test will start
// "unexpectedly passing" — then delete the test.fail line.
test('no page in page mode holds more text than fits', async ({ page }) => {
  test.fail(true, 'Known bug #1: long paragraphs overflow their page');
  await addPiece(page, 'Overflow', [para(40), para(600), para(40)]);
  await page.click('.piece');
  await switchMode(page, 'pages');
  await expect(page.locator('.page').first()).toBeVisible();
  const overflowing = await page.locator('.page').evaluateAll((pages) =>
    pages.filter((p) => p.scrollHeight > p.clientHeight + 1).length);
  expect(overflowing).toBe(0);
});
