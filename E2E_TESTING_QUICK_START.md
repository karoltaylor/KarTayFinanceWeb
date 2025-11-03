# 🚀 E2E Testing Quick Start Guide

## ✅ What's Been Set Up

Your Playwright end-to-end testing environment is now ready! Here's what was installed and configured:

### Installed
- ✅ `@playwright/test` - Playwright test runner
- ✅ Chromium browser for testing
- ✅ Test configuration in `playwright.config.js`

### Created Test Files
- ✅ `e2e/smoke.spec.js` - Basic smoke tests (ready to run!)
- ✅ `e2e/example.spec.js` - App navigation tests
- ✅ `e2e/auth.spec.js` - Authentication flow tests (templates)
- ✅ `e2e/finance.spec.js` - Finance Manager tests (templates)

### Helper Files
- ✅ `e2e/helpers/auth.setup.js` - Authentication utilities
- ✅ `e2e/helpers/test-utils.js` - Common test utilities
- ✅ `e2e/README.md` - Comprehensive testing guide

### Configuration
- ✅ Updated `package.json` with test scripts
- ✅ Updated `.gitignore` for test results
- ✅ Configured to auto-start dev server

## 🏃 Running Your First Test

### Option 1: UI Mode (Recommended for Beginners)

This opens an interactive interface where you can see tests run in real-time:

```bash
npm run test:e2e:ui
```

**What you'll see:**
- Visual test execution
- Time-travel debugging
- Watch mode
- Click-to-run individual tests

### Option 2: Headless Mode (Fast)

Run all tests in the background:

```bash
npm run test:e2e
```

**What happens:**
- Dev server starts automatically on http://localhost:5173
- Tests run in Chromium (headless)
- Results shown in terminal
- Report generated (view with `npm run test:e2e:report`)

### Option 3: Headed Mode (See the Browser)

Watch tests run in a real browser window:

```bash
npm run test:e2e:headed
```

### Option 4: Debug Mode

Step through tests with Playwright Inspector:

```bash
npm run test:e2e:debug
```

## 📝 Your Test Files

### 1. **smoke.spec.js** - Start Here!

These tests verify basic functionality and should pass immediately:
- ✅ App is accessible
- ✅ No critical JavaScript errors
- ✅ React app renders
- ✅ Styles load correctly

**Run just smoke tests:**
```bash
npx playwright test smoke
```

### 2. **example.spec.js** - Navigation Tests

Tests for basic app navigation:
- App loading
- Header visibility
- Mutual Funds button
- Modal opening

**Note:** Some tests may need auth setup to pass.

### 3. **auth.spec.js** - Authentication (Templates)

Templates for auth testing. Currently marked as `.skip` - you'll need to:
1. Set up Firebase auth test account
2. Implement login flow in the tests
3. Remove `.skip` to activate

### 4. **finance.spec.js** - Feature Tests (Templates)

Templates for testing Finance Manager features:
- Wallet management
- Transaction display
- Filtering and pagination

**You'll need to:**
1. Update selectors to match your components
2. Implement auth setup
3. Add specific test scenarios

## 🔧 Customizing Tests

### Update Selectors

Replace placeholder selectors with your actual component selectors:

```javascript
// Generic (current)
const element = page.locator('[class*="Component"]');

// Specific (better)
const element = page.getByRole('button', { name: /add wallet/i });
// or
const element = page.getByTestId('add-wallet-button');
```

### Add Test IDs to Components

For more reliable tests, add `data-testid` attributes:

```jsx
// In your React component
<button data-testid="submit-button">Submit</button>
```

```javascript
// In your test
await page.getByTestId('submit-button').click();
```

## 🔐 Handling Authentication

Your app uses Firebase Authentication. Here are your options:

### Option A: Test with Real Auth (Development)

1. Create test user in Firebase Console
2. Store credentials in `.env.test`:
```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
```

3. Update `auth.setup.js` to use these credentials

### Option B: Reuse Auth State

1. Log in once and save state:
```javascript
setup('authenticate', async ({ page }) => {
  // Log in
  await page.goto('/');
  // ... perform login steps
  
  // Save state
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
```

2. Configure Playwright to use saved state (see `e2e/README.md`)

### Option C: Firebase Emulator (CI/CD)

Best for automated testing:
```bash
firebase emulators:start --only auth
```

Update tests to point to emulator URL.

## 📊 Viewing Test Results

### HTML Report

After running tests, view the interactive report:

```bash
npm run test:e2e:report
```

This shows:
- ✅ Passed tests
- ❌ Failed tests
- Screenshots of failures
- Execution traces
- Network activity

### Screenshots & Videos

Failed tests automatically capture:
- Screenshots: `test-results/` folder
- Traces: For time-travel debugging
- Videos: (if enabled in config)

## 🎯 Next Steps

### 1. Run Your First Test (Right Now!)

```bash
npm run test:e2e:ui
```

Click on `smoke.spec.js` and watch the tests run!

### 2. Customize Example Tests

Open `e2e/example.spec.js` and update selectors to match your components.

### 3. Set Up Authentication

Choose an auth strategy and implement it in `e2e/helpers/auth.setup.js`.

### 4. Write Your First Custom Test

Create a new file:
```bash
# e2e/my-feature.spec.js
```

Use examples from existing test files as templates.

### 5. Add to CI/CD

Add to your GitHub Actions or CI pipeline:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
```

## 🐛 Troubleshooting

### Tests Fail Because of Auth

- **Solution:** Implement auth setup (see `e2e/helpers/auth.setup.js`)
- **Quick fix:** Test non-protected pages first or mock auth state

### Dev Server Doesn't Start

- **Check:** Is port 5173 already in use?
- **Solution:** Update `baseURL` in `playwright.config.js`

### Selector Not Found

- **Check:** Element might not be visible yet
- **Solution:** Add wait: `await expect(element).toBeVisible()`

### Tests Are Slow

- **Solution:** Run in parallel: `npx playwright test --workers=4`
- **Or:** Run specific tests only: `npx playwright test smoke`

### Can't See What's Happening

- **Solution:** Use headed mode: `npm run test:e2e:headed`
- **Or:** Use UI mode: `npm run test:e2e:ui`

## 📚 Learning Resources

- **Documentation:** See `e2e/README.md` for detailed guide
- **Playwright Docs:** https://playwright.dev/docs/intro
- **Best Practices:** https://playwright.dev/docs/best-practices
- **Examples:** Check test files in `e2e/` folder

## 💡 Pro Tips

1. **Start with smoke tests** - They're simple and should pass immediately
2. **Use UI mode** - Best for learning and debugging
3. **Add data-testid attributes** - Makes tests more reliable
4. **Keep tests independent** - Each test should work alone
5. **Use semantic locators** - `getByRole`, `getByLabel`, `getByText`
6. **Wait for elements** - Use `expect().toBeVisible()` instead of fixed waits
7. **Run tests often** - Catch issues early
8. **Check the HTML report** - Great for understanding failures

## 🎉 You're Ready!

Everything is set up. Start with:

```bash
npm run test:e2e:ui
```

Happy testing! 🚀

---

**Need help?** Check:
- `e2e/README.md` - Detailed documentation
- `e2e/helpers/test-utils.js` - Utility functions
- https://playwright.dev/docs/intro - Official docs

