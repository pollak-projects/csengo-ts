import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'
import { ref } from 'vue'

export const usePlaySongStore = defineStore('playSong', () => {
  const logger = serviceLogger('playSongStore')
  const url = import.meta.env.VITE_API_URL
  const song = ref({
    songId: '',
    audio: new Audio(),
  })

  const newSongRequest = ref(false)

  async function fetchSong() {
    try {
      const response = await fetch(`${url}/api/songs/audio?id=${song.value.songId}`, {
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



  return {
    song,
    newSongRequest,
    fetchSong,
  }
})
