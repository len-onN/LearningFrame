import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CardResponse, DeckSummary, PageResponse } from '../../types/api'
import { useDeckManagement, type DeckManagementApi } from './useDeckManagement'

describe('useDeckManagement', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('carrega metadata e primeira pagina de cartas do baralho gerenciado', async () => {
    const { client, management } = createSubject()
    client.deckMetadata.mockResolvedValueOnce(deck(7, 'Neuro'))
    client.deckCards.mockResolvedValueOnce(page([
      card(1, 'Frente A', 'Verso A'),
      card(2, 'Frente B', 'Verso B')
    ], 0, 5))

    await management.loadManagedDeckRoute(7)

    expect(client.deckMetadata).toHaveBeenCalledWith(7)
    expect(client.deckCards).toHaveBeenCalledWith(7, 0, 2, '')
    expect(management.managedDeck.value?.title).toBe('Neuro')
    expect(management.managedCards.value.map((loadedCard) => loadedCard.id)).toEqual([1, 2])
    expect(management.selectedManagedCardId.value).toBe(1)
  })

  it('mescla paginas de cartas e remove selecoes que sairam do conjunto carregado', async () => {
    const { client, management } = createSubject()
    management.setManagedDeck(deck(7, 'Deck'))
    client.deckCards
      .mockResolvedValueOnce(page([
        card(1, 'A', ''),
        card(2, 'B', '')
      ], 0, 3))
      .mockResolvedValueOnce(page([
        card(2, 'B atualizado', ''),
        card(3, 'C', '')
      ], 1, 3, true))

    await management.loadManagedCards(true)
    management.toggleManagedCardSelection(1)
    management.toggleManagedCardSelection(99)
    await management.loadManagedCards()

    expect(management.managedCards.value.map(({ id, frontHtml }) => [id, frontHtml])).toEqual([
      [1, 'A'],
      [2, 'B atualizado'],
      [3, 'C']
    ])
    expect([...management.selectedManagedCardIds.value]).toEqual([1])
  })

  it('respeita confirmacao antes de descartar alteracoes do baralho', async () => {
    const confirm = vi.fn(() => false)
    const { management, navigateToMyDecks } = createSubject({ confirm })
    management.setManagedDeck(deck(7, 'Original'))
    management.updateManagedDeckForm({
      title: 'Alterado',
      description: '',
      visibility: 'PRIVATE'
    })

    await expect(management.closeManagedDeck()).resolves.toBe(false)
    expect(management.managedDeck.value?.id).toBe(7)
    expect(navigateToMyDecks).not.toHaveBeenCalled()

    confirm.mockReturnValueOnce(true)

    await expect(management.closeManagedDeck()).resolves.toBe(true)
    expect(management.managedDeck.value).toBeNull()
    expect(navigateToMyDecks).toHaveBeenCalled()
  })

  it('salva metadata do deck e recarrega meus baralhos', async () => {
    const { client, loadMyDecks, management, showNotice } = createSubject()
    management.setManagedDeck(deck(7, 'Original', { visibility: 'PRIVATE' }))
    management.updateManagedDeckForm({
      title: 'Atualizado',
      description: 'Descricao',
      visibility: 'PUBLIC'
    })
    client.updateDeck.mockResolvedValueOnce(deck(7, 'Atualizado', {
      description: 'Descricao',
      visibility: 'PUBLIC'
    }))

    await management.saveManagedDeck()

    expect(client.updateDeck).toHaveBeenCalledWith(7, 'Atualizado', 'Descricao', 'PUBLIC')
    expect(loadMyDecks).toHaveBeenCalledWith(true)
    expect(showNotice).toHaveBeenCalledWith('Baralho atualizado.')
    expect(management.managedDeckDirty.value).toBe(false)
  })

  it('valida titulo antes de salvar metadata do deck', async () => {
    const { client, management, showError } = createSubject()
    management.setManagedDeck(deck(7, 'Original'))
    management.updateManagedDeckForm({
      title: '   ',
      description: '',
      visibility: 'PRIVATE'
    })

    await management.saveManagedDeck()

    expect(client.updateDeck).not.toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith('Informe o titulo do baralho.')
  })

  it('cria carta pelo editor, separa tags e recarrega cartas e decks', async () => {
    const { client, loadMyDecks, management, showNotice } = createSubject()
    management.setManagedDeck(deck(7, 'Deck'))
    client.createCard.mockResolvedValueOnce(card(10, 'Frente', 'Verso', ['bio', 'neuro']))
    client.deckCards.mockResolvedValueOnce(page([
      card(10, 'Frente', 'Verso', ['bio', 'neuro'])
    ], 0, 1, true))

    management.openCreateCardEditor()
    management.cardEditorForm.value = {
      frontHtml: 'Frente',
      backHtml: 'Verso',
      tags: ' bio, , neuro '
    }
    await management.saveCardEditor()

    expect(client.createCard).toHaveBeenCalledWith(7, 'Frente', 'Verso', ['bio', 'neuro'])
    expect(client.deckCards).toHaveBeenCalledWith(7, 0, 2, '')
    expect(loadMyDecks).toHaveBeenCalledWith(true)
    expect(management.cardEditorOpen.value).toBe(false)
    expect(management.selectedManagedCardId.value).toBe(10)
    expect(showNotice).toHaveBeenCalledWith('Carta adicionada.')
  })

  it('exclui cartas selecionadas preservando paginacao e limpando selecao', async () => {
    const { client, loadMyDecks, management, showNotice } = createSubject()
    management.setManagedDeck(deck(7, 'Deck'))
    client.deckCards
      .mockResolvedValueOnce(page([
        card(1, 'A', ''),
        card(2, 'B', '')
      ], 0, 2, true))
      .mockResolvedValueOnce(page([], 0, 0, true))

    await management.loadManagedCards(true)
    management.toggleVisibleManagedCardsSelection()
    await management.deleteSelectedManagedCards()

    expect(client.deleteCards).toHaveBeenCalledWith(7, [1, 2])
    expect(client.deckCards).toHaveBeenLastCalledWith(7, 0, 2, '')
    expect(loadMyDecks).toHaveBeenCalledWith(true)
    expect(management.selectedManagedCardIds.value.size).toBe(0)
    expect(management.selectedManagedCardId.value).toBeNull()
    expect(showNotice).toHaveBeenCalledWith('Cartas selecionadas excluidas.')
  })

  it('debounceia busca de cartas gerenciadas preservando loading invisivel', async () => {
    vi.useFakeTimers()
    const { client, management, withFeedback } = createSubject()
    management.setManagedDeck(deck(7, 'Deck'))
    client.deckCards.mockResolvedValueOnce(page([
      card(10, 'Frente', 'Verso')
    ], 0, 1, true))

    management.managedCardsSearch.value = 'bio'
    await nextTick()
    await vi.advanceTimersByTimeAsync(299)
    expect(client.deckCards).not.toHaveBeenCalled()

    management.managedCardsSearch.value = 'biologia'
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)

    expect(withFeedback).toHaveBeenCalledWith(expect.any(Function), { showLoading: false })
    expect(client.deckCards).toHaveBeenCalledWith(7, 0, 2, 'biologia')
  })

  it('gera snippets de midia para o editor de cartas', async () => {
    const { client, management, showNotice } = createSubject()
    management.setManagedDeck(deck(7, 'Deck'))
    client.uploadMedia.mockResolvedValueOnce({
      fileName: 'imagem.png',
      contentType: 'image/png'
    })

    await expect(management.uploadCardEditorMedia({} as File, 'image')).resolves.toBe('<img src="imagem.png" alt="">')
    expect(client.uploadMedia).toHaveBeenCalledWith(7, {})
    expect(showNotice).toHaveBeenCalledWith('Imagem inserida na carta.')
  })
})

