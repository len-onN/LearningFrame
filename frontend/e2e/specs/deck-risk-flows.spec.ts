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

  await expect(page.getByRole('heading', { name: 'Dados do baralho' })).toBeVisible()
  await page.getByLabel('Titulo').fill(updatedTitle)
  await page.getByLabel('Descricao').fill(updatedDescription)
  await page.getByLabel('Visibilidade').selectOption('PUBLIC')

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/decks/${deckId}`)
      && response.request().method() === 'PUT'
      && response.ok()
    ),
    page.getByRole('button', { name: 'Salvar' }).click()
  ])
  await expect(page.getByText('Baralho atualizado.')).toBeVisible()

  await page.getByRole('button', { name: 'Voltar' }).click()
  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByText(updatedTitle)).toBeVisible()

  await page.goto(`/biblioteca/meus/${deckId}/gerenciar`)
  await expect(page.getByLabel('Titulo')).toHaveValue(updatedTitle)
  await expect(page.getByLabel('Descricao')).toHaveValue(updatedDescription)
  await expect(page.getByLabel('Visibilidade')).toHaveValue('PUBLIC')
})

test('selecao e exclusao em lote de cartas limpam lista e estado ativo', async ({ page, seed }) => {
  const deckId = seed.decks.privateAnatomy.id

  await login(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/biblioteca/meus/${deckId}/gerenciar`)

  await expect(page.getByRole('button', { name: /E2E nervo femoral/ })).toBeVisible()
  await page.getByRole('button', { name: 'Selecionar pagina' }).click()
  await expect(page.getByRole('button', { name: /^Excluir 3$/ })).toBeEnabled()

  page.once('dialog', (dialog) => dialog.accept())
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/decks/${deckId}/cards/bulk-delete`)
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: /^Excluir 3$/ }).click()
  ])

  await expect(page.getByText('Cartas selecionadas excluidas.')).toBeVisible()
  await expect(page.getByRole('button', { name: /E2E nervo femoral/ })).not.toBeVisible()
  await expect(page.getByRole('button', { name: /E2E musculo sartorio/ })).not.toBeVisible()
  await expect(page.getByRole('button', { name: /E2E patela/ })).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nenhuma carta ainda' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Excluir$/ })).toBeDisabled()
})

test('selecao e exclusao em lote de baralhos limpam selecao e lista propria', async ({ page, seed }) => {
  await login(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto('/biblioteca/meus')

  await expect(page.getByText(seed.decks.privateAnatomy.title)).toBeVisible()
  await expect(page.getByText(seed.decks.privateProgramming.title)).toBeVisible()

  await page.getByRole('button', { name: 'Selecionar' }).click()
  await page.getByRole('button', { name: 'Selecionar visiveis' }).click()
  await expect(page.getByText('2 selecionados')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/decks/bulk-delete')
      && response.request().method() === 'POST'
      && response.ok()
    ),
    page.getByRole('button', { name: /^Excluir$/ }).click()
  ])

  await expect(page.getByText('Baralhos selecionados excluidos.')).toBeVisible()
  await expect(page.getByText(seed.decks.privateAnatomy.title)).not.toBeVisible()
  await expect(page.getByText(seed.decks.privateProgramming.title)).not.toBeVisible()
  await expect(page.getByText('Nenhum baralho seu encontrado.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Selecionar' })).toBeVisible()
  await expect(page.getByText('2 selecionados')).not.toBeVisible()
})
