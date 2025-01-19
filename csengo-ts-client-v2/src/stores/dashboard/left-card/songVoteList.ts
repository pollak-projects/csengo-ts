import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useSongVoteListStore = defineStore('songVoteList', () => {
  const logger = serviceLogger('songVoteListStore')
  const url = import.meta.env.VITE_API_URL
  const songVotesInSession = ref({
    sessionId: '',
    songs: [
      {
        songId: '',
        songTitle: '',
        voteCount: 0
      }
    ]
  })

  async function fetchSongVotesInSession() {
    try {
      const response = await fetch(`${url}/api/tv/session`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      logger.debug(`Fetched song votes in session: ${JSON.stringify(data)}`)

      if (!response.ok) {
        logger.debug(`Failed to get song votes in session: ${data.message}`)
        throw new Error(`Failed to get song votes in session: ${data.message}`)
      }

      const sortedSongs = data.songs.sort((a: { voteCount: number }, b: { voteCount: number }) => b.voteCount - a.voteCount).slice(0, 3)

      songVotesInSession.value = {
        ...data,
        songs: sortedSongs
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.debug(`Error fetching song votes in session: ${error.message}`)
        throw new Error(`Failed to get song votes in session: ${error.message}`)
      }
    }
  }

  return {
    songVotesInSession,
    fetchSongVotesInSession
  }
})
