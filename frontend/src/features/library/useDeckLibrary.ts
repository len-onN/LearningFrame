import { computed, nextTick, ref, type Ref } from 'vue'
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

  let highlightDeckTimer: number | undefined

  const publicDecksHasMore = computed(() => publicDeckPage.value ? !publicDeckPage.value.last : false)
  const myDecksHasMore = computed(() => myDeckPage.value ? !myDeckPage.value.last : false)
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
  }

  async function highlightDeck(deckId: number) {
    highlightedDeckId.value = null
    clearHighlightDeckTimer()
    await nextTick()
    document.querySelector(`[data-deck-id="${deckId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.requestAnimationFrame(() => {
      highlightedDeckId.value = deckId
      highlightDeckTimer = window.setTimeout(() => {
        if (highlightedDeckId.value === deckId) {
          highlightedDeckId.value = null
        }
      }, 10000)
    })
  }

  function clearHighlightDeckTimer() {
    window.clearTimeout(highlightDeckTimer)
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
    publicDecksHasMore,
    myDecksHasMore,
    publicDecksCountLabel,
    myDecksCountLabel,
    filteredPublicDecks,
    filteredMyDecks,
    activeLibraryCountLabel,
    currentLibraryQuery,
    loadPublicDecks,
    loadMyDecks,
    highlightDeck,
    clearHighlightDeckTimer
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
