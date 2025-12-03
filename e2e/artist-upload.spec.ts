import { test, expect } from '@playwright/test';
import { loginAsArtist } from './helpers/auth';
import { TEST_TRACK, createMockMP3File, createMockJPEGFile } from './helpers/fixtures';
import { mockResendEmail } from './helpers/stripe-mock';

test.describe('Artist Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup email mocks
    await mockResendEmail(page);
    
    // Login as artist
    await loginAsArtist(page);
  });

  test('complete track upload → metadata → submit for review', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/artist/upload');
    await expect(page.locator('h1, h2')).toContainText(/upload|nova faixa|música|enviar/i);

    // Step 2: Upload MP3 file
    const fileInput = page.locator('input[type="file"][accept*="audio"]');
    if (await fileInput.isVisible()) {
      // Set the file
      await fileInput.setInputFiles({
        name: 'test-track.mp3',
        mimeType: 'audio/mpeg',
        buffer: Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      });

      // Wait for file processing
      await page.waitForTimeout(2000);
    }

    // Step 3: Upload cover image
    const imageInput = page.locator('input[type="file"][accept*="image"]');
    if (await imageInput.isVisible()) {
      await imageInput.setInputFiles({
        name: 'test-cover.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]),
      });

      await page.waitForTimeout(1000);
    }

    // Step 4: Fill metadata form
    const titleInput = page.locator('[data-testid="track-title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill(TEST_TRACK.title);
    }

    const artistNameInput = page.locator('[data-testid="artist-name"]');
    if (await artistNameInput.isVisible()) {
      await artistNameInput.fill(TEST_TRACK.artistName);
    }

    // Select genre
    const genreSelect = page.locator('[data-testid="genre-select"]');
    if (await genreSelect.isVisible()) {
      await genreSelect.click();
      await page.locator(`[data-testid="genre-option-${TEST_TRACK.genre}"]`).click();
    }

    // Fill price
    const priceInput = page.locator('[data-testid="track-price"]');
    if (await priceInput.isVisible()) {
      await priceInput.fill(TEST_TRACK.currentPrice.toString());
    }

    // Fill total tokens
    const tokensInput = page.locator('[data-testid="total-tokens"]');
    if (await tokensInput.isVisible()) {
      await tokensInput.fill(TEST_TRACK.totalTokens.toString());
    }

    // Fill description
    const descriptionInput = page.locator('[data-testid="track-description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(TEST_TRACK.description);
    }

    // Step 5: Submit for review
    const submitButton = page.locator('[data-testid="submit-track"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for submission
    await page.waitForTimeout(2000);

    // Step 6: Verify success message or redirect
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Step 7: Navigate to artist dashboard to verify pending track
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/dashboard/i);

    // Check for pending tracks section
    const pendingSection = page.locator('[data-testid="pending-tracks"]');
    if (await pendingSection.isVisible()) {
      await expect(pendingSection).toContainText(/pending|aguardando/i);
      
      // Verify the uploaded track is listed
      const trackItem = pendingSection.locator('[data-testid="track-item"]').first();
      await expect(trackItem).toBeVisible();
    }
  });

  test('upload validation - missing required fields', async ({ page }) => {
    await page.goto('/dashboard/upload');

    // Try to submit without filling required fields
    const submitButton = page.locator('[data-testid="submit-track"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Verify validation errors
      const errorMessages = page.locator('[data-testid="error-message"]');
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('upload validation - invalid file type', async ({ page }) => {
    await page.goto('/dashboard/upload');

    // Try to upload invalid file type (e.g., .txt instead of .mp3)
    const fileInput = page.locator('input[type="file"][accept*="audio"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is not an audio file'),
      });

      await page.waitForTimeout(1000);

      // Verify error message
      const errorMessage = page.locator('[data-testid="file-error"]');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('upload validation - file size limit', async ({ page }) => {
    await page.goto('/dashboard/upload');

    // Mock file size check
    await page.evaluate(() => {
      // @ts-ignore
      window.mockFileSizeError = true;
    });

    const fileInput = page.locator('input[type="file"][accept*="audio"]');
    if (await fileInput.isVisible()) {
      // Simulate large file upload
      const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
      await fileInput.setInputFiles({
        name: 'large-track.mp3',
        mimeType: 'audio/mpeg',
        buffer: largeBuffer,
      });

      await page.waitForTimeout(1000);

      // Verify size error
      const errorMessage = page.locator('[data-testid="file-size-error"]');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('view uploaded tracks in artist dashboard', async ({ page }) => {
    await page.goto('/artist/dashboard');
    await expect(page.locator('h1, h2').first()).toContainText(/dashboard|artista|minhas músicas/i);

    // Check for tracks section
    const tracksSection = page.locator('[data-testid="artist-tracks"]');
    await expect(tracksSection).toBeVisible({ timeout: 5000 });

    // Verify tracks list or empty state
    const tracksList = tracksSection.locator('[data-testid="track-item"]');
    const emptyState = tracksSection.locator('[data-testid="empty-state"]');

    // Either tracks exist or empty state is shown
    const hasContent = (await tracksList.count()) > 0 || (await emptyState.isVisible());
    expect(hasContent).toBeTruthy();
  });

  test('edit pending track metadata', async ({ page }) => {
    await page.goto('/dashboard');

    // Find a pending track
    const pendingTrack = page.locator('[data-testid="pending-track-item"]').first();
    
    if (await pendingTrack.isVisible()) {
      // Click edit button
      const editButton = pendingTrack.locator('[data-testid="edit-track"]');
      await editButton.click();

      // Wait for edit form
      await page.waitForURL(/\/dashboard\/tracks\/[a-z0-9-]+\/edit/);

      // Update title
      const titleInput = page.locator('[data-testid="track-title"]');
      await titleInput.fill(`${TEST_TRACK.title} (Updated)`);

      // Save changes
      const saveButton = page.locator('[data-testid="save-track"]');
      await saveButton.click();

      // Verify success
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('delete pending track', async ({ page }) => {
    await page.goto('/dashboard');

    const pendingTrack = page.locator('[data-testid="pending-track-item"]').first();
    
    if (await pendingTrack.isVisible()) {
      // Click delete button
      const deleteButton = pendingTrack.locator('[data-testid="delete-track"]');
      await deleteButton.click();

      // Confirm deletion modal
      const confirmButton = page.locator('[data-testid="confirm-delete"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(1000);
      }

      // Verify success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });
});
