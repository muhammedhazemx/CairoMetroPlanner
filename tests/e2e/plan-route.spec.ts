import { test, expect } from '@playwright/test';

test.describe('Cairo Metro Route Planner E2E Flow', () => {
  test('should allow user to plan a route, view summary cards, swap stations, and toggle languages', async ({ page }) => {
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.stack || err.message));

    // Navigate to local dev server (default port 5173 for Vite)
    await page.goto('/');

    // 1. Verify page title & branding
    const title = page.locator('h1');
    await expect(title).toContainText('Cairo Metro Route Planner');

    // 2. Open origin picker and select "Helwan"
    const originInput = page.locator('#origin-input');
    await originInput.click();
    await page.locator('#origin-option-L1_HEL').click();

    // 3. Open destination picker and select "Maadi"
    const destInput = page.locator('#destination-input');
    await destInput.click();
    await page.locator('#destination-option-L1_MAD').click();

    // 4. Verify route details cards appear
    // Stops count card (should be 10 stops)
    const stopsCard = page.getByText('10', { exact: true });
    await expect(stopsCard).toBeVisible();

    // Ticket fare card (12 EGP)
    const fareCard = page.getByText('12', { exact: true });
    await expect(fareCard).toBeVisible();

    // Time estimate (20 mins)
    const timeCard = page.getByText('20', { exact: true });
    await expect(timeCard).toBeVisible();

    // 5. Verify Route Details Timeline shows segments
    await expect(page.getByText('Route Details')).toBeVisible();
    await expect(page.getByText('Helwan').last()).toBeVisible();
    await expect(page.getByText('Maadi').last()).toBeVisible();

    // 6. Click Swap button
    await page.getByRole('button', { name: 'Swap Origin & Destination' }).click();

    // Recalculations should still be valid after swap
    await expect(stopsCard).toBeVisible();

    // 7. Toggle to Arabic and check translations
    await page.getByRole('button', { name: 'Switch to Arabic' }).click();
    await expect(page.locator('h1')).toContainText('مخطط مسار مترو القاهرة');

    // Toggle back to English
    await page.getByRole('button', { name: 'تغيير اللغة إلى الإنجليزية' }).click();
    await expect(page.locator('h1')).toContainText('Cairo Metro Route Planner');
  });
});
