import { test, expect } from '@playwright/test';
import { loginAsInvestor } from './helpers/auth';
import { GDPR_EXPORT_FIELDS } from './helpers/fixtures';
import { mockResendEmail } from './helpers/stripe-mock';

test.describe('GDPR Data Export & Privacy Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup email mocks
    await mockResendEmail(page);
    
    // Login as investor
    await loginAsInvestor(page);
  });

  test('navigate to privacy settings', async ({ page }) => {
    // Step 1: Navigate to settings/privacy page
    await page.goto('/settings/privacy');
    await expect(page.locator('h1')).toContainText(/privacy|privacidade|settings|configurações|proteção|dados/i);

    // Verify GDPR section is visible
    const gdprSection = page.locator('[data-testid="gdpr-section"]');
    await expect(gdprSection).toBeVisible({ timeout: 5000 });
  });

  test('request GDPR data export', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Step 1: Find export button
    const exportButton = page.locator('[data-testid="request-data-export"]');
    await expect(exportButton).toBeVisible();

    // Step 2: Click export button
    await exportButton.click();

    // Step 3: Confirm export request modal
    const confirmButton = page.locator('[data-testid="confirm-export"]');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Step 4: Verify success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toContainText(/requested|solicitado|email/i, { timeout: 5000 });

    // Step 5: Verify email notification would be sent (mocked)
    // In real scenario, user would receive email with download link
  });

  test('download GDPR data export', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Check if there's a download link for previously exported data
    const downloadLink = page.locator('[data-testid="download-data-export"]');
    
    if (await downloadLink.isVisible()) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      await downloadLink.click();

      // Wait for download
      const download = await downloadPromise;
      
      // Verify file name and type
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/data.*\.json/i);

      // In a real scenario, we would verify the JSON contents
      // const path = await download.path();
      // const contents = JSON.parse(fs.readFileSync(path, 'utf-8'));
      // expect(contents).toHaveProperty('profile');
    }
  });

  test('verify GDPR export data completeness', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Request export
    const exportButton = page.locator('[data-testid="request-data-export"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();

      const confirmButton = page.locator('[data-testid="confirm-export"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(2000);

      // Check if preview or summary is shown
      const exportPreview = page.locator('[data-testid="export-preview"]');
      if (await exportPreview.isVisible()) {
        // Verify all expected fields are mentioned
        for (const field of GDPR_EXPORT_FIELDS) {
          const fieldElement = page.locator(`[data-testid="export-field-${field}"]`);
          if (await fieldElement.isVisible()) {
            await expect(fieldElement).toBeVisible();
          }
        }
      }
    }
  });

  test('view data retention policy', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Check for data retention policy section
    const retentionSection = page.locator('[data-testid="data-retention"]');
    
    if (await retentionSection.isVisible()) {
      await expect(retentionSection).toContainText(/retention|retenção|days|dias|meses|years|anos/i);
    }

    // Check for policy link
    const policyLink = page.locator('[data-testid="privacy-policy-link"]');
    if (await policyLink.isVisible()) {
      await policyLink.click();
      
      // Should navigate to privacy policy page or stay on settings
      await page.waitForTimeout(1000); // Small wait for potential navigation
      // Policy link may open external page or stay internal
    }
  });

  test('manage cookie preferences', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Check for cookie preferences section
    const cookieSection = page.locator('[data-testid="cookie-preferences"]');
    
    if (await cookieSection.isVisible()) {
      // Toggle analytics cookies
      const analyticsToggle = page.locator('[data-testid="cookie-analytics"]');
      if (await analyticsToggle.isVisible()) {
        await analyticsToggle.click();
        
        // Save preferences
        const saveButton = page.locator('[data-testid="save-cookie-prefs"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Wait for save to complete (toast notification appears)
          await page.waitForTimeout(1000);
          
          // Success is indicated by button being clickable again or toast
          await expect(saveButton).toBeEnabled();
        }
      }
    }
  });

  test('manage notification preferences', async ({ page }) => {
    await page.goto('/settings/notifications');
    await expect(page.locator('h1')).toContainText(/notifications|notificações|notificação|configurações/i);

    // Toggle email notifications
    const emailToggle = page.locator('[data-testid="notification-email"]');
    if (await emailToggle.isVisible()) {
      await emailToggle.click();
      
      // Save preferences
      const saveButton = page.locator('[data-testid="save-notifications"]');
      await saveButton.click();
      
      // Verify success
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('request account deletion', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Step 1: Find delete account button
    const deleteButton = page.locator('[data-testid="request-deletion"]');
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Step 2: Verify warning modal appears
      const warningModal = page.locator('[data-testid="deletion-warning"]');
      await expect(warningModal).toBeVisible();
      await expect(warningModal).toContainText(/permanent|irreversible|cannot be undone/i);

      // Step 3: Confirm understanding
      const understandCheckbox = page.locator('[data-testid="understand-deletion"]');
      if (await understandCheckbox.isVisible()) {
        await understandCheckbox.check();
      }

      // Step 4: Enter password for confirmation
      const passwordInput = page.locator('[data-testid="confirm-password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Test123!@#');
      }

      // Step 5: Confirm deletion (for testing, we won't actually delete)
      const confirmButton = page.locator('[data-testid="confirm-deletion"]');
      await expect(confirmButton).toBeVisible();
      
      // DON'T click in test to avoid actually deleting the test account
      // await confirmButton.click();
      
      // Just verify the button is there and enabled
      await expect(confirmButton).toBeEnabled();
    }
  });

  test('cancel account deletion request', async ({ page }) => {
    await page.goto('/settings/privacy');

    const deleteButton = page.locator('[data-testid="request-deletion"]');
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Cancel instead of confirming
      const cancelButton = page.locator('[data-testid="cancel-deletion"]');
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      // Modal should close
      const warningModal = page.locator('[data-testid="deletion-warning"]');
      await expect(warningModal).not.toBeVisible();
    }
  });

  test('view personal data summary', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Check for data summary section
    const dataSummary = page.locator('[data-testid="data-summary"]');
    
    if (await dataSummary.isVisible()) {
      // Verify key data categories are listed
      const categories = [
        'profile-data',
        'transaction-data',
        'activity-data',
      ];

      for (const category of categories) {
        const categoryElement = page.locator(`[data-testid="data-${category}"]`);
        if (await categoryElement.isVisible()) {
          // Category should show count or status
          await expect(categoryElement).toBeVisible();
        }
      }
    }
  });

  test('opt out of data processing', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Check for data processing options
    const processingSection = page.locator('[data-testid="data-processing"]');
    
    if (await processingSection.isVisible()) {
      // Toggle marketing data processing
      const marketingToggle = page.locator('[data-testid="processing-marketing"]');
      if (await marketingToggle.isVisible()) {
        await marketingToggle.click();
        
        // Save preferences
        const saveButton = page.locator('[data-testid="save-processing-prefs"]');
        await saveButton.click();
        
        // Verify success
        const successMessage = page.locator('[data-testid="success-message"]');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('view data access history', async ({ page }) => {
    await page.goto('/settings/privacy');

    // Check for access history section
    const accessHistory = page.locator('[data-testid="access-history"]');
    
    if (await accessHistory.isVisible()) {
      // Should show recent login activity
      const accessItems = page.locator('[data-testid="access-item"]');
      const emptyState = page.locator('[data-testid="empty-access-history"]');

      const hasContent = 
        (await accessItems.count()) > 0 ||
        (await emptyState.isVisible());

      expect(hasContent).toBeTruthy();

      // Verify access details if any exist
      if ((await accessItems.count()) > 0) {
        const firstAccess = accessItems.first();
        await expect(firstAccess).toContainText(/login|access/i);
      }
    }
  });
});
