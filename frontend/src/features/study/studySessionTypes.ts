import type { DeckVisibility } from '../../types/api'
import type { StudyRatingCounts, StudyReviewFeedback } from './studyFeedback'

export type StudyEmptyReason = 'idle' | 'no-due' | 'completed' | 'empty-deck'
export type InterleavedDeckSource = 'mine' | 'public'

export interface InterleavedDeckOption {
  id: number
  title: string
  description: string | null
  cardCount: number
  dueCount: number | null
  visibility: DeckVisibility
  source: InterleavedDeckSource
  ownerName: string
}

export interface InterleavedSelectionState {
  active: boolean
  options: InterleavedDeckOption[]
  selectedIds: number[]
  maxSelected: number
}

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
