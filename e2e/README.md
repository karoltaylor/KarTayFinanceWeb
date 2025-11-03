# End-to-End Tests with Playwright

This directory contains end-to-end tests for the KarTay React Web application.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Structure](#test-structure)
- [Authentication Setup](#authentication-setup)
- [Best Practices](#best-practices)
- [Debugging](#debugging)

## 🚀 Getting Started

Playwright is already installed and configured. The configuration is in `playwright.config.js` at the root of the project.

### First Time Setup

The browsers are already installed, but if you need to reinstall or add more:

```bash
# Install Chromium only
npx playwright install chromium

# Or install all browsers
npx playwright install
```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/example.spec.js

# Run tests matching a pattern
npx playwright test e2e/finance

# Run a single test by name
npx playwright test -g "should load the application"
```

### Run Tests on Different Browsers

```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## ✍️ Writing Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Interact with elements
    await page.getByRole('button', { name: /click me/i }).click();
    
    // Assert expectations
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

### Using Helpers

```javascript
import { test, expect } from '@playwright/test';
import { waitForAuth, isAuthenticated } from './helpers/auth.setup';
import { fillForm, waitForElement } from './helpers/test-utils';

test('should submit form', async ({ page }) => {
  await page.goto('/');
  await waitForAuth(page);
  
  await fillForm(page, {
    'Wallet Name': 'My Wallet',
    'Balance': '1000'
  });
  
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByText('Wallet added successfully')).toBeVisible();
});
```

## 📁 Test Structure

```
e2e/
├── README.md              # This file
├── example.spec.js        # Basic app and navigation tests
├── auth.spec.js          # Authentication flow tests
├── finance.spec.js       # Finance Manager feature tests
└── helpers/
    ├── auth.setup.js     # Authentication utilities
    └── test-utils.js     # Common test utilities
```

## 🔐 Authentication Setup

Since this app uses Firebase Authentication, you have several options:

### Option 1: Test with Real Authentication

For local development, you can use a real test account:

1. Create a dedicated test account in Firebase
2. Store credentials in environment variables
3. Use the auth setup helper to log in before tests

### Option 2: Use Auth State

Save authenticated state and reuse it:

```javascript
// In auth.setup.js
setup('authenticate', async ({ page }) => {
  await page.goto('/');
  // Perform login
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
```

Update `playwright.config.js`:

```javascript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.js/ },
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/user.json'
    },
    dependencies: ['setup']
  }
]
```

### Option 3: Firebase Auth Emulator (Recommended for CI/CD)

Use the Firebase Emulator for testing:

```bash
firebase emulators:start --only auth
```

Update your test environment to point to the emulator.

## ✨ Best Practices

### 1. Use Semantic Locators

Prefer user-facing attributes:

```javascript
// ✅ Good
await page.getByRole('button', { name: /submit/i });
await page.getByLabel('Email');
await page.getByText('Welcome');

// ❌ Avoid
await page.locator('.btn-submit');
await page.locator('#email-input');
```

### 2. Wait for Elements

Always wait for elements before interacting:

```javascript
// ✅ Good
const button = page.getByRole('button', { name: /submit/i });
await button.waitFor();
await button.click();

// Or use expect (recommended)
await expect(button).toBeVisible();
await button.click();
```

### 3. Use Test Hooks

Keep tests DRY with beforeEach/afterEach:

```javascript
test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('test 1', async ({ page }) => {
    // Test code
  });
});
```

### 4. Handle Network Requests

```javascript
// Wait for API calls
await page.waitForResponse(response => 
  response.url().includes('/api/wallets') && response.status() === 200
);

// Mock API responses
await page.route('**/api/wallets', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ wallets: [] })
  });
});
```

### 5. Use Data Attributes for Testing

Add `data-testid` attributes to your components:

```jsx
<button data-testid="add-wallet-btn">Add Wallet</button>
```

```javascript
await page.getByTestId('add-wallet-btn').click();
```

## 🐛 Debugging

### 1. Debug Mode

Run tests with Playwright Inspector:

```bash
npm run test:e2e:debug
```

### 2. UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

Features:
- Time travel debugging
- Watch mode
- Visual test execution
- Network activity

### 3. Screenshots and Videos

Playwright automatically captures:
- Screenshots on failure
- Traces on retry
- Videos (if enabled in config)

Find them in `test-results/` directory.

### 4. Console Output

Add console logs to tests:

```javascript
console.log('Current URL:', page.url());
console.log('Title:', await page.title());
```

### 5. Pause Test Execution

```javascript
await page.pause(); // Opens Playwright Inspector
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Authentication Guide](https://playwright.dev/docs/auth)

## 🎯 Next Steps

1. **Update test selectors**: Replace placeholder selectors with your actual component selectors
2. **Implement auth flow**: Set up authentication for your tests
3. **Add more test cases**: Cover critical user flows
4. **Set up CI/CD**: Add Playwright to your CI pipeline
5. **Add visual regression tests**: Use Playwright's screenshot comparison

## 💡 Tips

- Use `.skip` to temporarily skip tests
- Use `.only` to run a single test during development
- Use `test.fixme()` for tests that need to be written
- Keep tests independent - each test should work in isolation
- Use Page Object Model for complex pages
- Run tests in parallel for faster execution

