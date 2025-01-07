<script setup lang="ts">
import { useCreateSongPopupStore } from '@/stores/admin/song/createSongPopup'
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { emit } from '@/utils/eventBus.util'

const isCreating = defineModel('isCreating', { type: Boolean, default: false })

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const store = useCreateSongPopupStore()

const closeCreate = () => {
  isCreating.value = false
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    store.song.file = target.files[0]
    triggerToast('File added successfully', ToastEnum.Success)
  } else {
    triggerToast('Please select a file', ToastEnum.Error)
  }
}

async function createSong() {
  try {
    await store.uploadSong()
    triggerToast('Song created successfully', ToastEnum.Success)
    emit('updateSongList')
    closeCreate()
  } catch (error) {
    const err = error as Error
    triggerToast(`Error creating song ${err.message}`, ToastEnum.Error)
  }
}

</script>

<template>
  <div class="overlay">
    <div class="create-card">
      <h2>Hang létrehozása</h2>
      <form @submit.prevent="">
        <input id="name" v-model="store.song.title" type="text" placeholder="Adja meg a nevet" />

        <div v-if="store.song.file.name" class="file-name">{{ store.song.file.name }}</div>
        <input id="sound" type="file" accept=".mp3" @change="handleFileChange" class="hidden-input" />
        <label for="sound" class="file-upload-button">Válasszon fájlt</label>

        <button type="submit" @click="createSong">Létrehozás</button>
        <button type="button" @click="closeCreate">Mégse</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="sass">
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

.create-card h2
  margin-bottom: 20px
  font-size: 1.5rem

.create-card form
  display: flex
  flex-direction: column
  gap: 10px

.create-card input::placeholder
  text-align: center

.create-card input
.create-card button
  font-family: 'Anta', serif
  background-color: white
  width: 250px
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
  color: black

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

.hidden-input
  display: none

.file-upload-button
  font-family: 'Anta', serif
  background-color: #3883d9
  color: white
  width: 250px
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none
  border-radius: 5px
  cursor: pointer
  transition: background-color 0.3s ease-in-out

.file-upload-button:hover
  background-color: #2a64a6

</style>
