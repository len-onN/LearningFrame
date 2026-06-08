import { test, expect } from '../support/fixtures'
import { loginViaUi, logoutViaUi } from '../support/auth'

test('rota privada redireciona para login e retorna ao destino apos entrar', async ({ page, seed }) => {
  await page.goto('/biblioteca/meus')

  await expect(page).toHaveURL(/\/entrar\?redirect=/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/biblioteca/meus')

  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)

  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByText(seed.decks.privateAnatomy.title)).toBeVisible()
})

test('login e logout limpam acesso a dados privados', async ({ page, seed }) => {
  await page.goto('/entrar')
  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)
  await page.goto(`/biblioteca/meus/${seed.decks.privateAnatomy.id}/gerenciar`)

  await expect(page.getByRole('heading', { name: 'Dados do baralho' })).toBeVisible()
  await expect(page.getByLabel('Titulo')).toHaveValue(seed.decks.privateAnatomy.title)

  await logoutViaUi(page)
  await expect(page.getByText(seed.decks.privateAnatomy.title)).not.toBeVisible()

  await page.goto('/biblioteca/meus')
  await expect(page).toHaveURL(/\/entrar\?redirect=/)
})
