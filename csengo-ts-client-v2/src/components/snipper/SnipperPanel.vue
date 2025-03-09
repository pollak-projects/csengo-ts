<script setup lang="ts">
import { ToastEnum } from '@/types/toast.enum'
import YouTubePlayer from 'youtube-player'
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useUploadSongStore } from '@/stores/dashboard/snipper/uploadSong'

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const store = useUploadSongStore()

const from_to = ref([0, 0])
const from_to_last = ref([0, 0])
const length = ref(0)
const url = ref('')
const title = ref('')
const uploading = ref(false)

async function uploadSong() {
  if (url.value == '') {
    triggerToast('Nem adtál meg egy zenét!', ToastEnum.Warning)
    return
  }
  if ((from_to.value[0] == 0) || (from_to.value[1] == 0)) {
    triggerToast('Nem adtál meg egy szekciót a zenéből!', ToastEnum.Warning)
    return
  }
  if (title.value == '') {
    triggerToast('Nem adtál meg egy nevet!', ToastEnum.Warning)
    return
  }

  uploading.value = true
  try {
    await store.uploadSong({
      ytUrl: url.value,
      from: from_to.value[0],
      to: from_to.value[1],
      title: title.value
    })
    triggerToast('A zene kivágva, és feltöltve!', ToastEnum.Success)
  } catch (error) {
    triggerToast(error, ToastEnum.Warning)
  }
  uploading.value = false
}

const slider_change = async (input) => {
  const [slider_start, slider_end] = input

  const delta = slider_end - slider_start

  if (delta > 15) {
    if (slider_start !== from_to_last.value[0]) {
      from_to.value[1] = slider_start + 15
    } else if (slider_end !== from_to_last.value[1]) {
      from_to.value[0] = slider_end - 15
    }
  } else if (delta < 5) {
    if (slider_start !== from_to_last.value[0]) {
      from_to.value[1] = slider_start + 5
    } else if (slider_end !== from_to_last.value[1]) {
      from_to.value[0] = slider_end - 5
    }
  }

  from_to_last.value = [...from_to.value]
  player.seekTo(from_to.value[0], true)

  if (await player.getPlayerState() == 2) {
    player.playVideo()
  }
}

let player

function updatePlayerSize() {
  const videoContainer = document.getElementById('responsive-video-container')
  if (videoContainer) {
    const width = videoContainer.offsetWidth
    const height = videoContainer.offsetHeight
    player.setSize(width, height)
  }
}

onMounted(() => {
  const videoContainer = document.getElementById('responsive-video-container')
  player = YouTubePlayer('video-player', {
    height: videoContainer.offsetHeight,
    width: videoContainer.offsetWidth,
    playerVars: { controls: 0 } // disable so user can only seek with the range input
  })

  player.addEventListener('onStateChange', async (event) => {
    if (event.data == YT.PlayerState.PLAYING) {
      length.value = await player.getDuration()
    }
  })

  setInterval(async function() {
    if (player.getCurrentTime() >= from_to.value[1]) {
      await player.pauseVideo() // Pause the video
    }
  }, 100)

  window.addEventListener('resize', updatePlayerSize)
  updatePlayerSize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePlayerSize)
})

const replace_url = async (input) => {
  const regex = 'https://(?:m.youtube.com|yt.be|youtube.com|youtu.be|www.youtube.com)'
  if (input.target.value.match(regex)) {
    player.loadVideoByUrl(transformUrl(input.target.value))
    url.value = input.target.value
  } else {
    triggerToast('This link is not supported, only yout.be youtube.com are valid', ToastEnum.Warning)
  }
}

function transformUrl(url: string): string {
  let transformedUrl: string

  const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortUrlMatch) {
    transformedUrl = `https://youtu.be/embed/${shortUrlMatch[1]}`
  } else {
    const standardUrlMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
    if (standardUrlMatch) {
      transformedUrl = `https://youtube.com/embed/${standardUrlMatch[1]}`
    } else {
      transformedUrl = url
    }
  }

  return transformedUrl
}
</script>

<template>
  <div id="responsive-video-container">
    <div id="video-player" />
  </div>
  <input @change="replace_url" type="text" name="url" placeholder="Youtube link ide">
  <input v-model="title" type="text" name="url" placeholder="Adj neki egy nevet">
  <v-range-slider :max="length" @end="slider_change" step="1" :isDisabled="length == 0 ? true : false" strict="true"
                  v-model="from_to" thumb-label="always"
  />

  <div class="button-container" :class="{ upload: uploading }">
    <button @click="uploadSong" :disabled="uploading">Feltöltés YouTube-ról
      <span></span>
      <span></span>
      <span></span>
      <span></span>

    </button>
  </div>
</template>

<style lang="sass" scoped>
@import url('https://fonts.googleapis.com/css2?family=Anta&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap')

#responsive-video-container
  position: relative
  padding-bottom: 56.25%
  /* 16:9 aspect ratio */
  height: 0
  overflow: hidden
  max-width: 100%
  background: #000

#video-player
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%

.button-container
  gap: .5em

.container input[type="text"]
  width: 100%
  padding: 10px 0
  font-size: 16px
  color: #fff
  margin-bottom: 30px
  border: none
  border-bottom: 1px solid #fff
  outline: none
  background: transparent

.button-container button
  position: relative
  display: inline-block
  width: 50%
  padding: 12px 14px
  color: #fc2658
  font-size: 1rem
  text-decoration: none
  text-transform: uppercase
  overflow: hidden
  transition: 0.5s
  margin-top: 20px
  margin-bottom: 20px
  letter-spacing: 4px
  background: none
  border: none
  cursor: pointer

.button-container button:hover
  background: #fc2658
  color: #fff
  border-radius: 5px

.button-container button span
  position: absolute
  display: block

.upload button span:nth-child(1)
  top: 0
  left: -100%
  width: 100%
  height: 2px
  background: linear-gradient(90deg, transparent, #fc2658)
  animation: btn-anim1 1s linear infinite

@keyframes btn-anim1
  0%
    left: -100%
  50%, 100%
    left: 100%

.upload button span:nth-child(2)
  top: -100%
  right: 0
  width: 2px
  height: 100%
  background: linear-gradient(180deg, transparent, #fc2658)
  animation: btn-anim2 1s linear infinite
  animation-delay: 0.25s

@keyframes btn-anim2
  0%
    top: -100%
  50%, 100%
    top: 100%

.upload button span:nth-child(3)
  bottom: 0
  right: -100%
  width: 100%
  height: 2px
  background: linear-gradient(270deg, transparent, #fc2658)
  animation: btn-anim3 1s linear infinite
  animation-delay: 0.5s

@keyframes btn-anim3
  0%
    right: -100%
  50%, 100%
    right: 100%

.upload button span:nth-child(4)
  bottom: -100%
  left: 0
  width: 2px
  height: 100%
  background: linear-gradient(360deg, transparent, #fc2658)
  animation: btn-anim4 1s linear infinite
  animation-delay: 0.75s

@keyframes btn-anim4
  0%
    bottom: -100%
  50%, 100%
    bottom: 100%

button :disabled
  background-color: rgba(0, 0, 0, 0.5)

@media (max-height: 980)

.card-body
  margin-top: 130px

@media (max-width: 1300px)
  .container
    flex-direction: column
    gap: 20px

  .card-body
    height: auto
    margin-top: 0px
    min-width: 100%
    max-width: none

  .move-down
    margin-top: 100px

  .card-body p
    font-size: 1rem
</style>
