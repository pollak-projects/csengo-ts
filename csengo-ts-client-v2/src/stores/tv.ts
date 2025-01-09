import { defineStore } from 'pinia'
import { ref } from 'vue'
import serviceLogger from '@/utils/logger.custom.util'

export const useTvStore = defineStore('tv', () => {
  const logger = serviceLogger('songVoteListStore');
  const url = import.meta.env.VITE_API_URL;
  const songs = ref([
    { songId: '', songTitle: '', voteCount: 0 }
  ])

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]

    }
    return color
  }

  const colors = ref(songs.value.map(() => getRandomColor()))

  async function fetchSummaryOfVotesInSession() {
    try {
      const response = await fetch(`${url}/api/tv/session`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 404) songs.value = []
        logger.error(`Failed to fetch summary of votes in session: ${data.message}`)
        throw new Error(data.message)
      }
      songs.value = data.songs
      colors.value = songs.value.map(() => getRandomColor())
    } catch (error) {
      logger.error(`Failed to fetch summary of votes in session: ${error}`)
    }
  }


  return {
    songs,
    colors,
    fetchSummaryOfVotesInSession
  }
})
