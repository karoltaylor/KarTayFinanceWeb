# 📁 E2E Test Structure Guide

## Directory Layout

```
KarTayReactWeb/
├── playwright.config.js          ← Main configuration
├── package.json                   ← Added test:e2e scripts
├── E2E_TESTING_QUICK_START.md    ← Start here!
├── PLAYWRIGHT_SETUP_COMPLETE.md  ← Setup summary
│
├── e2e/                          ← All tests live here
│   ├── README.md                 ← Detailed documentation
│   ├── TEST_STRUCTURE.md         ← This file
│   │
│   ├── smoke.spec.js             ⭐ Ready to run!
│   ├── example.spec.js           ← Navigation tests
│   ├── auth.spec.js              ← Auth flow (templates)
│   ├── finance.spec.js           ← Feature tests (templates)
│   │
│   └── helpers/
│       ├── auth.setup.js         ← Auth utilities
│       └── test-utils.js         ← Common helpers
│
└── test-results/                 ← Generated after tests run
    ├── screenshots/
    └── traces/
```

## Test File Overview

### 🏃 smoke.spec.js - Start Here!

**Purpose:** Quick sanity checks to verify basic functionality

**Tests Include:**
- ✅ App is accessible
- ✅ Page title exists
- ✅ No JavaScript errors
- ✅ HTML structure loads
- ✅ Meta viewport is responsive
- ✅ CSS styles load
- ✅ React app renders
- ✅ No failed network requests

**Status:** ✅ Ready to run (no auth needed)

**Run with:**
```bash
npm run test:e2e:ui
# Then click on smoke.spec.js
```

---

### 🧭 example.spec.js - Navigation

**Purpose:** Test basic app navigation and UI elements

**Tests Include:**
```javascript
describe('App Loading')
  - should load the application
  - should display the header

describe('Navigation')
  - should show Mutual Funds button
  - should open Mutual Funds modal
```

**Status:** ⚠️ May need auth setup

**What to Update:**
- Auth handling for protected routes
- Selectors if component structure changed

---

### 🔐 auth.spec.js - Authentication

**Purpose:** Test login, logout, and protected routes

**Tests Include:**
```javascript
describe('Authentication')
  - should show login page (needs auth check)
  - should login with valid credentials (.skip)
  - should logout successfully (.skip)
```

**Status:** 🚧 Template (needs implementation)

**What to Implement:**
1. Firebase auth test flow
2. OAuth handling for Google Sign-In
3. Session management
4. Protected route verification

**Example Implementation:**
```javascript
test('should login with Google', async ({ page }) => {
  await page.goto('/');
  
  // Click Google sign-in button
  await page.getByRole('button', { name: /sign in with google/i }).click();
  
  // Handle OAuth popup or redirect
  // ... implement based on your auth flow
  
  // Verify successful login
  await expect(page.getByTestId('user-profile')).toBeVisible();
});
```

---

### 💰 finance.spec.js - Features

**Purpose:** Test Finance Manager functionality

**Tests Include:**
```javascript
describe('Finance Manager')
  - should display Finance Manager page
  - should display wallet list (.skip)
  - should add a new wallet (.skip)
  - should display transactions table (.skip)
  - should filter transactions (.skip)
  - should paginate through transactions (.skip)
```

**Status:** 🚧 Templates (need customization)

**What to Update:**
1. Selectors to match your components
2. Test data and scenarios
3. Auth setup in beforeEach
4. Assertions for your specific features

**Example Customization:**
```javascript
test('should add a new wallet', async ({ page }) => {
  // Navigate to wallets
  await page.goto('/');
  
  // Click add wallet button (update selector!)
  await page.getByTestId('add-wallet-btn').click();
  
  // Fill form (update field names!)
  await page.getByLabel('Wallet Name').fill('Test Wallet');
  await page.getByLabel('Initial Balance').fill('1000');
  await page.getByLabel('Currency').selectOption('USD');
  
  // Submit
  await page.getByRole('button', { name: /save/i }).click();
  
  // Verify (update assertion!)
  await expect(page.getByText('Test Wallet')).toBeVisible();
});
```

---

## Helper Files

### 🔑 helpers/auth.setup.js

**Purpose:** Utilities for handling authentication in tests

**Includes:**
- `bypassAuth(page)` - Mock auth for testing
- `isAuthenticated(page)` - Check auth state
- `waitForAuth(page)` - Wait for auth to complete

**Usage Example:**
```javascript
import { waitForAuth, isAuthenticated } from './helpers/auth.setup';

test('my test', async ({ page }) => {
  await page.goto('/');
  await waitForAuth(page);
  
  if (await isAuthenticated(page)) {
    // Test authenticated flow
  }
});
```

**Commented Setup Template:**
Shows how to save/reuse auth state across tests for better performance.

---

### 🛠️ helpers/test-utils.js

**Purpose:** Common utilities used across all tests

**20+ Utility Functions:**

#### Navigation & Waiting
- `waitForNetworkIdle(page)` - Wait for network to settle
- `waitForElement(page, selector)` - Wait for element to appear
- `elementExists(page, selector)` - Check if element exists

