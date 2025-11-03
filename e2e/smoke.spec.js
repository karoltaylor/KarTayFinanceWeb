import { test, expect } from '@playwright/test';

/**
 * Smoke tests - Quick sanity checks
 * These tests verify basic functionality and should run quickly
 */
test.describe('Smoke Tests', () => {
  test('app should be accessible', async ({ page }) => {
    const response = await page.goto('/');
    
    // Verify the page loads successfully
    expect(response?.status()).toBeLessThan(400);
  });

  test('should have correct document title', async ({ page }) => {
    await page.goto('/');
    
    // Wait a bit for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if title contains expected text (adjust as needed)
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('Page title:', title);
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Allow some time for any delayed errors
    await page.waitForTimeout(2000);
    
    // Filter out expected errors (like Firebase auth related ones during initial load)
    const criticalErrors = errors.filter(error => 
      !error.includes('Firebase') && 
      !error.includes('auth') &&
      !error.toLowerCase().includes('warning')
    );
    
    if (criticalErrors.length > 0) {
      console.log('JavaScript errors detected:', criticalErrors);
    }
    
    // This is informational - might fail if there are legitimate errors
    // Comment out if you expect some errors during development
    expect(criticalErrors.length).toBe(0);
  });

  test('should load main HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if root element exists
    const root = page.locator('#root');
    await expect(root).toBeAttached();
    
    // Verify some content loaded
    const hasContent = await root.evaluate(el => el.innerHTML.length > 100);
    expect(hasContent).toBeTruthy();
  });

  test('should have responsive meta viewport', async ({ page }) => {
    await page.goto('/');
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('should load CSS styles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if any stylesheets loaded
    const stylesheets = await page.evaluate(() => {
      return document.styleSheets.length;
    });
    
    expect(stylesheets).toBeGreaterThan(0);
    console.log(`Loaded ${stylesheets} stylesheet(s)`);
  });

  test('should render React app', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for React root - it should have some content
    const root = page.locator('#root');
    const content = await root.textContent();
    
    // The app should render something (not be empty)
    expect(content?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Network Tests', () => {
  test('should not have failed network requests', async ({ page }) => {
    const failedRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    if (failedRequests.length > 0) {
      console.log('Failed requests:', failedRequests);
    }
    
    // Filter out expected failures (like Firebase config issues in dev)
    const criticalFailures = failedRequests.filter(req => 
      !req.url.includes('firebaselogging') &&
      !req.url.includes('googleapis')
    );
    
    expect(criticalFailures.length).toBe(0);
  });

  test('should handle API base URL from environment', async ({ page }) => {
    await page.goto('/');
    
    // Check if environment variables are loaded
    const hasApiUrl = await page.evaluate(() => {
      return !!import.meta.env?.VITE_API_BASE_URL || 
             window.location.hostname === 'localhost';
    });
    
    expect(hasApiUrl).toBeTruthy();
  });
});

