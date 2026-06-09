import { computed, ref } from 'vue'
import type { ReviewRating, StudyCard } from '../../types/api'
import { formatDueIn } from '../../utils/dueTime'
import { safeStudyHtml } from '../../utils/html'
import {
  emptyStudyRatingCounts,
  type StudyRatingCounts,
  type StudyReviewFeedback
} from './studyFeedback'
import type { StudyEmptyReason } from './studySessionTypes'

export function useStudySession() {
  const studyQueue = ref<StudyCard[]>([])
  const sessionTitle = ref('Selecione um baralho ou inicie a prática intercalada.')
  const answerVisible = ref(false)
  const studyInitialTotal = ref(0)
  const studyReviewedCount = ref(0)
  const studyRatingCounts = ref<StudyRatingCounts>(emptyStudyRatingCounts())
  const lastStudyFeedback = ref<StudyReviewFeedback | null>(null)
  const studyEmptyReason = ref<StudyEmptyReason>('idle')

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
    completeCurrentReview
  }
}
