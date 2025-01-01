import { defineStore } from 'pinia'
import serviceLogger from '@/utils/logger.custom.util'
import { useCookies } from '@vueuse/integrations/useCookies'

export const useLoginStore = defineStore('login', () => {
  const url = import.meta.env.VITE_API_URL
  const isTestEnvironment = import.meta.env.VITE_TEST === 'true';
  const domain = import.meta.env.VITE_COOKIE_DOMAIN;
  const logger = serviceLogger('useLoginStore');

  const cookies = useCookies()
  const router = useRouter()

  async function fetchLogin(credentials: { username: string, password: string }) {
    try {
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      logger.debug('Response:', data)

      cookies.set('token', data.access_token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        secure: !isTestEnvironment,
        domain,
        sameSite: 'none'
      })
      await router.push('/')
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }

  return {
    fetchLogin
  }
})
