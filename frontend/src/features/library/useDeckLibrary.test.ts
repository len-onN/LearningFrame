import { effectScope, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DeckSummary, PageResponse, UserResponse } from '../../types/api'
import { deckPageCountLabel, mergeDeckPages, normalizeSearch, useDeckLibrary } from './useDeckLibrary'
import { useAuthSession } from '../../composables/useAuthSession'

vi.mock('../../composables/useAuthSession', () => ({
  useAuthSession: vi.fn()
}))

const publicDeck = deck(1, 'Publico')
const myDeck = deck(2, 'Meu')

describe('useDeckLibrary', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

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
    vi.mocked(useAuthSession).mockReturnValue({ user: ref(null) } as any)
    const library = useDeckLibrary({
      librarySection: ref('public'),
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
    vi.mocked(useAuthSession).mockReturnValue({ user: ref(null) } as any)
    const library = useDeckLibrary({
      librarySection: ref('mine'),
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
    vi.mocked(useAuthSession).mockReturnValue({ user } as any)
    const library = useDeckLibrary({ librarySection, client })

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

  it('alterna selecao individual de meus baralhos', async () => {
    const client = {
      publicDecks: vi.fn(async () => page([], 0, 0, true)),
      myDecks: vi.fn(async () => page([myDeck], 0, 1, true))
    }
    vi.mocked(useAuthSession).mockReturnValue({ user: ref({ id: 1, displayName: 'Ada', email: 'ada@example.com' }) } as any)
    const library = useDeckLibrary({
      librarySection: ref('mine'),
      client
    })

    await library.loadMyDecks(true)
    library.toggleMyDeckSelection(2)

    expect(library.deckSelectionMode.value).toBe(true)
    expect(library.selectedMyDeckIds.value.has(2)).toBe(true)
    expect(library.selectedMyDecksCount.value).toBe(1)

    library.toggleMyDeckSelection(2)

    expect(library.selectedMyDeckIds.value.has(2)).toBe(false)
    expect(library.selectedMyDecksCount.value).toBe(0)
  })

  it('seleciona e desmarca todos os baralhos visiveis', async () => {
    const decks = [deck(2, 'A'), deck(3, 'B')]
    const client = {
      publicDecks: vi.fn(async () => page([], 0, 0, true)),
      myDecks: vi.fn(async () => page(decks, 0, 2, true))
    }
    vi.mocked(useAuthSession).mockReturnValue({ user: ref({ id: 1, displayName: 'Ada', email: 'ada@example.com' }) } as any)
    const library = useDeckLibrary({
      librarySection: ref('mine'),
      client
    })

    await library.loadMyDecks(true)
    library.toggleVisibleMyDeckSelection()

    expect(library.allVisibleMyDecksSelected.value).toBe(true)
    expect([...library.selectedMyDeckIds.value]).toEqual([2, 3])

    library.toggleVisibleMyDeckSelection()

    expect(library.allVisibleMyDecksSelected.value).toBe(false)
    expect(library.selectedMyDecksCount.value).toBe(0)
  })

  it('remove selecoes que nao estao mais carregadas ao recarregar meus baralhos', async () => {
    const firstPage = page([deck(2, 'A'), deck(3, 'B')], 0, 2, true)
    const secondPage = page([deck(3, 'B')], 0, 1, true)
    const client = {
      publicDecks: vi.fn(async () => page([], 0, 0, true)),
      myDecks: vi.fn()
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage)
    }
    vi.mocked(useAuthSession).mockReturnValue({ user: ref({ id: 1, displayName: 'Ada', email: 'ada@example.com' }) } as any)
    const library = useDeckLibrary({
      librarySection: ref('mine'),
      client
    })

    await library.loadMyDecks(true)
    library.toggleVisibleMyDeckSelection()
    await library.loadMyDecks(true)

    expect([...library.selectedMyDeckIds.value]).toEqual([3])
  })

  it('destaca deck no proximo frame e limpa apos a duracao visual', async () => {
    vi.useFakeTimers()
    const browser = installHighlightBrowserStubs()
    vi.mocked(useAuthSession).mockReturnValue({ user: ref({ id: 1, displayName: 'Ada', email: 'ada@example.com' }) } as any)
    const library = useDeckLibrary({
      librarySection: ref('mine'),
      client: emptyClient()
    })

    await library.highlightDeck(2)

    expect(browser.scrollIntoView).toHaveBeenCalled()
    expect(library.highlightedDeckId.value).toBeNull()

    await vi.advanceTimersByTimeAsync(16)
    expect(library.highlightedDeckId.value).toBe(2)

    await vi.advanceTimersByTimeAsync(9999)
    expect(library.highlightedDeckId.value).toBe(2)

    await vi.advanceTimersByTimeAsync(1)
    expect(library.highlightedDeckId.value).toBeNull()
  })

  it('cancela frame pendente ao descartar o escopo do highlight', async () => {
    vi.useFakeTimers()
    const browser = installHighlightBrowserStubs()
    const scope = effectScope()
    vi.mocked(useAuthSession).mockReturnValue({ user: ref({ id: 1, displayName: 'Ada', email: 'ada@example.com' }) } as any)
    const library = scope.run(() => useDeckLibrary({
      librarySection: ref('mine'),
      client: emptyClient()
    }))

    if (!library) {
      throw new Error('Escopo de teste nao iniciado.')
    }

    await library.highlightDeck(2)
    scope.stop()
    await vi.advanceTimersByTimeAsync(16)

    expect(browser.cancelAnimationFrame).toHaveBeenCalled()
    expect(library.highlightedDeckId.value).toBeNull()
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

function emptyClient() {
  return {
    publicDecks: vi.fn(async () => page<DeckSummary>([], 0, 0, true)),
    myDecks: vi.fn(async () => page<DeckSummary>([], 0, 0, true))
  }
}

function installHighlightBrowserStubs() {
  const scrollIntoView = vi.fn()
  const rafTimers = new Map<number, ReturnType<typeof setTimeout>>()
  let nextFrame = 1
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const frameId = nextFrame++
    const timer = setTimeout(() => {
      rafTimers.delete(frameId)
      callback(0)
    }, 16)
    rafTimers.set(frameId, timer)
    return frameId
  })
  const cancelAnimationFrame = vi.fn((frameId: number) => {
    const timer = rafTimers.get(frameId)
    if (timer !== undefined) {
      clearTimeout(timer)
      rafTimers.delete(frameId)
    }
  })

  vi.stubGlobal('document', {
    querySelector: vi.fn(() => ({ scrollIntoView }))
  })
  vi.stubGlobal('window', {
    setTimeout,
    clearTimeout,
    requestAnimationFrame,
    cancelAnimationFrame
  })

  return {
    scrollIntoView,
    requestAnimationFrame,
    cancelAnimationFrame
  }
}
