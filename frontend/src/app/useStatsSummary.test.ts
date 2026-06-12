import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useRoute } from 'vue-router'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import { useAuthStore } from '../stores/useAuthStore'
import type { StatsSummary, UserResponse } from '../types/api'
import { useStatsSummary, type StatsSummaryApi } from './useStatsSummary'

vi.mock('vue-router', () => ({
  useRoute: vi.fn()
}))



vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: vi.fn()
}))

describe('useStatsSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('nao carrega stats sem usuario autenticado', async () => {
    const { client, statsSummary } = createSubject({ routeName: 'progress' })

    await statsSummary.refreshStats()
    await statsSummary.syncProgressRoute()

    expect(client.stats).not.toHaveBeenCalled()
    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.withFeedback).not.toHaveBeenCalled()
    expect(statsSummary.stats.value).toBeNull()
  })

  it('sincroniza a rota de progresso com feedback discreto', async () => {
    const { client, user, statsSummary } = createSubject({ routeName: 'progress' })
    user.value = userResponse()

    await statsSummary.syncProgressRoute()

    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.withFeedback).toHaveBeenCalledWith(expect.any(Function), {
      showLoading: false,
      clearOnStart: false
    })
    expect(client.stats).toHaveBeenCalledTimes(1)
    expect(statsSummary.stats.value?.dueNow).toBe(3)
  })

  it('limpa stats explicitamente', async () => {
    const { statsSummary, user } = createSubject({ routeName: 'library-public' })
    user.value = userResponse()

    await statsSummary.refreshStats()
    statsSummary.clearStats()

    expect(statsSummary.stats.value).toBeNull()
  })
})

function createSubject(options: { routeName: string }) {
  const route = { name: options.routeName }
  const user = ref<UserResponse | null>(null)
  const feedbackStore = useFeedbackStore()
  feedbackStore.withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  vi.mocked(useRoute).mockReturnValue(route as any)

  vi.mocked(useAuthStore).mockReturnValue({ user } as any)

  const client = createClient()
  const statsSummary = useStatsSummary({ client })

  return {
    client,

    user,
    statsSummary
  }
}

function createClient() {
  return {
    stats: vi.fn(async () => statsResponse())
  } satisfies StatsSummaryApi
}

function userResponse(): UserResponse {
  return {
    id: 1,
    displayName: 'Ada',
    email: 'ada@example.com'
  }
}

function statsResponse(): StatsSummary {
  return {
    dueNow: 3,
    reviewsToday: 5,
    accuracyLast7Days: 86,
    activeDaysLast30: 4,
    nextDueAt: null
  }
}
