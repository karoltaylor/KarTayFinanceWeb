/**
 * Common test utilities and helper functions
 */

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take a screenshot with a custom name
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({ 
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Fill form with data
 */
export async function fillForm(page, formData) {
  for (const [label, value] of Object.entries(formData)) {
    const input = page.getByLabel(new RegExp(label, 'i'));
    await input.fill(String(value));
  }
}

/**
 * Wait for element to be visible and return it
 */
export async function waitForElement(page, selector, options = {}) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: 10000, ...options });
  return element;
}

/**
 * Create a text file on disk for upload within a test
 */
export async function createTextFile(path, content) {
  const fs = await import('fs');
  fs.writeFileSync(path, content);
  return path;
}

/**
 * Check if element exists (without waiting)
 */
export async function elementExists(page, selector) {
  try {
    await page.locator(selector).waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Mock API response
 */
export async function mockApiResponse(page, url, response) {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for API call and capture request
 */
export async function waitForApiCall(page, urlPattern) {
  return await page.waitForRequest(urlPattern);
}

/**
 * Clear all cookies and local storage
 */
export async function clearBrowserData(page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Retry a function until it succeeds or times out
 */
export async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Get table data from a table element
 */
export async function getTableData(page, tableSelector) {
  const rows = await page.locator(`${tableSelector} tbody tr`).all();
  const data = [];
  
  for (const row of rows) {
    const cells = await row.locator('td').allTextContents();
    data.push(cells);
  }
  
  return data;
}

/**
 * Scroll to bottom of page
 */
export async function scrollToBottom(page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

/**
 * Hover over element and wait for any tooltips/popovers
 */
export async function hoverAndWait(page, selector, waitMs = 500) {
  await page.hover(selector);
  await page.waitForTimeout(waitMs);
}

/**
 * Type text slowly (simulates human typing)
 */
export async function typeSlowly(page, selector, text, delayMs = 100) {
  const element = page.locator(selector);
  await element.click();
  for (const char of text) {
    await element.pressSequentially(char, { delay: delayMs });
  }
}

