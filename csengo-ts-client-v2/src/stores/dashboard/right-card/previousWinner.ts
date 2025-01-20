import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const usePreviousWinnerStore = defineStore('previousWinner', () => {
  const logger = serviceLogger('previousWinnerStore')
  const url = import.meta.env.VITE_API_URL
  const previousWinner = ref({
    id: '' as string,
    title: '' as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    songBucketId: '' as string,
    songBucket: {
      id: '' as string,
      createdAt: new Date(),
      updatedAt: new Date(),
      path: '' as string
    }
  })

  async function fetchPreviousWinner() {
    try {
      const response = await fetch(`${url}/api/songs/winner`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) {
        logger.error('Error fetching previous winner', data)
        throw new Error(`Error fetching previous winner: ${data.message}`)
      }
      previousWinner.value = data
    } catch (error) {
      logger.error('Error fetching previous winner', error as Error)
      throw new Error(`Error fetching previous winner: ${(error as Error).message}`)
    }
  }

  return {
    previousWinner,
    fetchPreviousWinner
  }
})
