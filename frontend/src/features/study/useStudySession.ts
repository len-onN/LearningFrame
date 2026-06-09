import { computed, ref, type Ref } from 'vue'
import type { FeedbackOptions } from '../../composables/useFeedback'
import { api } from '../../services/api'
import type {
  DeckDetail,
  DeckSummary,
  DueResponse,
  LocalDeck,
  ReviewRating,
  ReviewResult,
  StudyCard,
  StudyCardResponse,
  StudyMode,
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
import type { StudyEmptyReason } from './studySessionTypes'

const DEFAULT_PUBLIC_DECK_CACHE_LIMIT = 6

export interface StudySessionApi {
  deck(deckId: number): Promise<DeckDetail>
  deckMetadata(deckId: number): Promise<DeckSummary>
  due(mode: StudyMode, deckId?: number): Promise<DueResponse>
  review(cardId: number, rating: ReviewRating): Promise<ReviewResult>
}

export interface StudySessionOptions {
  user: Ref<UserResponse | null>
  publicDecks: Ref<DeckSummary[]>
  loadPublicDecks: (reset?: boolean) => Promise<void>
  refreshStats: () => Promise<void>
  showNotice: (message: string) => void
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
  client?: StudySessionApi
  publicDeckCacheLimit?: number
}

export function useStudySession({
  user,
  publicDecks,
  loadPublicDecks,
  refreshStats,
  showNotice,
  withFeedback,
  client = api,
  publicDeckCacheLimit = DEFAULT_PUBLIC_DECK_CACHE_LIMIT
}: StudySessionOptions) {
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

  function resetStudySession() {
    studyQueue.value = []
    sessionTitle.value = 'Selecione um baralho ou inicie a prática intercalada.'
    answerVisible.value = false
    studyInitialTotal.value = 0
    studyReviewedCount.value = 0
    studyRatingCounts.value = emptyStudyRatingCounts()
    lastStudyFeedback.value = null
    studyEmptyReason.value = 'idle'
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

  async function loadStudyDeck(deckId: number) {
    answerVisible.value = false

    await withFeedback(async () => {
      const metadata = await client.deckMetadata(deckId).catch(() => null)
      sessionTitle.value = metadata?.title ?? 'Baralho'
      let cards: StudyCard[]
      let emptyReason: StudyEmptyReason = metadata?.cardCount === 0 ? 'empty-deck' : 'no-due'

      if (user.value) {
        const due = await client.due('SINGLE_DECK', deckId)
        cards = due.cards.map(serverCardToStudyCard)
      } else {
        const localDeck = await ensurePublicDeck(deckId)
        sessionTitle.value = localDeck.title
        cards = localDeckToStudyCards(localDeck, localStates.value)
      }

      setStudySessionCards(cards, emptyReason)
      if (cards.length === 0) {
        showNotice('Nenhum card vencido agora para esta sessao.')
      }
    })
  }

  async function loadInterleavedPractice() {
    sessionTitle.value = 'Prática intercalada'
    answerVisible.value = false

    await withFeedback(async () => {
      let cards: StudyCard[]
      if (user.value) {
        const due = await client.due('MIXED_DUE')
        cards = due.cards.map(serverCardToStudyCard)
      } else {
        if (publicDecks.value.length === 0) {
          await loadPublicDecks(true)
        }
        cards = []
        for (const deck of publicDecks.value.slice(0, 4)) {
          const localDeck = await ensurePublicDeck(deck.id)
          cards.push(...localDeckToStudyCards(localDeck, localStates.value))
        }
      }
      setStudySessionCards(cards, 'no-due')
      if (cards.length === 0) {
        showNotice('Prática intercalada sem cards vencidos agora.')
      }
    })
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
    resetStudySession,
    setStudySessionCards,
    completeCurrentReview,
    loadStudyDeck,
    loadInterleavedPractice,
    reviewCurrent,
    clearPublicStudyDeckCache
  }
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
