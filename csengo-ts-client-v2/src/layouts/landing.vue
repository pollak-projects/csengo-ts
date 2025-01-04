<script setup lang="ts">
import WelcomeSign from '@/components/dashboard/WelcomeSign.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useJwt } from '@vueuse/integrations/useJwt'
import { RoleEnum } from '@/types/role.enum.d'
import type { JwtPayload } from 'csengoJwt'

const isWindowSizeEnough = ref(true)

function checkWindowSize() {
  isWindowSizeEnough.value = window.innerWidth >= 315 && window.innerHeight >= 315
}

onMounted(() => {
  checkWindowSize()
  window.addEventListener('resize', checkWindowSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkWindowSize)
})

const isDropdownVisible = ref(false)

function toggleDropdown() {
  isDropdownVisible.value = !isDropdownVisible.value
}

const router = useRouter()
const isAdmin = ref(false)

function navigateToAdmin() {
  router.push('/admin')
}

const cookies = useCookies()
function logout() {
  cookies.remove('token', {
    secure: true,
    domain: import.meta.env.VITE_COOKIE_DOMAIN,
    sameSite: 'none'
  })
  router.push('/login')
}

onMounted(() => {
  const jwtToken = cookies.get('token')
  const { payload } = useJwt(jwtToken)
  const token: JwtPayload | null = payload.value as JwtPayload | null
  isAdmin.value = token!.roles.some((role) => role === RoleEnum.Admin)
})
</script>

<template>
  <div class="main-container background-image">
    <div v-if="isWindowSizeEnough">
      <div class="header">
        <div>
          <div class="title">
            <span class="pollak">POLLÁK</span>
            <span class="csengo">CSENGŐ</span>
          </div>
          <WelcomeSign />
        </div>
        <div class="user-icon" @click="toggleDropdown">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="48px" height="48px">
            <path
              d="M12 2C9.79 2 8 3.79 8 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8 2.24-8 5v3h16v-3c0-2.76-3.59-5-8-5z" />
          </svg>
          <div v-if="isDropdownVisible" class="dropdown-menu">
            <button v-if="isAdmin" class="dropdown-item" @click="navigateToAdmin">Admin</button>
            <button class="dropdown-item" @click="logout">Kijelentkezés</button>
          </div>
        </div>
      </div>
      <router-view />
    </div>
    <div v-else class="centered-message">
      <h3>Ez az oldal nem megtekinthető ekkora kijelzőn</h3>
    </div>
  </div>
</template>

<style scoped lang="sass">
.background-image
  background: url('../assets/background.jpg') no-repeat center center fixed
  background-size: cover

.centered-message
  font-family: 'Anta'
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  color: #fff

.main-container
  height: 100%
  position: relative

.header
  position: absolute
  top: 10px
  left: 10px
  right: 30px
  display: flex
  justify-content: space-between
  align-items: flex-start
  font-family: 'Anta'
  color: white
  padding-left: 20px
  padding-top: 20px

.title
  display: flex
  gap: 5px

.pollak
  font-size: 2rem
  font-weight: bold

.csengo
  font-size: 2rem
  font-weight: bold
  color: red

.user-icon
  width: 48px
  height: 48px
  position: relative
  cursor: pointer

.dropdown-menu
  z-index: 10000
  position: absolute
  top: 60px
  right: 0
  background-color: rgba(0, 0, 0, 0.8)
  color: white
  padding: 10px
  border-radius: 5px
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1)
  display: flex
  flex-direction: column

.dropdown-item
  background: transparent
  border: none
  color: white
  padding: 8px 16px
  text-align: left
  cursor: pointer
  font-size: 1rem
  transition: background 0.3s ease

.dropdown-item:hover
  background: rgba(255, 255, 255, 0.1)

.card-body p
  font-size: 1.2rem
  margin: 0

@media (max-width: 1300px)
  .pollak, .csengo
    font-size: 1.5rem

  .welcome
    font-size: 1rem

  .user-icon
    width: 32px
    height: 32px
</style>
