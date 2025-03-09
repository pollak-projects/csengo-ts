import { expect, test } from '@playwright/test'
import wavEncoder from 'wav-encoder'

test.describe('Landing Page', () => {
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

  test('should render RightLandingCard', async ({ page }) => {
    await page.goto('/')
    const rightCard = page.locator('.right-landing-card-main')
    await expect(rightCard).toBeVisible()
  })

  test('should display song selection list', async ({ page }) => {
    // Mock the API response for song selection list
    await page.route(`**/api/songs/session`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: '1',
          songs: [
            { songId: '1', songTitle: 'Song 1' },
            { songId: '2', songTitle: 'Song 2' }
          ]
        })
      })
    })

    await page.goto('/')

    const songSelectionList = page.locator('.song-selection-list-main')
    await expect(songSelectionList).toBeVisible()
    await expect(songSelectionList.locator('.song-selection-main')).toHaveCount(2)
  })

  test('should display previous winner', async ({ page }) => {
    // Mock the API response for previous winner
    await page.route(`**/api/songs/winner`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: '1',
          title: 'Winning Song',
          createdAt: new Date(),
          updatedAt: new Date(),
          songBucketId: '1',
          songBucket: {
            id: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            path: 'path/to/song'
          }
        })
      })
    })

    await page.goto('/')

    const previousWinner = page.locator('.previous-winner-main')
    await expect(previousWinner).toBeVisible()
    await expect(previousWinner.locator('h1')).toHaveText('Előző győztes: Winning Song')
  })

  test('should display no previous winner message if no winner', async ({ page }) => {
    // Mock the API response for no previous winner
    await page.route(`**/api/songs/winner`, route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ message: 'No previous winner' })
      })
    })

    await page.goto('/')

    const previousWinner = page.locator('.previous-winner-main')
    await expect(previousWinner).toBeVisible()
    await expect(previousWinner.locator('h1')).toHaveText('Jelenleg nincs korábbi győztes')
  })

  test('should display no song selection message if no songs', async ({ page }) => {
    // Mock the API response for no songs
    await page.route('**/api/songs/session', route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({
          'statusCode': 404,
          'message': 'No active voting session found'
        })
      })
    })

    await page.goto('/')

    const songSelectionList = page.locator('.song-selection-list-main')
    await expect(songSelectionList).not.toBeVisible()
    const noSongsMessage = page.locator('.right-landing-card-main .container')
    await expect(noSongsMessage).toHaveText('Jelenleg nincs szavazás')
  })

  test('should display no previous winner message if no previous winner', async ({ page }) => {
    // Mock the API response for no previous winner
    await page.route(`**/api/songs/winner`, route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ message: 'No previous winner' })
      })
    })

    await page.goto('/')

    const previousWinner = page.locator('.previous-winner-main')
    await expect(previousWinner).toBeVisible()
    await expect(previousWinner.locator('h1')).toHaveText('Jelenleg nincs korábbi győztes')
  })

  test('should display previous winner message if there is a previous winner', async ({ page }) => {
    // Mock the API response for previous winner
    await page.route(`**/api/songs/winner`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: '1',
          title: 'Winning Song',
          createdAt: new Date(),
          updatedAt: new Date(),
          songBucketId: '1',
          songBucket: {
            id: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            path: 'path/to/song'
          }
        })
      })
    })

    await page.goto('/')

    const previousWinner = page.locator('.previous-winner-main')
    await expect(previousWinner).toBeVisible()
    await expect(previousWinner.locator('h1')).toHaveText('Előző győztes: Winning Song')
  })


  test('should display the welcome message with the username', async ({ page }) => {
    // Mock the API response
    await page.route(`**/api/users/real-name`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ realName: 'John Doe' })
      })
    })

    await page.goto('/')

    // Check if the welcome message is displayed
    const welcomeMessage = page.locator('.welcome')
    await expect(welcomeMessage).toBeVisible()
    await expect(welcomeMessage).toHaveText('Üdvözlünk, John Doe')
  })

  test('should display no error toast if fetching the username fails', async ({ page }) => {
    // Mock the API response to return an error
    await page.route(`**/api/users/real-name`, route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error', statusCode: 500 })
      })
    })

    await page.goto('/')

    const toast = page.locator('.alert')
    await expect(toast).not.toBeVisible()
  })

  test('should play the song when play button is clicked', async ({ page }) => {
    await page.route(`**/api/songs/session`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: '89 0bd43d-321d-4d8c-847b-a02ec6ef537d',
          songs: [
            {
              songId: '3446b7b5-e3cb-44b8-a36c-65540535ec06',
              songTitle: 'I Know What You Want'
            }
          ]
        })
      })
    })

    // Mock the API response for fetching the song
    await page.route(`**/api/songs/audio?id=3446b7b5-e3cb-44b8-a36c-65540535ec06`, async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/')

    const playButton = page.locator('.song-selection-main button').first()
    await playButton.click()

    const isPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio')
      console.log(audio)
      return audio ? !audio.paused : false
    })

    expect(isPlaying).toBe(true)
  })

  test('should stop the song when stop button is clicked', async ({ page }) => {
    await page.route(`**/api/songs/session`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: '89 0bd43d-321d-4d8c-847b-a02ec6ef537d',
          songs: [
            {
              songId: '3446b7b5-e3cb-44b8-a36c-65540535ec06',
              songTitle: 'I Know What You Want'
            }
          ]
        })
      })
    })

    // Mock the API response for fetching the song
    await page.route(`**/api/songs/audio?id=3446b7b5-e3cb-44b8-a36c-65540535ec06`, async route => {
      await route.fulfill({
        status: 200,
        body: await generateAudioBuffer(),
        headers: {
          'Content-Type': 'audio/mpeg'
        }
      })
    })

    await page.goto('/')

    const playButton = page.locator('.song-selection-main button').first()
    await playButton.click()

    await playButton.click()

    const isPlaying = await page.evaluate(() => {
      const audio = document.querySelector('audio')
      console.log(audio)
      return audio ? !audio.paused : false
    })

    expect(isPlaying).toBe(false)
  })

  test('should vote for a song when vote button is clicked', async ({ page }) => {
    await page.route(`**/api/songs/session`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: '890bd43d-321d-4d8c-847b-a02ec6ef537d',
          songs: [
            {
              songId: '3446b7b5-e3cb-44b8-a36c-65540535ec06',
              songTitle: 'I Know What You Want'
            }
          ]
        })
      })
    })

    await page.route(`**/api/votes?id=3446b7b5-e3cb-44b8-a36c-65540535ec06`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Vote successfully created for song: 3446b7b5-e3cb-44b8-a36c-65540535ec06' })
      })
    })

    const votedSongs: string[] = []

    await page.route(`**/api/votes/current-user`, async route => {
      await route.fulfill({
        status: 200,
        // body: JSON.stringify(['3446b7b5-e3cb-44b8-a36c-65540535ec06'])
        body: JSON.stringify(votedSongs)
      })
    })

    await page.goto('/')

    const voteButton = page.getByRole('button').nth(1)
    await voteButton.click()

    votedSongs.push('3446b7b5-e3cb-44b8-a36c-65540535ec06')

    const svgPath = await voteButton.locator('svg path').getAttribute('d')

    const expectedPath = 'M14,19H18V5H14M6,19H10V5H6V19Z'

    expect(svgPath).toBe(expectedPath)
  })

  test('should remove vote for a song when vote button is clicked', async ({ page }) => {
    await page.route(`**/api/songs/session`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          sessionId: '890bd43d-321d-4d8c-847b-a02ec6ef537d',
          songs: [
            {
              songId: '3446b7b5-e3cb-44b8-a36c-65540535ec06',
              songTitle: 'I Know What You Want'
            }
          ]
        })
      })
    })

    await page.route(`**/api/votes?id=3446b7b5-e3cb-44b8-a36c-65540535ec06`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ message: 'Vote successfully created for song: 3446b7b5-e3cb-44b8-a36c-65540535ec06' })
      })
    })

    const votedSongs: string[] = ['3446b7b5-e3cb-44b8-a36c-65540535ec06']

    await page.route(`**/api/votes/current-user`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(votedSongs)
      })
    })

    await page.goto('/')

    const voteButton = page.getByRole('button').nth(1)
    await voteButton.click()

    votedSongs.pop()

    const svgPath = await voteButton.locator('svg path').getAttribute('d')

    const expectedPath = 'M14,19H18V5H14M6,19H10V5H6V19Z'

    expect(svgPath).toBe(expectedPath)
  })

  test('should open navigation dropdown menu when clicked', async ({ page }) => {
    await page.goto('/')

    const dropdown = page.locator('.user-icon')
    await dropdown.click()

    const dropdownMenu = page.locator('.dropdown-menu')
    await expect(dropdownMenu).toBeVisible()
  })

  test('should close navigation dropdown menu when clicked outside', async ({ page }) => {
    await page.goto('/')

    const dropdown = page.locator('.user-icon')
    await dropdown.click()

    const dropdownMenu = page.locator('.dropdown-menu')
    await expect(dropdownMenu).toBeVisible()

    await dropdown.click()

    await expect(dropdownMenu).not.toBeVisible()
  })

  test('should logout when logout button is clicked', async ({ page }) => {
    await page.goto('/')

    const dropdown = page.locator('.user-icon')
    await dropdown.click()

    const logoutButton = page.locator('.dropdown-menu button').last()
    await logoutButton.click()

    await expect(page).toHaveURL('/login')
  })

  test('should not display Admin button in the dropdown menu for non-admin users', async ({ page, context }) => {
    await context.addCookies([{
      name: 'token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMmJkMjQ4NS0yYWVlLTQzYWMtOTljNS1lZjY5NjU1YmNmZDkiLCJ1c2VybmFtZSI6ImFzZGYiLCJoYXNoZWRQYXNzd29yZCI6IiQyYSQxMCRqVC5GaVdoeE1VcGw0aDl2cGVtYUdPY2JudkZjUUgwRVpvUUIwZ044VGdjdzVuTTNULk54UyIsInJvbGVzIjpbXSwiaWF0IjoxNzM2Nzg5MDA0LCJleHAiOjE3MzczOTM4MDR9.hqcPmRuQuyeNBYgAoZpoxSe4Sve-4WljLBkpZYt4eZs',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'None'
    }])

    await page.goto('/')

    const dropdown = page.locator('.user-icon')
    await dropdown.click()

    const dropdownMenu = page.locator('.dropdown-menu')
    await expect(dropdownMenu).toHaveCount(1)
  })

  test('should display Admin button in the dropdown menu for admin users', async ({ page }) => {
    await page.goto('/')

    const dropdown = page.locator('.user-icon')
    await dropdown.click()

    const dropdownMenu = page.locator('.dropdown-menu > button')
    await expect(dropdownMenu).toHaveCount(2)
  })

  test('should display a success toast when the song upload is successful', async ({ page }) => {
    await page.route('**/api/songs/audio', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: "3198ee9a-06cb-46fd-9387-50837fb4492b",
          title: "OneRepublic - RUNAWAY.mp3",
          createdAt: "2025-01-28T21:27:23.261Z",
          updatedAt: "2025-01-28T21:27:23.261Z",
          songBucketId: "5b53f655-4ea1-4569-a5ff-8b7ad84cc5e1",
          uploadedById: "a99b95d6-60a5-456e-9b60-cc1328f6bb4f"
        })
      })
    })

    const file = new File([await generateAudioBuffer()], 'song.mp3', { type: 'audio/mpeg' });
    const fileObject = {
      name: file.name,
      mimeType: file.type,
      buffer: Buffer.from(await file.arrayBuffer())
    };
    await page.goto('/')

    const uploadButton = page.getByRole('textbox')
    await uploadButton.setInputFiles(fileObject)

    const toast = page.locator('.alert-success')

    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('File uploaded successfully')

  })

  test('should display an error toast when the song upload is too long', async ({ page }) => {
    await page.route('**/api/songs/audio', async route => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({
          message: "The audio file song.mp3 exceeds the maximum allowed length of 15 seconds.",
          error: "Bad Request",
          statusCode: 400
        })
      })
    })

    const file = new File([await generateAudioBuffer(30)], 'song.mp3', { type: 'audio/mpeg' });
    const fileObject = {
      name: file.name,
      mimeType: file.type,
      buffer: Buffer.from(await file.arrayBuffer())
    };
    await page.goto('/')

    const uploadButton = page.getByRole('textbox')
    await uploadButton.setInputFiles(fileObject)

    const toast = page.locator('.alert-error')

    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Failed to upload file: The audio file song.mp3 exceeds the maximum allowed length of 15 seconds.')

  })

  test('should display an error toast when the song upload is not type audo/mpeg', async ({ page }) => {
    await page.route('**/api/songs/audio', async route => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({
          message: "Validation failed (expected type is audio/mpeg)",
          error: "Bad Request",
          statusCode: 400
        })
      })
    })

    const file = new File([await generateAudioBuffer(30)], 'song.bmp', { type: 'image/apng' });
    const fileObject = {
      name: file.name,
      mimeType: 'image/apng',
      buffer: Buffer.from(await file.arrayBuffer())
    };
    await page.goto('/')

    const uploadButton = page.getByRole('textbox')
    await uploadButton.setInputFiles(fileObject)

    const toast = page.locator('.alert-error')

    await expect(toast).toBeVisible()
    await expect(toast).toHaveText('Failed to upload file: Validation failed (expected type is audio/mpeg)')

  })

  test('should redirect to admin page when Admin button is clicked and user is admin', async ({ page, context }) => {
    await page.goto('/')

    const dropdown = page.locator('.user-icon')
    await dropdown.click()

    const adminButton = page.locator('.dropdown-menu button').first()
    await adminButton.click()

    await expect(page).toHaveURL('/admin')
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

