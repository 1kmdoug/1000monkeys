// Runs the reader on emulated phones and a desktop browser.
// Local:  npm test      CI: .github/workflows/tests.yml
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  // Chromium-based emulation of each device's screen size and touch input.
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'small-phone', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Real iPhones run Safari's engine (WebKit). Runs on GitHub; skipped in
    // environments without WebKit installed unless WEBKIT=1 is set.
    ...(process.env.CI || process.env.WEBKIT
      ? [{ name: 'iphone-safari', use: { ...devices['iPhone 13'] } }]
      : []),
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --directory public',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
