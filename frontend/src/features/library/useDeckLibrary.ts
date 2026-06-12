import { computed, nextTick, ref, type Ref, onScopeDispose } from 'vue'
import { api } from '../../services/api'
import type { DeckSummary, PageResponse } from '../../types/api'
import type { LibrarySection } from './libraryTypes'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLibraryStore, normalizeSearchStr, mergePages as storeMergePages } from '../../stores/useLibraryStore'
import { storeToRefs } from 'pinia'

export interface DeckLibraryApi {
  publicDecks(page?: number, size?: number, query?: string): Promise<PageResponse<DeckSummary>>
  myDecks(page?: number, size?: number, query?: string): Promise<PageResponse<DeckSummary>>
}

// Keep export for backwards compatibility
export const mergeDeckPages = storeMergePages
export const normalizeSearch = normalizeSearchStr

export function deckPageCountLabel<T>(loaded: number, page: PageResponse<T> | null, label = 'baralhos') {
  if (!page) {
    return ''
  }
  return `${loaded} de ${page.totalElements} ${label}`
}

export function useDeckLibrary({
  librarySection,
  pageSize = 8,
  client = api
}: {
  librarySection: Ref<LibrarySection>
  pageSize?: number
  client?: DeckLibraryApi
}) {
  const store = useLibraryStore()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  const {
    librarySearch,
    publicDecks,
    myDecks,
    publicDeckPage,
    myDeckPage,
    publicDeckQuery,
    myDeckQuery,
    highlightedDeckId,
    deckSelectionMode,
    selectedMyDeckIds,
    publicDecksHasMore,
    myDecksHasMore,
    selectedMyDecksCount,
    allVisibleMyDecksSelected
  } = storeToRefs(store)

  const publicDecksCountLabel = computed(() => deckPageCountLabel(publicDecks.value.length, publicDeckPage.value))
  const myDecksCountLabel = computed(() => deckPageCountLabel(myDecks.value.length, myDeckPage.value))
  const filteredPublicDecks = computed(() => publicDecks.value)
  const filteredMyDecks = computed(() => myDecks.value)

  const activeLibraryCountLabel = computed(() => {
    const searching = normalizeSearch(librarySearch.value).length > 0
    if (searching) {
      if (librarySection.value === 'public') {
        return publicDecksCountLabel.value
      }
      return user.value ? myDecksCountLabel.value : ''
    }
    if (librarySection.value === 'public') {
      return publicDecksCountLabel.value
    }
    return user.value ? myDecksCountLabel.value : ''
  })

  // We map the store actions and pass the locally provided client and pageSize
  async function loadPublicDecks(reset = false) {
    await store.loadPublicDecks(client, pageSize, reset)
  }

  async function loadMyDecks(reset = false) {
    await store.loadMyDecks(client, pageSize, reset)
  }

  onScopeDispose(() => {
    store.disposeLibrary()
  })

  return {
    librarySearch,
    publicDecks,
    myDecks,
    publicDeckPage,
    myDeckPage,
    publicDeckQuery,
    myDeckQuery,
    highlightedDeckId,
    deckSelectionMode,
    selectedMyDeckIds,
    publicDecksHasMore,
    myDecksHasMore,
    publicDecksCountLabel,
    myDecksCountLabel,
    filteredPublicDecks,
    filteredMyDecks,
    selectedMyDecksCount,
    allVisibleMyDecksSelected,
    activeLibraryCountLabel,
    currentLibraryQuery: store.currentLibraryQuery,
    loadPublicDecks,
    loadMyDecks,
    highlightDeck: store.highlightDeck,
    clearHighlightDeckTimer: store.clearHighlightDeckTimer,
    toggleDeckSelectionMode: store.toggleDeckSelectionMode,
    enterDeckSelectionMode: store.enterDeckSelectionMode,
    exitDeckSelectionMode: store.exitDeckSelectionMode,
    toggleMyDeckSelection: store.toggleMyDeckSelection,
    toggleVisibleMyDeckSelection: store.toggleVisibleMyDeckSelection,
    clearMyDeckSelection: store.clearMyDeckSelection,
    disposeLibrary: store.disposeLibrary
  }
}

