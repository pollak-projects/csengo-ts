import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'
import { ref } from 'vue'

export const useCreateSessionPopupStore = defineStore('createSessionPopup', () => {
  const logger = serviceLogger('createSessionPopupStore')
  const url = import.meta.env.VITE_API_URL

  const session = ref({
    songIds: [],
    start: '',
    end: ''
  })

  const songs = ref<[{
    id: '',
    title: '',
    createdAt: '',
    updatedAt: '',
  }] | null>(null)

  async function fetchAllSongs() {
    try {
      const response = await fetch(`${url}/api/songs`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        logger.error(`Error fetching songs: ${data.message}`)
        throw new Error(`Error fetching songs: ${data.message}`)
      }
      songs.value = data
    } catch (error) {
      const e = error as Error
      logger.error(`Error fetching songs: ${e.message}`)
      throw new Error(`Error fetching songs: ${e.message}`)
    }
  }

  async function uploadSession() {
    session.value.start = new Date(session.value.start).toISOString()
    session.value.end = new Date(session.value.end).toISOString()
    try {
      const response = await fetch(`${url}/api/voting-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session.value),
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        logger.error(`Failed to create session: ${data.message}`)
        throw new Error(`Failed to create session: ${data.message}`)
      }
    } catch (e) {
      logger.error(`Failed to create session: ${e}`)
      throw new Error(`Failed to create session: ${e}`)
    }
  }

  return {
    session,
    songs,
    uploadSession,
    fetchAllSongs
  }
})
