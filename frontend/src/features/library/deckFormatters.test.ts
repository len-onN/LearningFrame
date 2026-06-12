import { createPinia, setActivePinia } from 'pinia'
import {  describe, expect, it , beforeEach } from 'vitest'
import type { DeckSummary } from '../../types/api'
import { cardCountLabel, deckDueLabel } from './deckFormatters'

describe('deckFormatters', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('formata quantidade de cartas no singular e plural', () => {
    expect(cardCountLabel(1)).toBe('1 carta')
    expect(cardCountLabel(2)).toBe('2 cartas')
  })

  it('exibe disponibilidade imediata para usuario anonimo sem agenda', () => {
    expect(deckDueLabel(deck({ dueCount: null, nextDueAt: null }), false)).toBe('disponivel agora')
  })

  it('delega agenda para decks com usuario autenticado ou dueCount definido', () => {
    expect(deckDueLabel(deck({ dueCount: 0, nextDueAt: null }), false)).toBe('proximo sem previsao')
    expect(deckDueLabel(deck({ dueCount: null, nextDueAt: null }), true)).toBe('proximo sem previsao')
  })
})

function deck(overrides: Partial<DeckSummary>): DeckSummary {
  return {
    id: 1,
    title: 'Deck',
    description: '',
    visibility: 'PUBLIC',
    sourceFormat: 'MANUAL',
    cardCount: 1,
    dueCount: 0,
    nextDueAt: null,
    ownerName: 'Ada',
    updatedAt: '2026-06-02T00:00:00Z',
    ...overrides
  }
}
