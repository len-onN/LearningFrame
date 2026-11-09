import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

async function login(page: Parameters<typeof loginViaUi>[0], email: string, password: string) {
  await page.goto('/entrar')
  await loginViaUi(page, email, password)
}

test('edicao de metadata do baralho persiste ao reabrir gerenciamento', async ({ page, seed }) => {
  const deckId = seed.decks.privateAnatomy.id
  const updatedTitle = 'E2E Anatomia Metadata Editada'
  const updatedDescription = 'Descricao atualizada pela suite E2E de risco.'

  await login(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/biblioteca/meus/${deckId}/gerenciar`)

  await expect(page.getByRole('heading', { name: 'Deck details' })).toBeVisible()
  await page.getByLabel('Title').fill(updatedTitle)
  await page.getByLabel('Description').fill(updatedDescription)
  await page.getByLabel('Visibility').selectOption('PUBLIC')

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/decks/${deckId}`)
      && response.request().method() === 'PUT'
      && response.ok()
    ),
    page.getByRole('button', { name: 'Save' }).click()
  ])
  await expect(page.getByText('Deck updated.')).toBeVisible()

  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByText(updatedTitle)).toBeVisible()

  await page.goto(`/biblioteca/meus/${deckId}/gerenciar`)
  await expect(page.getByLabel('Title')).toHaveValue(updatedTitle)
  await expect(page.getByLabel('Description')).toHaveValue(updatedDescription)
  await expect(page.getByLabel('Visibility')).toHaveValue('PUBLIC')
})

test('selecao e exclusao em lote de cartas limpam lista e estado ativo', async ({ page, seed }) => {
  const deckId = seed.decks.privateAnatomy.id

  await login(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/biblioteca/meus/${deckId}/gerenciar`)

  await expect(page.getByRole('button', { name: /E2E nervo femoral/ })).toBeVisible()
  await page.getByRole('button', { name: 'Select page' }).click()
  await expect(page.getByRole('button', { name: /^Delete 3$/ })).toBeEnabled()

  page.once('dialog', (dialog) => dialog.accept())
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/decks/${deckId}/cards/bulk-delete`)
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: /^Delete 3$/ }).click()
  ])

  await expect(page.getByText('Selected cards deleted.')).toBeVisible()
  await expect(page.getByRole('button', { name: /E2E nervo femoral/ })).not.toBeVisible()
  await expect(page.getByRole('button', { name: /E2E musculo sartorio/ })).not.toBeVisible()
  await expect(page.getByRole('button', { name: /E2E patela/ })).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'No cards yet' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Delete$/ })).toBeDisabled()
})

test('selecao e exclusao em lote de baralhos limpam selecao e lista propria', async ({ page, seed }) => {
  await login(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto('/biblioteca/meus')

  await expect(page.getByText(seed.decks.privateAnatomy.title)).toBeVisible()
  await expect(page.getByText(seed.decks.privateProgramming.title)).toBeVisible()

  await page.getByRole('button', { name: 'Select' }).click()
  await page.getByRole('button', { name: 'Select visible' }).click()
  await expect(page.getByText('2 selected')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/decks/bulk-delete')
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: /^Delete$/ }).click()
  ])

  await expect(page.getByText('Selected decks deleted.')).toBeVisible()
  await expect(page.getByText(seed.decks.privateAnatomy.title)).not.toBeVisible()
  await expect(page.getByText(seed.decks.privateProgramming.title)).not.toBeVisible()
  await expect(page.getByText('No decks found.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Select' })).toBeVisible()
  await expect(page.getByText('2 selected')).not.toBeVisible()
})
