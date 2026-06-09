import { reactive, ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import type { DeckSummary, PageResponse, UserResponse } from '../types/api'
import { useLibraryRouteSync } from './useLibraryRouteSync'

describe('useLibraryRouteSync', () => {
  it('carrega biblioteca publica na rota publica preservando feedback invisivel', async () => {
    const subject = createSubject({ name: 'library-public' })

    await subject.syncLibraryRoute()

    expect(subject.withFeedback).toHaveBeenCalledWith(
      expect.any(Function),
      { showLoading: false, clearOnStart: false }
    )
    expect(subject.loadPublicDecks).toHaveBeenCalledWith(true)
    expect(subject.loadMyDecks).not.toHaveBeenCalled()
  })

  it('nao recarrega publica quando a query atual ja esta carregada', async () => {
    const subject = createSubject({
      name: 'library-public',
      librarySearch: 'neuro',
      publicDeckPage: page([], 0, 0, true),
      publicDeckQuery: 'neuro'
    })

    expect(subject.shouldLoadPublicDecks()).toBe(false)

    await subject.syncLibraryRoute()

    expect(subject.loadPublicDecks).not.toHaveBeenCalled()
  })

  it('carrega meus baralhos apenas com usuario autenticado', async () => {
    const anonymous = createSubject({ name: 'library-mine' })

    await anonymous.syncLibraryRoute()

    expect(anonymous.loadMyDecks).not.toHaveBeenCalled()

    const authenticated = createSubject({
      name: 'library-mine',
      user: userResponse()
    })

    await authenticated.syncLibraryRoute()

    expect(authenticated.loadMyDecks).toHaveBeenCalledWith(true)
  })

  it('limpa busca e carrega o baralho gerenciado por deckId', async () => {
    const subject = createSubject({
      name: 'library-deck-manage',
      params: { deckId: '7' },
      librarySearch: 'bio',
      user: userResponse()
    })

    await subject.syncLibraryRoute()

    expect(subject.librarySearch.value).toBe('')
    expect(subject.loadManagedDeckRoute).toHaveBeenCalledWith(7)
  })

  it('substitui rota de gerenciamento sem deckId valido por meus baralhos', async () => {
    const subject = createSubject({
      name: 'library-deck-manage',
      params: { deckId: 'x' },
      user: userResponse()
    })

    await subject.syncLibraryRoute()

    expect(subject.replaceWithMyDecks).toHaveBeenCalled()
    expect(subject.loadManagedDeckRoute).not.toHaveBeenCalled()
  })

  it('fecha gerenciamento e selecao na limpeza de dominio', () => {
    const subject = createSubject({ name: 'library-public' })

    subject.cleanupLibraryRoute()

    expect(subject.closeManagedDeck).toHaveBeenCalledWith(true, false)
    expect(subject.exitDeckSelectionMode).toHaveBeenCalled()
  })
})

function createSubject(options: {
  name: string
  params?: RouteLocationNormalizedLoaded['params']
  librarySearch?: string
  user?: UserResponse | null
  managedDeck?: DeckSummary | null
  publicDeckPage?: PageResponse<DeckSummary> | null
  myDeckPage?: PageResponse<DeckSummary> | null
  publicDeckQuery?: string
  myDeckQuery?: string
}) {
  const route = reactive({
    name: options.name,
    params: options.params ?? {},
    fullPath: '',
    meta: {}
  }) as RouteLocationNormalizedLoaded
  const user = ref<UserResponse | null>(options.user ?? null)
  const managedDeck = ref<DeckSummary | null>(options.managedDeck ?? null)
  const librarySearch = ref(options.librarySearch ?? '')
  const publicDeckPage = ref<PageResponse<DeckSummary> | null>(options.publicDeckPage ?? null)
  const myDeckPage = ref<PageResponse<DeckSummary> | null>(options.myDeckPage ?? null)
  const publicDeckQuery = ref(options.publicDeckQuery ?? '')
  const myDeckQuery = ref(options.myDeckQuery ?? '')
  const loadPublicDecks = vi.fn(async () => undefined)
  const loadMyDecks = vi.fn(async () => undefined)
  const loadManagedDeckRoute = vi.fn(async () => undefined)
  const closeManagedDeck = vi.fn(async () => true)
  const exitDeckSelectionMode = vi.fn()
  const replaceWithMyDecks = vi.fn(async () => undefined)
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  return {
    route,
    user,
    managedDeck,
    librarySearch,
    publicDeckPage,
    myDeckPage,
    publicDeckQuery,
    myDeckQuery,
    loadPublicDecks,
    loadMyDecks,
    loadManagedDeckRoute,
    closeManagedDeck,
    exitDeckSelectionMode,
    replaceWithMyDecks,
    withFeedback,
    ...useLibraryRouteSync({
      route,
      user,
      managedDeck,
      librarySearch,
      publicDeckPage,
      myDeckPage,
      publicDeckQuery,
      myDeckQuery,
      currentLibraryQuery: () => librarySearch.value.trim(),
      routeDeckId: () => {
        const raw = Array.isArray(route.params.deckId) ? route.params.deckId[0] : route.params.deckId
        const deckId = Number(raw)
        return Number.isFinite(deckId) && deckId > 0 ? deckId : null
      },
      loadPublicDecks,
      loadMyDecks,
      loadManagedDeckRoute,
      closeManagedDeck,
      exitDeckSelectionMode,
      replaceWithMyDecks,
      withFeedback
    })
  }
}

function userResponse(): UserResponse {
  return {
    id: 1,
    displayName: 'Ada',
    email: 'ada@example.com'
  }
}

function page<T>(content: T[], pageNumber: number, totalElements: number, last = false): PageResponse<T> {
  return {
    content,
    page: pageNumber,
    size: 8,
    totalElements,
    totalPages: last ? pageNumber + 1 : pageNumber + 2,
    first: pageNumber === 0,
    last
  }
}
