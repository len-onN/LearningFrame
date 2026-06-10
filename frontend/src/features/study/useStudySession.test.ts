import { ref, type Ref } from 'vue'
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
} from '../../types/api'
import type { DueRequestOptions } from '../../services/api'
import {
  interleaveDeckCardGroups,
  useStudySession,
  type StudySessionApi
} from './useStudySession'

describe('useStudySession', () => {
  beforeEach(() => {
    installLocalStorage()
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('inicia sessao com cartas e calcula progresso', () => {
    const { session } = createSubject()

    session.setStudySessionCards([
      studyCard('a'),
      studyCard('b')
    ], 'no-due')

    expect(session.currentCard.value?.clientId).toBe('a')
    expect(session.studyProgress.value).toEqual({
      initialTotal: 2,
      reviewed: 0,
      remaining: 2,
      percent: 0
    })
    expect(session.studyEmptyReason.value).toBe('idle')
  })

  it('registra revisao e conclui a sessao ao acabar a fila', () => {
    const { session } = createSubject()
    session.setStudySessionCards([studyCard('a')], 'no-due')

    session.completeCurrentReview('GOOD', {
      rating: 'GOOD',
      ratingLabel: 'Bom',
      nextDueLabel: 'amanha',
      intervalLabel: '1 dia'
    })

    expect(session.studyQueue.value).toEqual([])
    expect(session.studyEmptyReason.value).toBe('completed')
    expect(session.studySummary.value?.reviewed).toBe(1)
    expect(session.studySummary.value?.ratingCounts.GOOD).toBe(1)
  })

  it('reseta estado da sessao', () => {
    const { session } = createSubject()
    session.setStudySessionCards([studyCard('a')], 'no-due')
    session.answerVisible.value = true

    session.resetStudySession()

    expect(session.studyQueue.value).toEqual([])
    expect(session.answerVisible.value).toBe(false)
    expect(session.studyEmptyReason.value).toBe('idle')
    expect(session.studyProgress.value.initialTotal).toBe(0)
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
    const { client, session, showNotice, withFeedback } = createSubject({
      publicDeckCacheLimit: 1
    })
    client.deck.mockResolvedValueOnce(deckDetail(7, [
      cardResponse(70, { frontHtml: '<p>Frente <script>alert(1)</script></p>' })
    ]))

    await session.loadStudyDeck(7)

    expect(withFeedback).toHaveBeenCalledWith(expect.any(Function))
    expect(client.deckMetadata).toHaveBeenCalledWith(7)
    expect(client.deck).toHaveBeenCalledWith(7)
    expect(client.due).not.toHaveBeenCalled()
    expect(session.sessionTitle.value).toBe('Deck 7')
    expect(session.studyQueue.value).toEqual([])
    expect(session.studyEmptyReason.value).toBe('no-due')
    expect(showNotice).toHaveBeenCalledWith('Nenhum card vencido agora para esta sessao.')

    await session.loadStudyDeck(7)
    expect(client.deck).toHaveBeenCalledTimes(1)
  })

  it('carrega estudo autenticado via cards vencidos do backend', async () => {
    const user = ref<UserResponse | null>(userResponse())
    const { client, session } = createSubject({ user })
    client.due.mockResolvedValueOnce(dueResponse([studyCardResponse(21)]))

    await session.loadStudyDeck(5)

    expect(client.deckMetadata).toHaveBeenCalledWith(5)
    expect(client.due).toHaveBeenCalledWith({ mode: 'SINGLE_DECK', deckId: 5 })
    expect(client.deck).not.toHaveBeenCalled()
    expect(session.sessionTitle.value).toBe('Deck 5')
    expect(session.currentCard.value).toMatchObject({
      clientId: 'server:21',
      cardId: 21,
      local: false
    })
    expect(session.studyEmptyReason.value).toBe('idle')
  })

  it('mantem estudo autenticado vazio como baralho vazio quando metadado informa zero cartas', async () => {
    const user = ref<UserResponse | null>(userResponse())
    const { client, session, showNotice } = createSubject({ user })
    client.deckMetadata.mockResolvedValueOnce(deckSummary(9, { cardCount: 0 }))
    client.due.mockResolvedValueOnce(dueResponse([]))

    await session.loadStudyDeck(9)

    expect(session.studyEmptyReason.value).toBe('empty-deck')
    expect(showNotice).toHaveBeenCalledWith('Nenhum card vencido agora para esta sessao.')
  })

  it('prepara selecao anonima com baralhos publicos carregados', async () => {
    const publicDecks = ref([
      deckSummary(1),
      deckSummary(2),
      deckSummary(3),
      deckSummary(4),
      deckSummary(5)
    ])
    const { client, loadPublicDecks, session } = createSubject({ publicDecks })

    await session.prepareInterleavedPracticeSelection()

    expect(loadPublicDecks).not.toHaveBeenCalled()
    expect(client.due).not.toHaveBeenCalled()
    expect(client.deck).not.toHaveBeenCalled()
    expect(session.sessionTitle.value).toBe('Pratica intercalada')
    expect(session.interleavedSelection.value.active).toBe(true)
    expect(session.interleavedSelection.value.options.map((deck) => deck.id)).toEqual([1, 2, 3, 4, 5])
    expect(session.interleavedSelection.value.selectedIds).toEqual([1, 2, 3, 4])
  })

  it('carrega decks publicos antes de preparar selecao anonima quando a lista esta vazia', async () => {
    const publicDecks = ref<DeckSummary[]>([])
    const { client, loadPublicDecks, session } = createSubject({ publicDecks })
    loadPublicDecks.mockImplementationOnce(async () => {
      publicDecks.value = [deckSummary(11)]
    })

    await session.prepareInterleavedPracticeSelection()

    expect(loadPublicDecks).toHaveBeenCalledWith(true)
    expect(client.deck).not.toHaveBeenCalled()
    expect(session.interleavedSelection.value.selectedIds).toEqual([11])
  })

  it('prepara selecao autenticada usando meus baralhos e publicos disponiveis', async () => {
    const user = ref<UserResponse | null>(userResponse())
    const myDecks = ref<DeckSummary[]>([])
    const publicDecks = ref<DeckSummary[]>([])
    const { loadMyDecks, loadPublicDecks, session } = createSubject({ user, myDecks, publicDecks })
    loadMyDecks.mockImplementationOnce(async () => {
      myDecks.value = [
        deckSummary(1, { dueCount: 0, visibility: 'PRIVATE' }),
        deckSummary(2, { dueCount: 3, visibility: 'PRIVATE' })
      ]
    })
    loadPublicDecks.mockImplementationOnce(async () => {
      publicDecks.value = [
        deckSummary(2, { dueCount: 5 }),
        deckSummary(3, { dueCount: 1 })
      ]
    })

    await session.prepareInterleavedPracticeSelection()

    expect(loadMyDecks).toHaveBeenCalledWith(true)
    expect(loadPublicDecks).toHaveBeenCalledWith(true)
    expect(session.interleavedSelection.value.options.map((deck) => ({
      id: deck.id,
      source: deck.source
    }))).toEqual([
      { id: 1, source: 'mine' },
      { id: 2, source: 'mine' },
      { id: 3, source: 'public' }
    ])
    expect(session.interleavedSelection.value.selectedIds).toEqual([2, 3])
  })

  it('seleciona e desseleciona decks respeitando limite maximo', async () => {
    const publicDecks = ref(Array.from({ length: 9 }, (_, index) => deckSummary(index + 1)))
    const { session } = createSubject({ publicDecks })

    await session.prepareInterleavedPracticeSelection()
    ;[5, 6, 7, 8, 9].forEach(session.toggleInterleavedDeckSelection)

    expect(session.interleavedSelection.value.selectedIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

    session.toggleInterleavedDeckSelection(4)
    session.toggleInterleavedDeckSelection(9)

    expect(session.interleavedSelection.value.selectedIds).toEqual([1, 2, 3, 5, 6, 7, 8, 9])
  })

  it('inicia pratica intercalada autenticada com deckIds selecionados', async () => {
    const user = ref<UserResponse | null>(userResponse())
    const myDecks = ref([
      deckSummary(1, { dueCount: 2 }),
      deckSummary(2, { dueCount: 1 })
    ])
    const { client, session } = createSubject({ user, myDecks })
    client.due.mockResolvedValueOnce(dueResponse([studyCardResponse(21)]))

    await session.prepareInterleavedPracticeSelection()
    await session.startInterleavedPracticeSession()

    expect(client.due).toHaveBeenCalledWith({
      mode: 'MIXED_DUE',
      deckIds: [1, 2],
      limit: 24
    })
    expect(session.interleavedSelection.value.active).toBe(false)
    expect(session.currentCard.value?.clientId).toBe('server:21')
  })

  it('inicia pratica intercalada anonima apenas com decks selecionados e intercala por baralho', async () => {
    const publicDecks = ref([
      deckSummary(1),
      deckSummary(2),
      deckSummary(3)
    ])
    const { client, session } = createSubject({ publicDecks })
    client.deck.mockImplementation(async (deckId: number) => deckDetail(deckId, [
      cardResponse(deckId * 10),
      cardResponse(deckId * 10 + 1)
    ]))

    await session.prepareInterleavedPracticeSelection()
    session.toggleInterleavedDeckSelection(2)
    await session.startInterleavedPracticeSession()

    expect(client.due).not.toHaveBeenCalled()
    expect(client.deck.mock.calls.map(([deckId]) => deckId)).toEqual([1, 3])
    expect(session.studyQueue.value.map((card) => card.clientId)).toEqual([
      'public:10',
      'public:30',
      'public:11',
      'public:31'
    ])
  })

  it('nao inicia pratica intercalada sem deck selecionado', async () => {
    const publicDecks = ref([deckSummary(1)])
    const { client, session, showNotice, withFeedback } = createSubject({ publicDecks })

    await session.prepareInterleavedPracticeSelection()
    session.toggleInterleavedDeckSelection(1)
    await session.startInterleavedPracticeSession()

    expect(showNotice).toHaveBeenCalledWith('Selecione pelo menos um baralho para iniciar.')
    expect(client.due).not.toHaveBeenCalled()
    expect(client.deck).not.toHaveBeenCalled()
    expect(withFeedback).toHaveBeenCalledTimes(1)
    expect(session.interleavedSelection.value.active).toBe(true)
  })

  it('mantem emptyReason no-due quando selecionados nao tem cartas vencidas', async () => {
    const publicDecks = ref([deckSummary(1)])
    const { client, session, showNotice } = createSubject({ publicDecks })
    client.deck.mockResolvedValueOnce(deckDetail(1, []))

    await session.prepareInterleavedPracticeSelection()
    await session.startInterleavedPracticeSession()

    expect(session.studyEmptyReason.value).toBe('no-due')
    expect(session.interleavedSelection.value.active).toBe(false)
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
    const { client, refreshStats, session, withFeedback } = createSubject()
    session.setStudySessionCards([studyCard('public:1')], 'no-due')

    await session.reviewCurrent('GOOD')

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
    expect(session.studySummary.value?.ratingCounts.GOOD).toBe(1)
  })

  it('reviewCurrent autenticado persiste no backend e atualiza stats', async () => {
    const user = ref<UserResponse | null>(userResponse())
    const { client, refreshStats, session } = createSubject({ user })
    client.review.mockResolvedValueOnce(reviewResult(33, 'EASY'))
    session.setStudySessionCards([serverStudyCard(33)], 'no-due')

    await session.reviewCurrent('EASY')

    expect(client.review).toHaveBeenCalledWith(33, 'EASY')
    expect(refreshStats).toHaveBeenCalledTimes(1)
    expect(session.studyQueue.value).toEqual([])
    expect(session.studySummary.value?.ratingCounts.EASY).toBe(1)
  })
})

function createSubject(overrides: Partial<{
  user: Ref<UserResponse | null>
  publicDecks: Ref<DeckSummary[]>
  myDecks: Ref<DeckSummary[]>
  client: ReturnType<typeof createClient>
  publicDeckCacheLimit: number
}> = {}) {
  const user = overrides.user ?? ref<UserResponse | null>(null)
  const publicDecks = overrides.publicDecks ?? ref<DeckSummary[]>([])
  const myDecks = overrides.myDecks ?? ref<DeckSummary[]>([])
  const client = overrides.client ?? createClient()
  const loadPublicDecks = vi.fn(async () => undefined)
  const loadMyDecks = vi.fn(async () => undefined)
  const refreshStats = vi.fn(async () => undefined)
  const showNotice = vi.fn()
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  const session = useStudySession({
    user,
    publicDecks,
    myDecks,
    loadPublicDecks,
    loadMyDecks,
    refreshStats,
    showNotice,
    withFeedback,
    client,
    publicDeckCacheLimit: overrides.publicDeckCacheLimit
  })

  return {
    user,
    publicDecks,
    myDecks,
    client,
    loadPublicDecks,
    loadMyDecks,
    refreshStats,
    showNotice,
    withFeedback,
    session
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
    cards
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
