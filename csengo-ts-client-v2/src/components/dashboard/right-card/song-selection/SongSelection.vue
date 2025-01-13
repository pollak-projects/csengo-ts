<script setup lang="ts">
import serviceLogger from '@/utils/logger.custom.util'

const props = defineProps<{
  song: {
    songId: string,
    songTitle: string,
  };
}>();
const logger = serviceLogger('SongSelection');

const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
  logger.debug('SongSelection props:', props.song);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

const truncatedTitle = computed(() => {
  const maxLength = screenWidth.value < 500 ? 7 : 18;
  const title = props.song.songTitle;
  return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
});
</script>

<template>
  <div class="song-selection-main">
    <PlaySong :song-id="props.song.songId" />
    <p class="song-title">{{ truncatedTitle }}</p>
    <VoteSong :song-id="props.song.songId" />
  </div>
</template>

<style scoped lang="sass">
.song-selection-main
  background-color: rgba(0, 0, 0, 0.5)
  font-size: clamp(0.8rem, 4.5vw, 2rem)
  border-radius: 10px
  display: inline-flex
  align-items: center
  justify-content: space-between
  gap: 2dvh
  width: 100%
</style>
