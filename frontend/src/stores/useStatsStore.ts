import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'
import type { StatsSummary } from '../types/api'
import { useAuthStore } from './useAuthStore'

export interface StatsSummaryApi {
  stats(): Promise<StatsSummary>
}

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<StatsSummary | null>(null)
  
  // We can inject a custom client for testing
  let client: StatsSummaryApi = api

  function setClient(newClient: StatsSummaryApi) {
    client = newClient
  }

  async function refreshStats() {
    const authStore = useAuthStore()
    if (!authStore.user) {
      stats.value = null
      return
    }
    stats.value = await client.stats()
  }

  function clearStats() {
    stats.value = null
  }

  return {
    stats,
    refreshStats,
    clearStats,
    setClient
  }
})
