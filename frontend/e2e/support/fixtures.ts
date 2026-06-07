import { test as base, expect } from '@playwright/test'
import { resetE2eData, type E2eSeedResponse } from './api'

export const test = base.extend<{ seed: E2eSeedResponse }>({
  seed: async ({ request }, use) => {
    const seed = await resetE2eData(request)
    await use(seed)
  }
})

export { expect }
