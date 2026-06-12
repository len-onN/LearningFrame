import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  DeckDetail,
  DeckSummary,
  DueResponse,
  ReviewRating,
  ReviewResult,
  StudyCard,
  StudyCardResponse,
  UserResponse
} from '../types/api'
import type { DueRequestOptions } from '../services/api'
import {
  interleaveDeckCardGroups,
  useStudyStore,
  type StudySessionApi
} from './useStudyStore'
import { useAuthStore } from './useAuthStore'
import { useFeedbackStore } from './useFeedbackStore'
import { useLibraryStore } from './useLibraryStore'
import { useStatsStore } from './useStatsStore'



describe('useStudyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    installLocalStorage()
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'))
    const store = useStudyStore()
    store.resetStudySession()
    store.__reloadLocalStatesForTesting()
    store.clearPublicStudyDeckCache()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('inicia sessao com cartas e calcula progresso', () => {
    const { store } = createSubject()

    store.setStudySessionCards([
      studyCard('a'),
      studyCard('b')
    ], 'no-due')

    expect(store.currentCard?.clientId).toBe('a')
    expect(store.studyProgress).toEqual({
      initialTotal: 2,
      reviewed: 0,
      remaining: 2,
      percent: 0
    })
    expect(store.studyEmptyReason).toBe('idle')
  })

  it('registra revisao e conclui a sessao ao acabar a fila', () => {
    const { store } = createSubject()
    store.setStudySessionCards([studyCard('a')], 'no-due')

    store.completeCurrentReview('GOOD', {
      rating: 'GOOD',
      ratingLabel: 'Bom',
      nextDueLabel: 'amanha',
      intervalLabel: '1 dia'
    })

    expect(store.studyQueue).toEqual([])
    expect(store.studyEmptyReason).toBe('completed')
    expect(store.studySummary?.reviewed).toBe(1)
    expect(store.studySummary?.ratingCounts.GOOD).toBe(1)
  })

  it('reseta estado da sessao', () => {
    const { store } = createSubject()
    store.setStudySessionCards([studyCard('a')], 'no-due')
    store.answerVisible = true

    store.resetStudySession()

    expect(store.studyQueue).toEqual([])
    expect(store.answerVisible).toBe(false)
    expect(store.studyEmptyReason).toBe('idle')
    expect(store.studyProgress.initialTotal).toBe(0)
  })

  it('carrega estudo anonimo com estado local e cache publico', async () => {
    localStorage.setItem('learningframe.localStates', JSON.stringify({
      'public:70': {
        dueAt: '2026-06-10T12:00:00.000Z',
        intervalDays: 1,
        repetitions: 1,
        easeFactor: 2.5
      }
    }))
    const { client, store, showNotice, withFeedback } = createSubject({
      publicDeckCacheLimit: 1
    })
    store.__reloadLocalStatesForTesting()
    client.deck.mockResolvedValueOnce(deckDetail(7, [
      cardResponse(70, { frontHtml: '<p>Frente <script>alert(1)</script></p>' })
    ]))

    await store.loadStudyDeck(7)

    expect(withFeedback).toHaveBeenCalledWith(expect.any(Function))
    expect(client.deckMetadata).toHaveBeenCalledWith(7)
    expect(client.deck).toHaveBeenCalledWith(7)
    expect(client.due).not.toHaveBeenCalled()
    expect(store.sessionTitle).toBe('Deck 7')
    expect(store.studyQueue).toEqual([])
    expect(store.studyEmptyReason).toBe('no-due')
    expect(showNotice).toHaveBeenCalledWith('Nenhum card vencido agora para esta sessao.')

    await store.loadStudyDeck(7)
    expect(client.deck).toHaveBeenCalledTimes(1)
  })

  it('carrega estudo autenticado via cards vencidos do backend', async () => {
    const user = userResponse()
    const { client, store } = createSubject({ user })
    client.due.mockResolvedValueOnce(dueResponse([studyCardResponse(21)]))

    await store.loadStudyDeck(5)

    expect(client.deckMetadata).toHaveBeenCalledWith(5)
    expect(client.due).toHaveBeenCalledWith({ mode: 'SINGLE_DECK', deckId: 5, limit: 20 })
    expect(client.deck).not.toHaveBeenCalled()
    expect(store.sessionTitle).toBe('Deck 5')
    expect(store.currentCard).toMatchObject({
      clientId: 'server:21',
      cardId: 21,
      local: false
    })
    expect(store.studyEmptyReason).toBe('idle')
  })

  it('mantem estudo autenticado vazio como baralho vazio quando metadado informa zero cartas', async () => {
    const user = userResponse()
    const { client, store, showNotice } = createSubject({ user })
    client.deckMetadata.mockResolvedValueOnce(deckSummary(9, { cardCount: 0 }))
    client.due.mockResolvedValueOnce(dueResponse([]))

    await store.loadStudyDeck(9)

    expect(store.studyEmptyReason).toBe('empty-deck')
    expect(showNotice).toHaveBeenCalledWith('Nenhum card vencido agora para esta sessao.')
  })

  it('prepara selecao anonima com baralhos publicos carregados', async () => {
    const publicDecks = [
      deckSummary(1),
      deckSummary(2),
      deckSummary(3),
      deckSummary(4),
      deckSummary(5)
    ]
    const { client, loadPublicDecks, store } = createSubject({ publicDecks })

    await store.prepareInterleavedPracticeSelection()

    expect(loadPublicDecks).not.toHaveBeenCalled()
    expect(client.due).not.toHaveBeenCalled()
    expect(client.deck).not.toHaveBeenCalled()
    expect(store.sessionTitle).toBe('Pratica intercalada')
    expect(store.interleavedSelection.active).toBe(true)
    expect(store.interleavedSelection.options.map((deck) => deck.id)).toEqual([1, 2, 3, 4, 5])
    expect(store.interleavedSelection.selectedIds).toEqual([])
  })

  it('carrega decks publicos antes de preparar selecao anonima quando a lista esta vazia', async () => {
    const { client, loadPublicDecks, store, libraryStore } = createSubject({ publicDecks: [] })
    loadPublicDecks.mockImplementationOnce(async () => {
      libraryStore.publicDecks = [deckSummary(11)]
    })

    await store.prepareInterleavedPracticeSelection()

    expect(loadPublicDecks).toHaveBeenCalledWith(true)
    expect(client.deck).not.toHaveBeenCalled()
    expect(store.interleavedSelection.selectedIds).toEqual([])
  })

  it('prepara selecao autenticada usando meus baralhos e publicos disponiveis', async () => {
    const user = userResponse()
    const { loadMyDecks, loadPublicDecks, store, libraryStore } = createSubject({ user, myDecks: [], publicDecks: [] })
    loadMyDecks.mockImplementationOnce(async () => {
      libraryStore.myDecks = [
        deckSummary(1, { dueCount: 0, visibility: 'PRIVATE' }),
        deckSummary(2, { dueCount: 3, visibility: 'PRIVATE' })
      ]
    })
    loadPublicDecks.mockImplementationOnce(async () => {
      libraryStore.publicDecks = [
        deckSummary(2, { dueCount: 5 }),
        deckSummary(3, { dueCount: 1 })
      ]
    })

    await store.prepareInterleavedPracticeSelection()

    expect(loadMyDecks).toHaveBeenCalledWith(true)
    expect(loadPublicDecks).toHaveBeenCalledWith(true)
    expect(store.interleavedSelection.options.map((deck) => ({
      id: deck.id,
      source: deck.source
    }))).toEqual([
      { id: 1, source: 'mine' },
      { id: 2, source: 'mine' },
      { id: 3, source: 'public' }
    ])
    expect(store.interleavedSelection.selectedIds).toEqual([])
  })

  it('seleciona e desseleciona decks respeitando limite maximo', async () => {
    const publicDecks = Array.from({ length: 9 }, (_, index) => deckSummary(index + 1))
    const { store } = createSubject({ publicDecks })

    await store.prepareInterleavedPracticeSelection()
    ;[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(store.toggleInterleavedDeckSelection)

    expect(store.interleavedSelection.selectedIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

    store.toggleInterleavedDeckSelection(4)
    store.toggleInterleavedDeckSelection(9)

    expect(store.interleavedSelection.selectedIds).toEqual([1, 2, 3, 5, 6, 7, 8, 9])
  })

  it('inicia pratica intercalada autenticada com deckIds selecionados', async () => {
    const user = userResponse()
    const myDecks = [
      deckSummary(1, { dueCount: 2 }),
      deckSummary(2, { dueCount: 1 })
    ]
    const { client, store } = createSubject({ user, myDecks })
    client.due.mockResolvedValueOnce(dueResponse([studyCardResponse(21)]))

    await store.prepareInterleavedPracticeSelection([1, 2])
    await store.startInterleavedPracticeSession()

    expect(client.due).toHaveBeenCalledWith({
      mode: 'MIXED_DUE',
      deckIds: [1, 2],
      limit: 20
    })
    expect(store.interleavedSelection.active).toBe(false)
    expect(store.currentCard?.clientId).toBe('server:21')
  })

  it('inicia pratica intercalada anonima apenas com decks selecionados e intercala por baralho', async () => {
    const publicDecks = [
      deckSummary(1),
      deckSummary(2),
      deckSummary(3)
    ]
    const { client, store } = createSubject({ publicDecks })
    client.deck.mockImplementation(async (deckId: number) => deckDetail(deckId, [
      cardResponse(deckId * 10),
      cardResponse(deckId * 10 + 1)
    ]))

    await store.prepareInterleavedPracticeSelection([1, 2, 3])
    store.toggleInterleavedDeckSelection(2)
    await store.startInterleavedPracticeSession()

    expect(client.due).not.toHaveBeenCalled()
    expect(client.deck.mock.calls.map(([deckId]) => deckId)).toEqual([1, 3])
    expect(store.studyQueue.map((card) => card.clientId)).toEqual([
      'public:10',
      'public:30',
      'public:11',
      'public:31'
    ])
  })

  it('nao inicia pratica intercalada sem deck selecionado', async () => {
    const publicDecks = [deckSummary(1)]
    const { client, store, showNotice, withFeedback } = createSubject({ publicDecks })

    await store.prepareInterleavedPracticeSelection([1])
    store.toggleInterleavedDeckSelection(1)
    await store.startInterleavedPracticeSession()

    expect(showNotice).toHaveBeenCalledWith('Selecione pelo menos um baralho para iniciar.')
    expect(client.due).not.toHaveBeenCalled()
    expect(client.deck).not.toHaveBeenCalled()
    expect(withFeedback).toHaveBeenCalledTimes(1)
    expect(store.interleavedSelection.active).toBe(true)
  })

  it('mantem emptyReason no-due quando selecionados nao tem cartas vencidas', async () => {
    const publicDecks = [deckSummary(1)]
    const { client, store, showNotice } = createSubject({ publicDecks })
    client.deck.mockResolvedValueOnce(deckDetail(1, []))

    await store.prepareInterleavedPracticeSelection([1])
    await store.startInterleavedPracticeSession()

    expect(store.studyEmptyReason).toBe('no-due')
    expect(store.interleavedSelection.active).toBe(false)
    expect(showNotice).toHaveBeenCalledWith('Pratica intercalada sem cards vencidos agora.')
  })

  it('intercala grupos de cartas por baralho', () => {
    expect(interleaveDeckCardGroups([
      [studyCard('a1'), studyCard('a2')],
      [studyCard('b1')],
      [studyCard('c1'), studyCard('c2')]
    ]).map((card) => card.clientId)).toEqual(['a1', 'b1', 'c1', 'a2', 'c2'])
  })

  it('reviewCurrent anonimo atualiza estado local sem chamar backend nem stats', async () => {
    const { client, refreshStats, store, withFeedback } = createSubject()
    store.setStudySessionCards([studyCard('public:1')], 'no-due')

    await store.reviewCurrent('GOOD')

    expect(withFeedback).toHaveBeenLastCalledWith(expect.any(Function), false)
    expect(client.review).not.toHaveBeenCalled()
    expect(refreshStats).not.toHaveBeenCalled()
    const stored = JSON.parse(localStorage.getItem('learningframe.localStates') ?? '{}')
    expect(stored['public:1']).toMatchObject({
      dueAt: '2026-06-10T12:00:00.000Z',
      intervalDays: 1,
      repetitions: 1,
      easeFactor: 2.5
    })
    expect(store.studySummary?.ratingCounts.GOOD).toBe(1)
  })

  it('reviewCurrent autenticado persiste no backend e atualiza stats', async () => {
    const user = userResponse()
    const { client, refreshStats, store } = createSubject({ user })
    client.review.mockResolvedValueOnce(reviewResult(33, 'EASY'))
    store.setStudySessionCards([serverStudyCard(33)], 'no-due')

    await store.reviewCurrent('EASY')

    expect(client.review).toHaveBeenCalledWith(33, 'EASY')
    expect(refreshStats).toHaveBeenCalledTimes(1)
    expect(store.studyQueue).toEqual([])
    expect(store.studySummary?.ratingCounts.EASY).toBe(1)
  })
})

function createSubject(overrides: Partial<{
  user: UserResponse | null
  publicDecks: DeckSummary[]
  myDecks: DeckSummary[]
  client: ReturnType<typeof createClient>
  publicDeckCacheLimit: number
}> = {}) {
  const authStore = useAuthStore()
  const libraryStore = useLibraryStore()
  const feedbackStore = useFeedbackStore()
  const statsStore = useStatsStore()

  authStore.user = overrides.user ?? null
  libraryStore.publicDecks = overrides.publicDecks ?? []
  libraryStore.myDecks = overrides.myDecks ?? []
  
  const client = overrides.client ?? createClient()
  const loadPublicDecks = vi.fn(async () => undefined)
  const loadMyDecks = vi.fn(async () => undefined)
  const refreshStats = vi.fn(async () => undefined)
  const showNotice = vi.fn()
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })
  
  libraryStore.loadPublicDecks = loadPublicDecks as any
  libraryStore.loadMyDecks = loadMyDecks as any
  feedbackStore.showNotice = showNotice as any
  feedbackStore.withFeedback = withFeedback as any
  statsStore.refreshStats = refreshStats as any

  const store = useStudyStore()
  store.setClient(client)
  if (overrides.publicDeckCacheLimit !== undefined) {
    store.setPublicDeckCacheLimit(overrides.publicDeckCacheLimit)
  }

  return {
    libraryStore,
    client,
    loadPublicDecks,
    loadMyDecks,
    refreshStats,
    showNotice,
    withFeedback,
    store
  }
}

