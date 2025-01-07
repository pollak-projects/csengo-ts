<script setup lang="ts">
import { emit, on } from '@/utils/eventBus.util'
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { useUpdateSongPopupStore } from '@/stores/admin/song/updateSongPopup'

const isEditing = defineModel('isEditing', { type: Boolean, default: false })

const store = useUpdateSongPopupStore()

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const props = defineProps<{
  song: {
    id: '',
    title: '',
    createdAt: '',
    updatedAt: ''
  }
}>()



function closeEdit() {
  isEditing.value = false;
}

async function rename() {
  try {
    await store.updateSongName(props.song.id)
    triggerToast('Sikeres átnevezés', ToastEnum.Success)
    emit('updateSongList')
    closeEdit()
  } catch (error) {
    const err = error as Error
    triggerToast(`Error renaming: ${err.message}`, ToastEnum.Error)
  }
}

</script>

<template>
  <div class="overlay">
    <div class="edit-card">
      <h2>Átnevezés</h2>
      <form @submit.prevent="">
        <input id="name" v-model="store.newTitle" type="text" placeholder="Adja meg a nevet" />

        <button type="submit" @click="rename">Átnevezés</button>
        <button type="button" @click="closeEdit()">Mégse</button>
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

/* These are the style for the edit popup */
.edit-card
  background-color: white
  padding: 20px
  border-radius: 10px
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)
  text-align: center
  width: 300px

.edit-card h2
  margin-bottom: 20px
  font-size: 1.5rem

.edit-card form
  display: flex
  flex-direction: column
  gap: 10px

.edit-card input::placeholder
  text-align: center

.edit-card input
.edit-card button
  font-family: 'Anta', serif
  background-color: white
  width: 250px
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none

.edit-card button
  border-radius: 5px
  cursor: pointer
  transition: background-color 0.3s ease-in-out

.edit-card input
  border-bottom: 4px solid black
  color: black

.edit-card input:focus
  outline: none

.edit-card button[type="submit"]
  background-color: #4caf50
  color: white

.edit-card button[type="button"]
  background-color: #f44336
  color: white

.edit-card button[type="submit"]:hover
  background-color: #358b38

.edit-card button[type="button"]:hover
  background-color: #be2e24



</style>
