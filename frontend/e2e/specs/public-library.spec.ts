import { test, expect } from '../support/fixtures'

test('smoke da biblioteca publica carrega sem login', async ({ page, seed }) => {
  await page.goto('/biblioteca/publicos')

  await expect(page.getByRole('heading', { name: /^(Biblioteca|Library)$/i })).toBeVisible()
  await expect(page.getByText(seed.decks.publicBasic.title)).toBeVisible()
  await expect(page.locator(`[data-deck-id="${seed.decks.publicBasic.id}"]`).getByRole('button', { name: /Study/i })).toBeVisible()

  await expect.poll(() => page.evaluate(() => localStorage.getItem('learningframe.token'))).toBeNull()
})

test('estudo anonimo basico avalia carta publica localmente', async ({ page, seed }) => {
  await page.goto('/biblioteca/publicos')
  await page.locator(`[data-deck-id="${seed.decks.publicBasic.id}"]`).getByRole('button', { name: /Study/i }).click()

  await expect(page).toHaveURL(new RegExp(`/estudo/baralho/${seed.decks.publicBasic.id}`))
  await expect(page.getByRole('heading', { name: '0 of 3 reviewed' })).toBeVisible()
  await expect(page.getByText('E2E recordacao ativa')).toBeVisible()
  await page.getByRole('button', { name: /Reveal answer/i }).click()
  await expect(page.getByText('Recuperar antes de consultar.')).toBeVisible()
  await page.getByRole('button', { name: 'Good' }).click()

  await expect(page.getByText(/Good recorded/)).toBeVisible()
  await expect(page.getByRole('heading', { name: '1 of 3 reviewed' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('learningframe.localStates'))).not.toBeNull()
})
