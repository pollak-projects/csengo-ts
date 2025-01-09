import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useSongStore = defineStore('song', () => {
  const logger = serviceLogger('pendingSongStore')
  const url = import.meta.env.VITE_API_URL

  async function fetchSong(songId: string) {
    try {
      const response = await fetch(`${url}/api/songs/audio?id=${songId}`, {
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

  async function deleteSongById(songId: string) {
    try {
      const response = await fetch(`${url}/api/songs?id=${songId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const data = await response.json()
        logger.error(`Error deleting song: ${data.message}`)
        throw new Error(`Error deleting song: ${data.message}`)
      }
      return 'Song deleted successfully'
    } catch (error) {
      logger.error(`Error deleting song: ${(error as Error).message}`)
      throw new Error(`Error deleting song: ${(error as Error).message}`)
    }
  }

  return {
    fetchSong,
    deleteSongById,
  }
})
