import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useDownloadStore = defineStore('download', () => {
  const logger = serviceLogger('downloadStore')
  const url = import.meta.env.VITE_API_URL

  async function fetchCurrentSessionSongs() {
    logger.verbose('Downloading current session songs')
    try {
      const response = await fetch(`${url}/api/songs/session/audio`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        logger.error(`Error downloading current session songs: ${data.message}`)
        throw new Error(`Error downloading current session songs: ${data.message}`)
      }

      const a = document.createElement('a')
      a.href = `${url}/api/songs/session/audio`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      logger.error(`Error downloading current session songs: ${error}`)
      throw new Error(`Error downloading current session songs: ${error}`)
    }
  }

  async function fetchLastSessionWinningSong() {
    logger.verbose('Fetching last session winning song')
    try {
      const winnerSongResponse = await fetch(`${url}/api/songs/winner`, {
        method: 'GET',
        credentials: 'include'
      })
      const response = await fetch(`${url}/api/songs/winner/audio`, {
        method: 'GET',
        credentials: 'include'
      })

      const winnerSongData = await winnerSongResponse.json()

      if (!response.ok || !winnerSongResponse.ok) {
        const data = await response.json()
        logger.error(`Error fetching last session winning song: ${data.message}, ${winnerSongData.message}`)
        throw new Error(`Error fetching last session winning song: ${data.message}, ${winnerSongData.message}`)
      }

      logger.verbose('Successfully fetched last session winning song')
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${winnerSongData.title}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      logger.error(`Error fetching last session winning song: ${error}`)
      throw new Error(`Error fetching last session winning song: ${error}`)
    }
  }

  async function updateLastSessionWinningSong() {
    logger.verbose('Updating last session winning song')
    try {
      const response = await fetch(`${url}/api/songs/server/update`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        logger.error(`Error updating last session winning song on the server: ${data.message}`)
        throw new Error(`Error updating last session winning song on the server: ${data.message}`)
      }
      logger.verbose('Successfully updated last session winning song on the server')
      return data
    } catch (error) {
      logger.error(`Error updating last session winning song on the server: ${error}`)
      throw new Error(`Error updating last session winning song on the server: ${error}`)
    }
  }

  async function startAudioOnServer() {
    logger.verbose('Starting audio playing on the server')
    try {
      const response = await fetch(`${url}/api/songs/server/start`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        logger.error(`Error starting audio on the server: ${data.message}`)
        throw new Error(`Error starting audio on the server: ${data.message}`)
      }
      logger.verbose('Successfully started audio playback on the server')
      return data
    } catch (error) {
      logger.error(`Error starting audio on the server: ${error}`)
      throw new Error(`Error starting audio on the server: ${error}`)
    }
  }

  async function stopAudioOnServer() {
    logger.verbose('Stopping audio playing on the server')
    try {
      const response = await fetch(`${url}/api/songs/server/stop`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        logger.error(`Error stopping audio on the server: ${data.message}`)
        throw new Error(`Error stopping audio on the server: ${data.message}`)
      }
      logger.verbose('Successfully stopped audio playback on the server')
      return data
    } catch (error) {
      logger.error(`Error starting audio on the server: ${error}`)
      throw new Error(`Error starting audio on the server: ${error}`)
    }
  }


  return {
    fetchCurrentSessionSongs,
    fetchLastSessionWinningSong,
    updateLastSessionWinningSong,
    startAudioOnServer,
    stopAudioOnServer,
  }
})
