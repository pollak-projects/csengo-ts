import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'

export const useUpdateUserPopupStore = defineStore('updateUserPopup', () => {
  const logger = serviceLogger('updateUserPopupStore')
  const url = import.meta.env.VITE_API_URL

  const newPassword = ref('')
  const newRole = ref('')

  async function updateUser(userId: string) {
    console.log(userId)
    console.log(newPassword.value)
    console.log(newRole.value)

    if (newPassword.value != '') {
      try {
        const response = await fetch(`${url}/api/users`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            password: newPassword.value
          }),
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

    if (newRole.value != '') {
      try {
        const response = await fetch(`${url}/api/users/roles`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            role: newRole.value.toLowerCase()
          }),
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

    newPassword.value = ''
    newRole.value = ''
  }

  return {
    newPassword,
    newRole,
    updateUser
  }
})
