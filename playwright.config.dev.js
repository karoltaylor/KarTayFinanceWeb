import { defineConfig, devices } from '@playwright/test';

/**
 * Development configuration for Playwright
 * This config expects the dev server to already be running
 * 
 * Usage: npx playwright test --config=playwright.config.dev.js
 * Or add to package.json: "test:e2e:dev": "playwright test --config=playwright.config.dev.js"
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project (manual login once to save storage state)
    {
      name: 'setup',
      testDir: 'e2e/setup',
      testMatch: /.*\.setup\.js/,
      use: {
        baseURL: 'http://localhost:3000',
        trace: 'on',
        screenshot: 'only-on-failure'
      },
    },

    // Use saved state for deterministic runs while developing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json'
      },
      dependencies: ['setup']
    },
  ],

  // NO webServer config - expects server to be already running
});

