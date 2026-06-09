import { ref, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { FeedbackOptions } from '../composables/useFeedback'
import { api } from '../services/api'
import type { StatsSummary, UserResponse } from '../types/api'

export interface StatsSummaryApi {
  stats(): Promise<StatsSummary>
}

export interface StatsSummaryOptions {
  route: RouteLocationNormalizedLoaded
  user: Ref<UserResponse | null>
  client?: StatsSummaryApi
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
}

export function useStatsSummary({
  route,
  user,
  client = api,
  withFeedback
}: StatsSummaryOptions) {
  const stats = ref<StatsSummary | null>(null)

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
