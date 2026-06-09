import { ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import type { StatsSummary, UserResponse } from '../types/api'
import { useStatsSummary, type StatsSummaryApi } from './useStatsSummary'

describe('useStatsSummary', () => {
  it('nao carrega stats sem usuario autenticado', async () => {
    const client = createClient()
    const withFeedback = createWithFeedback()
    const statsSummary = useStatsSummary({
      route: route('progress'),
      user: ref<UserResponse | null>(null),
      client,
      withFeedback
    })

    await statsSummary.refreshStats()
    await statsSummary.syncProgressRoute()

    expect(client.stats).not.toHaveBeenCalled()
    expect(withFeedback).not.toHaveBeenCalled()
    expect(statsSummary.stats.value).toBeNull()
  })

  it('sincroniza a rota de progresso com feedback discreto', async () => {
    const client = createClient()
    const withFeedback = createWithFeedback()
    const user = ref<UserResponse | null>(userResponse())
    const statsSummary = useStatsSummary({
      route: route('progress'),
      user,
      client,
      withFeedback
    })

    await statsSummary.syncProgressRoute()

    expect(withFeedback).toHaveBeenCalledWith(expect.any(Function), {
      showLoading: false,
      clearOnStart: false
    })
    expect(client.stats).toHaveBeenCalledTimes(1)
    expect(statsSummary.stats.value?.dueNow).toBe(3)
  })

  it('limpa stats explicitamente', async () => {
    const statsSummary = useStatsSummary({
      route: route('library-public'),
      user: ref<UserResponse | null>(userResponse()),
      client: createClient(),
      withFeedback: createWithFeedback()
    })

    await statsSummary.refreshStats()
    statsSummary.clearStats()

    expect(statsSummary.stats.value).toBeNull()
  })
})

function createClient() {
  return {
    stats: vi.fn(async () => statsResponse())
  } satisfies StatsSummaryApi
}

function createWithFeedback() {
  return vi.fn(async (task: () => Promise<void>) => {
    await task()
  })
}

function route(name: string) {
  return {
    name,
    meta: {},
    params: {}
  } as RouteLocationNormalizedLoaded
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
