import { defineStore } from 'pinia'
import { ref } from 'vue'
import serviceLogger from '@/utils/logger.custom.util'

export const useTimeTableStore = defineStore('timeTable', () => {
  const logger = serviceLogger('timeTableStore');
  const url = import.meta.env.VITE_API_URL;
  const timeList = ref([])

  const isTimeValid = () => {
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5]\d$/

    for (let i = 0; i < timeList.value.length; i++) {
      if (!timePattern.test(timeList.value[i][0]) || !timePattern.test(timeList.value[i][1])) {
        return false
      }
    }

    return true
  }

  async function updateSchedule() {
    try {
      logger.debug(`${timeList.value}`)
      const response = await fetch(`${url}/api/songs/server/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule: timeList.value.reduce((accumulator, value) => accumulator.concat(value), []) }),
      });
      const data = await response.json();
      if (!response.ok) {
        logger.error(`Error updating schedule: ${data.message}`);
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      const e = error as Error;
      logger.error(`Error updating schedule: ${e.message}`);
      throw new Error(`Error updating schedule: ${e.message}`);
    }
  }

  return {
    timeList,
    isTimeValid,
    updateSchedule,
  }
})
