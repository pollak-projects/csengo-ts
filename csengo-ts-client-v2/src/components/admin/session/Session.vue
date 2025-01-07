<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { emit } from '@/utils/eventBus.util'
import type { Session } from '@/types/session'
import { useSessionStore } from '@/stores/admin/session/session'
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'

const props = defineProps<{
  session: Session
}>()

const store = useSessionStore()
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

function openView(session: Session) {
  emit('openView', session)
}

function openEdit(session: Session) {
  emit('openEdit', session)
}

async function handleDeleteSession() {
  try {
    await store.deleteSessionById(props.session.id)
    emit('updateSessionList')
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
}

function formatDateTime(dateString: string): string {
  // Super robust time formatting
  if (dateString === '' || dateString === 'nincs adat') return 'Nincs adat'
  const date = new Date(dateString).toISOString()
  return `${date.slice(0, 10)} ${date.slice(11, 19)}`
}

</script>

<template>
  <tr>
    <td>
      {{ props.session.start ? formatDateTime(props.session.start) : 'Nincs adat' }}
    </td>
    <td>
      {{ props.session.end ? formatDateTime(props.session.end) : 'Nincs adat' }}
    </td>
    <td>
      <button class="view-button" @click="openView(props.session)">
        Megtekintés
      </button>
    </td>
    <td>
      <button class="edit-button">
        <SvgIcon type="mdi" :path="mdiPencil" @click="openEdit(props.session)" class="icon" />
      </button>
    </td>
    <td>
      <button class="delete-button" @click="handleDeleteSession">
        <SvgIcon type="mdi" :path="mdiDelete" class="icon" />
      </button>
    </td>
  </tr>
</template>

<style scoped lang="sass">
*
  color: black
  margin: 0
  padding: 0
  box-sizing: border-box

td
  align-items: center
  padding: 3px

.edit-button,
.delete-button
  padding: 5px
  width: 40px
  height: 40px
  border: none
  border-radius: 10px
  transition: all 0.2s ease-in-out

.view-button
  font-family: 'Anta', serif
  color: white
  font-size: 1.3rem
  padding: 5px 15px
  border-radius: 10px
  background-color: #3883d9
  transition: all 0.2s ease-in-out

.edit-button
  background-color: #FF00D0

.delete-button
  background-color: #B61431

.view-button:hover,
.edit-button:hover,
.delete-button:hover
  transform: scale(1.1)
  cursor: pointer

.view-button:hover
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

.view-button:hover .icon,
.edit-button:hover .icon,
.delete-button:hover .icon
  transform: scale(1.1)

</style>
