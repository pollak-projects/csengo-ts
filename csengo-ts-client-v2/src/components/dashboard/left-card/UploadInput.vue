<script setup lang="ts">

import { useUploadInputStore } from '@/stores/dashboard/left-card/uploadInput'
import { ToastEnum } from '@/types/toast.enum'

const store = useUploadInputStore()

const isUploading = ref(false)

const { triggerToast } = inject('toast')

store.setUrl(`${import.meta.env.VITE_API_URL}/api/songs/audio`)

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    store.setFile(target.files[0])
    try {
      isUploading.value = true
      await store.uploadFile()
      isUploading.value = false
      triggerToast('File uploaded successfully', ToastEnum.Success)
    } catch (error) {
      const err = error as Error
      triggerToast(err.message, ToastEnum.Error)
      isUploading.value = false
    }
  } else {
    triggerToast('Please select a file', ToastEnum.Error)
  }
}

</script>

<template>
  <div class="button-container">
    <div :class="['upload-input-main', { 'upload-input-main-grayed-out': isUploading }]">
      <input type="file" accept="audio/mpeg" :disabled="isUploading" @change="handleFileChange" />
    </div>
    <Router-link to="/snipper">
      <button>Feltöltés YouTube-ról</button>
    </Router-link>
  </div>
</template>

<style scoped lang="sass">
.upload-input-main
  position: relative
  width: 100%
  display: flex
  justify-content: center
  align-items: center

  &-grayed-out
    background-color: rgba(128, 128, 128, 0.5)
    border-radius: 5px

  input[type="file"]
    opacity: 0
    position: absolute
    width: 100%
    height: 100%
    cursor: pointer

  &::before
    content: 'Feltöltés'
    letter-spacing: 2px
    display: flex
    justify-content: center
    align-items: center
    width: 100%
    height: 100%
    text-align: center
    background-color: rgba(0, 0, 0, 0.5)
    color: white
    padding: 10px
    box-sizing: border-box
    border-radius: 5px

.button-container
  display: grid
  gap: .5em

  button
    color: white
    background-color: rgba(0, 0, 0, 0.5)
    padding: 10px
    box-sizing: border-box
    border-radius: 5px

</style>