function createClient() {
  return {
    deck: vi.fn(async (deckId: number) => deckDetail(deckId, [cardResponse(deckId * 10)])),
    deckMetadata: vi.fn(async (deckId: number) => deckSummary(deckId)),
    due: vi.fn(async (_options: DueRequestOptions) => dueResponse([])),
    review: vi.fn(async (cardId: number, rating: ReviewRating) => reviewResult(cardId, rating))
  } satisfies StudySessionApi
}

function studyCard(clientId: string, rating: ReviewRating = 'GOOD'): StudyCard {
  return {
    clientId,
    deckId: 7,
    deckTitle: 'Deck',
    frontHtml: `Frente ${rating}`,
    backHtml: 'Verso',
    tags: [],
    dueAt: '2026-06-08T12:00:00Z',
    intervalDays: 0,
    repetitions: 0,
    easeFactor: 2.5,
    newCard: true,
    local: true
  }
}

function serverStudyCard(cardId: number): StudyCard {
  return {
    ...studyCard(`server:${cardId}`),
    cardId,
    local: false
  }
}

function studyCardResponse(cardId: number): StudyCardResponse {
  return {
    cardId,
    deckId: 7,
    deckTitle: 'Deck',
    frontHtml: 'Frente',
    backHtml: 'Verso',
    tags: [],
    newCard: true,
    dueAt: '2026-06-09T12:00:00Z',
    intervalDays: 0,
    repetitions: 0
  }
}

