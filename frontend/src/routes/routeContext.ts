import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  ApkgCard,
  ApkgPreviewResponse,
  CardResponse,
  DeckSummary,
  DeckVisibility,
  ReviewRating,
  StatsSummary,
  StudyCard,
  UserResponse
} from '../types/api'
import type { AuthField, AuthMode } from '../utils/authValidation'

import type {
  InterleavedSelectionState,
  StudyEmptyReason,
  StudySessionProgress,
  StudySessionSummary
} from '../features/study/studySessionTypes'
import type { StudyReviewFeedback } from '../features/study/studyFeedback'
export type {
  InterleavedSelectionState,
  StudyEmptyReason,
  StudySessionProgress,
  StudySessionSummary
} from '../features/study/studySessionTypes'
export type { StudyReviewFeedback } from '../features/study/studyFeedback'

export interface AuthRouteContext {
  authForm: Ref<{
    displayName: string
    email: string
    password: string
  }>
  authMode: ComputedRef<AuthMode>
  authFieldError: (field: AuthField) => string
  submitAuth: () => Promise<void>
  goHome: () => Promise<void>
  toggleAuthMode: () => Promise<void>
  touchAuthField: (field: AuthField) => void
}


export interface CreateDeckRouteContext {
  deckForm: Ref<{
    title: string
    description: string
    visibility: DeckVisibility
  }>
  user: Ref<UserResponse | null>
  createDeck: () => Promise<void>
}

export interface ProgressRouteContext {
  user: Ref<UserResponse | null>
  stats: Ref<StatsSummary | null>
}

export const authRouteKey: InjectionKey<AuthRouteContext> = Symbol('auth-route')
export const createDeckRouteKey: InjectionKey<CreateDeckRouteContext> = Symbol('create-deck-route')
export const progressRouteKey: InjectionKey<ProgressRouteContext> = Symbol('progress-route')

export function useRequiredRouteContext<T>(key: InjectionKey<T>, label: string) {
  const context = inject(key)
  if (!context) {
    throw new Error(`${label} route context is not available.`)
  }
  return context
}
