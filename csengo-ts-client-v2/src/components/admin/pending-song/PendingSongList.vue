<script setup lang="ts">
import { onMounted, inject } from 'vue'
import { usePendingSongListStore } from '@/stores/admin/pending-song/pendingSongList'
import { ToastEnum } from '@/types/toast.enum'
import PendingSong from '@/components/admin/pending-song/PendingSong.vue'
import { on } from '@/utils/eventBus.util'

const store = usePendingSongListStore();
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }


onMounted(async () => {
  try {
    await store.fetchAllPendingSongs();
  } catch (error) {
    const err = error as Error;
    triggerToast(err.message, ToastEnum.Error);
  }
  on('updatePendingSongList', async () => {
    try {
      await store.fetchAllPendingSongs();
    } catch (error) {
      const err = error as Error;
      triggerToast(err.message, ToastEnum.Error);
    }
  });
});
</script>

<template>
  <div class="full-screen-container">
    <!-- THIS IS THE SEARCH BAR -->
    <div class="search-container">
      <input v-model="store.searchQuery" type="text" placeholder="Keresés" class="search-bar" />
    </div>


    <!-- THIS IS THE TABLE -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Név</th>
            <th>Feltöltő</th>
            <th>Feltöltés ideje</th>
            <th>Lejátszás</th>
            <th>Engedélyezés</th>
            <th>Elutasítás</th>
          </tr>
        </thead>
        <tbody>
          <PendingSong v-for="item in store.filteredSongs" :key="item.id" :pending-song="item" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="sass">
/* This is the container of the whole component which is changed by the navbar, absolutely needed */
.full-screen-container
  color: black
  width: 90%
  height: 90%
  display: flex
  flex-direction: column
  justify-content: start
  align-items: center

/* These are the styles for the search bar */
.search-container
  margin-bottom: 20px

.search-bar
  font-family: 'Anta', serif
  color: black
  background-color: white
  width: 250px
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none
  border-bottom: 4px solid black

.search-bar:focus
  outline: none

/* These are the style for the table and its button */
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
