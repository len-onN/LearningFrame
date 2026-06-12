import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useAuthStore } from './useAuthStore'
import type { StatsSummary, UserResponse } from '../types/api'
import { useStatsStore, type StatsSummaryApi } from './useStatsStore'

describe('useStatsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('nao carrega stats sem usuario autenticado', async () => {
    const { client, store } = createSubject()

    await store.refreshStats()

    expect(client.stats).not.toHaveBeenCalled()
    expect(store.stats).toBeNull()
  })

  it('carrega stats com usuario autenticado', async () => {
    const { client, authStore, store } = createSubject()
    authStore.user = userResponse()

    await store.refreshStats()

    expect(client.stats).toHaveBeenCalledTimes(1)
    expect(store.stats?.dueNow).toBe(3)
  })

  it('limpa stats explicitamente', async () => {
    const { store, authStore } = createSubject()
    authStore.user = userResponse()

    await store.refreshStats()
    store.clearStats()

    expect(store.stats).toBeNull()
  })
})

function createSubject() {
  const authStore = useAuthStore()
  const client = createClient()
  const store = useStatsStore()
  store.setClient(client)

  return {
    client,
    authStore,
    store
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
