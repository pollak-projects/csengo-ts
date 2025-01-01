<script lang="ts" setup>
import { ToastEnum } from './types/toast.enum'

const toast = ref({
  isVisible: false,
  message: 'This is a toast message',
  type: ToastEnum
})

function triggerToast(message: string, type: ToastEnum) {
  toast.value = {
    isVisible: true,
    message,
    type
  }
  setTimeout(() => {
    toast.value = {
      isVisible: false,
      message: '',
      type: ToastEnum.Warning
    }
  }, 4000)
}
provide('toast', { triggerToast })
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
      <Toast v-if="toast.isVisible" :message="toast.message" :type=toast.type :is-visible="toast.isVisible" />
    </v-main>
  </v-app>
</template>
