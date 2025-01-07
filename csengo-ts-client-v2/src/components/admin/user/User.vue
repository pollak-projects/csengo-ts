<script setup lang="ts">
import { mdiPencil } from '@mdi/js'
import SvgIcon from '@jamescoyle/vue-icon'
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { emit } from '@/utils/eventBus.util'

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

const isEditing = defineModel('isEditing', {
  type: Boolean,
  default: false,
})

const { triggerToast } = inject('toast') as {
  triggerToast: (message: string, type: ToastEnum) => void
}

function openEdit(user: { id: '' }) {
  isEditing.value = true
  emit('openEdit', user)
}
</script>

<template>
  <tr>
    <td>{{ props.user.username }}</td>
    <td>{{ props.user.kreta.name }}</td>
    <td>{{ props.user.email }}</td>
    <td>{{ props.user.kreta.om }}</td>
    <td>{{ props.user.role }}</td>
    <td>
      <button class="edit-button" @click="openEdit(props.user)">
        <SvgIcon type="mdi" :path="mdiPencil" class="icon" />
      </button>
    </td>
  </tr>
</template>

<style scoped lang="sass">
td
  align-items: center
  padding: 3px

.play-button,
.edit-button,
.delete-button
  padding: 5px
  width: 40px
  height: 40px
  border: none
  border-radius: 10px
  transition: all 0.2s ease-in-out

.play-button
  background-color: #2A73C5

.edit-button
  background-color: #FF00D0

.delete-button
  background-color: #B61431

.play-button:hover
.edit-button:hover
.delete-button:hover
  transform: scale(1.1)
  cursor: pointer

.play-button:hover
  background-color: #1c5b8a

.edit-button:hover
  background-color: #b40193

.delete-button:hover
  background-color: #9e0b26

.icon
  color: white
  width: 30px
  height: 30px
  transition: all 0.2s ease-in-out

.play-button:hover .icon
.edit-button:hover .icon
.delete-button:hover .icon
  transform: scale(1.1)
</style>
