import { test, expect } from '../support/fixtures'

test('smoke da biblioteca publica carrega sem login', async ({ page, seed }) => {
  await page.goto('/biblioteca/publicos')

  await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible()
  await expect(page.getByText(seed.decks.publicBasic.title)).toBeVisible()
  await expect(page.locator(`[data-deck-id="${seed.decks.publicBasic.id}"]`).getByRole('button', { name: /Estudar/ })).toBeVisible()

  await expect.poll(() => page.evaluate(() => localStorage.getItem('learningframe.token'))).toBeNull()
})

test('estudo anonimo basico avalia carta publica localmente', async ({ page, seed }) => {
  await page.goto('/biblioteca/publicos')
  await page.locator(`[data-deck-id="${seed.decks.publicBasic.id}"]`).getByRole('button', { name: /Estudar/ }).click()

  await expect(page).toHaveURL(new RegExp(`/estudo/baralho/${seed.decks.publicBasic.id}`))
  await expect(page.getByRole('heading', { name: '0 de 3 revisadas' })).toBeVisible()
  await expect(page.getByText('E2E recordacao ativa')).toBeVisible()
  await page.getByRole('button', { name: /Revelar resposta/ }).click()
  await expect(page.getByText('Recuperar antes de consultar.')).toBeVisible()
  await page.getByRole('button', { name: 'Bom' }).click()

  await expect(page.getByText(/Bom registrado/)).toBeVisible()
  await expect(page.getByRole('heading', { name: '1 de 3 revisadas' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('learningframe.localStates'))).not.toBeNull()
})
