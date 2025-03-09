<script setup lang="ts">
import { useSongVoteListStore } from '@/stores/dashboard/left-card/songVoteList'
import { ref, onMounted } from 'vue'
import { on } from '@/utils/eventBus.util'

const store = useSongVoteListStore()

const isSessionAvailable = ref(false)

onMounted(async () => {
  try {
    await store.fetchSongVotesInSession()
    isSessionAvailable.value = true
  } catch (error) {
    const err = error as Error
    console.error(err.message)
    // triggerToast(err.message, ToastEnum.Error)
  }
  on('updateSongVotes', async () => {
    await store.fetchSongVotesInSession()
  })
})
</script>

<template>
  <div class="song-vote-list-main">
    <h1>Szavazatok</h1>
    <div v-if="isSessionAvailable" class="song-vote-list">
      <SongVote v-for="songVote in store.songVotesInSession.songs" :key="songVote.songId" :song-vote="songVote" />
    </div>
    <div v-else>
      <h2>Jelenleg nincs szavazás</h2>
    </div>
  </div>
</template>

<style scoped lang="sass">
.song-vote-list-main
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 2dvh
  font-size: clamp(1rem, 3.5vw, 1.5rem)
</style>
