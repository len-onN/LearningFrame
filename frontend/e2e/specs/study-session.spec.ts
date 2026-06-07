import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

test('estudo autenticado registra progresso', async ({ page, seed }) => {
  await page.goto('/entrar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/estudo/baralho/${seed.decks.privateProgramming.id}`)

  await expect(page.getByText('E2E Vue Router')).toBeVisible()
  await page.getByRole('button', { name: /Revelar resposta/ }).click()
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/study/reviews')
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: 'Bom' }).click()
  ])

  await page.goto('/progresso')
  const reviewsToday = page.locator('.metric').filter({ hasText: 'Revisados hoje' })
  await expect(reviewsToday.getByText('1')).toBeVisible()
})
