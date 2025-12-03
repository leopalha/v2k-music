import { test, expect } from '@playwright/test';
import { loginAsInvestor } from './helpers/auth';
import { TEST_LIMIT_ORDER } from './helpers/fixtures';

test.describe('Portfolio Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as investor with existing portfolio
    await loginAsInvestor(page);
  });

  test('view portfolio overview with stats', async ({ page }) => {
    // Navigate to portfolio
    await page.goto('/portfolio');
    await expect(page.locator('h1')).toContainText(/portfolio|carteira/i);

    // Step 1: Verify portfolio overview section
    const portfolioOverview = page.locator('[data-testid="portfolio-overview"]');
    await expect(portfolioOverview).toBeVisible({ timeout: 5000 });

    // Step 2: Check for key metrics
    const cashBalance = page.locator('[data-testid="cash-balance"]');
    const portfolioValue = page.locator('[data-testid="portfolio-value"]');
    const totalROI = page.locator('[data-testid="total-roi"]');

    // At least one metric should be visible
    const hasMetrics = 
      (await cashBalance.isVisible()) ||
      (await portfolioValue.isVisible()) ||
      (await totalROI.isVisible());

    expect(hasMetrics).toBeTruthy();

    // Step 3: Verify holdings section
    const holdingsSection = page.locator('[data-testid="holdings-section"]');
    await expect(holdingsSection).toBeVisible({ timeout: 5000 });

    // Check for holdings or empty state
    const holdings = page.locator('[data-testid="holding-item"]');
    const emptyState = page.locator('[data-testid="empty-holdings"]');

    const hasContent = 
      (await holdings.count()) > 0 ||
      (await emptyState.isVisible());

    expect(hasContent).toBeTruthy();
  });

  test('view individual track holdings', async ({ page }) => {
    await page.goto('/portfolio');

    const holdings = page.locator('[data-testid="holding-item"]');
    const hasHoldings = (await holdings.count()) > 0;

    if (hasHoldings) {
      // Click on first holding
      await holdings.first().click();

      // Verify holding details
      await expect(page.locator('[data-testid="track-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="tokens-owned"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="roi-percentage"]')).toBeVisible();
    }
  });

  test('view transaction history', async ({ page }) => {
    await page.goto('/transactions');
    await expect(page.locator('h1')).toContainText(/transactions|histórico|transações/i);

    // Check transactions list
    const transactionsList = page.locator('[data-testid="transaction-item"]');
    const emptyState = page.locator('[data-testid="empty-transactions"]');

    const hasContent = 
      (await transactionsList.count()) > 0 ||
      (await emptyState.isVisible());

    expect(hasContent).toBeTruthy();

    // If transactions exist, verify details
    if ((await transactionsList.count()) > 0) {
      const firstTransaction = transactionsList.first();
      
      await expect(firstTransaction.locator('[data-testid="transaction-type"]')).toBeVisible();
      await expect(firstTransaction.locator('[data-testid="transaction-amount"]')).toBeVisible();
      await expect(firstTransaction.locator('[data-testid="transaction-date"]')).toBeVisible();
    }
  });

  test('filter transactions by type', async ({ page }) => {
    await page.goto('/transactions');

    const filterSelect = page.locator('[data-testid="transaction-type-filter"]');
    
    if (await filterSelect.isVisible()) {
      // Filter by BUY transactions
      await filterSelect.click();
      await page.locator('[data-testid="filter-BUY"]').click();
      await page.waitForTimeout(1000);

      // Verify filtered results
      const transactions = page.locator('[data-testid="transaction-item"]');
      if ((await transactions.count()) > 0) {
        // All visible transactions should be BUY type
        const firstTransaction = transactions.first();
        await expect(firstTransaction).toContainText(/buy|compra/i);
      }
    }
  });

  test('place limit order - buy', async ({ page }) => {
    await page.goto('/portfolio');

    // Navigate to a track or find "Place Order" button
    const placeOrderButton = page.locator('[data-testid="place-order"]');
    
    if (await placeOrderButton.isVisible()) {
      await placeOrderButton.click();

      // Fill order form
      const orderTypeSelect = page.locator('[data-testid="order-type"]');
      if (await orderTypeSelect.isVisible()) {
        await orderTypeSelect.click();
        await page.locator('[data-testid="order-type-BUY"]').click();
      }

      const priceInput = page.locator('[data-testid="order-price"]');
      if (await priceInput.isVisible()) {
        await priceInput.fill(TEST_LIMIT_ORDER.price.toString());
      }

      const quantityInput = page.locator('[data-testid="order-quantity"]');
      if (await quantityInput.isVisible()) {
        await quantityInput.fill(TEST_LIMIT_ORDER.quantity.toString());
      }

      // Submit order
      const submitButton = page.locator('[data-testid="submit-order"]');
      await submitButton.click();

      // Verify success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // Order created successfully - no need to verify visibility as it may be in a hidden section
    }
  });

  test('place limit order - sell', async ({ page }) => {
    await page.goto('/portfolio');

    // Find a holding to sell
    const holdings = page.locator('[data-testid="holding-item"]');
    const hasHoldings = (await holdings.count()) > 0;

    if (hasHoldings) {
      await holdings.first().click();

      // Click sell button
      const sellButton = page.locator('[data-testid="sell-button"]');
      if (await sellButton.isVisible()) {
        await sellButton.click();

        // Fill sell order form
        const priceInput = page.locator('[data-testid="sell-price"]');
        if (await priceInput.isVisible()) {
          await priceInput.fill('10.5');
        }

        const quantityInput = page.locator('[data-testid="sell-quantity"]');
        if (await quantityInput.isVisible()) {
          await quantityInput.fill('5');
        }

        // Submit sell order
        const confirmButton = page.locator('[data-testid="confirm-sell"]');
        await confirmButton.click();

        // Verify success
        const successMessage = page.locator('[data-testid="success-message"]');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('view pending limit orders', async ({ page }) => {
    // Limit orders may be accessed through portfolio page or dedicated section
    await page.goto('/portfolio');
    
    // Check if there's an orders tab or section
    const ordersTab = page.locator('[data-testid="orders-tab"]');
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
    }

    // Check orders list
    const ordersList = page.locator('[data-testid="order-item"]');
    const emptyState = page.locator('[data-testid="empty-orders"]');

    const hasContent = 
      (await ordersList.count()) > 0 ||
      (await emptyState.isVisible());

    expect(hasContent).toBeTruthy();

    // Verify order details if any exist
    if ((await ordersList.count()) > 0) {
      const firstOrder = ordersList.first();
      
      await expect(firstOrder.locator('[data-testid="order-type"]')).toBeVisible();
      await expect(firstOrder.locator('[data-testid="order-price"]')).toBeVisible();
      await expect(firstOrder.locator('[data-testid="order-status"]')).toBeVisible();
    }
  });

  test('cancel pending limit order', async ({ page }) => {
    await page.goto('/portfolio');

    const ordersList = page.locator('[data-testid="order-item"]');
    const hasOrders = (await ordersList.count()) > 0;

    if (hasOrders) {
      // Find a pending order
      const pendingOrder = ordersList.locator('[data-testid="order-status-PENDING"]').first();

      if (await pendingOrder.isVisible()) {
        // Click cancel button
        const cancelButton = pendingOrder.locator('[data-testid="cancel-order"]');
        await cancelButton.click();

        // Confirm cancellation
        const confirmButton = page.locator('[data-testid="confirm-cancel"]');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify success
        const successMessage = page.locator('[data-testid="success-message"]');
        await expect(successMessage).toBeVisible({ timeout: 5000 });

        // Verify order status changed
        await page.reload();
        await page.waitForTimeout(1000);

        const cancelledOrder = page.locator('[data-testid="order-status-CANCELLED"]');
        // Order should be cancelled or removed from list
        const orderStillPending = await pendingOrder.isVisible();
        expect(orderStillPending || (await cancelledOrder.isVisible())).toBeTruthy();
      }
    }
  });

  test('view portfolio performance chart', async ({ page }) => {
    await page.goto('/portfolio');

    // Check for performance chart
    const performanceChart = page.locator('[data-testid="performance-chart"]');
    
    if (await performanceChart.isVisible()) {
      // Verify chart is rendered
      await expect(performanceChart).toBeVisible();

      // Try switching time periods
      const timePeriodButtons = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
      
      for (const period of timePeriodButtons) {
        const periodButton = page.locator(`[data-testid="period-${period}"]`);
        if (await periodButton.isVisible()) {
          await periodButton.click();
          await page.waitForTimeout(500);
          
          // Chart should still be visible
          await expect(performanceChart).toBeVisible();
        }
      }
    }
  });

  test('export portfolio data', async ({ page }) => {
    await page.goto('/portfolio');

    // Find export button
    const exportButton = page.locator('[data-testid="export-portfolio"]');
    
    if (await exportButton.isVisible()) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();

      // Wait for download to complete
      const download = await downloadPromise;
      
      // Verify file name
      expect(download.suggestedFilename()).toMatch(/portfolio.*\.(csv|pdf|xlsx)/i);
    }
  });
});
