// Utilities
import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useUploadInputStore = defineStore('uploadInput', () => {
  const logger = serviceLogger('uploadInputStore')

  const url = ref<string>('')

  const file = ref<File | null>(null)

  function setUrl(newUrl: string) {
    url.value = newUrl
  }

  function setFile(newFile: File) {
    file.value = newFile
  }

  async function uploadFile() {
    const body = new FormData()
    body.append('file', file.value as Blob)
    body.append('title', file.value?.name as string)

    try {
      const response = await fetch(url.value, {
        method: 'POST',
        body,
        credentials: 'include'
      })
      file.value = null
      const data = await response.json()
      logger.debug(`File uploaded: ${JSON.stringify(response)}`)
      if (!response.ok) {
        throw new Error(data.message)
      }
    } catch (error) {
      const err = error as Error
      throw new Error(`Failed to upload file: ${err.message}`)
    }

  }

  return {
    file,
    uploadFile,
    setUrl,
    setFile
  }
})
