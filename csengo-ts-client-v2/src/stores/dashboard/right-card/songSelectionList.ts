import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useSongSelectionListStore = defineStore('songSelectionList', () => {
  const logger = serviceLogger('songSelectionListStore')
  const url = import.meta.env.VITE_API_URL
  const songSelectionList = ref({
    sessionId: '',
    songs: [{
      songId: '',
      songTitle: '',
    }],
  })

  async function fetchSongSelectionList() {
    try {
      const response = await fetch(`${url}/api/songs/session`, {
        credentials: 'include',
      })
      const data = await response.json()
      logger.debug(`Fetched song selection list ${JSON.stringify(data)}`)

      if (!response.ok) {
        logger.debug(`Failed to fetch song selection list ${JSON.stringify(data)}`)
        throw new Error(`Failed to fetch song selection list ${JSON.stringify(data)}`)
      }

      songSelectionList.value = data
    } catch (err) {
      const error = err as Error
      logger.debug(`Failed to fetch song selection list ${error.message}`)
      throw new Error(`Failed to fetch song selection list ${error.message}`)
    }
  }

  async function fetchAllSongList() {
      try {
        const response = await fetch(`${url}/api/songs`, {
          credentials: 'include',
        })
        const data = await response.json()
        logger.debug(`Fetched song selection list ${JSON.stringify(data)}`)

        if (!response.ok) {
          logger.debug(`Failed to fetch song selection list ${JSON.stringify(data)}`)
          throw new Error(`Failed to fetch song selection list ${JSON.stringify(data)}`)
        }

        songSelectionList.value.songs = data.map((song: any) => ({songId: song.id, songTitle: song.title}))
      } catch (err) {
        const error = err as Error
        logger.debug(`Failed to fetch song selection list ${error.message}`)
        throw new Error(`Failed to fetch song selection list ${error.message}`)
      }

  }

  return {
    songSelectionList,
    fetchSongSelectionList,
    fetchAllSongList,
  }
})
