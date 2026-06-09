import { describe, expect, it, vi } from 'vitest'
import type { DeckSummary, DeckVisibility } from '../../types/api'
import { useCreateDeckFlow, type CreateDeckApi } from './useCreateDeckFlow'

describe('useCreateDeckFlow', () => {
  it('cria baralho, reseta formulario e abre gerenciamento', async () => {
    const {
      client,
      flow,
      loadMyDecks,
      navigateToManagedDeck,
      setManagedDeck,
      showNotice,
      withFeedback
    } = createSubject()
    const created = deck(42, 'Neuro', {
      description: 'Memoria',
      visibility: 'PUBLIC'
    })
    client.createDeck.mockResolvedValueOnce(created)
    flow.deckForm.value = {
      title: 'Neuro',
      description: 'Memoria',
      visibility: 'PUBLIC'
    }

    await flow.createDeck()

    expect(withFeedback).toHaveBeenCalledWith(expect.any(Function))
    expect(client.createDeck).toHaveBeenCalledWith('Neuro', 'Memoria', 'PUBLIC')
    expect(flow.deckForm.value).toEqual({
      title: '',
      description: '',
      visibility: 'PRIVATE'
    })
    expect(loadMyDecks).toHaveBeenCalledWith(true)
    expect(setManagedDeck).toHaveBeenCalledWith(created)
    expect(navigateToManagedDeck).toHaveBeenCalledWith(42)
    expect(showNotice).toHaveBeenCalledWith('Baralho criado. Adicione as primeiras cartas.')
  })
})

function createSubject() {
  const client = createClient()
  const loadMyDecks = vi.fn(async () => undefined)
  const setManagedDeck = vi.fn()
  const navigateToManagedDeck = vi.fn(async () => undefined)
  const showNotice = vi.fn()
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  const flow = useCreateDeckFlow({
    client,
    loadMyDecks,
    setManagedDeck,
    navigateToManagedDeck,
    showNotice,
    withFeedback
  })

  return {
    client,
    flow,
    loadMyDecks,
    setManagedDeck,
    navigateToManagedDeck,
    showNotice,
    withFeedback
  }
}

function createClient() {
  return {
    createDeck: vi.fn(async (_title: string, _description: string, _visibility: DeckVisibility) => (
      deck(1, 'Deck')
    ))
  } satisfies CreateDeckApi
}

function deck(id: number, title: string, overrides: Partial<DeckSummary> = {}): DeckSummary {
  return {
    id,
    title,
    description: '',
    visibility: 'PRIVATE',
    sourceFormat: 'MANUAL',
    cardCount: 0,
    dueCount: 0,
    nextDueAt: null,
    ownerName: 'Ada',
    updatedAt: '2026-06-09T00:00:00Z',
    ...overrides
  }
}
