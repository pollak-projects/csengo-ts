<script setup lang="ts">
import { inject } from 'vue'
import { ToastEnum } from '@/types/toast.enum'
import type { Session } from '@/types/session'

const { triggerToast } = inject('toast') as { triggerToast: (message: string, type: ToastEnum) => void }

const isViewing = defineModel('isViewing', {
  type: Boolean,
  default: false
})

const props = defineProps<{
  session: Session | null,
}>();

function closeView() {
  isViewing.value = false
}

</script>

<template>
  <div class="overlay">
    <div class="view-card">
      <h2>Zenék</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Név</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in props.session?.songNames" :key="index">
              <td>{{ item }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="close-button" @click="closeView">Bezár</button>
    </div>
  </div>
</template>

<style scoped lang="sass">
*
  color: black
  margin: 0
  padding: 0
  box-sizing: border-box

/* This is the overlay for the popups */
.overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: rgba(0, 0, 0, 0.5)
  display: flex
  justify-content: center
  align-items: center
  z-index: 1000

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

.data-table th,
.data-table td
  padding: 5px
  text-align: center
  font-size: 1.3rem

.data-table th
  border-bottom: 4px solid black
  font-weight: bold

tr 
  text-align: center

/* These are the style for the view popup */
.view-card
  background-color: white
  padding: 20px
  border-radius: 10px
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)
  text-align: center
  width: 400px
  max-height: 500px
  overflow-y: auto
  display: flex
  flex-direction: column

.view-card h2
  margin-bottom: 20px
  font-size: 1.5rem

.view-card button
  font-family: 'Anta'
  background-color: white
  width: 100%
  padding: 10px
  font-size: 1.3rem
  text-align: center
  border: none

.view-card button
  border-radius: 5px
  cursor: pointer
  transition: background-color 0.3s ease-in-out

.view-card button[type="button"]
  background-color: #f44336
  color: white

.view-card button[type="button"]:hover
  background-color: #be2e24

@media (max-height: 500px)
  .view-card
    max-height: 300px
</style>
