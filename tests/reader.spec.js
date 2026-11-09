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

// ---- Page-mode pagination (issue #1: long paragraphs used to be clipped)

// Distinct, numbered words so we can prove nothing is lost or repeated.
const numbered = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}${i}`).join(' ');

async function openInPages(page, paragraphs) {
  await addPiece(page, 'Pagination', paragraphs);
  await page.click('.piece');
  await switchMode(page, 'pages');
  await expect(page.locator('.page').first()).toBeVisible();
}

const overflowingPages = (page) => page.locator('.page').evaluateAll((pages) =>
  pages.filter((p) => p.scrollHeight > p.clientHeight + 1).length);

test('no page in page mode holds more text than fits', async ({ page }) => {
  await openInPages(page, [para(40), para(600), para(40)]);
  expect(await overflowingPages(page)).toBe(0);
});

test('a split paragraph keeps every word, in order, exactly once', async ({ page }) => {
  const paragraphs = [numbered('a', 40), numbered('b', 900), numbered('c', 300), numbered('d', 20)];
  await openInPages(page, paragraphs);
  const shown = await page.locator('.page p').evaluateAll((ps) =>
    ps.map((p) => p.textContent).join(' ').split(/\s+/).filter(Boolean));
  expect(shown).toEqual(paragraphs.join(' ').split(' '));
});

test('the continued part of a paragraph has no fresh indent', async ({ page }) => {
  await openInPages(page, [para(40), para(600)]);
  const cont = page.locator('.page p.cont').first();
  await expect(cont).toHaveCount(1);
  expect(await cont.evaluate((el) => getComputedStyle(el).textIndent)).toBe('0px');
  // The opening paragraph keeps its drop cap; continuations never get one.
  await expect(page.locator('.page p.cont.first-para')).toHaveCount(0);
});

test('pages fill up instead of leaving big gaps before a long paragraph', async ({ page }) => {
  await openInPages(page, [para(40), para(600)]);
  // The first page should carry the start of the long paragraph, not just the short one.
  await expect(page.locator('.page').first().locator('p')).toHaveCount(2);
});

for (const [label, size, leading] of [['smallest text, tight', 'down', '1.5'], ['largest text, airy', 'up', '1.95']]) {
  test(`no overflow with ${label}`, async ({ page }) => {
    await addPiece(page, 'Sizes', [para(40), para(700), para(120), para(500)]);
    await page.click('.piece');
    await page.click('#settingsBtn');
    await page.click('#modeSeg button[data-mode=pages]');
    await page.click(`#leadingSeg button[data-leading="${leading}"]`);
    for (let i = 0; i < 12; i++) await page.click(size === 'up' ? '#sizeUp' : '#sizeDown');
    await page.click('#drawerCloseBtn');
    await expect(page.locator('.page').first()).toBeVisible();
    expect(await overflowingPages(page)).toBe(0);
  });
}

test('reading position survives reopening a piece with split paragraphs', async ({ page }) => {
  await openInPages(page, [para(40), para(900), para(900)]);
  const { width, height } = page.viewportSize();
  for (let i = 0; i < 3; i++) await page.mouse.click(width - 10, height / 2);
  const before = await page.locator('#pageCounter').textContent();
  await page.click('#backBtn');
  await page.click('.piece');
  await expect(page.locator('#pageCounter')).toHaveText(before);
});
