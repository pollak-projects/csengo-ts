import { expect, test } from '@playwright/test'

test.describe('TV Page', () => {
  test.beforeEach(async ({ page, context }) => {

  })

  test('should navigate to tv page', async ({ page }) => {
    await page.goto('/tv')
    await expect(page).toHaveURL('/tv')
  })

  test('should navigate to index page when logged in', async ({ page, context }) => {
    await context.addCookies([{
      name: 'token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMmJkMjQ4NS0yYWVlLTQzYWMtOTljNS1lZjY5NjU1YmNmZDkiLCJ1c2VybmFtZSI6ImFzZGYiLCJoYXNoZWRQYXNzd29yZCI6IiQyYSQxMCRqVC5GaVdoeE1VcGw0aDl2cGVtYUdPY2JudkZjUUgwRVpvUUIwZ044VGdjdzVuTTNULk54UyIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTczNjc4OTAwNCwiZXhwIjoxNzM3MzkzODA0fQ.DMjwD91UZ0v4bxhNiuMxtvAWjGB7nLaPzLCFTM9uS6o',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'None'
    }])
    await page.goto('/tv')
    await expect(page).toHaveURL('/')
  })

  test('should display call to action when no session is active', async ({ page }) => {
    await page.goto('/tv')
    await expect(page.getByRole('img', { name: 'Pollák' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Jelenleg nincsen aktív szavaz' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Töltsetek fel új zenéket' })).toBeVisible()
  })

  test('should display correct data when a session is active', async ({ page }) => {
    await page.route('**/api/tv/session', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: '1',
          songs: [
            {
              songId: '1',
              songTitle: 'Test song 1',
              voteCount: 5
            },
            {
              songId: '2',
              songTitle: 'Test song 2',
              voteCount: 3
            },
            {
              songId: '3',
              songTitle: 'Test song 3',
              voteCount: 1
            }
          ]
        })
      })
    })

    await page.goto('/tv')

    await expect(page.locator('#voteChart')).toBeVisible()
    expect(page.locator('li').filter({ hasText: 'Test song 1 - 5' })).toBeDefined()
    expect(page.locator('li').filter({ hasText: 'Test song 2 - 3' })).toBeDefined()
    expect(page.locator('li').filter({ hasText: 'Test song 3 - 1' })).toBeDefined()
  })
})
