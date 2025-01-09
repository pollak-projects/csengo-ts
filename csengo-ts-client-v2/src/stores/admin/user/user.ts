import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useUserStore = defineStore('user', () => {
  const logger = serviceLogger('userStore')
  const url = import.meta.env.VITE_API_URL

  const users = ref([
    {
      id: '',
      username: 'nincs adat',
      email: 'nincs adat',
      role: 'nincs adat',
      kreta: {
        om: 'nincs adat',
        name: 'nincs adat',
      },
    },
  ])

  const searchQuery = ref('')

  const filteredUsers = computed(() => {
    return searchQuery.value
      ? users.value.filter((item) =>
          item.kreta.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
        )
      : users.value
  })

  async function fetchUsers() {
    logger.verbose('Fetching all users')
    try {
      const response = await fetch(`${url}/api/users`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await response.json()
      if(!response.ok) {
        logger.error(`Error fetching all users: ${data.message}`)
        throw new Error(`Error fetching all users: ${data.message}`)
      }

      users.value = data
      logger.verbose(`${JSON.stringify(data)}`)
      logger.verbose('Successfully fetched all users')
    } catch (error) {
      logger.error(`Error fetching all users: ${error}`)
      throw new Error(`Error fetching all users: ${error}`)
    }
  }

  return {
    users,
    searchQuery,
    filteredUsers,
    fetchUsers,
  }
})
