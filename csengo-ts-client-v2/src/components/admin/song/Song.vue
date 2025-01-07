<script setup lang="ts">
import { mdiDelete, mdiPause, mdiPencil, mdiPlay } from '@mdi/js'
import SvgIcon from '@jamescoyle/vue-icon'
import { inject, onMounted } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { emit, on } from '@/utils/eventBus.util'
import { useSongStore } from '@/stores/admin/song/song'

const props = defineProps<{
  song: {
    id: '',
    title: '',
    uploadedBy: {
      kreta: {
        name: '',
      }
    },
    createdAt: '',
    updatedAt: '',
  }
}>();

const isEditing = defineModel('isEditing', {
  type: Boolean,
  default: false
})

const store = useSongStore()

const isPlaying = ref(false);
const songAudio = ref<HTMLAudioElement>(new Audio())
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

async function updateSong() {
  if (songAudio.value.duration === 0) {
    return
  }
  try {
    const fetchedSong = await store.fetchSong(props.song.id)
    songAudio.value.src = fetchedSong.src
    songAudio.value.addEventListener('ended', handleAudioEnded)
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
}

async function handleAudioPlayStart() {
  console.log('handleAudioPlayStart');
  emit('stopAllAdminSongs');
  try {
    await updateSong();
    isPlaying.value = true;
    await songAudio.value.play();
    console.log(`Audio play started ${songAudio.value.paused}`);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Audio play aborted by the user agent');
      triggerToast('Audio play aborted by the user agent', ToastEnum.Warning);
    } else {
      const err = error as Error;
      triggerToast(err.message, ToastEnum.Error);
    }
    isPlaying.value = false;
  }
}

function handleAudioPlayStop() {
  songAudio.value.pause()
  songAudio.value.currentTime = 0
  isPlaying.value = false
}

function handleAudioEnded() {
  isPlaying.value = false
}

async function handleDeleteSong() {
  try {
    await store.deleteSongById(props.song.id)
    emit('updateSongList')
    triggerToast('Song deleted successfully', ToastEnum.Success)
  } catch (error) {
    const err = error as Error
    triggerToast(`Error deleting song ${err.message}`, ToastEnum.Error)
  }
}

function openEdit(song: {
  id: '',
  title: '',
  createdAt: '',
  updatedAt: '',
}) {
  isEditing.value = true;
  emit('openEdit', song)
}

function formatDateTime(dateString: string): string {
  // Super robust time formatting
  if (dateString === '' || dateString === 'nincs adat') return 'Nincs adat'
  const date = new Date(dateString).toISOString()
  return `${date.slice(0, 10)} ${date.slice(11, 19)}`
}


onMounted(async () => {
  on('stopAllAdminSongs', () => {
    if (isPlaying.value && songAudio.value) {
      songAudio.value.pause()
      songAudio.value.currentTime = 0
      isPlaying.value = false
    }
  })
})


// onUnmounted(() => {
//   songAudio.value.removeEventListener('ended', handleAudioEnded)
// })
</script>

<template>
  <tr>
    <td>{{ props.song.title }}</td>
    <td>{{ props.song.uploadedBy.kreta.name }}</td>
    <td>{{ formatDateTime(props.song.createdAt) }}</td>
    <td>
      <button class="play-button" @click="isPlaying ? handleAudioPlayStop() : handleAudioPlayStart()">
        <SvgIcon type="mdi" :path="isPlaying ? mdiPause : mdiPlay" class="icon" />
      </button>
      <audio ref="songAudio" />
    </td>
    <td>
      <button class="edit-button" @click="openEdit(props.song)">
        <SvgIcon type="mdi" :path="mdiPencil" class="icon" />
      </button>
    </td>
    <td>
      <button class="delete-button" @click="handleDeleteSong">
        <SvgIcon type="mdi" :path="mdiDelete" class="icon" />
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
