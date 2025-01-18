<script setup lang="ts">
const isWindowSizeEnoguh = ref(true);

const updateIsMobile = () => {
    isWindowSizeEnoguh.value = window.innerWidth >= 300 && window.innerHeight >= 300;
};

const router = useRouter()

const toHome = () => {
    router.push('/')
}

onMounted(() => {
    window.addEventListener("resize", updateIsMobile);
});

onUnmounted(() => {
    window.removeEventListener("resize", updateIsMobile);
});
</script>

<template>
    <div class="container background-image">
        <div v-if="isWindowSizeEnoguh" class="container">
            <h1 class="title">Forbidden Page</h1>
            <button class="home-button" @click="toHome">Home</button>
        </div>
        <div v-else class="centered-message">
            <h3>Ez az oldal nem megtekinthető ekkora kijelzőn</h3>
        </div>
    </div>
</template>

<style lang="sass" scoped>
@import url('https://fonts.googleapis.com/css2?family=Anta&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap')

.centered-message
  font-family: 'Anta', serif
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  color: #fff

.background-image
  background: url('../assets/background.jpg') no-repeat center center fixed
  background-size: cover

.container
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  min-height: 100vh
  padding: 20px
  gap: 20px

.title
  font-family: 'Anta', serif
  font-size: 2.5rem
  color: white
  text-align: center

.home-button
  font-family: 'Anta', serif
  font-size: 1.5rem
  color: white
  background-color: #007bff
  border: none
  border-radius: 8px
  padding: 10px 20px
  cursor: pointer
  transition: background-color 0.3s ease, transform 0.3s ease
  text-align: center

.home-button:hover
  background-color: #0056b3
  transform: scale(1.05)
</style>
