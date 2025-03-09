<route lang="yaml">
meta:
  layout: snipper
</route>

<script lang="ts" setup>

</script>

<template>
  <div class="container">
    <div class="card-body move-down">
      <SnipperPanel />
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import url('https://fonts.googleapis.com/css2?family=Anta&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap')

.container
  display: flex
  justify-content: space-evenly
  align-items: center
  min-height: 100vh
  padding: 20px
  gap: 50px

.card-body
  font-family: 'Anta'
  position: relative
  width: 100%
  max-width: 720px
  min-width: 600px
  height: 700px
  padding: 20px
  background: rgba(0, 0, 0, 0.5)
  backdrop-filter: blur(50px)
  box-sizing: border-box
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6)
  border-radius: 10px
  text-align: center
  color: white
  align-items: center
  justify-content: center
  flex-direction: column
  word-wrap: break-word

.move-down
  margin-top: 0px

@media (max-height: 980)
  .card-body
    margin-top: 0px

@media (max-width: 1300px)
  .card-body
    height: auto
    margin-top: 0px
    min-width: 100%
    max-width: none

  .move-down
    margin-top: 100px

  .card-body p
    font-size: 1rem
</style>
