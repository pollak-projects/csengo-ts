<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useTvStore } from '@/stores/tv'

const isActiveSession = ref<null | boolean>(null)

const store = useTvStore()

Chart.register(ChartDataLabels)

const chartInstance = ref<null | Chart>(null)

const createChart = async () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  await nextTick()

  const canvas = document.getElementById('voteChart') as HTMLCanvasElement

  const ctx = canvas!.getContext('2d')
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: store.songs.map(song => song.songTitle.length > 10 ? song.songTitle.substring(0, 10) + '...' : song.songTitle),
      datasets: [
        {
          label: 'Szavazatok',
          data: store.songs.map(song => song.voteCount),
          backgroundColor: store.colors,
          borderRadius: { topLeft: 10, topRight: 10 },
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: 'white',
          font: {
            size: 20
          },
          anchor: 'end',
          align: 'top',
          formatter: (value) => value
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
            font: {
              size: 20,
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: 'Zenék',
            color: 'white',
            font: {
              size: 20,
              weight: 'bold'
            }
          }
        },
        y: {
          ticks: {
            color: 'white',
            font: {
              size: 20,
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: 'Szavazatok száma',
            color: 'white',
            font: {
              size: 20,
              weight: 'bold'
            }
          },
          beginAtZero: true,
          suggestedMax: Math.max(...store.songs.map(song => song.voteCount)) + 1
        }
      }
    },
    plugins: [ChartDataLabels]
  })
}

const countdown = ref(120)

const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const startCountdown = () => {
  setInterval(async () => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      await displayDiagram()
      countdown.value = 120
    }
  }, 1000)
}

const startAutoScroll = async () => {
  const legend = document.querySelector('.legend')
  let scrollDirection = 1

  setInterval(() => {
    if (legend) {
      if (legend.scrollTop + legend.clientHeight >= legend.scrollHeight) {
        scrollDirection = -1
      } else if (legend.scrollTop <= 0) {
        scrollDirection = 1
      }

      legend.scrollTop += scrollDirection
    }
  }, 30)

}

async function displayDiagram() {
  await store.fetchSummaryOfVotesInSession()

  if (store.songs.length < 2) {
    isActiveSession.value = false
  } else {
    store.songs.sort((a, b) => b.voteCount - a.voteCount)
    isActiveSession.value = true
    await createChart()
    await startAutoScroll()
  }
}

onMounted(async () => {
  await displayDiagram()
  startCountdown()
})
</script>

<template>
  <div v-if="isActiveSession == null"></div>
  <div v-else-if="isActiveSession" class="chart-container">
    <div class="chart">
      <canvas class="vote-chart" id="voteChart"></canvas>
    </div>
    <div class="legend">
      <div class="timer">
        <h1>Frissítés: {{ formattedCountdown }}</h1>
        <h1 class="connection-title">Színek -- zenék</h1>
      </div>
      <ul class="title-container">
        <li v-for="(song, index) in store.songs" :key="song.songId">
          <span :style="{ backgroundColor: store.colors[index] }" class="color-box"></span>
          <span class="song-title">{{ song.songTitle.length > 20 ? song.songTitle.substring(0, 20) + '...' :
            song.songTitle }} - {{ song.voteCount }}</span>
        </li>
      </ul>
    </div>
  </div>
  <div v-else class="centered-message">
    <img alt="Pollák" src="../assets/pollakLogo.png" />
    <h3>Jelenleg nincsen aktív szavazás</h3>
    <h4>Töltsetek fel új zenéket</h4>
  </div>
</template>

<style scoped lang="sass">
@import url('https://fonts.googleapis.com/css2?family=Anta&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap')

*
  font-family: 'Anta', serif

img
  width: 25%
  height: 25%


.centered-message
  font-family: 'Anta', serif
  font-size: clamp(1rem, 2.5vw, 4rem)
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  text-align: center
  color: #fff

.timer
  text-align: center
  font-size: 2rem

.timer,
h1
  position: sticky
  top: 0
  z-index: 2
  margin: 0

.connection-title
  text-align: center
  font-size: 2rem

.legend
  flex: 1
  overflow-y: auto
  max-height: calc(100vh - 100px)
  scrollbar-width: none
  scroll-behavior: smooth

.chart-container
  color: #fff
  display: flex
  gap: 20px
  padding: 20px
  height: 100vh
  box-sizing: border-box


.chart
  flex: 3
  display: flex
  align-items: center
  justify-content: center

.color-box
  display: inline-block
  width: 20px
  height: 20px
  margin-right: 10px
  border-radius: 3px

.song-title
  font-size: 1.5rem
  font-weight: bold

body,
html
  margin: 0
  padding: 0
  width: 100%
  height: 100%
</style>
