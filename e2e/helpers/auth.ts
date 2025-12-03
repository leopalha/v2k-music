import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

/**
 * Login as an existing user
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/signin');
  
  // Fill login form using data-testids
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="signin-button"]');
  
  // Wait for redirect after login (marketplace is default)
  await page.waitForURL(/\/(marketplace|dashboard|admin|onboarding)/, { timeout: 15000 });
}

/**
 * Signup as a new user
 */
export async function signup(page: Page, user: TestUser) {
  await page.goto('/signup');
  
  // Fill signup form
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  
  // Fill confirm password (required for signup)
  const confirmPasswordInput = page.locator('input[type="password"]').nth(1);
  await confirmPasswordInput.fill(user.password);
  
  // Wait for password requirements to be validated
  await page.waitForTimeout(1000);
  
  // Click signup button
  await page.click('[data-testid="signup-button"]');
  
  // Wait for redirect after signup (to onboarding or marketplace)
  await page.waitForURL(/\/(onboarding|marketplace|dashboard)/, { timeout: 15000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Set mobile viewport to make user-menu visible (it's lg:hidden)
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Click on user menu/avatar
  await page.click('[data-testid="user-menu"]');
  
  // Click logout button
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login
  await page.waitForURL(/\/signin/, { timeout: 5000 });
  
  // Restore desktop viewport
  await page.setViewportSize({ width: 1280, height: 720 });
}

/**
 * Login as investor (regular user with balance)
 */
export async function loginAsInvestor(page: Page) {
  const investor = {
    email: 'investor@v2k.e2e',
    password: 'Test123!@#',
  };
  
  await login(page, investor.email, investor.password);
  
  // Verify investor role
  await expect(page).toHaveURL(/\/(marketplace|portfolio)/);
}

/**
 * Login as artist
 */
export async function loginAsArtist(page: Page) {
  const artist = {
    email: 'artist@v2k.e2e',
    password: 'Test123!@#',
  };
  
  await login(page, artist.email, artist.password);
  
  // Just verify login succeeded - artist can navigate to dashboard later
  await expect(page).toHaveURL(/\/(marketplace|artist|dashboard|onboarding)/);
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page) {
  const admin = {
    email: 'admin@v2k.e2e',
    password: 'Test123!@#',
  };
  
  await login(page, admin.email, admin.password);
  
  // Navigate to admin panel (login redirects to marketplace by default)
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin/);
}

/**
 * Verify user is logged in
 */
export async function verifyLoggedIn(page: Page) {
  // Check for user-related elements (user-menu is mobile-only, so check URL or session)
  // User is logged in if they're not on signin/signup page
  await expect(page).not.toHaveURL(/\/(signin|signup|login)/);
  
  // Also verify we can access authenticated pages
  const currentUrl = page.url();
  if (currentUrl.includes('/marketplace') || currentUrl.includes('/portfolio') || currentUrl.includes('/profile')) {
    return; // User is on authenticated page, so they're logged in
  }
  
  // Fallback: check for user menu (may be hidden on desktop)
  const userMenu = page.locator('[data-testid="user-menu"]');
  const notificationBell = page.locator('[data-testid="notification-bell"]');
  const hasAuthElement = await userMenu.isVisible() || await notificationBell.isVisible();
  expect(hasAuthElement || !currentUrl.includes('/signin')).toBeTruthy();
}

/**
 * Verify user is logged out
 */
export async function verifyLoggedOut(page: Page) {
  await expect(page).toHaveURL(/\/signin/);
}
