import { computed, ref, type Ref } from 'vue'
import type { FeedbackOptions } from '../../composables/useFeedback'
import { api, type DueRequestOptions } from '../../services/api'
import type {
  DeckDetail,
  DeckSummary,
  DueResponse,
  LocalDeck,
  ReviewRating,
  ReviewResult,
  StudyCard,
  StudyCardResponse,
  UserResponse
} from '../../types/api'
import { formatDueIn } from '../../utils/dueTime'
import { safeStudyHtml } from '../../utils/html'
import {
  deckDetailToLocal,
  loadLocalStates,
  localDeckToStudyCards,
  saveLocalStates
} from '../../utils/localStudy'
import { nextReview } from '../../utils/srs'
import {
  emptyStudyRatingCounts,
  studyFeedbackFromResult,
  studyFeedbackFromReviewResult,
  type StudyRatingCounts,
  type StudyReviewFeedback
} from './studyFeedback'
import type {
  InterleavedDeckOption,
  InterleavedSelectionState,
  StudyEmptyReason
} from './studySessionTypes'

import { useAuthSession } from '../../composables/useAuthSession'
import { useFeedback } from '../../composables/useFeedback'
import { useDeckLibrary } from '../library/useDeckLibrary'
import { useStatsSummary } from '../../app/useStatsSummary'

const DEFAULT_PUBLIC_DECK_CACHE_LIMIT = 6
const INTERLEAVED_STUDY_LIMIT = 24
const INTERLEAVED_MAX_SELECTED_DECKS = 8
const INTERLEAVED_INITIAL_SELECTED_DECKS = 4

export interface StudySessionApi {
  deck(deckId: number): Promise<DeckDetail>
  deckMetadata(deckId: number): Promise<DeckSummary>
  due(options: DueRequestOptions): Promise<DueResponse>
  review(cardId: number, rating: ReviewRating): Promise<ReviewResult>
}

const studyQueue = ref<StudyCard[]>([])
const sessionTitle = ref('Selecione um baralho ou inicie a prática intercalada.')
const answerVisible = ref(false)
const studyInitialTotal = ref(0)
const studyReviewedCount = ref(0)
const studyRatingCounts = ref<StudyRatingCounts>(emptyStudyRatingCounts())
const lastStudyFeedback = ref<StudyReviewFeedback | null>(null)
const studyEmptyReason = ref<StudyEmptyReason>('idle')
const publicStudyDeckCache = ref<LocalDeck[]>([])
const localStates = ref(loadLocalStates())
const interleavedSelection = ref<InterleavedSelectionState>(emptyInterleavedSelection())
const currentStudyRequest = ref<DueRequestOptions | null>(null)

