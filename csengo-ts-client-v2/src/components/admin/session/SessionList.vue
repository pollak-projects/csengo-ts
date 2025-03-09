<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useSessionListStore } from '@/stores/admin/session/sessionList'
import { ToastEnum } from '@/types/toast.enum'
import { on } from '@/utils/eventBus.util'
import type { Session } from '@/types/session'

const store = useSessionListStore();
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const isCreating = ref(false);
const isEditing = ref(false);
const isViewing = ref(false);

const selectedSession = ref<Session | null>(null);


function openCreate() {
  isCreating.value = true;
}

async function updateSessionList() {
  try {
    await store.fetchAllSessions();
  } catch (error) {
    const err = error as Error;
    triggerToast(err.message, ToastEnum.Error);
  }
}

onMounted(async () => {
  await updateSessionList();
  on('updateSessionList', async () => {
    await updateSessionList();
  });
  on('openEdit', (session: Session) => {
    selectedSession.value = session;
    isEditing.value = true;
  });
  on('openView', (session: Session) => {
    selectedSession.value = session;
    isViewing.value = true;
  });
});
</script>

<template>
  <div class="full-screen-container">

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kezdet</th>
            <th>Vég</th>
            <th>Zenék</th>
            <th>Szerkesztés</th>
            <th>Törlés</th>
          </tr>
        </thead>
        <tbody>
          <Session v-for="item in store.filteredSessions" :key="item.id" :session="item" />
        </tbody>
      </table>
    </div>

    <button class="create" @click="openCreate">Létrehozás</button>

    <!-- THE POPUP TO CREATE SESSION -->
    <CreateSessionPopup v-if="isCreating" v-model:is-creating="isCreating" />

    <!-- THE POPUP TO EDIT SESSION -->
    <UpdateSessionPopup v-if="isEditing" v-model:is-editing="isEditing" :session="selectedSession" />

    <!-- THE POPUP TO VIEW SONGS -->
    <ViewSessionSongsPopup v-if="isViewing" v-model:is-viewing="isViewing" :session="selectedSession" />
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

.search-container
  margin-bottom: 20px

.search-bar
  font-family: 'Anta', serif
  background-color: white
  width: 250px
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none
  border-bottom: 4px solid black

.search-bar:focus
  outline: none

.create
  font-family: 'Anta', serif
  color: white
  margin-top: auto
  font-size: 2rem
  padding: 10px 30px
  border-radius: 10px
  background-color: #3883d9

.create:hover
  background-color: #2a64a6
  cursor: pointer

.table-container
  width: 100%
  overflow-x: auto
  scrollbar-width: none

.table-container::-webkit-scrollbar
  display: none

.data-table th
  position: sticky
  top: 0
  background-color: white
  z-index: 1
  font-weight: bold
  padding: 12px
  text-align: center
  font-size: 1.3rem
  border-bottom: 4px solid black

.data-table thead
  border-bottom: 4px solid black

.data-table
  width: 100%
  border-collapse: collapse

.data-table td
  padding: 12px
  text-align: center
  font-size: 1.3rem

tr
  text-align: center
</style>
