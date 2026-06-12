import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick, ref } from 'vue'
import {  afterEach, describe, expect, it, vi , beforeEach } from 'vitest'
import type { UserResponse } from '../types/api'
import { useLibrarySearchLifecycle } from './useLibrarySearchLifecycle'
import { useFeedbackStore } from '../stores/useFeedbackStore'

describe('useLibrarySearchLifecycle', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounceia busca publica preservando loading invisivel', async () => {
    vi.useFakeTimers()
    const { loadPublicDecks, loadMyDecks } = createSubject()
    const librarySearch = ref('')
    const scope = effectScope()

    scope.run(() => {
      useLibrarySearchLifecycle({
        librarySearch,
        librarySection: ref('public'),
        user: ref(null),
        delayMs: 300,
        loadPublicDecks,
        loadMyDecks
      })
    })

    librarySearch.value = 'neuro'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(loadPublicDecks).toHaveBeenCalledWith(true)
    expect(loadMyDecks).not.toHaveBeenCalled()
    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.withFeedback).toHaveBeenCalledWith(expect.any(Function), { showLoading: false })
    scope.stop()
  })

  it('limpa debounce pendente ao descartar o escopo', async () => {
    vi.useFakeTimers()
    const { loadPublicDecks, loadMyDecks } = createSubject()
    const librarySearch = ref('')
    const scope = effectScope()

    scope.run(() => {
      useLibrarySearchLifecycle({
        librarySearch,
        librarySection: ref('public'),
        user: ref(null),
        delayMs: 300,
        loadPublicDecks,
        loadMyDecks
      })
    })

    librarySearch.value = 'cardio'
    await nextTick()
    scope.stop()
    await vi.advanceTimersByTimeAsync(300)

    expect(loadPublicDecks).not.toHaveBeenCalled()
  })

  it('debounceia busca de meus baralhos apenas com usuario autenticado', async () => {
    vi.useFakeTimers()
    const { loadPublicDecks, loadMyDecks } = createSubject()
    const user = ref<UserResponse | null>({
      id: 1,
      displayName: 'Ada',
      email: 'ada@example.com'
    })
    const librarySearch = ref('')
    const scope = effectScope()

    scope.run(() => {
      useLibrarySearchLifecycle({
        librarySearch,
        librarySection: ref('mine'),
        user,
        delayMs: 300,
        loadPublicDecks,
        loadMyDecks
      })
    })

    librarySearch.value = 'memoria'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(loadPublicDecks).not.toHaveBeenCalled()
    expect(loadMyDecks).toHaveBeenCalledWith(true)
    scope.stop()
  })

  it('ignora debounce quando a query atual ja foi carregada por outro sync', async () => {
    vi.useFakeTimers()
    const { loadPublicDecks, loadMyDecks } = createSubject()
    const librarySearch = ref('')
    const scope = effectScope()

    scope.run(() => {
      useLibrarySearchLifecycle({
        librarySearch,
        librarySection: ref('public'),
        user: ref(null),
        delayMs: 300,
        loadPublicDecks,
        loadMyDecks,
        shouldLoadPublicDecks: () => false
      })
    })

    librarySearch.value = 'neuro'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.withFeedback).not.toHaveBeenCalled()
    expect(loadPublicDecks).not.toHaveBeenCalled()
    scope.stop()
  })
})

function createSubject() {
  const loadPublicDecks = vi.fn(async () => undefined)
  const loadMyDecks = vi.fn(async () => undefined)
  const feedbackStore = useFeedbackStore()
  feedbackStore.withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  return {
    loadPublicDecks,
    loadMyDecks
  }
}