function createSubject(options: {
  confirm?: (message: string) => boolean
} = {}) {
  const client = createClient()
  const showNotice = vi.fn()
  const showError = vi.fn()
  const loadMyDecks = vi.fn(async () => undefined)
  const refreshStats = vi.fn(async () => undefined)
  const navigateToMyDecks = vi.fn(async () => undefined)
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  const management = useDeckManagement({
    pageSize: 2,
    client,
    showNotice,
    showError,
    withFeedback,
    loadMyDecks,
    refreshStats,
    navigateToMyDecks,
    confirm: options.confirm ?? (() => true)
  })

  return {
    client,
    showNotice,
    showError,
    loadMyDecks,
    refreshStats,
    navigateToMyDecks,
    withFeedback,
    management
  }
}

function createClient() {
  return {
    deckMetadata: vi.fn(async (deckId: number) => deck(deckId, 'Deck')),
    deckCards: vi.fn(async () => page<CardResponse>([], 0, 0, true)),
    updateDeck: vi.fn(async (deckId: number, title: string, description: string, visibility: DeckSummary['visibility']) => (
      deck(deckId, title, { description, visibility })
    )),
    deleteDeck: vi.fn(async () => undefined),
    createCard: vi.fn(async (_deckId: number, frontHtml: string, backHtml: string, tags: string[]) => (
      card(1, frontHtml, backHtml, tags)
    )),
    updateCard: vi.fn(async (_deckId: number, cardId: number, frontHtml: string, backHtml: string, tags: string[]) => (
      card(cardId, frontHtml, backHtml, tags)
    )),
    deleteCard: vi.fn(async () => undefined),
    deleteCards: vi.fn(async () => undefined),
    uploadMedia: vi.fn(async () => ({
      fileName: 'arquivo.png',
      contentType: 'image/png'
    }))
  } satisfies DeckManagementApi
}

function deck(id: number, title: string, overrides: Partial<DeckSummary> = {}): DeckSummary {
  return {
    id,
    title,
    description: '',
    visibility: 'PRIVATE',
    sourceFormat: 'MANUAL',
    cardCount: 2,
    dueCount: 0,
    nextDueAt: null,
    ownerName: 'Ada',
    updatedAt: '2026-06-02T00:00:00Z',
    ...overrides
  }
}

function card(id: number, frontHtml: string, backHtml: string, tags: string[] = []): CardResponse {
  return {
    id,
    deckId: 7,
    frontHtml,
    backHtml,
    tags
  }
}

function page<T>(content: T[], pageNumber: number, totalElements: number, last = false): PageResponse<T> {
  return {
    content,
    page: pageNumber,
    size: 2,
    totalElements,
    totalPages: last ? pageNumber + 1 : pageNumber + 2,
    first: pageNumber === 0,
    last
  }
}
