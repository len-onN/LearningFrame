import type { CardResponse, DeckSummary, DeckVisibility } from '../../types/api'

export type LibrarySection = 'public' | 'mine'
export type LibraryView = 'decks' | 'manage-deck'

export interface ManagedDeckFormState {
  title: string
  description: string
  visibility: DeckVisibility
}

export interface ManagedCardsViewState {
  cards: CardResponse[]
  selectedCard: CardResponse | null
  selectedCardId: number | null
  selectedCardIds: Set<number>
  selectedCount: number
  allVisibleSelected: boolean
  hasMore: boolean
  countLabel: string
  frontPreview: string
  backPreview: string
}

export interface DeckListFormatters {
  cardCount: (count: number) => string
  due: (deck: DeckSummary) => string
}

export type CardTextFormatter = (card: CardResponse) => string
