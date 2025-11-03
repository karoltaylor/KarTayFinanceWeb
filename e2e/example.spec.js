import { test, expect } from '@playwright/test';

/**
 * Basic example test to verify the app loads
 * This test will wait for authentication and check if the main page loads
 */
test.describe('App Loading', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page title is loaded
    await expect(page).toHaveTitle(/KarTay/i);
  });

  test('should display the header', async ({ page }) => {
    await page.goto('/');
    
    // Wait for either login page or authenticated page
    // Adjust selectors based on your actual login page
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test('should show Mutual Funds button in header', async ({ page }) => {
    await page.goto('/');
    
    // Wait for authentication and page load
    await page.waitForLoadState('networkidle');
    
    // Check if Mutual Funds button exists
    const mutualFundsButton = page.getByRole('button', { name: /mutual funds/i });
    
    // Note: This might require authentication
    // You may need to handle auth state first
    await expect(mutualFundsButton).toBeVisible({ timeout: 15000 });
  });

  test('should open Mutual Funds modal when button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Click the Mutual Funds button
    const mutualFundsButton = page.getByRole('button', { name: /mutual funds/i });
    await mutualFundsButton.click();
    
    // Verify modal/page opened (adjust selector based on your actual modal)
    // This is an example - update with your actual modal selector
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });
});

