import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { DeckSummary, PageResponse, UserResponse } from '../../types/api'
import { deckPageCountLabel, mergeDeckPages, normalizeSearch, useDeckLibrary } from './useDeckLibrary'

const publicDeck = deck(1, 'Publico')
const myDeck = deck(2, 'Meu')

describe('useDeckLibrary', () => {
  it('mescla paginas sem duplicar decks pelo id', () => {
    expect(mergeDeckPages([
      deck(1, 'A'),
      deck(2, 'B')
    ], [
      deck(2, 'B atualizado'),
      deck(3, 'C')
    ])).toEqual([
      deck(1, 'A'),
      deck(2, 'B atualizado'),
      deck(3, 'C')
    ])
  })

  it('formata labels de pagina quando ha pagina carregada', () => {
    expect(deckPageCountLabel(8, page([], 0, 20))).toBe('8 de 20 baralhos')
    expect(deckPageCountLabel(4, page([], 0, 12), 'cartas')).toBe('4 de 12 cartas')
    expect(deckPageCountLabel(0, null)).toBe('')
  })

  it('normaliza busca removendo acentos e espacos externos', () => {
    expect(normalizeSearch('  Neuronios  ')).toBe('neuronios')
  })

  it('carrega baralhos publicos com query atual e pagina configurada', async () => {
    const client = {
      publicDecks: vi.fn(async () => page([publicDeck], 0, 1, true)),
      myDecks: vi.fn(async () => page([], 0, 0, true))
    }
    const library = useDeckLibrary({
      librarySection: ref('public'),
      user: ref(null),
      pageSize: 8,
      client
    })

    library.librarySearch.value = ' nervos '
    await library.loadPublicDecks(true)

    expect(client.publicDecks).toHaveBeenCalledWith(0, 8, 'nervos')
    expect(library.publicDecks.value).toEqual([publicDeck])
    expect(library.publicDeckQuery.value).toBe('nervos')
    expect(library.publicDecksHasMore.value).toBe(false)
  })

  it('nao carrega meus baralhos sem usuario autenticado', async () => {
    const client = {
      publicDecks: vi.fn(async () => page([], 0, 0, true)),
      myDecks: vi.fn(async () => page([myDeck], 0, 1, true))
    }
    const library = useDeckLibrary({
      librarySection: ref('mine'),
      user: ref(null),
      client
    })

    await library.loadMyDecks(true)

    expect(client.myDecks).not.toHaveBeenCalled()
    expect(library.myDecks.value).toEqual([])
  })

  it('exibe label ativo conforme secao, busca e usuario', async () => {
    const librarySection = ref<'public' | 'mine'>('public')
    const user = ref<UserResponse | null>(null)
    const client = {
      publicDecks: vi.fn(async () => page([publicDeck], 0, 3, false)),
      myDecks: vi.fn(async () => page([myDeck], 0, 2, false))
    }
    const library = useDeckLibrary({ librarySection, user, client })

    await library.loadPublicDecks(true)
    expect(library.activeLibraryCountLabel.value).toBe('1 de 3 baralhos')

    librarySection.value = 'mine'
    expect(library.activeLibraryCountLabel.value).toBe('')

    user.value = {
      id: 1,
      displayName: 'Ada',
      email: 'ada@example.com'
    }
    await library.loadMyDecks(true)
    expect(library.activeLibraryCountLabel.value).toBe('1 de 2 baralhos')
  })
})

function deck(id: number, title: string): DeckSummary {
  return {
    id,
    title,
    description: '',
    visibility: 'PUBLIC',
    sourceFormat: 'MANUAL',
    cardCount: 1,
    dueCount: 0,
    nextDueAt: null,
    ownerName: 'Ada',
    updatedAt: '2026-06-02T00:00:00Z'
  }
}

function page<T>(content: T[], pageNumber: number, totalElements: number, last = false): PageResponse<T> {
  return {
    content,
    page: pageNumber,
    size: 8,
    totalElements,
    totalPages: last ? pageNumber + 1 : pageNumber + 2,
    first: pageNumber === 0,
    last
  }
}
