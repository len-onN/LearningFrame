import { ref } from 'vue'
import { api } from '../../services/api'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import type { DeckSummary } from '../../types/api'


export interface LibraryActionsApi {
  copyPublicDeck(deckId: number): Promise<DeckSummary>
  deleteDecks(deckIds: number[]): Promise<void>
}

import { useAuthStore } from '../../stores/useAuthStore'
import { storeToRefs } from 'pinia'

import { useDeckLibrary } from './useDeckLibrary'
import { useStatsStore } from '../../stores/useStatsStore'
import { useDeckManagement } from './useDeckManagement'
import { useRouter } from 'vue-router'
import { useAuthFlow } from '../auth/useAuthFlow'


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
  const statsStore = useStatsStore()
  const { setManagedDeck } = useDeckManagement()
  const authFlow = useAuthFlow()
  const loadingMorePublicDecks = ref(false)
  const loadingMoreMyDecks = ref(false)

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
        await statsStore.refreshStats()
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
      feedbackStore.showNotice('Sign in to save this deck to My decks.')
      return
    }

    await feedbackStore.withFeedback(async () => {
      const saved = await client.copyPublicDeck(deck.id)
      librarySearch.value = ''
      await loadMyDecks(true)
      await statsStore.refreshStats()
      await navigateToMyDecks()
      feedbackStore.showNotice('Deck saved to My decks as a private copy.')
      await highlightDeck(saved.id)
    })
  }

  async function deleteSelectedMyDecks() {
    const deckIds = [...selectedMyDeckIds.value]
    if (deckIds.length === 0) {
      return
    }
    const label = deckIds.length === 1 ? '1 selected deck' : `${deckIds.length} selected decks`
    const cardsLabel = deckIds.length === 1 ? 'all of its cards' : 'all of their cards'
    if (!confirm(`Delete ${label} and ${cardsLabel}?`)) {
      return
    }

    await feedbackStore.withFeedback(async () => {
      await client.deleteDecks(deckIds)
      exitDeckSelectionMode()
      await loadMyDecks(true)
      if (user.value) {
        await statsStore.refreshStats()
      }
      feedbackStore.showNotice(deckIds.length === 1 ? 'Deck deleted.' : 'Selected decks deleted.')
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
