import { expect, test } from '@playwright/test'

test.describe('Snipper Page', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([{
      name: 'token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMmJkMjQ4NS0yYWVlLTQzYWMtOTljNS1lZjY5NjU1YmNmZDkiLCJ1c2VybmFtZSI6ImFzZGYiLCJoYXNoZWRQYXNzd29yZCI6IiQyYSQxMCRqVC5GaVdoeE1VcGw0aDl2cGVtYUdPY2JudkZjUUgwRVpvUUIwZ044VGdjdzVuTTNULk54UyIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTczNjc4OTAwNCwiZXhwIjoxNzM3MzkzODA0fQ.DMjwD91UZ0v4bxhNiuMxtvAWjGB7nLaPzLCFTM9uS6o',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'None'
    }])
  })

  test('should display snipper page', async ({ page }) => {
    await page.goto('/snipper')
    await expect(page).toHaveURL('/snipper')
  })

  test('should display home button', async ({ page }) => {
    await page.goto('/snipper')
    await expect(page.getByRole('link')).toBeVisible()
  })

  test('should display all elements', async ({ page }) => {
    await page.goto('/snipper')
    await expect(page.locator('#responsive-video-container')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Youtube link ide' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Adj neki egy nevet' })).toBeVisible()
    await expect(page.getByText('00')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Feltöltés YouTube-ról' })).toBeVisible()
  })

  test('should display waring message when no youtube link is given', async ({ page }) => {
    await page.goto('/snipper')
    await page.getByRole('button', { name: 'Feltöltés YouTube-ról' }).click()

    const toast = page.locator('.alert-warning')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Nem adtál meg egy zenét!')
  })

  test('should display warning message when no section is given', async ({ page }) => {
    await page.goto('/snipper')
    await page.getByRole('textbox', { name: 'Youtube link ide' }).fill('https://www.youtube.com/watch?v=f2iQfEcO39A')
    await page.getByRole('textbox', { name: 'Adj neki egy nevet' }).fill('test')
    await page.getByRole('button', { name: 'Feltöltés YouTube-ról' }).click()

    const toast = page.locator('.alert-warning')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Nem adtál meg egy szekciót a zenéből!')
  })

  test('should display warning message when no title is given', async ({ page }) => {
    await page.goto('/snipper')

    await page.getByRole('textbox', { name: 'Youtube link ide' }).fill('https://www.youtube.com/watch?v=f2iQfEcO39A')
    await page.getByRole('textbox', { name: 'Adj neki egy nevet' }).fill('')

    const slider = page.getByRole('slider').locator('div').nth(1)

    const frame = page.frames()[0];
    await frame.waitForLoadState('networkidle');

    await slider.hover({ force: true, position: { x: 0, y: 0 } })
    await page.mouse.down()
    await slider.hover({ force: true, position: { x: 103, y: 0 } })
    await page.mouse.up()

    await page.getByRole('button', { name: 'Feltöltés YouTube-ról' }).click()

    const toast = page.locator('.alert-warning')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Nem adtál meg egy nevet!')
  })

  test('should not allow section to be more than 15 seconds', async ({ page }) => {
    await page.goto('/snipper')
    await page.getByRole('textbox', { name: 'Youtube link ide' }).fill('https://www.youtube.com/watch?v=f2iQfEcO39A')
    await page.getByRole('textbox', { name: 'Adj neki egy nevet' }).fill('test')

    const frame = page.frames()[0];
    await frame.waitForLoadState('networkidle');

    const slider = page.getByRole('slider').locator('div').nth(1)

    await slider.hover({ force: true, position: { x: 0, y: 0 } })
    await page.mouse.down()
    await slider.hover({ force: true, position: { x: 103, y: 0 } })
    await page.mouse.up()

    await expect(page.getByRole('slider').filter({ hasText: '10' }).locator('div').nth(1)).toBeVisible()
    await expect(page.getByRole('slider').filter({ hasText: '25' }).locator('div').nth(1)).toBeVisible()
  })

  test('should request upload when all data is given', async ({ page }) => {
    await page.route('**/api/snipper', async route => {
      await route.fulfill({
        status: 200
      })
    })

    await page.goto('/snipper')

    await page.getByRole('textbox', { name: 'Youtube link ide' }).fill('https://www.youtube.com/watch?v=f2iQfEcO39A')
    await page.getByRole('textbox', { name: 'Adj neki egy nevet' }).fill('test')

    const slider = page.getByRole('slider').locator('div').nth(1)

    const frame = page.frames()[0];
    await frame.waitForLoadState('networkidle');

    await slider.hover({ force: true, position: { x: 0, y: 0 } })
    await page.mouse.down()
    await slider.hover({ force: true, position: { x: 103, y: 0 } })
    await page.mouse.up()

    await page.getByRole('button', { name: 'Feltöltés YouTube-ról' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('A zene kivágva, és feltöltve!')
  })

  test('should display error message when request fails', async ({ page }) => {
    await page.route('**/api/snipper', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({
          message: 'Error'
        })
      })
    })

    await page.goto('/snipper')

    await page.getByRole('textbox', { name: 'Youtube link ide' }).fill('https://www.youtube.com/watch?v=f2iQfEcO39A')
    await page.getByRole('textbox', { name: 'Adj neki egy nevet' }).fill('test')

    const slider = page.getByRole('slider').locator('div').nth(1)

    const frame = page.frames()[0];
    await frame.waitForLoadState('networkidle');

    await slider.hover({ force: true, position: { x: 0, y: 0 } })
    await page.mouse.down()
    await slider.hover({ force: true, position: { x: 103, y: 0 } })
    await page.mouse.up()

    await page.getByRole('button', { name: 'Feltöltés YouTube-ról' }).click()

    const toast = page.locator('.alert-warning')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Error: Error catch snipping video: Error: Error snipping video: Error')
  })

})
