<script setup lang="ts">
import { mdiCheck, mdiClose, mdiPause, mdiPlay } from '@mdi/js'
import SvgIcon from '@jamescoyle/vue-icon'
import { inject, onMounted } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { emit, on } from '@/utils/eventBus.util'
import { usePendingSongStore } from '@/stores/admin/pending-song/pendingSong'

const props = defineProps<{
  pendingSong: {
    id: '',
    title: '',
    uploadedBy: {
      kreta: {
        name: '',
      }
    },
    createdAt: '',
    updatedAt: '',
    songBucketId: '',
  }
}>();

const store = usePendingSongStore()

const isPlaying = ref(false);
const pendingSongAudio = ref<HTMLAudioElement>(new Audio())
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

async function updatePendingSong() {
  if (pendingSongAudio.value.duration === 0) {
    return
  }
  try {
    const fetchedSong = await store.fetchSong(props.pendingSong.id)
    pendingSongAudio.value.src = fetchedSong.src
    pendingSongAudio.value.addEventListener('ended', handleAudioEnded)
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
}

async function handleAudioPlayStart() {
  console.log('handleAudioPlayStart');
  emit('stopAllPendingSongs');
  try {
    await updatePendingSong();
    isPlaying.value = true;
    await pendingSongAudio.value.play();
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
  pendingSongAudio.value.pause()
  pendingSongAudio.value.currentTime = 0
  isPlaying.value = false
}

function handleAudioEnded() {
  isPlaying.value = false
}

async function handleApproveSong() {
  try {
    await store.approveSongById(props.pendingSong.id)
    emit('updatePendingSongList')
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
}

async function handleDisapproveSong() {
  try {
    await store.disapproveSongById(props.pendingSong.id)
    emit('updatePendingSongList')
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

onMounted(async () => {
  on('stopAllPendingSongs', () => {
    if (isPlaying.value && pendingSongAudio.value) {
      pendingSongAudio.value.pause()
      pendingSongAudio.value.currentTime = 0
      isPlaying.value = false
    }
  })
})


// onUnmounted(() => {
//     pendingSongAudio.value.removeEventListener('ended', handleAudioEnded)
// })


</script>

<template>
  <tr class="table-body">
    <td>{{ props.pendingSong.title }}</td>
    <td>{{ props.pendingSong.uploadedBy.kreta.name }}</td>
    <td>{{ formatDateTime(props.pendingSong.createdAt) }}</td>
    <td>
      <button class="play-button" @click="isPlaying ? handleAudioPlayStop() : handleAudioPlayStart()">
        <SvgIcon type="mdi" :path="isPlaying ? mdiPause : mdiPlay" class="icon" />
        <audio ref="pendingSongAudio" />
      </button>
    </td>
    <td>
      <button class="approve-button" @click="handleApproveSong">
        <SvgIcon type="mdi" :path="mdiCheck" class="icon" />
      </button>
    </td>
    <td>
      <button class="delete-button" @click="handleDisapproveSong">
        <SvgIcon type="mdi" :path="mdiClose" class="icon" />
      </button>
    </td>
  </tr>
</template>

<style scoped lang="sass">
td
  align-items: center
  padding: 3px

.play-button,
.approve-button,
.delete-button
  padding: 5px
  width: 40px
  height: 40px
  border: none
  border-radius: 10px
  transition: all 0.2s ease-in-out

.play-button
  background-color: #2A73C5

.approve-button
  background-color: #00C700

.delete-button
  background-color: #B61431

.play-button:hover,
.approve-button:hover,
.delete-button:hover
  transform: scale(1.1)
  cursor: pointer

.play-button:hover
  background-color: #1c5b8a

.approve-button:hover
  background-color: #01a901

.delete-button:hover
  background-color: #9e0b26

.icon
  color: white
  width: 30px
  height: 30px
  transition: all 0.2s ease-in-out

.play-button:hover .icon,
.approve-button:hover .icon,
.delete-button:hover .icon
  transform: scale(1.1)
</style>
