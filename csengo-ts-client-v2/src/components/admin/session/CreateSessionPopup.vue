<script setup lang="ts">
import { useCreateSessionPopupStore } from '@/stores/admin/session/createSessionPopup'
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { emit, on } from '@/utils/eventBus.util'

const store = useCreateSessionPopupStore()
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const dropdownOpen = ref(false)

const isCreating = defineModel('isCreating', {
  type: Boolean,
  default: false
})

function closeCreate() {
  isCreating.value = false
  store.session = {
    songIds: [],
    start: '',
    end: '',
  }
}

async function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  await updateSongsInDropDown()
}

async function updateSongsInDropDown() {
  if (store.songs !== null) {
    return
  }
  try {
    await store.fetchAllSongs()
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
}


async function create() {
  try {
    await store.uploadSession()
    emit('updateSessionList')
    store.session = {
      songIds: [''],
      start: '',
      end: '',
    }
    closeCreate()
    triggerToast('Sikeres szavazás létrehozás', ToastEnum.Success)
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
}

const truncatedTitle = (name) => {
  const maxLength = 15;
  const title = name;
  return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
};

onMounted(async () => {
  await updateSongsInDropDown()
  on('updateSongList', async () => {
    await updateSongsInDropDown()
  })
})

</script>

<template>
  <div class="overlay">
    <div class="create-card">
      <h2>Szavazás létrehozása</h2>
      <form @submit.prevent="">

        <label for="startDate">Kezdő dátum:</label>
        <input id="startDate" v-model="store.session.start" type="datetime-local" required />

        <label for="endDate">Befejező dátum:</label>
        <input id="endDate" v-model="store.session.end" type="datetime-local" required />

        <label for="songDropdown">Válasszon zenéket:</label>
        <div class="dropdown">
          <button type="button" @click="toggleDropdown" class="dropdown-button">
            Zenék kiválasztása
          </button>
          <ul v-if="dropdownOpen" class="dropdown-menu">
            <li v-for="song in store.songs" :key="song.id">
              <input type="checkbox" :id="`${song.id}`" :value="`${song.id}`" v-model="store.session.songIds" />
              <label :for="`song-${song.id}`">{{ truncatedTitle(song.title) }}</label>
            </li>
          </ul>
        </div>

        <button type="submit" @click="create">Létrehozás</button>
        <button type="button" @click="closeCreate">Mégse</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="sass">
*
  color: black
  margin: 0
  padding: 0
  box-sizing: border-box

/* This is the overlay for the popups */
.overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: rgba(0, 0, 0, 0.5)
  display: flex
  justify-content: center
  align-items: center
  z-index: 1000

/* These are the styles for the create popup */
.create-card
  background-color: white
  padding: 20px
  border-radius: 10px
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)
  text-align: center
  width: 300px
  max-height: 500px

.create-card h2
  margin-bottom: 20px
  font-size: 1.5rem

.create-card form
  display: flex
  flex-direction: column
  gap: 3px

.create-card input,
.create-card button
  font-family: 'Anta'
  background-color: white
  width: 100%
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none

.create-card button
  border-radius: 5px
  cursor: pointer
  transition: background-color 0.3s ease-in-out

.create-card input
  border-bottom: 4px solid black

.create-card input:focus
  outline: none

.create-card button[type="submit"]
  background-color: #4caf50
  color: white

.create-card button[type="button"]
  background-color: #f44336
  color: white

.create-card button[type="submit"]:hover
  background-color: #358b38

.create-card button[type="button"]:hover
  background-color: #be2e24

.dropdown
  position: relative

.dropdown-button
  padding: 10px
  background-color: #3883d9 !important
  color: white
  border: none
  border-radius: 5px
  cursor: pointer

.dropdown-menu
  position: absolute
  top: 100%
  left: 0
  background-color: white
  border: 1px solid #ccc
  border-radius: 5px
  list-style: none
  padding: 10px
  z-index: 1000
  scrollbar-width: none
  overflow-x: auto
  max-height: 200px

.dropdown-menu li
  width: 230px
  display: flex
  margin-bottom: 5px

.dropdown-menu input
  width: 30px
  margin-right: 20px

@media (max-height: 600px)
  .dropdown-menu
    max-height: 130px
</style>
