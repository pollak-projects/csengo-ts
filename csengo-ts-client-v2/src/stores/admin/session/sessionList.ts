import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'
import { computed, ref } from 'vue'

export const useSessionListStore = defineStore('sessionList', () => {
  const logger = serviceLogger('previousWinnerStore')
  const url = import.meta.env.VITE_API_URL
  const sessionList = ref([{
    id: '',
    songNames: [''],
    start: '',
    end: '',
    createdAt: '',
    updatedAt: '',
    songs: [{
      id: '',
      title: '',
      createdAt: '',
      updatedAt: '',
      songBucketId: ''
    }],
    Vote: [{
      id: '',
      userId: '',
      songId: '',
      sessionId: '',
      createdAt: '',
      updatedAt: ''
    }]
  }])

  const searchQuery = ref('')

  const filteredSessions = computed(() => {
    return searchQuery.value
      ? sessionList.value.filter(item =>
        item.id.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      : sessionList.value
  })

  async function fetchAllSessions() {
    logger.verbose('Fetching all sessions')
    try {
      const response = await fetch(`${url}/api/voting-sessions`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 404) {
          sessionList.value = [
            {
              id: '',
              songNames: [''],
              start: '',
              end: '',
              createdAt: '',
              updatedAt: '',
              songs: [{
                id: '',
                title: '',
                createdAt: '',
                updatedAt: '',
                songBucketId: ''
              }],
              Vote: [{
                id: '',
                userId: '',
                songId: '',
                sessionId: '',
                createdAt: '',
                updatedAt: ''
              }]
            }
          ]
          return
        }
        logger.error(`Error fetching all sessions: ${data.message}`)
        throw new Error(`Error fetching all sessions: ${data.message}`)
      }

      sessionList.value = data
      logger.verbose('Successfully fetched all sessions')
    } catch (error) {
      logger.error(`Error fetching all sessions: ${error}`)
      throw new Error(`Error fetching all sessions: ${error}`)
    }
  }

  return {
    searchQuery,
    sessionList,
    filteredSessions,
    fetchAllSessions,
  }
})
