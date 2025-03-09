<script setup lang="ts">

</script>

<template>
  <div class="song-upload-main">
    <h1>Zene feltöltés</h1>
    <p class="criteria-title">Kritériumok</p>
    <div class="song-upload-criteria">
      <p>Időtartam: 15 másodperc</p>
      <p>Formátum: .mp3</p>
    </div>
    <UploadInput />
  </div>

</template>

<style scoped lang="sass">
.song-upload-main
  font-size: clamp(1rem, 4.5vw, 2rem)
  width: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 1dvh

.criteria-title
  font-size: clamp(1.5rem, 2.5vw, 2.5rem)

.song-upload-criteria
  font-size: clamp(1rem, 2.5vw, 1.3rem)
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 0.5dvh
</style>
