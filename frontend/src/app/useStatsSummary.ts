import { ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'
import type { StatsSummary, UserResponse } from '../types/api'

import { useAuthSession } from '../composables/useAuthSession'
import { useFeedback } from '../composables/useFeedback'

export interface StatsSummaryApi {
  stats(): Promise<StatsSummary>
}

const stats = ref<StatsSummary | null>(null)

export function useStatsSummary({
  client = api
}: { client?: StatsSummaryApi } = {}) {
  const route = useRoute()
  const { user } = useAuthSession()
  const { withFeedback } = useFeedback()

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
      await withFeedback(async () => {
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