export function useStudySession({
  client = api,
  publicDeckCacheLimit = DEFAULT_PUBLIC_DECK_CACHE_LIMIT
}: {
  client?: StudySessionApi
  publicDeckCacheLimit?: number
} = {}) {
  const { user } = useAuthSession()
  const { showNotice, withFeedback } = useFeedback()
  const { publicDecks, myDecks, loadPublicDecks, loadMyDecks } = useDeckLibrary({ librarySection: ref('mine') })
  const { refreshStats } = useStatsSummary()
  const currentCard = computed(() => studyQueue.value[0])
  const frontHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.frontHtml, currentCard.value.deckId) : '')
  const backHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.backHtml, currentCard.value.deckId) : '')
  const currentDueLabel = computed(() => currentCard.value ? formatDueIn(currentCard.value.dueAt) : '')
  const studyProgress = computed(() => {
    const initialTotal = studyInitialTotal.value
    const reviewed = studyReviewedCount.value
    return {
      initialTotal,
      reviewed,
      remaining: Math.max(0, initialTotal - reviewed),
      percent: initialTotal > 0 ? Math.round((reviewed / initialTotal) * 100) : 0
    }
  })
  const studySummary = computed(() => studyEmptyReason.value === 'completed' && studyReviewedCount.value > 0
    ? {
        reviewed: studyReviewedCount.value,
        ratingCounts: studyRatingCounts.value,
        lastFeedback: lastStudyFeedback.value
      }
    : null
  )

  const predictedIntervals = computed(() => {
    const card = currentCard.value
    if (!card) return null

    const state = {
      dueAt: card.dueAt,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor
    }

    const formatInterval = (days: number) => {
      if (days === 0) return '< 10m'
      if (days === 1) return '1 d'
      if (days < 30) return `${days} d`
      if (days < 365) return `${Math.floor(days / 30)} m`
      return `${Math.floor(days / 365)} a`
    }

    return {
      AGAIN: formatInterval(nextReview(state, 'AGAIN').intervalDays),
      HARD: formatInterval(nextReview(state, 'HARD').intervalDays),
      GOOD: formatInterval(nextReview(state, 'GOOD').intervalDays),
      EASY: formatInterval(nextReview(state, 'EASY').intervalDays)
    }
  })

  function resetStudySession() {
    studyQueue.value = []
    sessionTitle.value = 'Selecione um baralho ou inicie a prática intercalada.'
    answerVisible.value = false
    studyInitialTotal.value = 0
    studyReviewedCount.value = 0
    studyRatingCounts.value = emptyStudyRatingCounts()
    lastStudyFeedback.value = null
    studyEmptyReason.value = 'idle'
    interleavedSelection.value = emptyInterleavedSelection()
    currentStudyRequest.value = null
  }

  function __reloadLocalStatesForTesting() {
    localStates.value = loadLocalStates()
  }

  function setStudySessionCards(cards: StudyCard[], emptyReason: StudyEmptyReason) {
    studyQueue.value = cards
    studyInitialTotal.value = cards.length
    studyReviewedCount.value = 0
    studyRatingCounts.value = emptyStudyRatingCounts()
    lastStudyFeedback.value = null
    studyEmptyReason.value = cards.length > 0 ? 'idle' : emptyReason
    answerVisible.value = false
  }

  function completeCurrentReview(rating: ReviewRating, feedback: StudyReviewFeedback | null) {
    studyReviewedCount.value += 1
    studyRatingCounts.value = {
      ...studyRatingCounts.value,
      [rating]: studyRatingCounts.value[rating] + 1
    }
    lastStudyFeedback.value = feedback
    studyQueue.value.shift()
    answerVisible.value = false
    if (studyQueue.value.length === 0) {
      studyEmptyReason.value = 'completed'
    }
  }

  async function fetchNextBatch() {
    if (!currentStudyRequest.value) return
    const due = await client.due(currentStudyRequest.value)
    const cards = due.cards.map(serverCardToStudyCard)

    if (cards.length > 0) {
      studyQueue.value = cards
      studyInitialTotal.value += cards.length
      studyEmptyReason.value = 'idle'
    } else {
      if (due.limitReachedNew || due.limitReachedReview) {
        studyEmptyReason.value = 'limit-reached'
      } else {
        studyEmptyReason.value = 'completed'
      }
    }
  }

  async function loadStudyDeck(deckId: number) {
    answerVisible.value = false

    await withFeedback(async () => {
      const metadata = await client.deckMetadata(deckId).catch(() => null)
      sessionTitle.value = metadata?.title ?? 'Baralho'
      let cards: StudyCard[]
      let emptyReason: StudyEmptyReason = metadata?.cardCount === 0 ? 'empty-deck' : 'no-due'

      if (user.value) {
        currentStudyRequest.value = { mode: 'SINGLE_DECK', deckId, limit: 20 }
        const due = await client.due(currentStudyRequest.value)
        cards = due.cards.map(serverCardToStudyCard)
        if (cards.length === 0 && emptyReason !== 'empty-deck') {
          emptyReason = (due.limitReachedNew || due.limitReachedReview) ? 'limit-reached' : 'no-due'
        }
      } else {
        currentStudyRequest.value = null
        const localDeck = await ensurePublicDeck(deckId)
        sessionTitle.value = localDeck.title
        cards = localDeckToStudyCards(localDeck, localStates.value)
      }

      setStudySessionCards(cards, emptyReason)
      if (cards.length === 0) {
        if (emptyReason === 'limit-reached') {
          showNotice('Voce atingiu o limite diario de estudos.')
        } else {
          showNotice('Nenhum card vencido agora para esta sessao.')
        }
      }
    })
  }

  async function prepareInterleavedPracticeSelection(initialSelectedIds: number[] = []) {
    sessionTitle.value = 'Pratica intercalada'
    answerVisible.value = false
    studyQueue.value = []
    studyInitialTotal.value = 0
    studyReviewedCount.value = 0
    studyRatingCounts.value = emptyStudyRatingCounts()
    lastStudyFeedback.value = null
    studyEmptyReason.value = 'idle'

    await withFeedback(async () => {
      if (user.value) {
        if (myDecks.value.length === 0) {
          await loadMyDecks(true)
        }
        if (publicDecks.value.length === 0) {
          await loadPublicDecks(true)
        }
      } else if (publicDecks.value.length === 0) {
        await loadPublicDecks(true)
      }

      const options = interleavedDeckOptions(user.value ? myDecks.value : [], publicDecks.value, Boolean(user.value))
      const validSelectedIds = initialSelectedIds
        .filter((id) => options.some((opt) => opt.id === id))
        .slice(0, INTERLEAVED_MAX_SELECTED_DECKS)

      const currentDeckId = currentStudyRequest.value && 'deckId' in currentStudyRequest.value 
        ? currentStudyRequest.value.deckId 
        : null

      interleavedSelection.value = {
        active: true,
        options,
        selectedIds: validSelectedIds.length > 0 ? validSelectedIds : initialInterleavedSelection(options, currentDeckId),
        maxSelected: INTERLEAVED_MAX_SELECTED_DECKS
      }
    })
  }

  async function startInterleavedPracticeSession() {
    const selectedIds = interleavedSelection.value.selectedIds
    if (selectedIds.length === 0) {
      showNotice('Selecione pelo menos um baralho para iniciar.')
      return
    }

    sessionTitle.value = 'Pratica intercalada'
    answerVisible.value = false

    await withFeedback(async () => {
      let cards: StudyCard[]
      let emptyReason: StudyEmptyReason = 'no-due'

      if (user.value) {
        currentStudyRequest.value = {
          mode: 'MIXED_DUE',
          deckIds: selectedIds,
          limit: 20
        }
        const due = await client.due(currentStudyRequest.value)
        cards = due.cards.map(serverCardToStudyCard)
        if (cards.length === 0) {
          emptyReason = (due.limitReachedNew || due.limitReachedReview) ? 'limit-reached' : 'no-due'
        }
      } else {
        currentStudyRequest.value = null
        const groups: StudyCard[][] = []
        for (const deckId of selectedIds) {
          const localDeck = await ensurePublicDeck(deckId)
          groups.push(localDeckToStudyCards(localDeck, localStates.value))
        }
        cards = interleaveDeckCardGroups(groups, INTERLEAVED_STUDY_LIMIT)
      }

      interleavedSelection.value = {
        ...interleavedSelection.value,
        active: false
      }
      setStudySessionCards(cards, emptyReason)
      if (cards.length === 0) {
        if (emptyReason === 'limit-reached') {
          showNotice('Voce atingiu o limite diario de estudos.')
        } else {
          showNotice('Pratica intercalada sem cards vencidos agora.')
        }
      }
    })
  }

  function toggleInterleavedDeckSelection(deckId: number) {
    const current = interleavedSelection.value
    const selected = new Set(current.selectedIds)
    if (selected.has(deckId)) {
      selected.delete(deckId)
    } else if (selected.size < current.maxSelected) {
      selected.add(deckId)
    }
    interleavedSelection.value = {
      ...current,
      selectedIds: [...selected]
    }
  }

  async function reviewCurrent(rating: ReviewRating) {
    const card = currentCard.value
    if (!card) {
      return
    }

    await withFeedback(async () => {
      let feedback: StudyReviewFeedback | null = null
      if (card.local) {
        const result = nextReview(localStates.value[card.clientId], rating)
        localStates.value[card.clientId] = result
        saveLocalStates(localStates.value)
        feedback = studyFeedbackFromResult(rating, result.dueAt, result.intervalDays)
      } else if (card.cardId) {
        const result = await client.review(card.cardId, rating)
        feedback = studyFeedbackFromReviewResult(result)
        if (user.value) {
          await refreshStats()
        }
      }
      completeCurrentReview(rating, feedback)
      
      if (studyQueue.value.length === 0 && user.value && currentStudyRequest.value) {
        await fetchNextBatch()
      }
    }, false)
  }

  async function ensurePublicDeck(deckId: number) {
    const localId = `public:${deckId}`
    const existing = publicStudyDeckCache.value.find((deck) => deck.id === localId)
    if (existing) {
      publicStudyDeckCache.value = [
        existing,
        ...publicStudyDeckCache.value.filter((deck) => deck.id !== localId)
      ]
      return existing
    }

    const detail = await client.deck(deckId)
    const localDeck = deckDetailToLocal(detail)
    publicStudyDeckCache.value = [localDeck, ...publicStudyDeckCache.value]
      .slice(0, publicDeckCacheLimit)
    return localDeck
  }

  function clearPublicStudyDeckCache() {
    publicStudyDeckCache.value = []
  }

  function skipCurrentCard() {
    if (studyQueue.value.length > 1) {
      const card = studyQueue.value.shift()
      if (card) {
        studyQueue.value.push(card)
      }
    }
    answerVisible.value = false
  }

  return {
    studyQueue,
    sessionTitle,
    answerVisible,
    lastStudyFeedback,
    studyEmptyReason,
    currentCard,
    frontHtml,
    backHtml,
    currentDueLabel,
    studyProgress,
    studySummary,
    predictedIntervals,
    interleavedSelection,
    resetStudySession,
    setStudySessionCards,
    completeCurrentReview,
    loadStudyDeck,
    prepareInterleavedPracticeSelection,
    startInterleavedPracticeSession,
    toggleInterleavedDeckSelection,
    reviewCurrent,
    clearPublicStudyDeckCache,
    skipCurrentCard,
    __reloadLocalStatesForTesting
  }
}

