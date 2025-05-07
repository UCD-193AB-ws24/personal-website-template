import { test, expect } from '@playwright/test';

test('homepage test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot();
  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 });
});