import { test, expect } from '@playwright/test';

// Common mock data
const mockWallet = { id: 'w_123', name: 'Test Wallet', balance: 0, created_at: new Date().toISOString() };
const mockTransactionsResponse = {
  transactions: [
    { id: 't1', asset_name: 'AAPL', asset_type: 'STOCK', date: '2024-01-02', transaction_type: 'BUY', volume: 10, item_price: 150, transaction_amount: 1500, currency: 'USD', fee: 0 },
    { id: 't2', asset_name: 'MSFT', asset_type: 'STOCK', date: '2024-02-03', transaction_type: 'BUY', volume: 5, item_price: 300, transaction_amount: 1500, currency: 'USD', fee: 0 }
  ],
  total_count: 2,
  total_pages: 1,
  page: 1,
  limit: 1000,
  has_next: false,
  has_prev: false
};

test.describe('Finance Manager', () => {
  test.beforeEach(async ({ page }) => {
    // Mock wallets list initially empty, then include created wallet after POST
    let created = false;
    await page.route('**/api/wallets', async (route, request) => {
      if (request.method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(created ? [mockWallet] : []) });
      }
      if (request.method() === 'POST') {
        created = true;
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: mockWallet }) });
      }
      return route.continue();
    });

    // Mock transactions APIs
    await page.route('**/api/transactions?**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockTransactionsResponse) });
    });

    await page.route('**/api/transactions/count?**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: mockTransactionsResponse.total_count }) });
    });

    await page.route('**/api/transactions/errors**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ errors: [], total_count: 0 }) });
    });

    // Mock currency detection and upload endpoints
    await page.route('**/api/transactions/detect-currency', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ detected_currency: 'USD', needs_currency: false }) });
    });
    await page.route('**/api/transactions/upload', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', failed_transactions: [] }) });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display Finance Manager page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /finance manager/i })).toBeVisible({ timeout: 15000 });
  });

  test('should be able to add a new wallet', async ({ page }) => {
    // Click Add Wallet (button rendered when form is hidden)
    await page.getByRole('button', { name: /add wallet/i }).click();
    // Fill wallet name and submit
    await page.getByPlaceholder('Wallet name').fill('Test Wallet');
    await page.getByRole('button', { name: /^add$/i }).click();

    // Expect new wallet visible in sidebar
    await expect(page.getByText('Test Wallet', { exact: true })).toBeVisible();
  });

  test('should upload CSV, XLS, and XLSX files', async ({ page }, testInfo) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    const csvPath = testInfo.project.outputDir + '/sample.csv';
    const xlsPath = testInfo.project.outputDir + '/sample.xls';
    const xlsxPath = testInfo.project.outputDir + '/sample.xlsx';

    // Create simple text content files with different extensions
    const fs = await import('fs');
    fs.writeFileSync(csvPath, 'date,asset,transaction_type,volume,price\n2024-01-02,AAPL,BUY,10,150');
    fs.writeFileSync(xlsPath, 'dummy xls content');
    fs.writeFileSync(xlsxPath, 'dummy xlsx content');

    // Ensure a wallet exists/selected by clicking it if present
    const walletItem = page.getByText('Test Wallet', { exact: true });
    if (await walletItem.isVisible().catch(() => false)) {
      await walletItem.click();
    }

    // Upload CSV
    await fileInput.setInputFiles(csvPath);
    await expect(page.getByText(/transactions/i)).toBeVisible({ timeout: 5000 });

    // Upload XLS
    await fileInput.setInputFiles(xlsPath);
    await expect(page.getByText(/transactions/i)).toBeVisible({ timeout: 5000 });

    // Upload XLSX
    await fileInput.setInputFiles(xlsxPath);
    await expect(page.getByText(/transactions/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display uploaded transactions for selected wallet', async ({ page }) => {
    // Select wallet
    await page.getByText('Test Wallet', { exact: true }).click();

    // Expect transactions to show (by asset names we mocked)
    await expect(page.getByText('AAPL')).toBeVisible();
    await expect(page.getByText('MSFT')).toBeVisible();
  });
});

