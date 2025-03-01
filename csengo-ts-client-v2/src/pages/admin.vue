<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiHome } from '@mdi/js'

import PendingSongList from '@/components/admin/pending-song/PendingSongList.vue'
import SongList from '@/components/admin/song/SongList.vue'
import SessionList from '@/components/admin/session/SessionList.vue'
import Download from '@/components/admin/Download.vue'
import UserList from '@/components/admin/user/UserList.vue'
import { useCookies } from '@vueuse/integrations/useCookies'

const isWindowSizeEnoguh = ref(true)
const currentComponent = ref(SongList)
const isMobileMenuOpen = ref(false)
const isMobile = ref(false)

const componentsMap = {
  SongList,
  PendingSongList,
  SessionList,
  UserList,
  Download,
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 1156
  isWindowSizeEnoguh.value = window.innerWidth >= 300 && window.innerHeight >= 460
}

onMounted(() => {
  isMobile.value = window.innerWidth <= 1156
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const isDropdownVisible = ref(false)

function toggleDropdown() {
  isDropdownVisible.value = !isDropdownVisible.value
}

const router = useRouter()
function logout() {
  const cookies = useCookies()
  cookies.remove('token', {
    secure: true,
    domain: import.meta.env.VITE_COOKIE_DOMAIN,
    sameSite: 'none',
  })
  router.push('/login')
}
</script>

<template>
  <div v-if="isWindowSizeEnoguh" class="home-bg">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <button class="hamburger-menu" @click="isMobileMenuOpen = !isMobileMenuOpen">
            &#9776;
          </button>
          <RouterLink v-if="!isMobileMenuOpen && !isMobile" to="/">
            <SvgIcon type="mdi" :path="mdiHome" class="navbar-icon" />
          </RouterLink>
        </div>

        <div v-if="!isMobileMenuOpen && !isMobile" class="navbar-center">
          <button class="navbar-link" @click="currentComponent = componentsMap.SongList">
            Zenék
          </button>
          <button class="navbar-link" @click="currentComponent = componentsMap.PendingSongList">
            Zene kérelmek
          </button>
          <button class="navbar-link" @click="currentComponent = componentsMap.SessionList">
            Szavazások
          </button>
          <button class="navbar-link" @click="currentComponent = componentsMap.UserList">
            Felhasználók
          </button>
          <button class="navbar-link" @click="currentComponent = componentsMap.Download">
            Egyebek
          </button>
        </div>

        <div class="navbar-right">
          <SvgIcon type="mdi" :path="mdiAccount" class="navbar-icon" @click="toggleDropdown" />
          <!-- Lenyíló menü -->
          <div v-if="isDropdownVisible" class="dropdown-menu">
            <button class="dropdown-item" @click="logout">Kijelentkezés</button>
          </div>
        </div>
      </div>

      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <RouterLink to="/" class="navbar-link" @click="isMobileMenuOpen = false">Home</RouterLink>
        <button class="navbar-link" @click="
          currentComponent = componentsMap.SongList;
        isMobileMenuOpen = false
          ">
          Zenék
        </button>
        <button class="navbar-link" @click="
          currentComponent = componentsMap.PendingSongList;
        isMobileMenuOpen = false
          ">
          Zene kérelmek
        </button>
        <button class="navbar-link" @click="
          currentComponent = componentsMap.SessionList;
        isMobileMenuOpen = false
          ">
          Szavazások
        </button>
        <button class="navbar-link" @click="
          currentComponent = componentsMap.UserList;
        isMobileMenuOpen = false
          ">
          Felhasználók
        </button>
        <button class="navbar-link" @click="
          currentComponent = componentsMap.Download;
        isMobileMenuOpen = false
          ">
          Egyebek
        </button>
      </div>
    </nav>

    <div class="content-body">
      <component :is="currentComponent"></component>
    </div>
  </div>
  <div v-else class="centered-message">
    <h3>Ez az oldal nem megtekinthető ekkora kijelzőn</h3>
  </div>
</template>

<style scoped lang="sass">
@import url('https://fonts.googleapis.com/css2?family=Anta&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap')

.centered-message
  font-family: 'Anta'
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  color: #fff

*
  font-family: 'Anta'

h1
  font-size: 3rem
  margin-bottom: 20px

h2
  font-size: 2rem

.home-bg
  background-color: white
  min-height: 100vh
  display: flex
  flex-direction: column

.navbar
  background-color: white
  color: black
  padding: 16px
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3)
  display: flex
  align-items: center
  position: sticky
  top: 0
  z-index: 10

.navbar-container
  display: flex
  justify-content: space-between
  align-items: center
  width: 100%

.navbar-right
  margin-right: 20px

.navbar-left
.navbar-center
.navbar-right
  display: flex
  align-items: center

.navbar-center
  margin-left: 20px
  gap: 20px

.hamburger-menu
  display: none
  font-size: 24px
  background: none
  border: none
  color: black
  cursor: pointer

.navbar-icon
  width: 40px
  height: 40px
  color: black
  cursor: pointer
  transition: color 0.3s, transform 0.3s

.navbar-icon:hover
  transform: scale(1.2)
  color: #3883d9

.menu-items
  display: flex
  flex-direction: row
  gap: 20px

.navbar-link
  color: black
  text-decoration: none
  padding: 8px 16px
  border: none
  font-size: 1.5rem
  font-weight: 500
  transition: color 0.3s
  background-color: rgba(255, 255, 255, 0.5)
  cursor: pointer

.navbar-link:hover
  color: #3883d9

.user-button
  background-color: rgba(255, 255, 255, 0.5)
  color: #fff
  border: none
  padding: 10px 20px
  border-radius: 6px
  cursor: pointer
  font-weight: 600
  display: flex
  justify-content: center
  align-items: center
  gap: 12px
  transition: background-color 0.3s

.mobile-menu
  display: none
  position: absolute
  top: 60px
  left: 0
  background-color: white
  width: 100%
  padding: 16px
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1)
  border-radius: 6px
  display: flex
  flex-direction: column
  gap: 10px

.mobile-menu .navbar-link
  width: 100%
  text-align: center
  padding: 10px 20px
  border-radius: 6px
  font-weight: 600
  transition: color 0.3s

.mobile-menu .navbar-link:hover
  color: #3883d9

.dropdown-menu
  position: absolute
  top: 60px
  right: 40px
  background-color: rgba(0, 0, 0, 0.8)
  color: white
  padding: 10px
  border-radius: 5px
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

.content-body
  height: 90vh
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

@media (max-width: 1156px)
  .hamburger-menu
    display: block

  .navbar-center
  .navbar-left>.navbar-link
    display: none

  .mobile-menu
    display: flex

  .menu-items
    display: none
</style>
