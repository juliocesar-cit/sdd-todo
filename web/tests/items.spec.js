import { test, expect } from '@playwright/test';

test.describe('Items CRUD', () => {
  test.beforeEach(async ({ page, request }) => {
    const apiBase = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000';
    await page.goto('/');
    // Clear all items via API before each test
    const items = await request.get(`${apiBase}/api/items`);
    const list = await items.json();
    for (const item of list) {
      await request.delete(`${apiBase}/api/items/${item.id}`);
    }
    await page.reload();
  });

  test('creates a new item', async ({ page }) => {
    await page.fill('[data-testid="new-item-input"]', 'My first item');
    await page.click('[data-testid="create-item-btn"]');
    await expect(page.locator('[data-testid="item-name"]')).toContainText('My first item');
  });

  test('edits an item', async ({ page }) => {
    await page.fill('[data-testid="new-item-input"]', 'Original name');
    await page.click('[data-testid="create-item-btn"]');

    await page.click('[data-testid="edit-item-btn"]');
    await page.fill('[data-testid="edit-item-input"]', 'Updated name');
    await page.click('[data-testid="save-item-btn"]');

    await expect(page.locator('[data-testid="item-name"]')).toContainText('Updated name');
  });

  test('deletes an item', async ({ page }) => {
    await page.fill('[data-testid="new-item-input"]', 'To be deleted');
    await page.click('[data-testid="create-item-btn"]');

    await page.click('[data-testid="delete-item-btn"]');
    await expect(page.locator('[data-testid="item-name"]')).toHaveCount(0);
  });

  test('shows inline error when API fails', async ({ page }) => {
    // Submit empty name to trigger 400
    await page.click('[data-testid="create-item-btn"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
