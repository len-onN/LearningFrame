<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LibraryPage from '../pages/LibraryPage.vue'
import { useDeckLibrary } from '../features/library/useDeckLibrary'
import { useDeckManagement } from '../features/library/useDeckManagement'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import { useLibraryActions } from '../features/library/useLibraryActions'
import { useAuthFlow } from '../features/auth/useAuthFlow'
import { useAuthStore } from '../stores/useAuthStore'
import { storeToRefs } from 'pinia'

import { cardCountLabel, deckDueLabel } from '../features/library/deckFormatters'
import { cardTextSummary as summarizeCardText } from '../features/library/cardText'
import { htmlSummary } from '../features/import/importPreview'
import type { DeckSummary, CardResponse } from '../types/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const feedbackStore = useFeedbackStore()


const librarySection = computed<'public' | 'mine'>(() => {
  if (route.name === 'library-mine' || route.name === 'library-deck-manage') {
    return 'mine'
  }
  return 'public'
})

const libraryView = computed<'decks' | 'manage-deck'>(() => {
  if (route.name === 'library-deck-manage') {
    return 'manage-deck'
  }
  return 'decks'
})

const library = useDeckLibrary({ librarySection })

const librarySearch = computed({
  get: () => library.librarySearch.value,
  set: (val) => { library.librarySearch.value = val }
})
const activeLibraryCountLabel = computed(() => library.activeLibraryCountLabel.value)
const filteredPublicDecks = computed(() => library.publicDecks.value)
const filteredMyDecks = computed(() => library.myDecks.value)
const publicDecksHasMore = computed(() => library.publicDecksHasMore.value)
const myDecksHasMore = computed(() => library.myDecksHasMore.value)
const highlightedDeckId = computed(() => library.highlightedDeckId.value)
const deckSelectionMode = computed(() => library.deckSelectionMode.value)
const selectedMyDeckIds = computed(() => library.selectedMyDeckIds.value)
const selectedMyDecksCount = computed(() => library.selectedMyDecksCount.value)
const allVisibleMyDecksSelected = computed(() => library.allVisibleMyDecksSelected.value)

const toggleDeckSelectionMode = library.toggleDeckSelectionMode
const toggleVisibleMyDeckSelection = library.toggleVisibleMyDeckSelection
const clearMyDeckSelection = library.clearMyDeckSelection
const toggleMyDeckSelection = library.toggleMyDeckSelection

const {
  managedDeck,
  managedDeckForm,
  managedDeckDirty,
  managedCardsView,
  managedCardsSearch,
  loadingMoreManagedCards,
  updateManagedDeckForm,
  closeManagedDeck,
  saveManagedDeck,
  deleteManagedDeck,
  openCreateCardEditor,
  toggleVisibleManagedCardsSelection,
  clearManagedCardSelection,
  deleteSelectedManagedCards,
  selectManagedCard,
  toggleManagedCardSelection,
  loadMoreManagedCards,
  openEditCardEditor,
  deleteManagedCard
} = useDeckManagement()

const {
  loadingMorePublicDecks,
  loadingMoreMyDecks,
  refreshAll,
  savePublicDeck,
  loadMorePublicDecks,
  loadMoreMyDecks,
  openManagedDeck,
  deleteSelectedMyDecks
} = useLibraryActions()

const authFlow = useAuthFlow({
  authMode: computed(() => 'login' as const),
  route,
  login: () => Promise.resolve({} as any),
  register: () => Promise.resolve({} as any),
  persistSession: () => {},
  refreshAfterAuth: refreshAll,
  closeManagedDeck: closeManagedDeck,
  navigateToImport: async () => {},
  navigateToRedirect: async () => {},
  navigateToMyDecks: async () => {},
  
  
})

const deckFormatters = {
  cardCount: cardCountLabel,
  due: (deck: DeckSummary) => deckDueLabel(deck, Boolean(user.value))
}

const cardTextSummary = (card: CardResponse) => summarizeCardText(card, managedCardsView.value.cards, htmlSummary)

function navigateTo(to: any) {
  return router.push(to)
}

function startDeck(deck: DeckSummary) {
  return router.push({ name: 'study-deck', params: { deckId: deck.id } })
}

function startInterleavedFromSelection(deckIds: number[]) {
  return router.push({ name: 'study-interleaved', query: { decks: deckIds.join(',') } })
}

function openAuth(mode: any) {
  return authFlow.openAuth(mode)
}
</script>

<template>
  <LibraryPage
    v-model:search="librarySearch"
    :section="librarySection"
    :view="libraryView"
    :user="user"
    :active-count-label="activeLibraryCountLabel"
    :public-decks="filteredPublicDecks"
    :my-decks="filteredMyDecks"
    :public-decks-has-more="publicDecksHasMore"
    :my-decks-has-more="myDecksHasMore"
    :loading-more-public="loadingMorePublicDecks"
    :loading-more-mine="loadingMoreMyDecks"
    :highlighted-deck-id="highlightedDeckId"
    :deck-selection-mode="deckSelectionMode"
    :selected-my-deck-ids="selectedMyDeckIds"
    :selected-my-decks-count="selectedMyDecksCount"
    :all-visible-my-decks-selected="allVisibleMyDecksSelected"
    :managed-deck="managedDeck"
    :managed-deck-form="managedDeckForm"
    :managed-deck-dirty="managedDeckDirty"
    :managed-cards-view="managedCardsView"
    :managed-cards-search="managedCardsSearch"
    @update:managed-cards-search="managedCardsSearch = $event"
    :loading-more-cards="loadingMoreManagedCards"
    :deck-formatters="deckFormatters"
    :card-text-summary="cardTextSummary"
    :card-count-label="cardCountLabel"
    @go-public="navigateTo({ name: 'library-public' })"
    @go-mine="navigateTo({ name: 'library-mine' })"
    @refresh="refreshAll"
    @start-deck="startDeck"
    @save-public-deck="savePublicDeck"
    @load-more-public="loadMorePublicDecks"
    @load-more-mine="loadMoreMyDecks"
    @open-managed-deck="openManagedDeck"
    @toggle-deck-selection-mode="toggleDeckSelectionMode"
    @toggle-visible-deck-selection="toggleVisibleMyDeckSelection"
    @clear-deck-selection="clearMyDeckSelection"
    @delete-selected-decks="deleteSelectedMyDecks"
    @toggle-deck-selection="toggleMyDeckSelection"
    @start-selected-study="startInterleavedFromSelection(Array.from(selectedMyDeckIds))"
    @login="openAuth('login')"
    @close-managed-deck="closeManagedDeck"
    @save-managed-deck="saveManagedDeck"
    @delete-managed-deck="deleteManagedDeck"
    @update:managed-deck-form="updateManagedDeckForm"
    @create-card="openCreateCardEditor"
    @toggle-visible-card-selection="toggleVisibleManagedCardsSelection"
    @clear-card-selection="clearManagedCardSelection"
    @delete-selected-cards="deleteSelectedManagedCards"
    @select-card="selectManagedCard"
    @toggle-card-selection="toggleManagedCardSelection"
    @load-more-cards="loadMoreManagedCards"
    @edit-card="openEditCardEditor"
    @delete-card="deleteManagedCard"
  />
</template>
