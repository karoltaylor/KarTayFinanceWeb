import { test, expect } from '@playwright/test';
import { isAuthenticated, waitForAuth } from './helpers/auth.setup';

/**
 * Authentication tests
 * Note: These tests will need to be adapted based on your Firebase auth setup
 * For now, they provide a starting structure
 */
test.describe('Authentication', () => {
  const AUTH_TIMEOUT_MS = 3000;

  test('should load appropriate UI within 3 seconds (authenticated or login)', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check for either authenticated state OR login page - test passes for both
    // This handles cases where user may be logged in by default in Chrome
    const userProfile = page.locator('[class*="UserProfile"]').first();
    const signInButton = page.getByRole('button', { name: /sign in with/i }).first();
    
    // Wait for either authenticated UI or login UI to appear within 3 seconds
    // Try authenticated state first
    try {
      await expect(userProfile).toBeVisible({ timeout: AUTH_TIMEOUT_MS });
      // If authenticated, verify the profile is actually visible
      expect(await userProfile.isVisible()).toBeTruthy();
    } catch {
      // If not authenticated, login page should be visible
      await expect(signInButton).toBeVisible({ timeout: AUTH_TIMEOUT_MS });
      // Verify login page is actually visible
      expect(await signInButton.isVisible()).toBeTruthy();
    }
    
    // Final verification: at least one state should be visible
    const isAuth = await userProfile.isVisible().catch(() => false);
    const isLogin = await signInButton.isVisible().catch(() => false);
    
    // Test passes if either authenticated or login page is shown
    expect(isAuth || isLogin).toBeTruthy();
  });
  test('should show login page when not authenticated', async ({ page }) => {
    // Clear any existing auth state to force login page
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    
    // Wait for login page to appear
    await page.waitForLoadState('domcontentloaded');
    
    // Use semantic selectors - look for the actual sign-in buttons
    const signInButton = page.getByRole('button', { name: /sign in with/i }).first();
    await expect(signInButton).toBeVisible({ timeout: AUTH_TIMEOUT_MS });
    
    // Verify login page content
    await expect(page.getByRole('heading', { name: /finance manager/i })).toBeVisible();
    await expect(page.getByText(/sign in to manage/i)).toBeVisible();
  });

  test('should detect authentication state correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Use the helper to determine auth state (throws if can't determine within timeout)
    const authState = await waitForAuth(page, AUTH_TIMEOUT_MS);
    
    if (authState) {
      // User is authenticated - verify authenticated UI elements
      const userProfile = page.locator('[class*="UserProfile"]').first();
      await expect(userProfile).toBeVisible({ timeout: 2000 });
      
      // Additional verification: check for authenticated-only elements
      // e.g., header, main content that only shows when logged in
      await expect(page.locator('header')).toBeVisible();
    } else {
      // User is not authenticated - verify login page elements
      const signInButton = page.getByRole('button', { name: /sign in with/i }).first();
      await expect(signInButton).toBeVisible({ timeout: 2000 });
      
      // Verify login page specific content
      await expect(page.getByRole('heading', { name: /finance manager/i })).toBeVisible();
    }
    
    // Test passes - we successfully determined auth state and verified appropriate UI
    expect(typeof authState === 'boolean').toBeTruthy();
  });

  // Example test structure - you'll need to implement actual auth flow
  test.skip('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // This is a template - implement based on your auth method
    // For Google Sign-In, you might need to use Playwright's auth setup
    // See: https://playwright.dev/docs/auth
    
    // Example:
    // await page.getByRole('button', { name: /sign in with google/i }).click();
    // ... handle OAuth popup/redirect
    // await expect(page.locator('header')).toBeVisible();
  });

  test.skip('should logout successfully', async ({ page }) => {
    // Template for logout test
    // You'll need to be authenticated first
    
    // Example:
    // await page.goto('/');
    // await page.getByRole('button', { name: /logout/i }).click();
    // await expect(page).toHaveURL(/login/);
  });
});

