import type { Ref } from 'vue'
import { ref } from 'vue'
import { api } from '../../services/api'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import type { DeckSummary, UserResponse } from '../../types/api'
import type { AuthMode } from '../../utils/authValidation'

export interface LibraryActionsApi {
  copyPublicDeck(deckId: number): Promise<DeckSummary>
  deleteDecks(deckIds: number[]): Promise<void>
}

import { useAuthStore } from '../../stores/useAuthStore'
import { storeToRefs } from 'pinia'

import { useDeckLibrary } from './useDeckLibrary'
import { useStatsSummary } from '../../app/useStatsSummary'
import { useDeckManagement } from './useDeckManagement'
import { useRouter } from 'vue-router'
import { useAuthFlow } from '../auth/useAuthFlow'

const loadingMorePublicDecks = ref(false)
const loadingMoreMyDecks = ref(false)

export function useLibraryActions({
  client = api,
  confirm = (message) => window.confirm(message)
}: {
  client?: LibraryActionsApi
  confirm?: (message: string) => boolean
} = {}) {
  const router = useRouter()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  const feedbackStore = useFeedbackStore()
  const { librarySearch, selectedMyDeckIds, loadPublicDecks, loadMyDecks, highlightDeck, exitDeckSelectionMode, clearMyDeckSelection } = useDeckLibrary({ librarySection: ref('public') })
  const { refreshStats } = useStatsSummary()
  const { setManagedDeck } = useDeckManagement()
  const authFlow = useAuthFlow({
    authMode: ref('login') as any,
    route: router.currentRoute.value,
    login: () => Promise.resolve({} as any),
    register: () => Promise.resolve({} as any),
    persistSession: () => {},
    refreshAfterAuth: () => Promise.resolve(),
    closeManagedDeck: () => Promise.resolve(true),
    navigateToImport: () => Promise.resolve(),
    navigateToRedirect: () => Promise.resolve(),
    navigateToMyDecks: () => Promise.resolve()
  })

  async function navigateToMyDecks() {
    await router.replace({ name: 'library-mine' })
  }

  async function navigateToManagedDeck(deckId: number) {
    await router.push({ name: 'library-deck-manage', params: { deckId } })
  }

  async function refreshAll() {
    await feedbackStore.withFeedback(async () => {
      await loadPublicDecks(true)
      if (user.value) {
        await loadMyDecks(true)
        await refreshStats()
      }
    }, { showLoading: false })
  }
  async function loadMorePublicDecks() {
    loadingMorePublicDecks.value = true
    try {
      await feedbackStore.withFeedback(async () => {
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
      await feedbackStore.withFeedback(async () => {
        await loadMyDecks()
      }, { showLoading: false })
    } finally {
      loadingMoreMyDecks.value = false
    }
  }

  async function savePublicDeck(deck: DeckSummary) {
    if (!user.value) {
      await authFlow.openAuth('login')
      feedbackStore.showNotice('Entre para salvar este baralho em Meus baralhos.')
      return
    }

    await feedbackStore.withFeedback(async () => {
      const saved = await client.copyPublicDeck(deck.id)
      librarySearch.value = ''
      await loadMyDecks(true)
      await refreshStats()
      await navigateToMyDecks()
      feedbackStore.showNotice('Baralho salvo em Meus baralhos como copia privada.')
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

    await feedbackStore.withFeedback(async () => {
      await client.deleteDecks(deckIds)
      exitDeckSelectionMode()
      await loadMyDecks(true)
      if (user.value) {
        await refreshStats()
      }
      feedbackStore.showNotice(deckIds.length === 1 ? 'Baralho excluido.' : 'Baralhos selecionados excluidos.')
    })
  }

  function clearSelectedMyDecks() {
    clearMyDeckSelection()
  }

  async function openManagedDeck(deck: DeckSummary, showLoading = true) {
    if (!user.value) {
      await authFlow.openAuth('login')
      return
    }
    await feedbackStore.withFeedback(async () => {
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
