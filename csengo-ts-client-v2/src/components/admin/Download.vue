<script setup lang="ts">
import { useDownloadStore } from '@/stores/admin/download'
import { ToastEnum } from '@/types/toast.enum'

const store = useDownloadStore();
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

async function handleDownloadCurrentSessionSongs() {
    try {
        await store.fetchCurrentSessionSongs();
    } catch (error) {
        const err = error as Error;
        triggerToast(err.message, ToastEnum.Error);
    }
}

async function handleDownloadLastSessionWinningSong() {
    try {
        await store.fetchLastSessionWinningSong();
    } catch (error) {
        const err = error as Error;
        triggerToast(err.message, ToastEnum.Error);
    }
}

</script>

<template>
    <div class="full-screen-container">
        <button class="create" @click="handleDownloadCurrentSessionSongs">Szavazásban lévő zenék letöltése</button>
        <button class="create" @click="handleDownloadLastSessionWinningSong">Nyertes zene letöltése</button>
    </div>
</template>

<style scoped lang="sass">
*
  color: black
  margin: 0
  padding: 0
  box-sizing: border-box

/* THESE ARE THE TABLE STYLES */
.full-screen-container
  width: 90%
  height: 90%
  display: flex
  flex-direction: column
  justify-content: start
  align-items: center

.create
  font-family: 'Anta', serif
  color: white
  margin-top: 3%
  font-size: 1.6rem
  padding: 10px 30px
  border-radius: 10px
  background-color: #3883d9
  width: 50dvh

.create:hover
  background-color: #2a64a6
  cursor: pointer

.create-start
    font-family: 'Anta', serif
    color: white
    margin-top: 3%
    font-size: 1.6rem
    padding: 10px 30px
    border-radius: 10px
    background-color: #48ff00

.create-start:hover
  background-color: #50d256
  cursor: pointer

.create-stop
    font-family: 'Anta', serif
    color: white
    margin-top: 3%
    font-size: 1.6rem
    padding: 10px 30px
    border-radius: 10px
    background-color: #e30102

.create-stop:hover
  background-color: #b20102
  cursor: pointer
</style>
