import type { ApkgPreviewResponse, DeckDetail, LocalDeck, LocalReviewState, StudyCard } from '../types/api'
import { isDue } from './srs'

const DECKS_KEY = 'learningframe.localDecks'
const STATES_KEY = 'learningframe.localStates'

export function loadLocalDecks(): LocalDeck[] {
  return readJson<LocalDeck[]>(DECKS_KEY, [])
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

export function apkgPreviewToLocal(preview: ApkgPreviewResponse): LocalDeck {
  const deckId = `apkg:${crypto.randomUUID()}`
  return {
    id: deckId,
    title: preview.title,
    description: `${preview.cardsReady} cards importados localmente.`,
    source: 'APKG',
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
