<script setup lang="ts">
import { mdiPlay, mdiPause } from '@mdi/js'
import SvgIcon from "@jamescoyle/vue-icon";

import { usePlaySongStore } from '@/stores/dashboard/right-card/song-selection/playSong'
import { ToastEnum } from '@/types/toast.enum'
import { inject, ref, onMounted } from 'vue'
import { on, emit } from '@/utils/eventBus.util'

const props = defineProps<{
  songId: string
}>()

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const store = usePlaySongStore()

const isPlayingLocal = ref(false)
const song = ref<HTMLAudioElement>(new Audio())

onMounted(async () => {
  try {
    store.song.songId = props.songId
    song.value = await store.fetchSong()
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
  on('stopAllSongs', () => {
    console.log('stopAllSongs event received')
    if (isPlayingLocal.value && song.value) {
      song.value.pause()
      song.value.currentTime = 0
      isPlayingLocal.value = false
    }
  })
})

function handleAudioPlayStart() {
  emit('stopAllSongs')
  isPlayingLocal.value = true
  song.value.play()
  song.value.addEventListener('ended', handleAudioEnded)
}

function handleAudioPlayStop() {
  song.value.pause()
  song.value.currentTime = 0
  isPlayingLocal.value = false
}

function handleAudioEnded() {
  isPlayingLocal.value = false
}

// onUnmounted(() => {
//   song.value.removeEventListener('ended', handleAudioEnded)
// })
</script>

<template>
  <div>
    <button v-if="!isPlayingLocal" @click="handleAudioPlayStart">
      <SvgIcon type="mdi" :path="mdiPlay" class="icon" />
    </button>
    <button v-if="isPlayingLocal" @click="handleAudioPlayStop">
      <SvgIcon type="mdi" :path="mdiPause" class="icon" />
    </button>
    <audio ref="song" :src="song.src" />
  </div>
</template>

<style scoped lang="sass">
.icon
  color: white
  margin-top: 8px
  margin-left: 8px
  width: 50px
  height: 50px
  transition: all 0.2s ease-in-out

.icon:hover
  transform: scale(1.1)
</style>
