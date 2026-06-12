import { ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'
import type { StatsSummary, UserResponse } from '../types/api'

import { useAuthStore } from '../stores/useAuthStore'
import { storeToRefs } from 'pinia'
import { useFeedbackStore } from '../stores/useFeedbackStore'

export interface StatsSummaryApi {
  stats(): Promise<StatsSummary>
}

const stats = ref<StatsSummary | null>(null)

export function useStatsSummary({
  client = api
}: { client?: StatsSummaryApi } = {}) {
  const route = useRoute()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  const feedbackStore = useFeedbackStore()

  async function refreshStats() {
    if (!user.value) {
      stats.value = null
      return
    }
    stats.value = await client.stats()
  }

  function clearStats() {
    stats.value = null
  }

  async function syncProgressRoute() {
    if (route.name === 'progress' && user.value) {
      await feedbackStore.withFeedback(async () => {
        await refreshStats()
      }, { showLoading: false, clearOnStart: false })
    }
  }

  return {
    stats,
    refreshStats,
    clearStats,
    syncProgressRoute
  }
}
