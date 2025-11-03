import { test as setup } from '@playwright/test';

/**
 * Authentication setup helper
 * 
 * This file provides utilities for handling authentication in your tests.
 * 
 * For Firebase Authentication, you have several options:
 * 
 * 1. Use a test account with real credentials
 * 2. Mock the authentication state
 * 3. Use Firebase Auth Emulator (recommended for CI/CD)
 * 
 * Example usage with saved auth state:
 * 
 * setup('authenticate', async ({ page }) => {
 *   await page.goto('/');
 *   // Perform login steps
 *   await page.getByRole('button', { name: /sign in/i }).click();
 *   // ... complete auth flow
 *   
 *   // Save auth state
 *   await page.context().storageState({ path: 'e2e/.auth/user.json' });
 * });
 * 
 * Then in playwright.config.js, add:
 * 
 * projects: [
 *   { name: 'setup', testMatch: /.*\.setup\.js/ },
 *   {
 *     name: 'chromium',
 *     use: { 
 *       ...devices['Desktop Chrome'],
 *       storageState: 'e2e/.auth/user.json'
 *     },
 *     dependencies: ['setup']
 *   },
 * ]
 */

// Example: Setup authenticated state
// Uncomment and modify based on your auth flow
/*
setup('authenticate', async ({ page }) => {
  await page.goto('/');
  
  // Wait for login page
  await page.waitForSelector('[data-testid="login-button"]');
  
  // Perform authentication
  // Note: For Google Sign-In, you might need special handling
  // See: https://playwright.dev/docs/auth
  
  // Wait for successful authentication
  await page.waitForSelector('[data-testid="user-profile"]');
  
  // Save signed-in state
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
*/

/**
 * Helper function to bypass authentication for testing
 * (Use with caution and only in test environments)
 */
export async function bypassAuth(page) {
  // This is a placeholder - implement based on your auth system
  // Example: Set localStorage/sessionStorage with mock auth tokens
  
  await page.addInitScript(() => {
    // Mock Firebase auth state
    // window.localStorage.setItem('firebase:authUser', JSON.stringify({...}));
  });
}

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated(page) {
  // Check for elements that only appear when authenticated
  const userProfile = page.locator('[class*="UserProfile"]');
  try {
    await userProfile.waitFor({ timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to wait for authentication to complete
 * Uses semantic selectors instead of fragile class name selectors
 * Returns true if authenticated, false if on login page
 */
export async function waitForAuth(page, timeout = 3000) {
  try {
    // Try to find authenticated state first (UserProfile)
    await page.waitForSelector('[class*="UserProfile"]', { timeout, state: 'visible' });
    return true;
  } catch {
    try {
      // If not authenticated, wait for login page (sign-in buttons)
      await page.getByRole('button', { name: /sign in with/i }).first().waitFor({ timeout, state: 'visible' });
      return false;
    } catch {
      // If neither found, throw timeout
      throw new Error(`Auth state not determined within ${timeout}ms`);
    }
  }
}

