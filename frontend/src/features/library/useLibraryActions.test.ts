import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { DeckSummary, UserResponse } from '../../types/api'
import { useLibraryActions, type LibraryActionsApi } from './useLibraryActions'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/useAuthStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { useDeckLibrary } from './useDeckLibrary'
import { useStatsSummary } from '../../app/useStatsSummary'
import { useDeckManagement } from './useDeckManagement'
import { useAuthFlow } from '../auth/useAuthFlow'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('./useDeckLibrary', () => ({
  useDeckLibrary: vi.fn()
}))

vi.mock('../../app/useStatsSummary', () => ({
  useStatsSummary: vi.fn()
}))

vi.mock('./useDeckManagement', () => ({
  useDeckManagement: vi.fn()
}))

vi.mock('../auth/useAuthFlow', () => ({
  useAuthFlow: vi.fn()
}))

describe('useLibraryActions', () => {
  it('atualiza publica, meus baralhos e stats quando ha usuario', async () => {
    const subject = createSubject({ user: userResponse() })

    await subject.actions.refreshAll()

    expect(subject.withFeedback).toHaveBeenCalledWith(expect.any(Function), { showLoading: false })
    expect(subject.loadPublicDecks).toHaveBeenCalledWith(true)
    expect(subject.loadMyDecks).toHaveBeenCalledWith(true)
    expect(subject.refreshStats).toHaveBeenCalled()
  })

  it('carrega mais decks preservando loading invisivel', async () => {
    const subject = createSubject()

    await subject.actions.loadMorePublicDecks()
    await subject.actions.loadMoreMyDecks()

    expect(subject.withFeedback).toHaveBeenNthCalledWith(1, expect.any(Function), { showLoading: false })
    expect(subject.withFeedback).toHaveBeenNthCalledWith(2, expect.any(Function), { showLoading: false })
    expect(subject.loadPublicDecks).toHaveBeenCalledWith()
    expect(subject.loadMyDecks).toHaveBeenCalledWith()
  })

  it('abre auth ao salvar deck publico sem sessao', async () => {
    const subject = createSubject({ user: null })

    await subject.actions.savePublicDeck(deck(3, 'Publico'))

    expect(subject.openAuth).toHaveBeenCalledWith('login')
    expect(subject.showNotice).toHaveBeenCalledWith('Entre para salvar este baralho em Meus baralhos.')
    expect(subject.client.copyPublicDeck).not.toHaveBeenCalled()
  })

  it('salva deck publico, recarrega meus baralhos e preserva highlight', async () => {
    const subject = createSubject({
      user: userResponse(),
      librarySearch: 'neuro'
    })
    subject.client.copyPublicDeck.mockResolvedValueOnce(deck(9, 'Copia'))

    await subject.actions.savePublicDeck(deck(3, 'Publico'))

    expect(subject.client.copyPublicDeck).toHaveBeenCalledWith(3)
    expect(subject.librarySearch.value).toBe('')
    expect(subject.loadMyDecks).toHaveBeenCalledWith(true)
    expect(subject.refreshStats).toHaveBeenCalled()
    expect(subject.navigateToMyDecks).toHaveBeenCalled()
    expect(subject.highlightDeck).toHaveBeenCalledWith(9)
    expect(subject.showNotice).toHaveBeenCalledWith('Baralho salvo em Meus baralhos como copia privada.')
  })

  it('confirma exclusao em lote antes de excluir meus baralhos', async () => {
    const subject = createSubject({
      user: userResponse(),
      selectedIds: [2, 3],
      confirm: vi.fn(() => true)
    })

    await subject.actions.deleteSelectedMyDecks()

    expect(subject.confirm).toHaveBeenCalledWith('Excluir 2 baralhos selecionados e todas as suas cartas?')
    expect(subject.client.deleteDecks).toHaveBeenCalledWith([2, 3])
    expect(subject.exitDeckSelectionMode).toHaveBeenCalled()
    expect(subject.loadMyDecks).toHaveBeenCalledWith(true)
    expect(subject.refreshStats).toHaveBeenCalled()
    expect(subject.showNotice).toHaveBeenCalledWith('Baralhos selecionados excluidos.')
  })

  it('nao exclui meus baralhos quando a confirmacao e cancelada', async () => {
    const subject = createSubject({
      selectedIds: [2],
      confirm: vi.fn(() => false)
    })

    await subject.actions.deleteSelectedMyDecks()

    expect(subject.client.deleteDecks).not.toHaveBeenCalled()
    expect(subject.withFeedback).not.toHaveBeenCalled()
  })

  it('abre deck gerenciado com callbacks nomeados', async () => {
    const selectedDeck = deck(7, 'Meu deck')
    const subject = createSubject({
      user: userResponse(),
      librarySearch: 'busca'
    })

    await subject.actions.openManagedDeck(selectedDeck, false)

    expect(subject.withFeedback).toHaveBeenCalledWith(expect.any(Function), false)
    expect(subject.setManagedDeck).toHaveBeenCalledWith(selectedDeck)
    expect(subject.librarySearch.value).toBe('')
    expect(subject.navigateToManagedDeck).toHaveBeenCalledWith({ name: 'library-deck-manage', params: { deckId: 7 } })
  })
})

