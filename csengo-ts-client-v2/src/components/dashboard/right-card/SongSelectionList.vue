<script setup lang="ts">
import { useSongSelectionListStore } from '@/stores/dashboard/right-card/songSelectionList'
import { ToastEnum } from '@/types/toast.enum'
import { inject, ref, onMounted } from 'vue'
import { useVoteSongStore } from '@/stores/dashboard/right-card/song-selection/voteSong'

const store = useSongSelectionListStore()
const voteStore = useVoteSongStore()

const isSessionAvailable = ref(false)

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

onMounted(async () => {
  try {
    await store.fetchSongSelectionList()
    isSessionAvailable.value = true
  } catch (error) {
    const err = error as Error
    console.error(err.message)
    // triggerToast(err.message, ToastEnum.Error)
  }

  try {
    await voteStore.fetchVotesByUser()
  } catch (error) {
    const err = error as Error
    console.error(err.message)
    // triggerToast(err.message, ToastEnum.Error)
  }
})
</script>

<template>
  <div class="container">
    <div class="song-selection-list-main" v-if="isSessionAvailable">
      <SongSelection v-for="song in store.songSelectionList.songs" :key="song.songId" :song="song" />
    </div>
    <div v-else>
      <h1>Jelenleg nincs szavazás</h1>
    </div>
  </div>
</template>

<style scoped lang="sass">
.container
  width: 100%

.song-selection-list-main
  display: flex
  flex-direction: column
  align-items: center
  justify-content: flex-start
  overflow-y: auto
  gap: 1dvh
  padding: 10px
  height: 100%
  max-height: 500px
  width: 100%
  scrollbar-width: none
</style>
