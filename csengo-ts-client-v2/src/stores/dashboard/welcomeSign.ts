// Utilities
import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useWelcomeSignStore = defineStore('welcomeSign', () => {
  const logger = serviceLogger('WelcomeSignStore')
  const url = import.meta.env.VITE_API_URL

  async function fetchFullName() {
    try {
      const response = await fetch(`${url}/api/users/real-name`, {
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error(`Error fetching name: ${data.message}`)
        throw new Error(`Error fetching name: ${data.message}`)
      }

      return data.realName
    } catch (error) {
      logger.error(`Error catch fetching name: ${error}`)
      throw new Error(`Error catch fetching name: ${error}`)
    }
  }

  return {
    fetchFullName
  }
})
