<script setup lang="ts">
import { useWelcomeSignStore } from '@/stores/dashboard/welcomeSign'
import { ToastEnum } from '@/types/toast.enum'

const store = useWelcomeSignStore()

const realname = ref('')

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

onMounted(async () => {
  try {
    realname.value = await store.fetchFullName()
  } catch (error) {
    triggerToast(error.message, ToastEnum.Error)
  }
})

</script>

<template>
  <div class="welcome">Üdvözlünk, {{ realname }}</div>
</template>

<style scoped lang="sass">
.welcome
  font-size: 1.2rem
  margin-top: 5px
  text-align: center
  padding-left: 20px
  padding-right: 20px

</style>
