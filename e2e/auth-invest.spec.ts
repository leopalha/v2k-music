import { test, expect } from '@playwright/test';
import { signup, login, logout, verifyLoggedIn, verifyLoggedOut } from './helpers/auth';
import { TEST_USERS, TEST_INVESTMENT } from './helpers/fixtures';
import { mockStripePayment, simulateSuccessfulPayment } from './helpers/stripe-mock';

test.describe('Authentication & Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup Stripe mocks
    await mockStripePayment(page);
  });

  test('complete signup → login → invest → portfolio flow', async ({ page }) => {
    // Step 1: Signup as new user
    const newUser = {
      ...TEST_USERS.newUser,
      email: `investor-${Date.now()}@v2k.e2e`,
    };

    await signup(page, newUser);
    await verifyLoggedIn(page);

    // Verify redirect after signup (could be marketplace, dashboard, or onboarding)
    await expect(page).toHaveURL(/\/(marketplace|dashboard|onboarding)/);

    // Step 2: Logout
    await logout(page);
    await verifyLoggedOut(page);

    // Step 3: Login with same credentials
    await login(page, newUser.email, newUser.password);
    await verifyLoggedIn(page);

    // Step 4: Browse marketplace
    await page.goto('/marketplace');
    await expect(page.locator('h1')).toContainText(/marketplace|explore/i);

    // Check if tracks are displayed
    const trackCards = page.locator('[data-testid="track-card"]');
    await expect(trackCards.first()).toBeVisible({ timeout: 10000 });

    // Step 5: Filter tracks by genre
    const genreFilter = page.locator('[data-testid="genre-filter"]');
    if (await genreFilter.isVisible()) {
      await genreFilter.click();
      await page.locator('[data-testid="genre-eletronica"]').click();
      await page.waitForTimeout(1000); // Wait for filter to apply
    }

    // Step 6: Search for a track
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000); // Wait for search results
    }

    // Step 7: Click on first track to view details
    await trackCards.first().click();
    await page.waitForURL(/\/tracks\/[a-z0-9-]+/);

    // Verify track details page
    await expect(page.locator('[data-testid="track-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="track-price"]')).toBeVisible();

    // Step 8: Simulate investment
    // Note: In real scenario, we'd mock balance check and Stripe payment
    const investButton = page.locator('[data-testid="invest-button"]');
    
    if (await investButton.isVisible()) {
      await investButton.click();

      // Fill investment form
      const tokenInput = page.locator('[data-testid="token-quantity"]');
      if (await tokenInput.isVisible()) {
        await tokenInput.fill('10');
      }

      // Simulate payment success
      await simulateSuccessfulPayment(page, TEST_INVESTMENT.amount);

      // Confirm investment
      const confirmButton = page.locator('[data-testid="confirm-investment"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(2000); // Wait for transaction processing
      }
    }

    // Step 9: Navigate to portfolio
    await page.goto('/portfolio');
    await expect(page.locator('h1')).toContainText(/portfolio/i);

    // Verify portfolio shows balance or investments
    const portfolioContent = page.locator('[data-testid="portfolio-overview"]');
    await expect(portfolioContent).toBeVisible({ timeout: 5000 });

    // Step 10: Logout
    await logout(page);
    await verifyLoggedOut(page);
  });

  test('login validation - invalid credentials', async ({ page }) => {
    await page.goto('/signin');

    await page.fill('[data-testid="email-input"]', 'invalid@v2k.e2e');
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
    await page.click('[data-testid="signin-button"]');

    // Wait for response and verify error message appears
    await page.waitForTimeout(2000); // Wait for auth API to respond
    
    // Check for error message or stay on signin page (not redirected)
    const errorMessage = page.locator('[data-testid="error-message"]');
    const stillOnSignin = page.url().includes('/signin');
    
    const hasError = await errorMessage.isVisible() || stillOnSignin;
    expect(hasError).toBeTruthy();
  });

  test('signup validation - weak password', async ({ page }) => {
    await page.goto('/signup');

    // Fill signup form with weak password
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@v2k.e2e`);
    await page.fill('[data-testid="password-input"]', 'weak'); // Too short, missing requirements

    // Try to click signup (button should be disabled)
    const signupButton = page.locator('[data-testid="signup-button"]');
    await expect(signupButton).toBeDisabled();

    // Verify validation error
    const passwordError = page.locator('[data-testid="password-error"]');
    await expect(passwordError).toBeVisible({ timeout: 5000 });
  });

  test('signup validation - duplicate email', async ({ page }) => {
    await page.goto('/signup');

    // Try to signup with existing user email
    await page.fill('[data-testid="email-input"]', TEST_USERS.investor.email);
    await page.fill('[data-testid="password-input"]', 'Test123!@#');
    
    // Fill confirm password
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    await confirmPasswordInput.fill('Test123!@#');
    
    await page.waitForTimeout(1000); // Wait for validation
    await page.click('[data-testid="signup-button"]');

    // Verify duplicate email error
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText(/already exists|já cadastrado/i, { timeout: 5000 });
  });

  test('session persistence after page reload', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.investor.email, TEST_USERS.investor.password);
    await verifyLoggedIn(page);

    // Reload page
    await page.reload();

    // Verify still logged in (not redirected to signin)
    await verifyLoggedIn(page);
    await expect(page).not.toHaveURL(/\/(signin|signup|login)/);
  });
});
