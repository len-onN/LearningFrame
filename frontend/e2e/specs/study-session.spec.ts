import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

test('estudo autenticado registra progresso', async ({ page, seed }) => {
  await page.goto('/entrar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/estudo/baralho/${seed.decks.privateProgramming.id}`)

  await expect(page.getByRole('heading', { name: '0 of 2 reviewed' })).toBeVisible()
  await expect(page.getByText('E2E Vue Router')).toBeVisible()
  await page.getByRole('button', { name: /Reveal answer/i }).click()
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/study/reviews')
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: 'Good' }).click()
  ])
  await expect(page.getByText(/Good recorded/)).toBeVisible()
  await expect(page.getByRole('heading', { name: '1 of 2 reviewed' })).toBeVisible()

  await expect(page.getByText('E2E composable')).toBeVisible()
  await page.getByRole('button', { name: /Reveal answer/i }).click()
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/study/reviews')
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: 'Hard' }).click()
  ])

  await expect(page.getByRole('heading', { name: 'Session completed' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '2 cards reviewed' })).toBeVisible()
  await expect(page.getByText(/Last review: Hard/)).toBeVisible()

  await page.goto('/progresso')
  const reviewsToday = page.locator('.metric').filter({ hasText: 'Reviewed today' })
  await expect(reviewsToday.getByText('2')).toBeVisible()
})
