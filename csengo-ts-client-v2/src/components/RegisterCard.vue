<script lang="ts" setup>
import { useRegisterStore } from '@/stores/register'
import { ToastEnum } from '@/types/toast.enum'

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }
const store = useRegisterStore()

const passwordConfirmation = ref('')
const credentials = ref({
  username: '',
  password: '',
  email: '',
  om: ''
})

async function handleRegister() {
  try {
    await store.fetchRegister(credentials.value, passwordConfirmation.value)
  } catch (error) {
    triggerToast((error as Error).message, ToastEnum.Warning)
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="register-box">
    <img alt="Pollák" src="../assets/pollakLogo.png" />
    <h1 class="title">
      POLLÁK <span class="highlight">CSENGŐ</span>
    </h1>
    <h2>Regisztráció</h2>
    <form @submit.prevent="handleRegister">
      <div class="user-box">
        <input v-model="credentials.username" required type="text" />
        <div>Felhasználónév</div>
      </div>
      <div class="user-box">
        <input v-model="credentials.email" required type="text" />
        <div>Email</div>
      </div>
      <div class="user-box">
        <input v-model="credentials.om" required type="text" />
        <div>OM</div>
      </div>
      <div class="user-box">
        <input v-model="credentials.password" required type="password" />
        <div>Jelszó</div>
      </div>
      <div class="user-box">
        <input v-model="passwordConfirmation" required type="password" />
        <div>Jelszó megerősítése</div>
      </div>
      <button class="submit" type="submit">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        Regisztrálás
      </button>
      <p>Van már fiókod?
        <router-link style="text-decoration: underline; color: white; font-weight: 700;" to="/login">Lépj be itt!
        </router-link>
      </p>
    </form>
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

.register-box
  font-family: 'Anta', serif
  position: absolute
  top: 50%
  left: 50%
  width: 90%
  max-width: 400px
  padding: 40px
  margin-top: -10px
  transform: translate(-50%, -50%)
  background: rgba(0, 0, 0, 0.5)
  backdrop-filter: blur(50px)
  box-sizing: border-box
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6)
  border-radius: 10px
  text-align: center

img
  position: absolute
  top: -30px
  left: -30px
  width: 80px
  height: 80px
  border-radius: 50%
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6)

p
  font-size: 1rem
  margin-bottom: -20px

.title
  font-size: 1rem
  margin-top: -10px
  margin-bottom: 10px
  color: #fff

.title .highlight
  color: #fc2658
  font-weight: bold

.register-box h2
  margin: 20px 0 30px
  padding: 0
  color: #fff
  font-size: 1.8rem
  text-align: center

.register-box .user-box
  position: relative

.register-box .user-box input
  width: 100%
  padding: 10px 0
  font-size: 16px
  color: #fff
  margin-bottom: 30px
  border: none
  border-bottom: 1px solid #fff
  outline: none
  background: transparent

.register-box .user-box div
  position: absolute
  top: 0
  left: 0
  padding: 10px 0
  font-size: 16px
  color: #fff
  pointer-events: none
  transition: 0.5s
  text-align: left

.register-box .user-box input:focus~div,
.register-box .user-box input:valid~div
  top: -20px
  left: 0
  color: #fc2658
  font-size: 12px

.register-box form .submit
  position: relative
  display: inline-block
  width: 70%
  padding: 12px 14px
  color: #fc2658
  font-size: 1rem
  text-decoration: none
  text-transform: uppercase
  overflow: hidden
  transition: 0.5s
  margin-top: 20px
  margin-bottom: 20px
  letter-spacing: 4px
  background: none
  border: none
  cursor: pointer

.register-box .submit:hover
  background: #fc2658
  color: #fff
  border-radius: 5px
  box-shadow: 0 0 0px #fc2658, 0 0 25px #fc2658, 0 0 50px #fc2658, 0 0 100px #fc2658

/* BUTTON ANIMATION */
.register-box .submit span
  position: absolute
  display: block

.register-box .submit span:nth-child(1)
  top: 0
  left: -100%
  width: 100%
  height: 2px
  background: linear-gradient(90deg, transparent, #fc2658)
  animation: btn-anim1 1s linear infinite

@keyframes btn-anim1
  0%
    left: -100%
  50%, 100%
    left: 100%

.register-box .submit span:nth-child(2)
  top: -100%
  right: 0
  width: 2px
  height: 100%
  background: linear-gradient(180deg, transparent, #fc2658)
  animation: btn-anim2 1s linear infinite
  animation-delay: 0.25s

@keyframes btn-anim2
  0%
    top: -100%
  50%, 100%
    top: 100%

.register-box .submit span:nth-child(3)
  bottom: 0
  right: -100%
  width: 100%
  height: 2px
  background: linear-gradient(270deg, transparent, #fc2658)
  animation: btn-anim3 1s linear infinite
  animation-delay: 0.5s

@keyframes btn-anim3
  0%
    right: -100%
  50%, 100%
    right: 100%

.register-box .submit span:nth-child(4)
  bottom: -100%
  left: 0
  width: 2px
  height: 100%
  background: linear-gradient(360deg, transparent, #fc2658)
  animation: btn-anim4 1s linear infinite
  animation-delay: 0.75s

@keyframes btn-anim4
  0%
    bottom: -100%
  50%, 100%
    bottom: 100%

/* MEDIA SETTINGS */
@media (min-width: 768px)
  .register-box
    width: 60%
    max-width: 500px
  .title
    font-size: 1.2rem
  .register-box h2
    font-size: 2rem

@media (max-width: 480px)
  img
    width: 70px
    height: 70px
    top: -30px
    left: -30px
  p
    margin-bottom: -10px
  .register-box
    margin-top: 10px
    margin-bottom: 50px
    width: 80%
    padding: 20px
  .title
    margin-top: 5px
    font-size: 0.8rem
  .register-box h2
    font-size: 1.5rem
  .register-box form .submit
    letter-spacing: 1px

@media (max-width: 340px)
  img
    width: 50px
    height: 50px
    top: -20px
    left: -20px
  .register-box form .submit
    font-size: 0.9rem
    letter-spacing: 1px
    padding: 8px

@media (max-height: 700px)
  .register-box
    margin-top: 0px

@media (max-height: 480px)
  .register-box
    margin-top: 0px

</style>
