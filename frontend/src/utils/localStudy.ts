import type { ApkgPreviewResponse, DeckDetail, LocalDeck, LocalReviewState, StudyCard } from '../types/api'
import { isDue } from './srs'

const DECKS_KEY = 'learningframe.localDecks'
const STATES_KEY = 'learningframe.localStates'
const LOCAL_IMPORT_SEEDS: LocalDeck[] = [
  {
    id: 'seed-local:biologia-celular',
    title: 'Biologia celular: rascunho local',
    description: 'Exemplo de importacao local para revisar e salvar em Meus baralhos.',
    source: 'APKG',
    cards: [
      {
        clientId: 'seed-local:biologia-celular:card:1',
        deckId: 'seed-local:biologia-celular',
        deckTitle: 'Biologia celular: rascunho local',
        frontHtml: '<p>Qual organela e responsavel pela producao de ATP?</p>',
        backHtml: '<p>Mitocondria.</p>',
        tags: ['biologia', 'celula']
      },
      {
        clientId: 'seed-local:biologia-celular:card:2',
        deckId: 'seed-local:biologia-celular',
        deckTitle: 'Biologia celular: rascunho local',
        frontHtml: '<p>Qual estrutura controla a entrada e saida de substancias da celula?</p>',
        backHtml: '<p>A membrana plasmatica.</p>',
        tags: ['biologia', 'membrana']
      }
    ]
  },
  {
    id: 'seed-local:anatomia-comparada',
    title: 'Anatomia comparada: rascunho local',
    description: 'Cartas locais de exemplo para ajustar frente, verso e tags antes de salvar.',
    source: 'APKG',
    cards: [
      {
        clientId: 'seed-local:anatomia-comparada:card:1',
        deckId: 'seed-local:anatomia-comparada',
        deckTitle: 'Anatomia comparada: rascunho local',
        frontHtml: '<p>Qual grupo possui coracao com quatro camaras?</p>',
        backHtml: '<p>Aves e mamiferos.</p>',
        tags: ['anatomia', 'comparada']
      },
      {
        clientId: 'seed-local:anatomia-comparada:card:2',
        deckId: 'seed-local:anatomia-comparada',
        deckTitle: 'Anatomia comparada: rascunho local',
        frontHtml: '<p>Qual e a principal funcao das branquias?</p>',
        backHtml: '<p>Realizar trocas gasosas em ambiente aquatico.</p>',
        tags: ['anatomia', 'respiracao']
      }
    ]
  }
]

export function loadLocalDecks(): LocalDeck[] {
  const raw = localStorage.getItem(DECKS_KEY)
  if (raw === null) {
    return LOCAL_IMPORT_SEEDS
  }
  const storedDecks = readJson<LocalDeck[]>(DECKS_KEY, [])
  const importDrafts = storedDecks.filter((deck) => deck.source === 'APKG')
  if (importDrafts.length > 0 || storedDecks.length === 0) {
    return importDrafts
  }
  return LOCAL_IMPORT_SEEDS
}

export function saveLocalDecks(decks: LocalDeck[]) {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks))
}

export function loadLocalStates(): Record<string, LocalReviewState> {
  return readJson<Record<string, LocalReviewState>>(STATES_KEY, {})
}

export function saveLocalStates(states: Record<string, LocalReviewState>) {
  localStorage.setItem(STATES_KEY, JSON.stringify(states))
}

export function deckDetailToLocal(deck: DeckDetail): LocalDeck {
  return {
    id: `public:${deck.id}`,
    title: deck.title,
    description: deck.description ?? '',
    source: 'PUBLIC',
    cards: deck.cards.map((card) => ({
      clientId: `public:${card.id}`,
      deckId: `public:${deck.id}`,
      deckTitle: deck.title,
      frontHtml: card.frontHtml,
      backHtml: card.backHtml,
      tags: card.tags,
      sourceCardId: card.id
    }))
  }
}

export function apkgPreviewToLocal(preview: ApkgPreviewResponse, sourceFileName?: string): LocalDeck {
  const deckId = `apkg:${crypto.randomUUID()}`
  return {
    id: deckId,
    title: preview.title,
    description: preview.mediaFound > 0
      ? `${preview.cardsReady} cartas importadas localmente. Contem ${preview.mediaFound} midias.`
      : `${preview.cardsReady} cartas importadas localmente.`,
    source: 'APKG',
    sourceFileName,
    mediaFound: preview.mediaFound,
    requiresBackendImport: preview.mediaFound > 0,
    importedAt: new Date().toISOString(),
    cards: preview.cards.map((card, index) => ({
      clientId: `${deckId}:card:${index}`,
      deckId,
      deckTitle: preview.title,
      frontHtml: card.frontHtml,
      backHtml: card.backHtml,
      tags: card.tags
    }))
  }
}

export function localDeckToStudyCards(deck: LocalDeck, states: Record<string, LocalReviewState>): StudyCard[] {
  return deck.cards
    .filter((card) => isDue(states[card.clientId]))
    .map((card) => {
      const state = states[card.clientId]
      return {
        clientId: card.clientId,
        deckId: card.deckId,
        deckTitle: card.deckTitle,
        frontHtml: card.frontHtml,
        backHtml: card.backHtml,
        tags: card.tags,
        dueAt: state?.dueAt ?? new Date().toISOString(),
        intervalDays: state?.intervalDays ?? 0,
        repetitions: state?.repetitions ?? 0,
        easeFactor: state?.easeFactor ?? 2.5,
        newCard: !state,
        local: true
      }
    })
}

export function mixedLocalStudyCards(decks: LocalDeck[], states: Record<string, LocalReviewState>, limit = 24): StudyCard[] {
  const groups = decks.map((deck) => localDeckToStudyCards(deck, states))
  const mixed: StudyCard[] = []
  let added = true
  while (added && mixed.length < limit) {
    added = false
    for (const group of groups) {
      const next = group.shift()
      if (next) {
        mixed.push(next)
        added = true
      }
      if (mixed.length >= limit) {
        break
      }
    }
  }
  return mixed
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}
