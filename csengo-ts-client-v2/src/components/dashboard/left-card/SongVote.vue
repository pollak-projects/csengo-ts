<script setup lang="ts">
const props = defineProps<{
  songVote: {
    songId: string,
    songTitle: string,
    voteCount: number
  };
}>();

const screenWidth = ref(window.innerWidth);

// Figyeljük a képernyőméretet
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

const truncatedTitle = computed(() => {
  const maxLength = screenWidth.value < 600 ? 10 : 15;
  const title = props.songVote.songTitle;
  return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
});
</script>

<template>
  <div class="song-vote-main">
    <p>{{ truncatedTitle }}</p>
    <p>{{ props.songVote.voteCount }} szavazat</p>
  </div>
</template>

<style scoped lang="sass">
.song-vote-main
  overflow-x: auto
  font-size: clamp(1rem, 4.5vw, 2rem)
  display: flex
  flex-direction: row
  justify-content: space-between
  gap: clamp(10px, 2vw, 50px)
</style>