function createSubject(options: {
  user?: UserResponse | null
  librarySearch?: string
  selectedIds?: number[]
  confirm?: (message: string) => boolean
} = {}) {
  setActivePinia(createPinia())
  const client = createClient()
  const user = ref<UserResponse | null>(options.user ?? null)
  const librarySearch = ref(options.librarySearch ?? '')
  const selectedMyDeckIds = ref(new Set(options.selectedIds ?? []))
  const loadPublicDecks = vi.fn(async () => undefined)
  const loadMyDecks = vi.fn(async () => undefined)
  const setManagedDeck = vi.fn()
  const highlightDeck = vi.fn(async () => undefined)
  const exitDeckSelectionMode = vi.fn()
  const clearMyDeckSelection = vi.fn()
  const openAuth = vi.fn(async () => undefined)
  const navigateToMyDecks = vi.fn(async () => undefined)
  const navigateToManagedDeck = vi.fn(async () => undefined)
  const refreshStats = vi.fn(async () => undefined)
  const showNotice = vi.fn()
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })
  const feedbackStore = useFeedbackStore()
  try { feedbackStore.showNotice = showNotice as any } catch(e) {}
  try { feedbackStore.withFeedback = withFeedback as any } catch(e) {}
  const confirm = options.confirm ?? vi.fn(() => true)

  vi.mocked(useRouter).mockReturnValue({
    replace: navigateToMyDecks,
    push: navigateToManagedDeck,
    currentRoute: ref({ name: 'library-public' })
  } as any)

  vi.mocked(useAuthStore).mockReturnValue({
    user
  } as any)

  
  vi.mocked(useDeckLibrary).mockReturnValue({
    librarySearch,
    selectedMyDeckIds,
    loadPublicDecks,
    loadMyDecks,
    highlightDeck,
    exitDeckSelectionMode,
    clearMyDeckSelection
  } as any)

  vi.mocked(useStatsSummary).mockReturnValue({
    refreshStats
  } as any)

  vi.mocked(useDeckManagement).mockReturnValue({
    setManagedDeck
  } as any)

  vi.mocked(useAuthFlow).mockReturnValue({
    openAuth
  } as any)

  const actions = useLibraryActions({
    client,
    confirm
  })

  return {
    client,
    user,
    librarySearch,
    selectedMyDeckIds,
    loadPublicDecks,
    loadMyDecks,
    setManagedDeck,
    highlightDeck,
    exitDeckSelectionMode,
    clearMyDeckSelection,
    openAuth,
    navigateToMyDecks,
    navigateToManagedDeck,
    refreshStats,
    showNotice,
    withFeedback,
    confirm,
    actions
  }
}

function createClient() {
  return {
    copyPublicDeck: vi.fn(async (deckId: number) => deck(deckId, 'Copia')),
    deleteDecks: vi.fn(async () => undefined)
  } satisfies LibraryActionsApi
}

function userResponse(): UserResponse {
  return {
    id: 1,
    displayName: 'Ada',
    email: 'ada@example.com'
  }
}

function deck(id: number, title: string): DeckSummary {
  return {
    id,
    title,
    description: '',
    visibility: 'PRIVATE',
    sourceFormat: 'MANUAL',
    cardCount: 1,
    dueCount: 0,
    nextDueAt: null,
    ownerName: 'Ada',
    updatedAt: '2026-06-02T00:00:00Z'
  }
}
