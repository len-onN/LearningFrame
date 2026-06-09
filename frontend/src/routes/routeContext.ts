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
  CardTextFormatter,
  DeckListFormatters,
  LibrarySection,
  LibraryView,
  ManagedCardsViewState,
  ManagedDeckFormState
} from '../features/library/libraryTypes'
import type { PreviewCardOption, PreviewFace } from '../features/import/importTypes'
import type {
  StudyEmptyReason,
  StudySessionProgress,
  StudySessionSummary
} from '../features/study/studySessionTypes'
import type { StudyReviewFeedback } from '../features/study/studyFeedback'
export type {
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

export interface LibraryRouteContext {
  librarySearch: Ref<string>
  librarySection: ComputedRef<LibrarySection>
  libraryView: ComputedRef<LibraryView>
  user: Ref<UserResponse | null>
  activeLibraryCountLabel: ComputedRef<string>
  filteredPublicDecks: ComputedRef<DeckSummary[]>
  filteredMyDecks: ComputedRef<DeckSummary[]>
  publicDecksHasMore: ComputedRef<boolean>
  myDecksHasMore: ComputedRef<boolean>
  highlightedDeckId: Ref<number | null>
  deckSelectionMode: Ref<boolean>
  selectedMyDeckIds: Ref<Set<number>>
  selectedMyDecksCount: ComputedRef<number>
  allVisibleMyDecksSelected: ComputedRef<boolean>
  managedDeck: Ref<DeckSummary | null>
  managedDeckForm: Ref<ManagedDeckFormState>
  managedDeckDirty: ComputedRef<boolean>
  managedCardsView: ComputedRef<ManagedCardsViewState>
  managedCardsSearch: Ref<string>
  deckFormatters: DeckListFormatters
  cardTextSummary: CardTextFormatter
  cardCountLabel: (count: number) => string
  navigateTo: (to: RouteLocationRaw) => Promise<void>
  refreshAll: () => Promise<void>
  startDeck: (deck: DeckSummary) => Promise<void>
  savePublicDeck: (deck: DeckSummary) => Promise<void>
  loadMorePublicDecks: () => Promise<void>
  loadMoreMyDecks: () => Promise<void>
  openManagedDeck: (deck: DeckSummary) => Promise<void>
  toggleDeckSelectionMode: () => void
  toggleVisibleMyDeckSelection: () => void
  clearSelectedMyDecks: () => void
  deleteSelectedMyDecks: () => Promise<void>
  toggleMyDeckSelection: (deckId: number) => void
  openAuth: (mode?: AuthMode) => Promise<void>
  closeManagedDeck: () => Promise<boolean>
  saveManagedDeck: () => Promise<void>
  deleteManagedDeck: () => Promise<void>
  updateManagedDeckForm: (form: ManagedDeckFormState) => void
  openCreateCardEditor: () => void
  toggleVisibleManagedCardsSelection: () => void
  clearManagedCardSelection: () => void
  deleteSelectedManagedCards: () => Promise<void>
  selectManagedCard: (card: CardResponse) => void
  toggleManagedCardSelection: (cardId: number) => void
  loadMoreManagedCards: () => Promise<void>
  openEditCardEditor: (card: CardResponse) => void
  deleteManagedCard: (card: CardResponse) => Promise<void>
}

export interface StudyRouteContext {
  sessionTitle: Ref<string>
  currentCard: ComputedRef<StudyCard | undefined>
  currentDueLabel: ComputedRef<string>
  frontHtml: ComputedRef<string>
  backHtml: ComputedRef<string>
  answerVisible: Ref<boolean>
  studyProgress: ComputedRef<StudySessionProgress>
  studyEmptyReason: Ref<StudyEmptyReason>
  lastStudyFeedback: Ref<StudyReviewFeedback | null>
  studySummary: ComputedRef<StudySessionSummary | null>
  goToLibrary: () => Promise<void>
  startInterleavedPractice: () => Promise<void>
  reviewCurrent: (rating: ReviewRating) => Promise<void>
}

export interface ImportRouteContext {
  importTitle: Ref<string>
  importVisibility: Ref<DeckVisibility>
  selectedFile: Ref<File | null>
  loading: Ref<boolean>
  importPreview: Ref<ApkgPreviewResponse | null>
  currentPreviewCard: ComputedRef<ApkgCard | null>
  previewCardIndex: Ref<number>
  previewFace: Ref<PreviewFace>
  previewPickerOpen: Ref<boolean>
  previewCardSearch: Ref<string>
  previewCardOptions: ComputedRef<PreviewCardOption[]>
  previewCardTitle: (index: number) => string
  currentPreviewHtml: ComputedRef<string>
  user: Ref<UserResponse | null>
  handleApkgChange: (event: Event) => Promise<void>
  selectPreviewCard: (index: number) => Promise<void>
  movePreviewCard: (direction: -1 | 1) => Promise<void>
  togglePreviewFace: () => Promise<void>
  persistImport: () => Promise<void>
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
export const libraryRouteKey: InjectionKey<LibraryRouteContext> = Symbol('library-route')
export const studyRouteKey: InjectionKey<StudyRouteContext> = Symbol('study-route')
export const importRouteKey: InjectionKey<ImportRouteContext> = Symbol('import-route')
export const createDeckRouteKey: InjectionKey<CreateDeckRouteContext> = Symbol('create-deck-route')
export const progressRouteKey: InjectionKey<ProgressRouteContext> = Symbol('progress-route')

export function useRequiredRouteContext<T>(key: InjectionKey<T>, label: string) {
  const context = inject(key)
  if (!context) {
    throw new Error(`${label} route context is not available.`)
  }
  return context
}
