import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

async function login(page: Parameters<typeof loginViaUi>[0], email: string, password: string) {
  await page.goto('/entrar')
  await loginViaUi(page, email, password)
}

test('refresh direto em rotas principais renderiza estados finais', async ({ page, seed }) => {
  await page.goto('/biblioteca/publicos')
  await expect(page).toHaveURL(/\/biblioteca\/publicos/)
  await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible()
  await expect(page.getByText(seed.decks.publicBasic.title)).toBeVisible()

  await page.goto('/importar')
  await expect(page).toHaveURL(/\/importar/)
  await expect(page.getByRole('heading', { name: 'Importar APKG' })).toBeVisible()
  await expect(page.getByLabel('Arquivo APKG')).toBeAttached()

  await login(page, seed.users.primary.email, seed.users.primary.password)

  await page.goto('/biblioteca/meus')
  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible()
  await expect(page.getByText(seed.decks.privateAnatomy.title)).toBeVisible()

  await page.goto(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`)
  await expect(page).toHaveURL(new RegExp(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`))
  await expect(page.getByRole('heading', { name: 'Dados do baralho' })).toBeVisible()
  await expect(page.getByLabel('Titulo')).toHaveValue(seed.decks.privateAnatomy.title)
  await expect(page.getByRole('button', { name: /E2E nervo femoral/ })).toBeVisible()

  await page.goto(`/estudo/baralho/${seed.decks.privateProgramming.id}`)
  await expect(page).toHaveURL(new RegExp(`/estudo/baralho/${seed.decks.privateProgramming.id}`))
  await expect(page.getByText('E2E Vue Router')).toBeVisible()
  await expect(page.getByRole('button', { name: /Revelar resposta/ })).toBeVisible()
})

test('back e forward preservam telas principais sem estado incoerente', async ({ page, seed }) => {
  await login(page, seed.users.primary.email, seed.users.primary.password)

  await page.goto('/biblioteca/publicos')
  await expect(page.getByText(seed.decks.publicBasic.title)).toBeVisible()

  await page.getByRole('tab', { name: 'Meus baralhos' }).click()
  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByText(seed.decks.privateAnatomy.title)).toBeVisible()

  await page
    .locator(`[data-deck-id="${seed.decks.privateAnatomy.id}"]`)
    .getByRole('button', { name: 'Gerenciar' })
    .click()
  await expect(page).toHaveURL(new RegExp(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`))
  await expect(page.getByLabel('Titulo')).toHaveValue(seed.decks.privateAnatomy.title)

  await page.getByRole('button', { name: 'Criar' }).click()
  await expect(page).toHaveURL(/\/criar/)
  await expect(page.getByRole('heading', { name: 'Novo baralho' })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`))
  await expect(page.getByRole('heading', { name: 'Dados do baralho' })).toBeVisible()
  await expect(page.getByLabel('Titulo')).toHaveValue(seed.decks.privateAnatomy.title)

  await page.goBack()
  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible()
  await expect(page.getByText(seed.decks.privateProgramming.title)).toBeVisible()

  await page.goForward()
  await expect(page).toHaveURL(new RegExp(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`))
  await expect(page.getByLabel('Titulo')).toHaveValue(seed.decks.privateAnatomy.title)

  await page.goForward()
  await expect(page).toHaveURL(/\/criar/)
  await expect(page.getByLabel('Titulo do baralho')).toBeVisible()
})
