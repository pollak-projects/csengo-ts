import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useSessionStore = defineStore('session', () => {
  const logger = serviceLogger('session')
  const url = import.meta.env.VITE_API_URL

  async function deleteSessionById(sessionId: string) {
    try {
      const response = await fetch(`${url}/api/voting-sessions?id=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(`Error deleting session: ${data.message}`)
      }
    } catch (error) {
      const e = error as Error
      logger.error(`Error deleting session: ${e.message}`)
      throw new Error(`Error deleting session: ${e.message}`)
    }
  }

  return {
    deleteSessionById,
  }
})
