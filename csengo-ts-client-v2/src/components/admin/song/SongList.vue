
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { useSongListStore } from '@/stores/admin/song/songList'
import { ToastEnum } from '@/types/toast.enum'
import { on } from '@/utils/eventBus.util'
import Song from '@/components/admin/song/Song.vue'
import CreateSongPopup from '@/components/admin/song/CreateSongPopup.vue'
import UpdateSongPopup from '@/components/admin/song/UpdateSongPopup.vue'

const store = useSongListStore()
const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const isCreating = ref(false)
const isEditing = ref(false)

const editSong = ref({})

function openCreate() {
  isCreating.value = true
}

onMounted(async () => {
  try {
    await store.fetchAllSongs()
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
  on('updateSongList', async () => {
    try {
      await store.fetchAllSongs()
    } catch (error) {
      const err = error as Error
      triggerToast(err.message, ToastEnum.Error)
    }
  })
  on('openEdit', (song: {
    id: '',
    title: '',
    uploadedBy: {
      kreta: {
        name: '',
      }
    },
    createdAt: '',
    updatedAt: '',
  }) => {
    console.log('openEdit event received');
    editSong.value = song
    isEditing.value = true;
  });
})
</script>

<template>
  <div class="full-screen-container">
    <!-- THE SEARCH BAR TO SEARCH MUSIC BY NAME -->
    <div class="search-container">
      <input v-model="store.searchQuery" type="text" placeholder="Keresés" class="search-bar" />
    </div>

    <!-- THE TABLE TO LIST TEH SONGS -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Név</th>
            <th>Feltöltő</th>
            <th>Feltöltés ideje</th>
            <th>Lejátszás</th>
            <th>Szerkesztés</th>
            <th>Törlés</th>
          </tr>
        </thead>
        <tbody>
          <Song v-for="item in store.filteredSongs" :key="item.id" :song="item" />
        </tbody>
      </table>
    </div>

    <button class="upload" @click="openCreate">Feltöltés</button>


    <!-- THE POPUP TO UPLOAD MUSIC -->
    <CreateSongPopup v-if="isCreating" v-model:is-creating="isCreating" />

    <!-- THE POPUP TO RENAME MUSIC -->
    <UpdateSongPopup v-if="isEditing" v-model:is-editing="isEditing" v-model:song="editSong" />
  </div>
</template>

<style scoped lang="sass">
.full-screen-container
  color: black
  width: 90%
  height: 90%
  display: flex
  flex-direction: column
  justify-content: start
  align-items: center

/* And lastly, these are the table styles */
.table-container
  width: 100%
  overflow-x: auto
  scrollbar-width: thin

.table-container::-webkit-scrollbar
  display: none

.data-table th
  position: sticky
  top: 0
  background-color: white
  z-index: 1
  font-weight: bold

.data-table thead
  border-bottom: 4px solid black

.data-table
  width: 100%
  border-collapse: collapse

.data-table th

.data-table td
  padding: 12px
  text-align: center
  font-size: 1.3rem

.data-table th
  border-bottom: 4px solid black
  font-weight: bold

tr
  text-align: center

/* These are the styles for the search bar */
.search-container
  margin-bottom: 20px

.search-bar
  font-family: 'Anta'
  background-color: white
  color: black
  width: 250px
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none
  border-bottom: 4px solid black

.search-bar:focus
  outline: none


.upload
  font-family: 'Anta'
  color: white
  margin-top: auto
  font-size: 2rem
  padding: 10px 30px
  border-radius: 10px
  background-color: #3883d9

.upload:hover
  background-color: #2a64a6
  cursor: pointer
</style>
