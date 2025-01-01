import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display the registration form', async ({ page }) => {
    await expect(page.locator('h1.title')).toHaveText('POLLÁK CSENGŐ');
    await expect(page.locator('h2')).toHaveText('Regisztráció');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have all input fields', async ({ page }) => {
    await expect(page.locator('input[type="text"][required]')).toHaveCount(3);
    await expect(page.locator('input[type="password"][required]')).toHaveCount(2);
  });

  test('should display labels for input fields', async ({ page }) => {
    await expect(page.locator('.user-box div')).toHaveText(['Felhasználónév', 'Email', 'OM', 'Jelszó', 'Jelszó megerősítése']);
  });

  test('should navigate to login page when link is clicked', async ({ page }) => {
    await page.click('text=Lépj be itt!');
    await expect(page).toHaveURL('/login');
  });

  test('should register a new user', async ({ page }) => {
    await page.route(`**/api/auth/register`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMmJkMjQ4NS0yYWVlLTQzYWMtOTljNS1lZjY5NjU1YmNmZDkiLCJ1c2VybmFtZSI6ImFzZGYiLCJoYXNoZWRQYXNzd29yZCI6IiQyYSQxMCRqVC5GaVdoeE1VcGw0aDl2cGVtYUdPY2JudkZjUUgwRVpvUUIwZ044VGdjdzVuTTNULk54UyIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTczNjc4OTAwNCwiZXhwIjoxNzM3MzkzODA0fQ.DMjwD91UZ0v4bxhNiuMxtvAWjGB7nLaPzLCFTM9uS6o'
        })
      });
    });
    await page.fill('input[type="text"][required]>>nth=0', 'testuser');
    await page.fill('input[type="text"][required]>>nth=1', 'testuser@example.com');
    await page.fill('input[type="text"][required]>>nth=2', '123456');
    await page.fill('input[type="password"][required]>>nth=0', 'password123');
    await page.fill('input[type="password"][required]>>nth=1', 'password123');
    await page.click('button.submit');
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should show error message on registration failure', async ({ page }) => {
    await page.route(`**/api/auth/register`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });
    await page.fill('input[type="text"][required] >> nth=0', 'testuser');
    await page.fill('input[type="text"][required] >> nth=1', 'invalid-email');
    await page.fill('input[type="text"][required] >> nth=2', '123456');
    await page.fill('input[type="password"][required]>>nth=0', 'password123');
    await page.fill('input[type="password"][required]>>nth=1', 'password123');
    await page.click('button.submit');
    await expect(page.locator('.alert')).toHaveText('Invalid credentials');
  });

  test('should show error message on password mismatch', async ({ page }) => {
    await page.fill('input[type="text"][required] >> nth=0', 'testuser');
    await page.fill('input[type="text"][required] >> nth=1', 'invalid-email');
    await page.fill('input[type="text"][required] >> nth=2', '123456');
    await page.fill('input[type="password"][required]>>nth=0', 'password123');
    await page.fill('input[type="password"][required]>>nth=1', 'password1235');
    await page.click('button.submit');
    await expect(page.locator('.alert')).toHaveText('A jelszavak nem egyeznek meg!');
  });
});
