import { test, expect } from '@playwright/test';

// This setup test logs in ONCE and saves the authenticated storage state to e2e/.auth/user.json
// How to use (recommended in development):
// 1) Start your dev server: npm run dev
// 2) Run: npm run test:e2e:login  (opens UI). Complete the login flow once.
// 3) All subsequent tests will reuse the saved state deterministically.

const STORAGE_STATE_PATH = 'e2e/.auth/user.json';

test('authenticate and save storage state', async ({ page }) => {
  await page.goto('/');

  // If already authenticated, just save state
  const userProfile = page.locator('[class*="UserProfile"]').first();
  if (await userProfile.isVisible().catch(() => false)) {
    await page.context().storageState({ path: STORAGE_STATE_PATH });
    return;
  }

  // Otherwise, show login page and wait for manual/automated login to complete
  const signInButton = page.getByRole('button', { name: /sign in with/i }).first();
  await expect(signInButton).toBeVisible({ timeout: 10_000 });

  // If you can automate your provider, click here, otherwise login manually in UI mode
  // Example (uncomment if you automate):
  // await signInButton.click();
  // ... handle provider flow ...

  // Wait until authenticated UI appears (user profile visible)
  await expect(userProfile).toBeVisible({ timeout: 60_000 });

  // Save the signed-in storage state for reuse by other projects
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});


