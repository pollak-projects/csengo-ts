<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/admin/user/user'
import { ToastEnum } from '@/types/toast.enum'
import { on } from '@/utils/eventBus.util'
import User from '@/components/admin/user/User.vue'
import UpdateUserPopup from '@/components/admin/user/UpdateUserPopup.vue'

const store = useUserStore()
const { triggerToast } = inject('toast') as {
  triggerToast: (message: string, type: ToastEnum) => void
}

const isEditing = ref(false)

const editUser = ref({})

onMounted(async () => {
  try {
    await store.fetchUsers()
  } catch (error) {
    const err = error as Error
    triggerToast(err.message, ToastEnum.Error)
  }
  on('openEdit', (user: { id: ''; username: ''; name: ''; email: ''; om: '' }) => {
    console.log('openEdit event received')
    editUser.value = user
    isEditing.value = true
  })
  on('updateUserList', async () => {
    try {
      await store.fetchUsers()
    } catch (error) {
      const err = error as Error
      triggerToast(err.message, ToastEnum.Error)
    }
  })
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
            <th>Felhasználónév</th>
            <th>Név</th>
            <th>Email</th>
            <th>OM</th>
            <th>Rang</th>
            <th>Szerkesztés</th>
          </tr>
        </thead>
        <tbody>
          <User v-for="item in store.filteredUsers" :key="item.id" :user="item" />
        </tbody>
      </table>
    </div>

    <!-- THE POPUP TO RENAME MUSIC -->
    <UpdateUserPopup v-if="isEditing" v-model:is-editing="isEditing" v-model:user="editUser" />
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
  scrollbar-width: none

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
  margin-top: 3%
  font-size: 2rem
  padding: 10px 30px
  border-radius: 10px
  background-color: #3883d9

.upload:hover
  background-color: #2a64a6
  cursor: pointer
</style>
