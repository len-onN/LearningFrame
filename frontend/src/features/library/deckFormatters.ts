import type { DeckSummary } from '../../types/api'
import { nextDueLabel } from '../../utils/dueTime'

export function cardCountLabel(count: number) {
  return `${count} ${count === 1 ? 'carta' : 'cartas'}`
}

export function deckDueLabel(deck: DeckSummary, hasUser: boolean) {
  if (!hasUser && deck.dueCount == null) {
    return 'disponivel agora'
  }
  return nextDueLabel(deck.dueCount, deck.nextDueAt)
}
