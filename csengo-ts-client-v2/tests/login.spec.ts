import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should render login page correctly', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Bejelentkezés');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Belépés');
    await expect(page.locator('a[href="/register"]')).toHaveText('Regisztrálj itt!');
  });

  test('should show validation errors if fields are empty', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('input[type="text"]:invalid')).toBeVisible();
    await expect(page.locator('input[type="password"]:invalid')).toBeVisible();
  });

  test('should handle login with correct credentials', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ access_token: 'fake-token' }),
      })
    );

    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Verify that the request was made
    const [request] = await Promise.all([
      page.waitForRequest('**/api/auth/login'),
      page.click('button[type="submit"]')
    ]);

    expect(request).toBeTruthy();
  });

  test('should show error message on failed login', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.fulfill({
        status: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    );

    await page.fill('input[type="text"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.alert')).toHaveText('Error: Invalid credentials');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL('/register');
  });
});
