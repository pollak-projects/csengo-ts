import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useUpdateSongPopupStore = defineStore('updateSongPopup', () => {
  const logger = serviceLogger('updateSongPopupStore')
  const url = import.meta.env.VITE_API_URL

  const newTitle = ref('')

  async function updateSongName(songId: string) {
    try {
      const response = await fetch(`${url}/api/songs?id=${songId}&name=${newTitle.value}`, {
        method: 'PUT',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(`Failed to rename song ${data.message}`)
      }
    } catch (err) {
      const error = err as Error
      logger.error(`Error renaming song: ${error.message}`)
      throw new Error(`Error renaming song: ${error.message}`)
    }
  }

  return {
    newTitle,
    updateSongName
  }
})
