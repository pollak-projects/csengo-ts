import { expect, test } from '@playwright/test'
import wavEncoder from 'wav-encoder'

test.describe('Admin Page', () => {
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

  test('should display the admin page', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
  })

  test('should display home button', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('link')).toBeVisible()
  })

  test('should display dropdown menu', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('#app path').nth(1)).toBeVisible()
  })

  test('should display logout option when dropdown menu is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.locator('#app path').nth(1).click()
    await expect(page.getByRole('button', { name: 'Kijelentkezés' })).toBeVisible()
  })

  test('should go to pending song when pending song is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Zene kérelmek' }).click()
    await expect(page.getByRole('cell', { name: 'Engedélyezés' })).toBeVisible()
  })

  test('should go to votes when votes is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Szavazások' }).click()
    await expect(page.getByRole('cell', { name: 'Kezdet' })).toBeVisible()
  })

  test('should go to miscellaneous when miscellaneous is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Egyebek' }).click()
    await expect(page.getByRole('button', { name: 'Nyertes zene letöltése' })).toBeVisible()
  })

  test('should display no data on song page when no data is present', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Zenék' }).click()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).nth(1)).toBeVisible()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).nth(2)).toBeVisible()
  })

  test('should display no data on pending song page when no data is present', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Zene kérelmek' }).click()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).nth(1)).toBeVisible()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).nth(2)).toBeVisible()
  })

  test('should display no data on votes page when no data is present', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Szavazások' }).click()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'nincs adat' }).nth(1)).toBeVisible()
  })

  test('should display correct data on song page when its present', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zenék' }).click()

    await expect(page.getByRole('cell', { name: 'OneRepublic - RUNAWAY' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '2025-01-06 12:05:35' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Default Kreta' })).toBeVisible()
  })

  test('should starting playing audio on song page when play button is pressed', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/songs/audio?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/admin')

    await page.getByRole('row', { name: 'OneRepublic - RUNAWAY Default' }).getByRole('button').first().click()

    await page.waitForFunction(() => {
      const audio = document.querySelector('audio')
      return audio && !audio.paused
    })

    const isPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio')
      return audio ? !audio.paused : false
    })

    expect(isPlaying).toBe(true)
  })

  test('should stop playing audio on song page when play button is pressed twice', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/songs/audio?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/admin')

    const playButton = page.getByRole('row', { name: 'OneRepublic - RUNAWAY Default' }).getByRole('button').first()
    await playButton.click()
    await playButton.click()

    await page.waitForFunction(() => {
      const audio = document.querySelector('audio')
      return audio && audio.paused
    })

    const isPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio')
      return audio ? !audio.paused : false
    })

    expect(isPlaying).toBe(false)
  })

  test('should upload new song on song page when upload button is pressed', async ({ page }) => {
    await page.route('**/api/songs/audio/direct', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: '4f7ad399-b1cd-47de-9fcd-87110621d6be',
          title: 'test',
          createdAt: '2025-01-30T14:02:21.117Z',
          updatedAt: '2025-01-30T14:02:21.117Z',
          songBucketId: 'e18b23e5-2623-4047-9fe9-86b2249b8250',
          uploadedById: 'a3a64467-e4f2-4bd5-a9e8-27a602106474',
          uploadedBy: {
            id: 'a3a64467-e4f2-4bd5-a9e8-27a602106474',
            username: 'test',
            password: 'test',
            email: 'test@test.com',
            createdAt: '2024-12-10T19:47:04.317Z',
            updatedAt: '2024-12-10T19:47:04.317Z',
            kretaId: '560b4f38-5bd1-4015-ad5f-9fc5f45f7078'
          }
        })
      })
    })

    const file = new File([await generateAudioBuffer()], 'song.mp3', { type: 'audio/mpeg' })
    const fileObject = {
      name: file.name,
      mimeType: file.type,
      buffer: Buffer.from(await file.arrayBuffer())
    }
    await page.goto('/admin')


    await page.getByRole('button', { name: 'Feltöltés' }).click()
    await page.getByPlaceholder('Adja meg a nevet').click()
    await page.getByPlaceholder('Adja meg a nevet').fill('test')
    await page.getByText('Válasszon fájlt').setInputFiles(fileObject)
    await page.getByRole('button', { name: 'Létrehozás' }).click()

    const toast = page.locator('.alert-success')

    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Song created successfully')
  })

  test('should rename song on song page when rename button is pressed', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/songs?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850&name=asdf', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Song renamed successfully to asdf'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zenék' }).click()

    const editButton = page.locator('.edit-button').first()
    await expect(editButton).toBeVisible()
    await editButton.click()

    const nameInput = page.locator('input[placeholder="Adja meg a nevet"]')
    await expect(nameInput).toBeVisible()

    await nameInput.fill('asdf')
    await page.getByRole('button', { name: 'Átnevezés' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Sikeres átnevezés')
  })

  test('should delete song on song page when delete button is pressed', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/songs?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Song deleted successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zenék' }).click()

    const deleteButton = page.locator('.delete-button').first()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Song deleted successfully')
  })

  test('should go to pending song page when pending song button is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Zene kérelmek' }).click()
    await expect(page.getByRole('cell', { name: 'Engedélyezés' })).toBeVisible()
  })

  test('should display correct data on pending song page when its present', async ({ page }) => {
    await page.route('**/api/pending-songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zene kérelmek' }).click()

    await expect(page.getByRole('cell', { name: 'OneRepublic - RUNAWAY' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '2025-01-06 12:05:35' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Default Kreta' })).toBeVisible()
  })

  test('should play audio on pending song page when play button is pressed', async ({ page }) => {
    await page.route('**/api/pending-songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/pending-songs/audio?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zene kérelmek' }).click()

    await page.getByRole('row', { name: 'OneRepublic - RUNAWAY Default' }).getByRole('button').first().click()

    await page.waitForFunction(() => {
      const audio = document.querySelector('audio')
      return audio && !audio.paused
    })

    const isPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio')
      return audio ? !audio.paused : false
    })

    expect(isPlaying).toBe(true)
  })

  test('should stop playing audio on pending song page when play button is pressed twice', async ({ page }) => {
    await page.route('**/api/pending-songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/pending-songs/audio?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zene kérelmek' }).click()

    const playButton = page.getByRole('row', { name: 'OneRepublic - RUNAWAY Default' }).getByRole('button').first()

    await playButton.click()
    await playButton.click()

    await page.waitForFunction(() => {
      const audio = document.querySelector('audio')
      return audio && audio.paused
    })

    const isPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio')
      return audio ? !audio.paused : false
    })

    expect(isPlaying).toBe(false)
  })

  test('should approve song on pending song page when approve button is pressed', async ({ page }) => {
    let data = {
      id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
      title: 'OneRepublic - RUNAWAY',
      createdAt: '2025-01-06T12:05:35.240Z',
      updatedAt: '2025-01-06T12:06:27.275Z',
      uploadedBy: { kreta: { name: 'Default Kreta' } }
    }
    await page.route('**/api/pending-songs', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([data])
      })
    })

    await page.route('**/api/pending-songs?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Song approved successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zene kérelmek' }).click()

    const approveButton = page.locator('.approve-button').first()
    await expect(approveButton).toBeVisible()
    await approveButton.click()

    //@ts-expect-error this needs to be an empty object
    data = {}

    await expect(page.getByRole('cell', { name: 'OneRepublic - RUNAWAY' })).not.toBeVisible()
    await expect(page.getByRole('cell', { name: '2025-01-06T12:05:35.240Z' })).not.toBeVisible()
    await expect(page.getByRole('cell', { name: 'Default Kreta' })).not.toBeVisible()
  })

  test('should disapprove song on pending song page when disapprove button is pressed', async ({ page }) => {
    let data = {
      id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
      title: 'OneRepublic - RUNAWAY',
      createdAt: '2025-01-06T12:05:35.240Z',
      updatedAt: '2025-01-06T12:06:27.275Z',
      uploadedBy: { kreta: { name: 'Default Kreta' } }
    }
    await page.route('**/api/pending-songs', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([data])
      })
    })

    await page.route('**/api/pending-songs?id=861674a7-f4dd-4152-adaf-7bf8dbe2d850', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Song disapproved successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Zene kérelmek' }).click()

    const disapproveButton = page.locator('.delete-button').first()
    await expect(disapproveButton).toBeVisible()
    await disapproveButton.click()

    //@ts-expect-error this needs to be an empty object
    data = {}

    await expect(page.getByRole('cell', { name: 'OneRepublic - RUNAWAY' })).not.toBeVisible()
    await expect(page.getByRole('cell', { name: '2025-01-06T12:05:35.240Z' })).not.toBeVisible()
    await expect(page.getByRole('cell', { name: 'Default Kreta' })).not.toBeVisible()
  })

  test('should go to votes page when votes button is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Szavazások' }).click()
    await expect(page.getByRole('cell', { name: 'Kezdet' })).toBeVisible()
  })

  test('should display correct data on votes page when its present', async ({ page }) => {
    await page.route('**/api/voting-sessions', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '4ac60c47-410e-4165-86a6-c233018e1988',
            songNames: ['sadf', 'eeeee'],
            start: '2025-01-27T21:59:00.000Z',
            end: '2025-01-31T21:59:00.000Z',
            createdAt: '2025-01-28T19:17:42.067Z',
            updatedAt: '2025-01-28T19:17:42.067Z',
            songs: [
              {
                id: '2487866a-937b-4c47-ad2b-b49c456e3824',
                title: 'sadf',
                createdAt: '2025-01-28T19:17:08.158Z',
                updatedAt: '2025-01-28T19:17:08.158Z',
                songBucketId: '5bf4c396-ca9f-4d2b-9a24-46c483324c8d',
                uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
              },
              {
                id: '6aa8a58a-3fae-4949-b949-f5d8e2f9b4cd',
                title: 'eeeee',
                createdAt: '2025-01-28T19:17:16.346Z',
                updatedAt: '2025-01-28T19:17:16.346Z',
                songBucketId: '18acb768-37dd-4dfd-97a0-b0d17575f247',
                uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
              }
            ],
            Vote: []
          }
        ])
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Szavazások' }).click()

    await expect(page.getByRole('cell', { name: '2025-01-27 21:59:00' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '2025-01-31 21:59:00' })).toBeVisible()
  })

  test('should display all part taking songs when view button is pressed', async ({ page }) => {
    await page.route('**/api/voting-sessions', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '4ac60c47-410e-4165-86a6-c233018e1988',
            songNames: ['sadf', 'eeeee'],
            start: '2025-01-27T21:59:00.000Z',
            end: '2025-01-31T21:59:00.000Z',
            createdAt: '2025-01-28T19:17:42.067Z',
            updatedAt: '2025-01-28T19:17:42.067Z',
            songs: [
              {
                id: '2487866a-937b-4c47-ad2b-b49c456e3824',
                title: 'sadf',
                createdAt: '2025-01-28T19:17:08.158Z',
                updatedAt: '2025-01-28T19:17:08.158Z',
                songBucketId: '5bf4c396-ca9f-4d2b-9a24-46c483324c8d',
                uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
              },
              {
                id: '6aa8a58a-3fae-4949-b949-f5d8e2f9b4cd',
                title: 'eeeee',
                createdAt: '2025-01-28T19:17:16.346Z',
                updatedAt: '2025-01-28T19:17:16.346Z',
                songBucketId: '18acb768-37dd-4dfd-97a0-b0d17575f247',
                uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
              }
            ],
            Vote: []
          }
        ])
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Szavazások' }).click()

    await page.locator('.view-button').first().click()

    await expect(page.getByRole('cell', { name: 'sadf' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'eeeee' })).toBeVisible()
  })

  test('should edit all data when edit button is pressed', async ({ page }) => {
    await page.route('**/api/voting-sessions', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '4ac60c47-410e-4165-86a6-c233018e1988',
            songNames: ['sadf', 'eeeee'],
            start: '2025-01-27T21:59:00.000Z',
            end: '2025-01-31T21:59:00.000Z',
            createdAt: '2025-01-28T19:17:42.067Z',
            updatedAt: '2025-01-28T19:17:42.067Z',
            songs: [
              {
                id: '2487866a-937b-4c47-ad2b-b49c456e3824',
                title: 'sadf',
                createdAt: '2025-01-28T19:17:08.158Z',
                updatedAt: '2025-01-28T19:17:08.158Z',
                songBucketId: '5bf4c396-ca9f-4d2b-9a24-46c483324c8d',
                uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
              },
              {
                id: '6aa8a58a-3fae-4949-b949-f5d8e2f9b4cd',
                title: 'eeeee',
                createdAt: '2025-01-28T19:17:16.346Z',
                updatedAt: '2025-01-28T19:17:16.346Z',
                songBucketId: '18acb768-37dd-4dfd-97a0-b0d17575f247',
                uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
              }
            ],
            Vote: []
          }
        ])
      })
    })

    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          },
          {
            id: '2487866a-937b-4c47-ad2b-b49c456e3824',
            title: 'sadf',
            createdAt: '2025-01-28T19:17:08.158Z',
            updatedAt: '2025-01-28T19:17:08.158Z',
            songBucketId: '5bf4c396-ca9f-4d2b-9a24-46c483324c8d',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          },
          {
            id: '6aa8a58a-3fae-4949-b949-f5d8e2f9b4cd',
            title: 'eeeee',
            createdAt: '2025-01-28T19:17:16.346Z',
            updatedAt: '2025-01-28T19:17:16.346Z',
            songBucketId: '18acb768-37dd-4dfd-97a0-b0d17575f247',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })

    await page.route('**/api/voting-sessions?id=4ac60c47-410e-4165-86a6-c233018e1988', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Voting session updated successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Szavazások' }).click()

    await page.locator('.edit-button').first().click()

    await page.getByLabel('Kezdő dátum:').click()
    await page.getByLabel('Kezdő dátum:').waitFor()
    await page.getByLabel('Kezdő dátum:').fill('2222-02-22T22:22')
    await page.getByLabel('Befejező dátum:').click()
    await page.getByLabel('Befejező dátum:').waitFor()
    await page.getByLabel('Befejező dátum:').fill('2223-02-22T22:22')
    await page.getByRole('button', { name: 'Zenék kiválasztása' }).click()
    await page.locator('li').filter({ hasText: 'sadf' }).getByRole('checkbox').uncheck()
    await page.locator('li').filter({ hasText: 'eeeee' }).getByRole('checkbox').uncheck()
    await page.locator('li').filter({ hasText: 'OneRepublic - R...' }).getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Zenék kiválasztása' }).click()
    await page.getByRole('button', { name: 'Módosítás' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Sikeres szavazás frissites')
  })

  test('should delete voting session on votes page when delete button is pressed', async ({ page }) => {
    let data = {
      id: '4ac60c47-410e-4165-86a6-c233018e1988',
      songNames: ['sadf', 'eeeee'],
      start: '2025-01-27T21:59:00.000Z',
      end: '2025-01-31T21:59:00.000Z',
      createdAt: '2025-01-28T19:17:42.067Z',
      updatedAt: '2025-01-28T19:17:42.067Z',
      songs: [
        {
          id: '2487866a-937b-4c47-ad2b-b49c456e3824',
          title: 'sadf',
          createdAt: '2025-01-28T19:17:08.158Z',
          updatedAt: '2025-01-28T19:17:08.158Z',
          songBucketId: '5bf4c396-ca9f-4d2b-9a24-46c483324c8d',
          uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
        },
        {
          id: '6aa8a58a-3fae-4949-b949-f5d8e2f9b4cd',
          title: 'eeeee',
          createdAt: '2025-01-28T19:17:16.346Z',
          updatedAt: '2025-01-28T19:17:16.346Z',
          songBucketId: '18acb768-37dd-4dfd-97a0-b0d17575f247',
          uploadedById: 'a99b95d6-60a5-456e-9b60-cc1328f6bb4f'
        }
      ],
      Vote: []
    }
    await page.route('**/api/voting-sessions', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          data
        ])
      })
    })
    await page.route('**/api/voting-sessions?id=4ac60c47-410e-4165-86a6-c233018e1988', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Voting session deleted successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Szavazások' }).click()

    const deleteButton = page.locator('.delete-button').first()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    //@ts-expect-error this needs to be an empty object
    data = {}

    await expect(page.getByRole('cell', { name: '2025-01-27 21:59:00' })).not.toBeVisible()
    await expect(page.getByRole('cell', { name: '2025-01-31 21:59:00' })).not.toBeVisible()
  })

  test('should create new voting session on votes page when create button is pressed', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            title: 'OneRepublic - RUNAWAY',
            createdAt: '2025-01-06T12:05:35.240Z',
            updatedAt: '2025-01-06T12:06:27.275Z',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          },
          {
            id: '2487866a-937b-4c47-ad2b-b49c456e3824',
            title: 'sadf',
            createdAt: '2025-01-28T19:17:08.158Z',
            updatedAt: '2025-01-28T19:17:08.158Z',
            songBucketId: '5bf4c396-ca9f-4d2b-9a24-46c483324c8d',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          },
          {
            id: '6aa8a58a-3fae-4949-b949-f5d8e2f9b4cd',
            title: 'eeeee',
            createdAt: '2025-01-28T19:17:16.346Z',
            updatedAt: '2025-01-28T19:17:16.346Z',
            songBucketId: '18acb768-37dd-4dfd-97a0-b0d17575f247',
            uploadedBy: { kreta: { name: 'Default Kreta' } }
          }
        ])
      })
    })
    await page.route('**/api/voting-sessions', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Successfully created new session: [object Object]'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Szavazások' }).click()

    await page.getByRole('button', { name: 'Létrehozás' }).click()
    await page.getByLabel('Kezdő dátum:').click()
    await page.getByLabel('Kezdő dátum:').fill('3333-03-10T03:33')
    await page.getByLabel('Befejező dátum:').click()
    await page.getByLabel('Befejező dátum:').fill('3333-03-31T03:33')
    await page.getByRole('button', { name: 'Zenék kiválasztása' }).click()
    await page.locator('li').filter({ hasText: 'OneRepublic - R...' }).getByRole('checkbox').check()
    await page.locator('li').filter({ hasText: 'sadf' }).getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Zenék kiválasztása' }).click()
    await page.locator('form').getByRole('button', { name: 'Létrehozás' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Sikeres szavazás létrehozás')
  })

  test('should go to users page when users button is pressed', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Felhasználók' }).click()
    await expect(page.getByRole('cell', { name: 'Felhasználónév' })).toBeVisible()
  })

  test('should display correct data on users page when its present', async ({ page }) => {
    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
            username: 'asdf',
            email: 'email@email.com',
            role: 'user',
            kreta: {
              name: 'name',
              om: '123'
            }
          }
        ])
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Felhasználók' }).click()

    await expect(page.getByRole('cell', { name: 'asdf' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'email@email.com' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'user' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'name' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '123' })).toBeVisible()
  })

  test('should edit user\'s password on users page when edit button is pressed and only password is filled', async ({ page }) => {
    await page.route('**/api/users', async route => {
      if (route.request().method() == 'POST')
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            message: 'User updated successfully'
          })
        })
      else
        await route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
              username: 'asdf',
              email: 'email@email.com',
              role: 'user',
              kreta: {
                name: 'name',
                om: '123'
              }
            }
          ])
        })
    })

    await page.route('**/api/users/roles', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'User updated successfully'
        })
      })
    })


    await page.goto('/admin')

    await page.getByRole('button', { name: 'Felhasználók' }).click()

    await page.getByRole('row', { name: 'asdf name email@email.com 123' }).getByRole('button').click()
    await page.getByPlaceholder('Adja meg az uj jelszót').click()
    await page.getByPlaceholder('Adja meg az uj jelszót').fill('asdfasdf')
    await page.getByRole('button', { name: 'Szerkesztés' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Sikeres átnevezés')
  })

  test('should edit user\'s role on users page when edit button is pressed and only role is filled', async ({ page }) => {
    await page.route('**/api/users', async route => {
      if (route.request().method() == 'POST')
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            message: 'User updated successfully'
          })
        })
      else
        await route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
              username: 'asdf',
              email: 'email@email.com',
              role: 'user',
              kreta: {
                name: 'name',
                om: '123'
              }
            }
          ])
        })
    })

    await page.route('**/api/users/roles', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'User updated successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Felhasználók' }).click()

    await page.getByRole('row', { name: 'asdf name email@email.com 123' }).getByRole('button').click()
    await page.getByRole('combobox').selectOption('admin')
    await page.getByRole('button', { name: 'Szerkesztés' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Sikeres átnevezés')
  })

  test('should edit user\'s role and password on users page when edit button is pressed and both are filled', async ({ page }) => {
    await page.route('**/api/users', async route => {
      if (route.request().method() == 'POST')
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            message: 'User updated successfully'
          })
        })
      else
        await route.fulfill({
          status: 200,
          body: JSON.stringify([
            {
              id: '861674a7-f4dd-4152-adaf-7bf8dbe2d850',
              username: 'asdf',
              email: 'email@email.com',
              role: 'user',
              kreta: {
                name: 'name',
                om: '123'
              }
            }
          ])
        })
    })

    await page.route('**/api/users/roles', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'User updated successfully'
        })
      })
    })

    await page.goto('/admin')

    await page.getByRole('button', { name: 'Felhasználók' }).click()

    await page.getByRole('row', { name: 'asdf name email@email.com 123' }).getByRole('button').click()
    await page.getByPlaceholder('Adja meg az uj jelszót').click()
    await page.getByPlaceholder('Adja meg az uj jelszót').fill('asdfasdf')
    await page.getByRole('combobox').selectOption('admin')
    await page.getByRole('button', { name: 'Szerkesztés' }).click()

    const toast = page.locator('.alert-success')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Sikeres átnevezés')
  })

  test('should display all buttons on miscellaneous page', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Egyebek' }).click()
    await expect(page.getByRole('button', { name: 'Szavazásban lévő zenék letöltése' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nyertes zene letöltése' })).toBeVisible()
  })

  test('should download songs in voting on miscellaneous page when download button is pressed', async ({ page }) => {
    await page.route('**/api/songs/session/audio', async route => {
      await route.fulfill({
        status: 200,
        body: 'UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==',
        headers: {
          'Content-Type': 'application/zip'
        }
      })
    })

    await page.goto('/admin')
    await page.getByRole('button', { name: 'Egyebek' }).click()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Szavazásban lévő zenék letöltése' }).click()
    ])

    const path = await download.path()
    expect(path).toBeTruthy()
    expect(download.suggestedFilename()).toBe('audio.zip')

  })

  test('should download winner song on miscellaneous page when download button is pressed', async ({ page }) => {
    await page.route('**/api/songs/winner', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'c5001a12-9417-41fe-ad58-00d827fc1c41',
          title: 'Happy Nation',
          createdAt: '2025-01-09T16:15:59.501Z',
          updatedAt: '2025-01-15T08:51:39.493Z',
          songBucketId: '3eda5a05-5e69-4e61-be3f-2f3a690e03a3',
          uploadedById: '00000000-0000-0000-0000-000000000000',
          songBucket: {
            id: '3eda5a05-5e69-4e61-be3f-2f3a690e03a3',
            path: '/data/audio/1736433448356-Csengo_Happy-Nation.mp3',
            createdAt: '2025-01-09T14:37:28.408Z',
            updatedAt: '2025-01-09T14:37:28.408Z'
          }
        })
      })
    })

    await page.route('**/api/songs/winner/audio', async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/admin')
    await page.getByRole('button', { name: 'Egyebek' }).click()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Nyertes zene letöltése' }).click()
    ])

    const path = await download.path()
    expect(path).toBeTruthy()
    // Has to be wav since we are using wavEncoder
    expect(download.suggestedFilename()).toBe('Happy Nation.wav')
  })
})

async function generateAudioBuffer(duration: number = 10): Promise<Buffer> {
  const sampleRate = 44100
  const frequency = 1000 // Hz
  const numSamples = sampleRate * duration
  const toneBuffer = new Float32Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    toneBuffer[i] = Math.sin(2 * Math.PI * frequency * (i / sampleRate))
  }

  const wavData = await wavEncoder.encode({
    sampleRate,
    channelData: [toneBuffer]
  })

  const base64Audio = Buffer.from(wavData).toString('base64')
  return Buffer.from(base64Audio, 'base64')
}




