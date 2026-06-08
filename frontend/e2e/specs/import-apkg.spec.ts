import { fileURLToPath } from 'node:url'
import { test, expect } from '../support/fixtures'
import { loginViaUi } from '../support/auth'

const fixturePath = fileURLToPath(new URL('../fixtures/e2e-import.apkg', import.meta.url))

test('importacao APKG pequena preserva preview ao login e salva baralho', async ({ page, seed }) => {
  await page.goto('/importar')
  await page.getByLabel('Arquivo APKG').setInputFiles(fixturePath)

  await expect(page.getByText('E2E APKG Frente 1')).toBeVisible()
  await page.getByRole('button', { name: /Entrar para salvar/ }).click()
  await expect(page).toHaveURL(/\/entrar/)

  await loginViaUi(page, seed.users.primary.email, seed.users.primary.password)
  await expect(page).toHaveURL(/\/importar/)
  await expect(page.getByText('E2E APKG Frente 1')).toBeVisible()

  await page.getByLabel('Titulo do baralho importado').fill('E2E APKG Importado')
  await page.getByRole('button', { name: /Salvar APKG/ }).click()

  await expect(page).toHaveURL(/\/biblioteca\/meus/)
  await expect(page.getByText('E2E APKG Importado')).toBeVisible()
})

test('importacao APKG limpa preview ao sair da rota', async ({ page }) => {
  await page.goto('/importar')
  await page.getByLabel('Arquivo APKG').setInputFiles(fixturePath)
  await expect(page.getByText('E2E APKG Frente 1')).toBeVisible()

  await page.goto('/biblioteca/publicos')
  await page.goto('/importar')

  await expect(page.getByText('E2E APKG Frente 1')).not.toBeVisible()
  await expect(page.getByText('Selecionar arquivo .apkg')).toBeVisible()
})
