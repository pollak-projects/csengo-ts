<script lang="ts" setup>
const isWindowSizeEnough = ref(true)

function checkWindowSize() {
  isWindowSizeEnough.value = window.innerWidth >= 300 && window.innerHeight >= 300
}

onMounted(() => {
  checkWindowSize()
  window.addEventListener('resize', checkWindowSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkWindowSize)
})
</script>


<template>
  <v-app class="background-image">

    <div v-if="isWindowSizeEnough" class="container">
      <router-view />
    </div>
    <div v-else class="centered-message">
      <h3>Ez az oldal nem megtekinthető ekkora kijelzőn</h3>
    </div>

  </v-app>
</template>

<style lang="sass" scoped>
.background-image
  background: url('../assets/background.jpg') no-repeat center center fixed
  background-size: cover

.centered-message
  font-family: 'Anta'
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  color: #fff

@media (max-height: 700px)
  .container
    margin-bottom: 700px
</style>
