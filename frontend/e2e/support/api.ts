import type { APIRequestContext } from '@playwright/test'

export interface E2eSeedResponse {
  users: Record<string, E2eUserSeed>
  decks: Record<string, E2eDeckSeed>
}

export interface E2eUserSeed {
  id: number
  displayName: string
  email: string
  password: string
}

export interface E2eDeckSeed {
  id: number
  title: string
  cards: E2eCardSeed[]
}

export interface E2eCardSeed {
  id: number
  frontHtml: string
  backHtml: string
}

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:18081'
const resetToken = process.env.E2E_RESET_TOKEN ?? 'learningframe-e2e-reset-token'

export async function resetE2eData(request: APIRequestContext) {
  const response = await request.post(`${apiBaseUrl}/api/e2e/reset`, {
    headers: {
      'X-E2E-Token': resetToken
    }
  })

  if (!response.ok()) {
    throw new Error(`Reset e2e falhou: ${response.status()} ${await response.text()}`)
  }

  return response.json() as Promise<E2eSeedResponse>
}
