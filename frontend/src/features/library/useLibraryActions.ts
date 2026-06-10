import type { Ref } from 'vue'
import { ref } from 'vue'
import { api } from '../../services/api'
import type { FeedbackOptions } from '../../composables/useFeedback'
import type { DeckSummary, UserResponse } from '../../types/api'
import type { AuthMode } from '../../utils/authValidation'

export interface LibraryActionsApi {
  copyPublicDeck(deckId: number): Promise<DeckSummary>
  deleteDecks(deckIds: number[]): Promise<void>
}

export interface LibraryActionsOptions {
  user: Ref<UserResponse | null>
  librarySearch: Ref<string>
  selectedMyDeckIds: Ref<Set<number>>
  client?: LibraryActionsApi
  loadPublicDecks: (reset?: boolean) => Promise<void>
  loadMyDecks: (reset?: boolean) => Promise<void>
  setManagedDeck: (deck: DeckSummary) => void
  highlightDeck: (deckId: number) => Promise<void>
  exitDeckSelectionMode: () => void
  clearMyDeckSelection: () => void
  openAuth: (mode?: AuthMode) => Promise<void>
  navigateToMyDecks: () => Promise<void>
  navigateToManagedDeck: (deckId: number) => Promise<void>
  refreshStats: () => Promise<void>
  showNotice: (message: string) => void
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
  confirm?: (message: string) => boolean
}

export function useLibraryActions({
  user,
  librarySearch,
  selectedMyDeckIds,
  client = api,
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
  confirm = (message) => window.confirm(message)
}: LibraryActionsOptions) {
  async function refreshAll() {
    await withFeedback(async () => {
      await loadPublicDecks(true)
      if (user.value) {
        await loadMyDecks(true)
        await refreshStats()
      }
    }, { showLoading: false })
  }

  const loadingMorePublicDecks = ref(false)
  async function loadMorePublicDecks() {
    loadingMorePublicDecks.value = true
    try {
      await withFeedback(async () => {
        await loadPublicDecks()
      }, { showLoading: false })
    } finally {
      loadingMorePublicDecks.value = false
    }
  }

  const loadingMoreMyDecks = ref(false)
  async function loadMoreMyDecks() {
    loadingMoreMyDecks.value = true
    try {
      await withFeedback(async () => {
        await loadMyDecks()
      }, { showLoading: false })
    } finally {
      loadingMoreMyDecks.value = false
    }
  }

  async function savePublicDeck(deck: DeckSummary) {
    if (!user.value) {
      await openAuth('login')
      showNotice('Entre para salvar este baralho em Meus baralhos.')
      return
    }

    await withFeedback(async () => {
      const saved = await client.copyPublicDeck(deck.id)
      librarySearch.value = ''
      await loadMyDecks(true)
      await refreshStats()
      await navigateToMyDecks()
      showNotice('Baralho salvo em Meus baralhos como copia privada.')
      await highlightDeck(saved.id)
    })
  }

  async function deleteSelectedMyDecks() {
    const deckIds = [...selectedMyDeckIds.value]
    if (deckIds.length === 0) {
      return
    }
    const label = deckIds.length === 1 ? '1 baralho selecionado' : `${deckIds.length} baralhos selecionados`
    if (!confirm(`Excluir ${label} e todas as suas cartas?`)) {
      return
    }

    await withFeedback(async () => {
      await client.deleteDecks(deckIds)
      exitDeckSelectionMode()
      await loadMyDecks(true)
      if (user.value) {
        await refreshStats()
      }
      showNotice(deckIds.length === 1 ? 'Baralho excluido.' : 'Baralhos selecionados excluidos.')
    })
  }

  function clearSelectedMyDecks() {
    clearMyDeckSelection()
  }

  async function openManagedDeck(deck: DeckSummary, showLoading = true) {
    if (!user.value) {
      await openAuth('login')
      return
    }
    await withFeedback(async () => {
      setManagedDeck(deck)
      librarySearch.value = ''
      await navigateToManagedDeck(deck.id)
    }, showLoading)
  }

  return {
    loadingMorePublicDecks,
    loadingMoreMyDecks,
    refreshAll,
    loadMorePublicDecks,
    loadMoreMyDecks,
    savePublicDeck,
    deleteSelectedMyDecks,
    clearSelectedMyDecks,
    openManagedDeck
  }
}
