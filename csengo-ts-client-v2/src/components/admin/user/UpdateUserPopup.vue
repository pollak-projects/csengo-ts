<script setup lang="ts">
import { emit } from '@/utils/eventBus.util'
import { inject, onMounted } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { useUpdateUserPopupStore } from '@/stores/admin/user/updateUserPopup'

const isEditing = defineModel('isEditing', { type: Boolean, default: false })

const store = useUpdateUserPopupStore()

const { triggerToast } = inject('toast') as {
  triggerToast: (message: string, type: ToastEnum) => void
}

const props = defineProps<{
  user: {
    id: ''
    username: ''
    email: ''
    role: ''
    kreta: {
      om: ''
      name: ''
    }
  }
}>()

function closeEdit() {
  store.newPassword = ''
  store.newRole = ''
  isEditing.value = false
}

async function edit() {
  try {
    await store.updateUser(props.user.id)
    triggerToast('Sikeres átnevezés', ToastEnum.Success)
    emit('updateUserList')
    closeEdit()
  } catch (error) {
    const err = error as Error
    triggerToast(`Error renaming: ${err.message}`, ToastEnum.Error)
  }
}

onMounted(async () => {
  store.newRole = props.user.role
})
</script>

<template>
  <div class="overlay">
    <div class="edit-card">
      <h2>Szerkesztés</h2>
      <form @submit.prevent="">
        <input
          id="name"
          v-model="store.newPassword"
          type="text"
          placeholder="Adja meg az uj jelszót"
        />
        <select v-model="store.newRole" class="dropdown">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <button type="submit" @click="edit">Szerkesztés</button>
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

.dropdown
  text-align: center
  color: black
  border: 2px black solid
  border-radius: 5px
</style>
