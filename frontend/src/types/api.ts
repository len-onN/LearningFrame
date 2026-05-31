export type DeckVisibility = 'PRIVATE' | 'PUBLIC'
export type ImportFormat = 'MANUAL' | 'APKG' | 'CSV' | 'TSV'
export type ReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
export type StudyMode = 'SINGLE_DECK' | 'MIXED_DUE'

export interface UserResponse {
  id: number
  displayName: string
  email: string
}

export interface AuthResponse {
  token: string
  user: UserResponse
}

export interface DeckSummary {
  id: number
  title: string
  description: string | null
  visibility: DeckVisibility
  sourceFormat: ImportFormat
  cardCount: number
  dueCount: number | null
  nextDueAt: string | null
  ownerName: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface CardResponse {
  id: number
  deckId: number
  frontHtml: string
  backHtml: string
  tags: string[]
}

export interface DeckDetail {
  id: number
  title: string
  description: string | null
  visibility: DeckVisibility
  sourceFormat: ImportFormat
  ownerName: string
  cards: CardResponse[]
}

export interface StudyCardResponse {
  cardId: number
  deckId: number
  deckTitle: string
  frontHtml: string
  backHtml: string
  tags: string[]
  newCard: boolean
  dueAt: string
  intervalDays: number
  repetitions: number
}

export interface DueResponse {
  mode: StudyMode
  cards: StudyCardResponse[]
}

export interface ReviewResult {
  cardId: number | null
  rating: ReviewRating
  nextDueAt: string
  intervalDays: number
  repetitions: number
  easeFactor: number
}

export interface StatsSummary {
  dueNow: number
  reviewsToday: number
  accuracyLast7Days: number
  activeDaysLast30: number
  nextDueAt: string | null
}

export interface ApkgCard {
  frontHtml: string
  backHtml: string
  tags: string[]
}

export interface ApkgPreviewResponse {
  title: string
  notesFound: number
  cardsReady: number
  cardsSkipped: number
  mediaFound: number
  warnings: string[]
  cards: ApkgCard[]
}

export interface ApkgImportResponse {
  deckId: number
  title: string
  visibility: DeckVisibility
  cardsImported: number
  cardsSkipped: number
  mediaImported: number
  warnings: string[]
}

export interface LocalDeck {
  id: string
  title: string
  description: string
  source: 'PUBLIC' | 'APKG'
  sourceFileName?: string
  mediaFound?: number
  requiresBackendImport?: boolean
  importedAt?: string
  cards: LocalCard[]
}

export interface LocalCard {
  clientId: string
  deckId: string
  deckTitle: string
  frontHtml: string
  backHtml: string
  tags: string[]
  sourceCardId?: number
}

export interface LocalReviewState {
  dueAt: string
  intervalDays: number
  repetitions: number
  easeFactor: number
}

export interface StudyCard {
  clientId: string
  cardId?: number
  deckId: number | string
  deckTitle: string
  frontHtml: string
  backHtml: string
  tags: string[]
  dueAt: string
  intervalDays: number
  repetitions: number
  easeFactor: number
  newCard: boolean
  local: boolean
}