function cardResponse(id: number, overrides: Partial<DeckDetail['cards'][number]> = {}): DeckDetail['cards'][number] {
  return {
    id,
    deckId: 7,
    frontHtml: 'Frente',
    backHtml: 'Verso',
    tags: [],
    ...overrides
  }
}

function deckDetail(id: number, cards: DeckDetail['cards'] = []): DeckDetail {
  return {
    id,
    title: `Deck ${id}`,
    description: '',
    visibility: 'PUBLIC',
    sourceFormat: 'MANUAL',
    ownerName: 'Ada',
    cards
  }
}

function deckSummary(id: number, overrides: Partial<DeckSummary> = {}): DeckSummary {
  return {
    id,
    title: `Deck ${id}`,
    description: '',
    visibility: 'PUBLIC',
    sourceFormat: 'MANUAL',
    cardCount: 1,
    dueCount: 0,
    nextDueAt: null,
    ownerName: 'Ada',
    updatedAt: '2026-06-09T00:00:00Z',
    ...overrides
  }
}

function dueResponse(cards: StudyCardResponse[]): DueResponse {
  return {
    mode: 'SINGLE_DECK',
    cards,
    limitReachedNew: false,
    limitReachedReview: false
  }
}

function reviewResult(cardId: number, rating: ReviewRating): ReviewResult {
  return {
    cardId,
    rating,
    nextDueAt: '2026-06-13T12:00:00Z',
    intervalDays: 4,
    repetitions: 1,
    easeFactor: 2.65
  }
}

function userResponse(): UserResponse {
  return {
    id: 1,
    displayName: 'Ada',
    email: 'ada@example.com'
  }
}

function installLocalStorage() {
  const values = new Map<string, string>()

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key)
    }),
    clear: vi.fn(() => {
      values.clear()
    })
  })
}
