import type { StudyRatingCounts, StudyReviewFeedback } from './studyFeedback'

export type StudyEmptyReason = 'idle' | 'no-due' | 'completed' | 'empty-deck'

export interface StudySessionProgress {
  initialTotal: number
  reviewed: number
  remaining: number
  percent: number
}

export interface StudySessionSummary {
  reviewed: number
  ratingCounts: StudyRatingCounts
  lastFeedback: StudyReviewFeedback | null
}
