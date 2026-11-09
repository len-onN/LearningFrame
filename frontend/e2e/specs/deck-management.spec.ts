import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

test('cria baralho e navega para gerenciamento', async ({ page, seed }) => {
  await page.goto('/criar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)

  await expect(page).toHaveURL(/\/criar/)
  await page.getByLabel('Deck title').fill('E2E Baralho Criado Pela UI')
  await page.getByLabel('Deck description').fill('Criado pela suite Playwright.')
  await page.getByLabel('Deck visibility').selectOption('PRIVATE')
  await page.getByRole('button', { name: /Create deck/i }).click()

  await expect(page).toHaveURL(/\/biblioteca\/meus\/\d+\/gerenciar/)
  await expect(page.getByRole('heading', { name: 'Deck details' })).toBeVisible()
  await expect(page.getByLabel('Title')).toHaveValue('E2E Baralho Criado Pela UI')
})

test('cria edita e exclui carta basica no gerenciamento', async ({ page, seed }) => {
  await page.goto('/entrar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`)

  await page.getByRole('button', { name: /New card/i }).first().click()
  await expect(page.getByLabel('Card editor')).toBeVisible()
  await page.getByLabel('Card front').fill('E2E Frente nova carta')
  await page.getByLabel('Card back').fill('E2E Verso nova carta')
  await page.getByLabel('Card tags').fill('e2e, nova')
  await expect(page.getByText('E2E Frente nova carta')).toBeVisible()
  await page.getByRole('button', { name: /Save card/i }).click()

  await expect(page.getByLabel('Card editor')).not.toBeVisible()
  await expect(page.getByRole('button', { name: /E2E Frente nova carta/ })).toBeVisible()

  await page.getByRole('button', { name: /E2E Frente nova carta/ }).click()
  await page.getByRole('button', { name: 'Edit card' }).click()
  await page.getByLabel('Card front').fill('E2E Frente editada')
  await page.getByLabel('Card back').fill('E2E Verso editado')
  await page.getByLabel('Card tags').fill('e2e, editada')
  await page.getByRole('button', { name: /Save card/i }).click()

  await expect(page.getByRole('button', { name: /E2E Frente editada/ })).toBeVisible()
  await page.getByRole('button', { name: /E2E Frente editada/ }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete card' }).click()

  await expect(page.getByRole('button', { name: /E2E Frente editada/ })).not.toBeVisible()
})
