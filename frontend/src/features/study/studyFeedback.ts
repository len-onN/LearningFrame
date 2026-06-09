import type { ReviewRating, ReviewResult } from '../../types/api'
import { formatDueIn } from '../../utils/dueTime'

export type StudyRatingCounts = Record<ReviewRating, number>

export interface StudyReviewFeedback {
  rating: ReviewRating
  ratingLabel: string
  nextDueLabel: string
  intervalLabel: string
}

export function emptyStudyRatingCounts(): StudyRatingCounts {
  return {
    AGAIN: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0
  }
}

export function studyFeedbackFromReviewResult(result: ReviewResult) {
  return studyFeedbackFromResult(result.rating, result.nextDueAt, result.intervalDays)
}

export function studyFeedbackFromResult(rating: ReviewRating, nextDueAt: string, intervalDays: number): StudyReviewFeedback {
  return {
    rating,
    ratingLabel: ratingLabel(rating),
    nextDueLabel: formatDueIn(nextDueAt),
    intervalLabel: intervalLabel(intervalDays)
  }
}

export function ratingLabel(rating: ReviewRating) {
  const labels: Record<ReviewRating, string> = {
    AGAIN: 'De novo',
    HARD: 'Dif\u00edcil',
    GOOD: 'Bom',
    EASY: 'F\u00e1cil'
  }
  return labels[rating]
}

export function intervalLabel(intervalDays: number) {
  if (intervalDays <= 0) {
    return 'intervalo menor que 1 dia'
  }
  if (intervalDays === 1) {
    return 'intervalo de 1 dia'
  }
  return `intervalo de ${intervalDays} dias`
}
