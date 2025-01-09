import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useCreateSongPopupStore = defineStore('crateSongPopup', () => {
  const logger = serviceLogger('createSongPopupStore')
  const url = import.meta.env.VITE_API_URL

  const song = ref({
    title: '',
    file: new File([], '', { type: '' })
  })

  async function uploadSong() {
    const body = new FormData()
    body.append('file', song.value.file as Blob)
    body.append('title', song.value.title)

    try {
      const response = await fetch(`${url}/api/songs/audio/direct`, {
        method: 'POST',
        body,
        credentials: 'include'
      })
      const data = await response.json()
      logger.debug(`File uploaded: ${JSON.stringify(response)}`)
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${data.message}`)
      }
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`)
    }

  }

  return {
    song,
    uploadSong,
  }
})
