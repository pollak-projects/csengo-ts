import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const usePendingSongStore = defineStore(`pendingSong`, () => {
  const logger = serviceLogger('pendingSongStore')
  const url = import.meta.env.VITE_API_URL

  async function fetchSong(songId: string) {
    try {
      const response = await fetch(`${url}/api/pending-songs/audio?id=${songId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        logger.error(`Error fetching song: ${data.message}`)
        throw new Error(`Error fetching song: ${data.message}`)
      }
      const data = await response.blob()
      return new Audio(URL.createObjectURL(data))
    } catch (error) {
      logger.error(`Error fetching song: ${(error as Error).message}`)
      throw new Error(`Error fetching song: ${(error as Error).message}`)
    }

  }

  async function approveSongById(songId: string) {
    try {
      const response = await fetch(`${url}/api/pending-songs?id=${songId}`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        logger.error(`Error approving song: ${data.message}`)
        throw new Error(`Error approving song: ${data.message}`)
      }
      return await response.json()
    } catch (e) {
      logger.error(`Error approving song: ${(e as Error).message}`)
      throw new Error(`Error approving song: ${(e as Error).message}`)
    }
  }

  async function disapproveSongById(songId: string) {
    try {
      const response = await fetch(`${url}/api/pending-songs?id=${songId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        logger.error(`Error disapproving song: ${data.message}`)
        throw new Error(`Error disapproving song: ${data.message}`)
      }
      return await response.json()
    } catch (e) {
      logger.error(`Error disapproving song: ${(e as Error).message}`)
      throw new Error(`Error disapproving song: ${(e as Error).message}`)
    }
  }

  return {
    fetchSong,
    approveSongById,
    disapproveSongById,
  }
})
