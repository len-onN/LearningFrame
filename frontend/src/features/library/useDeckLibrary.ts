import { computed, nextTick, onScopeDispose, ref, type Ref } from 'vue'
import { api } from '../../services/api'
import type { DeckSummary, PageResponse, UserResponse } from '../../types/api'
import type { LibrarySection } from './libraryTypes'

export interface DeckLibraryApi {
  publicDecks(page?: number, size?: number, query?: string): Promise<PageResponse<DeckSummary>>
  myDecks(page?: number, size?: number, query?: string): Promise<PageResponse<DeckSummary>>
}

export interface DeckLibraryOptions {
  librarySection: Ref<LibrarySection>
  user: Ref<UserResponse | null>
  pageSize?: number
  client?: DeckLibraryApi
}

export function useDeckLibrary({
  librarySection,
  user,
  pageSize = 8,
  client = api
}: DeckLibraryOptions) {
  const librarySearch = ref('')
  const publicDecks = ref<DeckSummary[]>([])
  const myDecks = ref<DeckSummary[]>([])
  const publicDeckPage = ref<PageResponse<DeckSummary> | null>(null)
  const myDeckPage = ref<PageResponse<DeckSummary> | null>(null)
  const publicDeckQuery = ref('')
  const myDeckQuery = ref('')
  const highlightedDeckId = ref<number | null>(null)
  const deckSelectionMode = ref(false)
  const selectedMyDeckIds = ref<Set<number>>(new Set())

  let highlightDeckTimer: number | undefined
  let highlightDeckFrame: number | undefined
  let disposed = false

  const publicDecksHasMore = computed(() => publicDeckPage.value ? !publicDeckPage.value.last : false)
  const myDecksHasMore = computed(() => myDeckPage.value ? !myDeckPage.value.last : false)
  const publicDecksCountLabel = computed(() => deckPageCountLabel(publicDecks.value.length, publicDeckPage.value))
  const myDecksCountLabel = computed(() => deckPageCountLabel(myDecks.value.length, myDeckPage.value))
  const filteredPublicDecks = computed(() => publicDecks.value)
  const filteredMyDecks = computed(() => myDecks.value)
  const selectedMyDecksCount = computed(() => selectedMyDeckIds.value.size)
  const allVisibleMyDecksSelected = computed(() => (
    myDecks.value.length > 0
    && myDecks.value.every((deck) => selectedMyDeckIds.value.has(deck.id))
  ))
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

  function currentLibraryQuery() {
    return librarySearch.value.trim()
  }

  async function loadPublicDecks(reset = false) {
    const page = reset ? 0 : (publicDeckPage.value?.page ?? -1) + 1
    const query = currentLibraryQuery()
    const response = await client.publicDecks(page, pageSize, query)
    publicDecks.value = reset ? response.content : mergeDeckPages(publicDecks.value, response.content)
    publicDeckPage.value = response
    publicDeckQuery.value = query
  }

  async function loadMyDecks(reset = false) {
    if (!user.value) {
      return
    }
    const page = reset ? 0 : (myDeckPage.value?.page ?? -1) + 1
    const query = currentLibraryQuery()
    const response = await client.myDecks(page, pageSize, query)
    myDecks.value = reset ? response.content : mergeDeckPages(myDecks.value, response.content)
    myDeckPage.value = response
    myDeckQuery.value = query
    pruneMyDeckSelection()
  }

  async function highlightDeck(deckId: number) {
    if (disposed) {
      return
    }
    highlightedDeckId.value = null
    clearHighlightDeckTimer()
    await nextTick()
    if (disposed) {
      return
    }
    document.querySelector(`[data-deck-id="${deckId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    highlightDeckFrame = window.requestAnimationFrame(() => {
      highlightDeckFrame = undefined
      if (disposed) {
        return
      }
      highlightedDeckId.value = deckId
      highlightDeckTimer = window.setTimeout(() => {
        highlightDeckTimer = undefined
        if (!disposed && highlightedDeckId.value === deckId) {
          highlightedDeckId.value = null
        }
      }, 10000)
    })
  }

  function clearHighlightDeckTimer() {
    if (highlightDeckTimer !== undefined) {
      window.clearTimeout(highlightDeckTimer)
      highlightDeckTimer = undefined
    }
    if (highlightDeckFrame !== undefined) {
      window.cancelAnimationFrame(highlightDeckFrame)
      highlightDeckFrame = undefined
    }
  }

  onScopeDispose(() => {
    disposed = true
    clearHighlightDeckTimer()
  }, true)

  function toggleDeckSelectionMode() {
    deckSelectionMode.value = !deckSelectionMode.value
    if (!deckSelectionMode.value) {
      clearMyDeckSelection()
    }
  }

  function enterDeckSelectionMode() {
    deckSelectionMode.value = true
  }

  function exitDeckSelectionMode() {
    deckSelectionMode.value = false
    clearMyDeckSelection()
  }

  function toggleMyDeckSelection(deckId: number) {
    enterDeckSelectionMode()
    const selected = new Set(selectedMyDeckIds.value)
    if (selected.has(deckId)) {
      selected.delete(deckId)
    } else {
      selected.add(deckId)
    }
    selectedMyDeckIds.value = selected
  }

  function toggleVisibleMyDeckSelection() {
    const selected = new Set(selectedMyDeckIds.value)
    if (allVisibleMyDecksSelected.value) {
      myDecks.value.forEach((deck) => selected.delete(deck.id))
    } else {
      myDecks.value.forEach((deck) => selected.add(deck.id))
    }
    selectedMyDeckIds.value = selected
    if (selectedMyDeckIds.value.size > 0) {
      enterDeckSelectionMode()
    }
  }

  function clearMyDeckSelection() {
    selectedMyDeckIds.value = new Set()
  }

  function pruneMyDeckSelection() {
    const loadedIds = new Set(myDecks.value.map((deck) => deck.id))
    selectedMyDeckIds.value = new Set([...selectedMyDeckIds.value].filter((deckId) => loadedIds.has(deckId)))
    if (selectedMyDeckIds.value.size === 0 && deckSelectionMode.value && myDecks.value.length === 0) {
      deckSelectionMode.value = false
    }
  }

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
    currentLibraryQuery,
    loadPublicDecks,
    loadMyDecks,
    highlightDeck,
    clearHighlightDeckTimer,
    toggleDeckSelectionMode,
    enterDeckSelectionMode,
    exitDeckSelectionMode,
    toggleMyDeckSelection,
    toggleVisibleMyDeckSelection,
    clearMyDeckSelection
  }
}

export function mergeDeckPages(current: DeckSummary[], incoming: DeckSummary[]) {
  const merged = new Map<number, DeckSummary>()
  for (const deck of [...current, ...incoming]) {
    merged.set(deck.id, deck)
  }
  return [...merged.values()]
}

export function deckPageCountLabel<T>(loaded: number, page: PageResponse<T> | null, label = 'baralhos') {
  if (!page) {
    return ''
  }
  return `${loaded} de ${page.totalElements} ${label}`
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
