<script setup lang="ts">

import { mdiThumbUpOutline, mdiThumbUp } from '@mdi/js'
import SvgIcon from "@jamescoyle/vue-icon";

import { useVoteSongStore } from '@/stores/dashboard/right-card/song-selection/voteSong'
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import { emit } from '@/utils/eventBus.util'

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const props = defineProps<{
  songId: string
}>()

const store = useVoteSongStore();

const isVoted = ref(false);

async function handleVoteUp() {
  try {
    isVoted.value = true;
    await store.voteUp(props.songId);
    await updateUserVotes()
  } catch (error) {
    const err = error as Error;
    triggerToast(err.message, ToastEnum.Error);
  }
}

async function handleVoteDown() {
  try {
    isVoted.value = false;
    await store.voteDown(props.songId);
    await updateUserVotes()
  } catch (error) {
    const err = error as Error;
    triggerToast(err.message, ToastEnum.Error);
  }
}

function checkIfVoted() {
  isVoted.value = store.votes.some(vote => vote === props.songId);
}

async function updateUserVotes() {
  try {
    await store.fetchVotesByUser();
    checkIfVoted();
    console.log(store.votes.some(vote => vote === props.songId));
    emit('updateSongVotes');
  } catch (error) {
    const err = error as Error;
    triggerToast(err.message, ToastEnum.Error);
  }
}

watch(() => store.votes, () => {
  checkIfVoted();
});
</script>

<template>
  <div>
    <button v-if="!isVoted" @click="handleVoteUp">
      <SvgIcon type="mdi" :path="mdiThumbUpOutline" class="icon" />
    </button>
    <button v-if="isVoted" @click="handleVoteDown">
      <SvgIcon type="mdi" :path="mdiThumbUp" class="icon" />
    </button>
  </div>
</template>

<style scoped lang="sass">
.icon
  color: white
  margin-top: 8px
  margin-right: 8px
  width: 50px
  height: 50px
  transition: all 0.2s ease-in-out

.icon:hover
  transform: scale(1.1)
</style>
