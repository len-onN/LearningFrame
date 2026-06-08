import type { CardResponse } from '../../types/api'

export function splitTags(tags: string) {
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
}

export function cardTextSummary(
  card: CardResponse,
  managedCards: CardResponse[],
  summarizeHtml: (html: string) => string
) {
  return summarizeHtml(card.frontHtml) || summarizeHtml(card.backHtml) || fallbackCardLabel(card, managedCards)
}

export function fallbackCardLabel(card: CardResponse, managedCards: CardResponse[]) {
  const index = managedCards.findIndex((managedCard) => managedCard.id === card.id)
  return index >= 0 ? `Carta ${index + 1}` : 'Carta'
}

export function mergeCardsPages(current: CardResponse[], incoming: CardResponse[]) {
  const merged = new Map<number, CardResponse>()
  for (const card of [...current, ...incoming]) {
    merged.set(card.id, card)
  }
  return [...merged.values()]
}
