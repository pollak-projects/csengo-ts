// Utilities
import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useUploadSongStore = defineStore('uploadSong', () => {
  const logger = serviceLogger('uploadSong')
  const url = import.meta.env.VITE_API_URL

  async function uploadSong(options: { ytUrl: string, from: number, to: number, title: string }) {

    try {
      const response = await fetch(`${url}/api/snipper`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(options),
        timeout: 30_000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const data = await response.json()
        logger.error(`Error snipping video: ${data.message}`)
        throw new Error(`Error snipping video: ${data.message}`)
      }

      return;
    } catch (error) {
      logger.error(`Error catch snipping video: ${error}`)
      throw new Error(`Error catch snipping video: ${error}`)
    }
  }

  return {
    uploadSong
  }
})
