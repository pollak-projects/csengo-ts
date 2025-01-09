import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'
import { computed, ref } from 'vue'

export const usePendingSongListStore = defineStore('pendingSongs', () => {
  const logger = serviceLogger('playSongStore')
  const url = import.meta.env.VITE_API_URL
  const pendingSongs = ref([
    {
      id: '',
      title: 'nincs adat',
      uploadedBy: {
        kreta: {
          name: 'nincs adat'
        }
      },
      createdAt: 'nincs adat',
      updatedAt: '',
      songBucketId: ''
    }
  ])

  const searchQuery = ref('')

  const filteredSongs = computed(() => {
    return searchQuery.value ? pendingSongs.value.filter((item) => item.title.toLowerCase().includes(searchQuery.value.toLowerCase())) : pendingSongs.value
  })

  async function fetchAllPendingSongs() {
    try {
      const response = await fetch(`${url}/api/pending-songs`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 404) {
          pendingSongs.value = [
            {
              id: '',
              title: 'nincs adat',
              uploadedBy: {
                kreta: {
                  name: 'nincs adat'
                }
              },
              createdAt: 'nincs adat',
              updatedAt: '',
              songBucketId: ''
            }
          ]
          return
        }
        logger.error(`Error fetching songs: ${data.message}`)
        throw new Error(`Error fetching songs: ${data.message}`)
      }
      pendingSongs.value = data
    } catch (error) {
      const e = error as Error
      logger.error(`Data: ${JSON.stringify(e)}`)
      logger.error(`Error fetching songs: ${e.message}`)
      throw new Error(`Error fetching songs: ${e.message}`)
    }
  }

  return {
    pendingSongs,
    searchQuery,
    filteredSongs,
    fetchAllPendingSongs
  }
})
