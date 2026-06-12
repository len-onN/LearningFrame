import { createPinia, setActivePinia } from 'pinia'
import {  describe, expect, it , beforeEach } from 'vitest'
import type { CardResponse } from '../../types/api'
import { cardTextSummary, fallbackCardLabel, mergeCardsPages, splitTags } from './cardText'

describe('cardText', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('separa tags por virgula removendo espacos e entradas vazias', () => {
    expect(splitTags(' anatomia, , fisiologia ,')).toEqual(['anatomia', 'fisiologia'])
  })

  it('usa resumo da frente, verso ou fallback posicional', () => {
    const cards = [
      card(1, '', ''),
      card(2, '', 'Verso'),
      card(3, 'Frente', 'Verso')
    ]
    const summarizeHtml = (html: string) => html.trim()

    expect(cardTextSummary(cards[2], cards, summarizeHtml)).toBe('Frente')
    expect(cardTextSummary(cards[1], cards, summarizeHtml)).toBe('Verso')
    expect(cardTextSummary(cards[0], cards, summarizeHtml)).toBe('Carta 1')
    expect(fallbackCardLabel(card(99, '', ''), cards)).toBe('Carta')
  })

  it('mescla paginas de cartas sem duplicar pelo id', () => {
    expect(mergeCardsPages([
      card(1, 'A', ''),
      card(2, 'B', '')
    ], [
      card(2, 'B atualizado', ''),
      card(3, 'C', '')
    ])).toEqual([
      card(1, 'A', ''),
      card(2, 'B atualizado', ''),
      card(3, 'C', '')
    ])
  })
})

function card(id: number, frontHtml: string, backHtml: string): CardResponse {
  return {
    id,
    deckId: 1,
    frontHtml,
    backHtml,
    tags: []
  }
}
