import type {
  ApkgImportResponse,
  ApkgPreviewResponse,
  AuthResponse,
  DeckDetail,
  DeckSummary,
  DeckVisibility,
  PageResponse,
  DueResponse,
  ReviewRating,
  ReviewResult,
  StatsSummary,
  StudyMode
} from '../types/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8081'

let authToken = readStoredToken()

export function setAuthToken(token: string) {
  authToken = token
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('learningframe.token', token)
  }
}

export function clearAuthToken() {
  authToken = ''
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('learningframe.token')
  }
}

export function getAuthToken() {
  return authToken
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Erro inesperado.' }))
    throw new Error(body.message ?? 'Erro inesperado.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  register(displayName: string, email: string, password: string) {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password })
    })
  },
  login(email: string, password: string) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },
  publicDecks(page = 0, size = 8, query = '') {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (query.trim()) {
      params.set('q', query.trim())
    }
    return request<PageResponse<DeckSummary>>(`/api/decks/public?${params.toString()}`)
  },
  myDecks(page = 0, size = 8, query = '') {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (query.trim()) {
      params.set('q', query.trim())
    }
    return request<PageResponse<DeckSummary>>(`/api/decks/mine?${params.toString()}`)
  },
  deck(deckId: number) {
    return request<DeckDetail>(`/api/decks/${deckId}`)
  },
  createDeck(title: string, description: string, visibility: DeckVisibility) {
    return request<DeckSummary>('/api/decks', {
      method: 'POST',
      body: JSON.stringify({ title, description, visibility })
    })
  },
  createCard(deckId: number, frontHtml: string, backHtml: string, tags: string[]) {
    return request(`/api/decks/${deckId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ frontHtml, backHtml, tags })
    })
  },
  due(mode: StudyMode, deckId?: number) {
    const params = new URLSearchParams({ mode, limit: '24' })
    if (deckId) {
      params.set('deckId', String(deckId))
    }
    return request<DueResponse>(`/api/study/due?${params.toString()}`)
  },
  review(cardId: number, rating: ReviewRating) {
    return request<ReviewResult>('/api/study/reviews', {
      method: 'POST',
      body: JSON.stringify({ cardId, rating })
    })
  },
  anonymousReview(intervalDays: number, repetitions: number, easeFactor: number, rating: ReviewRating) {
    return request<ReviewResult>('/api/study/anonymous/review', {
      method: 'POST',
      body: JSON.stringify({ intervalDays, repetitions, easeFactor, rating })
    })
  },
  stats() {
    return request<StatsSummary>('/api/stats/summary')
  },
  previewApkg(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request<ApkgPreviewResponse>('/api/import/apkg/preview', {
      method: 'POST',
      body: formData
    })
  },
  importApkg(file: File, title: string, visibility: DeckVisibility) {
    const formData = new FormData()
    formData.append('file', file)
    if (title) {
      formData.append('title', title)
    }
    formData.append('visibility', visibility)
    return request<ApkgImportResponse>('/api/decks/import/apkg', {
      method: 'POST',
      body: formData
    })
  }
}

function readStoredToken() {
  return typeof localStorage === 'undefined'
    ? ''
    : localStorage.getItem('learningframe.token') ?? ''
}
