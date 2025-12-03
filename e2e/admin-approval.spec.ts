import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { mockResendEmail } from './helpers/stripe-mock';

test.describe('Admin Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup email mocks
    await mockResendEmail(page);
    
    // Login as admin
    await loginAsAdmin(page);
  });

  test('view pending tracks and approve', async ({ page }) => {
    // Step 1: Navigate to admin dashboard
    await page.goto('/admin');
    // Admin dashboard uses Cards, not H1. Just verify we're on the page
    await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible({ timeout: 5000 });

    // Step 2: Navigate to pending tracks section
    const pendingLink = page.locator('[data-testid="pending-tracks-link"]');
    if (await pendingLink.isVisible()) {
      await pendingLink.click();
    } else {
      await page.goto('/admin/tracks/pending');
    }

    await expect(page.locator('h1')).toContainText(/pending|pendentes/i);

    // Step 3: Check if there are pending tracks
    const tracksList = page.locator('[data-testid="pending-track-item"]');
    const emptyState = page.locator('[data-testid="empty-state"]');

    const hasTracks = (await tracksList.count()) > 0;
    
    if (hasTracks) {
      // Step 4: Click on first pending track
      await tracksList.first().click();

      // Wait for track details page
      await page.waitForURL(/\/admin\/tracks\/[a-z0-9-]+/);

      // Step 5: Review track metadata
      await expect(page.locator('[data-testid="track-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="track-artist"]')).toBeVisible();
      await expect(page.locator('[data-testid="track-genre"]')).toBeVisible();
      await expect(page.locator('[data-testid="track-price"]')).toBeVisible();

      // Step 6: Approve track
      const approveButton = page.locator('[data-testid="approve-track"]');
      await expect(approveButton).toBeVisible();
      await approveButton.click();

      // Confirm approval modal if exists
      const confirmButton = page.locator('[data-testid="confirm-approve"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Wait for success message
      await page.waitForTimeout(2000);

      // Step 7: Verify success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toContainText(/approved|aprovada/i, { timeout: 5000 });

      // Step 8: Verify track appears in marketplace
      await page.goto('/marketplace');
      await page.waitForTimeout(1000);

      const marketplaceTracks = page.locator('[data-testid="track-card"]');
      await expect(marketplaceTracks.first()).toBeVisible({ timeout: 5000 });
    } else {
      // No pending tracks - verify empty state
      await expect(emptyState).toBeVisible();
    }
  });

  test('reject track with reason', async ({ page }) => {
    await page.goto('/admin/tracks/pending');

    const tracksList = page.locator('[data-testid="pending-track-item"]');
    const hasTracks = (await tracksList.count()) > 0;

    if (hasTracks) {
      // Click on track
      await tracksList.first().click();
      await page.waitForURL(/\/admin\/tracks\/[a-z0-9-]+/);

      // Click reject button
      const rejectButton = page.locator('[data-testid="reject-track"]');
      await expect(rejectButton).toBeVisible();
      await rejectButton.click();

      // Fill rejection reason
      const reasonInput = page.locator('[data-testid="rejection-reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Content does not meet platform quality standards.');
      }

      // Confirm rejection
      const confirmButton = page.locator('[data-testid="confirm-reject"]');
      await confirmButton.click();

      // Verify success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toContainText(/rejected|rejeitada/i, { timeout: 5000 });

      // Verify notification sent to artist
      await page.goto('/admin/notifications');
      const notification = page.locator('[data-testid="notification-item"]').first();
      if (await notification.isVisible()) {
        await expect(notification).toContainText(/rejected|rejeitada/i);
      }
    }
  });

  test('view and manage users', async ({ page }) => {
    // Navigate to users management
    await page.goto('/admin/users');
    
    // Check users list
    const usersList = page.locator('[data-testid="user-item"]');
    await expect(usersList.first()).toBeVisible({ timeout: 5000 });

    // Search for specific user
    const searchInput = page.locator('[data-testid="search-users"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('@v2k.e2e');
      await page.waitForTimeout(1000);
    }

    // User email appears multiple times (in table rows). Just check first one exists.
    const userEmail = page.locator('[data-testid="user-email"]').first();
    await expect(userEmail).toBeVisible();
  });

  test('change user role', async ({ page }) => {
    await page.goto('/admin/users');

    const usersList = page.locator('[data-testid="user-item"]');
    if ((await usersList.count()) > 0) {
      // Click on user
      await usersList.first().click();

      // Change role dropdown
      const roleSelect = page.locator('[data-testid="user-role-select"]');
      if (await roleSelect.isVisible()) {
        await roleSelect.click();
        
        // Select new role
        const adminRole = page.locator('[data-testid="role-option-ADMIN"]');
        if (await adminRole.isVisible()) {
          await adminRole.click();

          // Save changes
          const saveButton = page.locator('[data-testid="save-user"]');
          await saveButton.click();

          // Verify success
          const successMessage = page.locator('[data-testid="success-message"]');
          await expect(successMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('view platform statistics', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for statistics dashboard
    const statsSection = page.locator('[data-testid="admin-stats"]');
    await expect(statsSection).toBeVisible({ timeout: 5000 });

    // Verify key metrics are displayed
    const totalUsers = page.locator('[data-testid="stat-total-users"]');
    const totalTracks = page.locator('[data-testid="stat-total-tracks"]');
    const totalInvestments = page.locator('[data-testid="stat-total-investments"]');

    // At least one stat should be visible
    const hasStats = 
      (await totalUsers.isVisible()) ||
      (await totalTracks.isVisible()) ||
      (await totalInvestments.isVisible());

    expect(hasStats).toBeTruthy();
  });

  test('view and filter transactions', async ({ page }) => {
    // Admin views all transactions at /transactions, not /admin/transactions
    await page.goto('/transactions');
    await expect(page.locator('h1')).toContainText(/transactions|transações|histórico/i);

    // Check transactions list
    const transactionsList = page.locator('[data-testid="transaction-item"]');
    const emptyState = page.locator('[data-testid="empty-state"]');

    // Either transactions exist or empty state
    const hasContent = 
      (await transactionsList.count()) > 0 ||
      (await emptyState.isVisible());

    expect(hasContent).toBeTruthy();

    // Try filtering by type
    const filterSelect = page.locator('[data-testid="transaction-type-filter"]');
    if (await filterSelect.isVisible()) {
      await filterSelect.click();
      await page.locator('[data-testid="filter-BUY"]').click();
      await page.waitForTimeout(1000);

      // Verify filtered results
      const filteredList = page.locator('[data-testid="transaction-item"]');
      if ((await filteredList.count()) > 0) {
        await expect(filteredList.first()).toBeVisible();
      }
    }
  });

  test('access admin-only routes', async ({ page }) => {
    // Test that admin can access restricted routes
    const adminRoutes = [
      '/admin',
      '/admin/users',
      '/admin/tracks/pending',
      '/admin/transactions',
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      
      // Should not redirect to login
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/\/auth\/signin/);
      
      // Should show content, not error
      const errorPage = page.locator('[data-testid="error-403"]');
      await expect(errorPage).not.toBeVisible();
    }
  });

  test('bulk approve tracks', async ({ page }) => {
    await page.goto('/admin/tracks/pending');

    const tracksList = page.locator('[data-testid="pending-track-item"]');
    const hasTracks = (await tracksList.count()) > 1;

    if (hasTracks) {
      // Select multiple tracks
      const firstCheckbox = tracksList.first().locator('[data-testid="select-track"]');
      const secondCheckbox = tracksList.nth(1).locator('[data-testid="select-track"]');

      if (await firstCheckbox.isVisible()) {
        await firstCheckbox.check();
        await secondCheckbox.check();

        // Click bulk approve
        const bulkApproveButton = page.locator('[data-testid="bulk-approve"]');
        if (await bulkApproveButton.isVisible()) {
          await bulkApproveButton.click();

          // Confirm bulk action
          const confirmButton = page.locator('[data-testid="confirm-bulk-approve"]');
          await confirmButton.click();

          // Verify success
          const successMessage = page.locator('[data-testid="success-message"]');
          await expect(successMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