#### Interaction
- `fillForm(page, formData)` - Fill multiple form fields
- `typeSlowly(page, selector, text)` - Simulate human typing
- `hoverAndWait(page, selector)` - Hover with delay
- `scrollToBottom(page)` - Scroll to page bottom

#### API & Network
- `mockApiResponse(page, url, response)` - Mock API calls
- `waitForApiCall(page, urlPattern)` - Wait for specific API call

#### Data & State
- `clearBrowserData(page)` - Clear cookies/storage
- `takeScreenshot(page, name)` - Custom screenshots
- `getTableData(page, tableSelector)` - Extract table data

#### Retry Logic
- `retry(fn, retries, delay)` - Retry failed operations

**Usage Example:**
```javascript
import { fillForm, waitForNetworkIdle, mockApiResponse } from './helpers/test-utils';

test('submit form', async ({ page }) => {
  await page.goto('/');
  
  // Mock API
  await mockApiResponse(page, '**/api/wallets', { success: true });
  
  // Fill form
  await fillForm(page, {
    'Name': 'My Wallet',
    'Balance': '1000'
  });
  
  // Submit and wait
  await page.getByRole('button', { name: /submit/i }).click();
  await waitForNetworkIdle(page);
});
```

---

## Configuration File

### playwright.config.js

**Key Settings:**

```javascript
{
  testDir: './e2e',                    // Where tests live
  baseURL: 'http://localhost:5173',   // Your dev server
  
  use: {
    trace: 'on-first-retry',          // Debugging traces
    screenshot: 'only-on-failure',    // Auto screenshots
  },
  
  webServer: {
    command: 'npm run dev',           // Auto-start server
    url: 'http://localhost:5173',
    reuseExistingServer: true,        // Don't restart if running
    timeout: 120000,                  // 2 min timeout
  },
  
  projects: [
    { name: 'chromium' },             // Test in Chrome
  ],
}
```

**Can Be Customized For:**
- Multiple browsers (Firefox, Safari)
- Mobile viewports
- Different environments (staging, production)
- Parallel execution
- CI/CD specific settings

---

## Test Execution Flow

### When You Run `npm run test:e2e`

```
1. Playwright reads playwright.config.js
2. Checks if dev server is running
   ├─ If not: Starts with `npm run dev`
   └─ If yes: Reuses existing server
3. Launches Chromium browser (headless)
4. Runs all test files in e2e/
5. Captures screenshots on failures
6. Generates HTML report
7. Shuts down (if it started the server)
```

### File Discovery

Playwright automatically finds files matching:
- `*.spec.js`
- `*.test.js`
- `*-test.js`

In the `testDir` (e2e/) directory.

---

## Writing Your Own Tests

### 1. Create New Test File

```bash
e2e/my-feature.spec.js
```

### 2. Use This Template

```javascript
import { test, expect } from '@playwright/test';
import { waitForAuth } from './helpers/auth.setup';
import { fillForm } from './helpers/test-utils';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
    await waitForAuth(page);
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await page.getByRole('button', { name: /click me/i }).click();
    await expect(page.getByText('Success')).toBeVisible();
  });

  test('should do something else', async ({ page }) => {
    // Another test
  });
});
```

### 3. Run Your Test

```bash
npx playwright test my-feature
```

---

## Test Organization Patterns

### Pattern 1: By Feature

```
e2e/
├── wallets.spec.js
├── transactions.spec.js
├── reports.spec.js
└── settings.spec.js
```

### Pattern 2: By User Journey

```
e2e/
├── onboarding.spec.js
├── daily-usage.spec.js
├── month-end-close.spec.js
└── admin-tasks.spec.js
```

### Pattern 3: By Page

```
e2e/
├── home-page.spec.js
├── dashboard.spec.js
├── profile-page.spec.js
└── settings-page.spec.js
```

### Current Structure (Hybrid)

```
e2e/
├── smoke.spec.js          ← Health checks
├── example.spec.js        ← Basic navigation
├── auth.spec.js          ← Authentication flows
└── finance.spec.js       ← Main feature tests
```

---

## Next Steps

1. **Run smoke tests** to verify setup
   ```bash
   npm run test:e2e:ui
   ```

2. **Update selectors** in example.spec.js
   - Replace generic class selectors
   - Use `getByRole`, `getByLabel`, `getByTestId`

3. **Implement auth** in auth.setup.js
   - Choose auth strategy
   - Implement login flow
   - Save/reuse auth state

4. **Customize finance tests**
   - Update selectors
   - Add your specific scenarios
   - Remove .skip from tests

5. **Write new tests** for your features
   - Use templates as starting point
   - Follow patterns above
   - Add to CI/CD when stable

---

## Resources

- **Quick Start:** `E2E_TESTING_QUICK_START.md`
- **Full Guide:** `e2e/README.md`
- **This Guide:** For understanding structure
- **Playwright Docs:** https://playwright.dev/docs/intro

---

**Ready to start?** Run your first test:

```bash
npm run test:e2e:ui
```

🚀 Happy Testing!