export function interleaveDeckCardGroups(groups: StudyCard[][], limit = INTERLEAVED_STUDY_LIMIT) {
  const mixed: StudyCard[] = []
  let index = 0
  let added = true

  while (added && mixed.length < limit) {
    added = false
    for (const group of groups) {
      const card = group[index]
      if (card) {
        mixed.push(card)
        added = true
        if (mixed.length >= limit) {
          return mixed
        }
      }
    }
    index += 1
  }

  return mixed
}

function emptyInterleavedSelection(): InterleavedSelectionState {
  return {
    active: false,
    options: [],
    selectedIds: [],
    maxSelected: INTERLEAVED_MAX_SELECTED_DECKS
  }
}

function interleavedDeckOptions(myDecks: DeckSummary[], publicDecks: DeckSummary[], authenticated: boolean) {
  const options: InterleavedDeckOption[] = []
  const seen = new Set<number>()

  if (authenticated) {
    appendDeckOptions(options, seen, myDecks, 'mine')
  }
  appendDeckOptions(options, seen, publicDecks, 'public')

  return options
}

function appendDeckOptions(
  options: InterleavedDeckOption[],
  seen: Set<number>,
  decks: DeckSummary[],
  source: InterleavedDeckOption['source']
) {
  for (const deck of decks) {
    if (seen.has(deck.id)) {
      continue
    }
    seen.add(deck.id)
    options.push({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: deck.cardCount,
      dueCount: deck.dueCount,
      visibility: deck.visibility,
      source,
      ownerName: deck.ownerName
    })
  }
}

function initialInterleavedSelection(options: InterleavedDeckOption[], currentDeckId: number | null) {
  if (currentDeckId !== null && options.some((opt) => opt.id === currentDeckId)) {
    return [currentDeckId]
  }
  return []
}

function serverCardToStudyCard(card: StudyCardResponse): StudyCard {
  return {
    clientId: `server:${card.cardId}`,
    cardId: card.cardId,
    deckId: card.deckId,
    deckTitle: card.deckTitle,
    frontHtml: card.frontHtml,
    backHtml: card.backHtml,
    tags: card.tags,
    dueAt: card.dueAt,
    intervalDays: card.intervalDays,
    repetitions: card.repetitions,
    easeFactor: 2.5,
    newCard: card.newCard,
    local: false
  }
}
