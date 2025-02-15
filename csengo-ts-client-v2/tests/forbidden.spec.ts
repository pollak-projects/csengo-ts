import { test, expect } from '@playwright/test';

test.describe('Forbidden Page', () => {
  test.beforeEach(async ({ page , context}) => {
    await context.addCookies([{
      name: 'token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMmJkMjQ4NS0yYWVlLTQzYWMtOTljNS1lZjY5NjU1YmNmZDkiLCJ1c2VybmFtZSI6ImFzZGYiLCJoYXNoZWRQYXNzd29yZCI6IiQyYSQxMCRqVC5GaVdoeE1VcGw0aDl2cGVtYUdPY2JudkZjUUgwRVpvUUIwZ044VGdjdzVuTTNULk54UyIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTczNjc4OTAwNCwiZXhwIjoxNzM3MzkzODA0fQ.DMjwD91UZ0v4bxhNiuMxtvAWjGB7nLaPzLCFTM9uS6o',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'None'
    }]);
    await page.goto('/forbidden');
  });

  test('should stay on forbidden page', async ({ page }) => {
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL('/forbidden');
  });

  test('should display the forbidden page with home button on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page).toHaveURL('/forbidden');
    await expect(page.locator('h1.title')).toHaveText('Forbidden Page');
    await expect(page.locator('button.home-button')).toBeVisible();
  });

  test('should display the message on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 299, height: 299 });
    await expect(page.locator('h3')).toHaveText('Ez az oldal nem megtekinthető ekkora kijelzőn');
  });

  test('should navigate to home page when home button is clicked', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.click('button.home-button');
    await expect(page).toHaveURL('/');
  });
});
