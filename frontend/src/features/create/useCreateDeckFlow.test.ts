import { createPinia, setActivePinia } from 'pinia'
import {  describe, expect, it, vi , beforeEach } from 'vitest'
import type { DeckSummary, DeckVisibility } from '../../types/api'
import { useCreateDeckFlow, type CreateDeckApi } from './useCreateDeckFlow'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useDeckManagementStore } from '../../stores/useDeckManagementStore'
import { useRouter } from 'vue-router'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('useCreateDeckFlow', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('cria baralho, reseta formulario e abre gerenciamento', async () => {
    const {
      client,
      flow,
      mockRouter,
      libraryStore,
      deckManagementStore
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

    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.withFeedback).toHaveBeenCalledWith(expect.any(Function))
    expect(client.createDeck).toHaveBeenCalledWith('Neuro', 'Memoria', 'PUBLIC')
    expect(flow.deckForm.value).toEqual({
      title: '',
      description: '',
      visibility: 'PRIVATE'
    })
    expect(libraryStore.loadMyDecks).toHaveBeenCalledWith(true)
    expect(deckManagementStore.setManagedDeck).toHaveBeenCalledWith(created)
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'library-deck-manage', params: { deckId: 42 } })
    expect(feedbackStore.showNotice).toHaveBeenCalledWith('Baralho criado. Adicione as primeiras cartas.')
  })
})

function createSubject() {
  const client = createClient()
  
  const mockRouter = {
    push: vi.fn()
  }
  vi.mocked(useRouter).mockReturnValue(mockRouter as any)

  const feedbackStore = useFeedbackStore()
  feedbackStore.showNotice = vi.fn()
  feedbackStore.withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  const libraryStore = useLibraryStore()
  libraryStore.loadMyDecks = vi.fn(async () => undefined)

  const deckManagementStore = useDeckManagementStore()
  deckManagementStore.setManagedDeck = vi.fn()

  const flow = useCreateDeckFlow({
    client
  })

  return {
    client,
    flow,
    mockRouter,
    libraryStore,
    deckManagementStore
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
