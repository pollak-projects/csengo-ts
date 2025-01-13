<script setup lang="ts">
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { usePreviousWinnerStore } from '@/stores/dashboard/right-card/previousWinner'

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const store = usePreviousWinnerStore()
const isSessionAvailable = ref(false)

const truncatedTitle = computed(() => {
  const maxLength = 15;
  const title = store.previousWinner.title;
  return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
});


onMounted(async () => {
  try {
    await store.fetchPreviousWinner()
    isSessionAvailable.value = true
  } catch (error) {
    const err = error as Error
    console.error(err.message)
    // triggerToast(err.message, ToastEnum.Error)
  }
})
</script>

<template>
  <div class="previous-winner-main">
    <div v-if="isSessionAvailable">
      <h1>Előző győztes: {{ truncatedTitle }}</h1>
    </div>
    <div v-else>
      <h1>Jelenleg nincs korábbi győztes</h1>
    </div>
  </div>
</template>

<style scoped lang="sass">
.previous-winner-main
  margin-top: 10px
  align-items: center
  height: 100%
  width: 100%
</style>
