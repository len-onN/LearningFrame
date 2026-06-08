import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

test('cria baralho e navega para gerenciamento', async ({ page, seed }) => {
  await page.goto('/criar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)

  await expect(page).toHaveURL(/\/criar/)
  await page.getByLabel('Titulo do baralho').fill('E2E Baralho Criado Pela UI')
  await page.getByLabel('Descricao do baralho').fill('Criado pela suite Playwright.')
  await page.getByLabel('Visibilidade do baralho').selectOption('PRIVATE')
  await page.getByRole('button', { name: /Criar baralho/ }).click()

  await expect(page).toHaveURL(/\/biblioteca\/meus\/\d+\/gerenciar/)
  await expect(page.getByRole('heading', { name: 'Dados do baralho' })).toBeVisible()
  await expect(page.getByLabel('Titulo')).toHaveValue('E2E Baralho Criado Pela UI')
})

test('cria edita e exclui carta basica no gerenciamento', async ({ page, seed }) => {
  await page.goto('/entrar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`)

  await page.getByRole('button', { name: /Nova carta/ }).first().click()
  await expect(page.getByLabel('Editor de carta')).toBeVisible()
  await page.getByLabel('Frente da carta').fill('E2E Frente nova carta')
  await page.getByLabel('Verso da carta').fill('E2E Verso nova carta')
  await page.getByLabel('Tags da carta').fill('e2e, nova')
  await expect(page.getByText('E2E Frente nova carta')).toBeVisible()
  await page.getByRole('button', { name: /Salvar carta/ }).click()

  await expect(page.getByLabel('Editor de carta')).not.toBeVisible()
  await expect(page.getByRole('button', { name: /E2E Frente nova carta/ })).toBeVisible()

  await page.getByRole('button', { name: /E2E Frente nova carta/ }).click()
  await page.getByRole('button', { name: 'Editar carta' }).click()
  await page.getByLabel('Frente da carta').fill('E2E Frente editada')
  await page.getByLabel('Verso da carta').fill('E2E Verso editado')
  await page.getByLabel('Tags da carta').fill('e2e, editada')
  await page.getByRole('button', { name: /Salvar carta/ }).click()

  await expect(page.getByRole('button', { name: /E2E Frente editada/ })).toBeVisible()
  await page.getByRole('button', { name: /E2E Frente editada/ }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Excluir carta' }).click()

  await expect(page.getByRole('button', { name: /E2E Frente editada/ })).not.toBeVisible()
})
