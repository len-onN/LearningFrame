import type { Page } from '@playwright/test'
import { expect } from './fixtures'

export async function loginViaUi(page: Page, email = 'e2e@learningframe.test', password = 'Senha#1234') {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('main').getByRole('button', { name: /^Entrar$/ }).click()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('learningframe.token'))).not.toBeNull()
}

export async function loginFromStart(page: Page, email = 'e2e@learningframe.test', password = 'Senha#1234') {
  await page.goto('/entrar')
  await loginViaUi(page, email, password)
  await expect(page).not.toHaveURL(/\/entrar/)
}

export async function logoutViaUi(page: Page) {
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/biblioteca\/publicos/)
}
