import { describe, expect, it } from 'vitest'
import { validateAuthForm } from './authValidation'

describe('validateAuthForm', () => {
  it('requires email and password for login', () => {
    expect(validateAuthForm({ displayName: '', email: '', password: '' }, 'login')).toEqual({
      email: 'Informe seu e-mail.',
      password: 'Informe sua senha.'
    })
  })

  it('validates registration name, email format and password policy', () => {
    expect(validateAuthForm({ displayName: '', email: 'sem-arroba', password: '123' }, 'register')).toEqual({
      displayName: 'Informe seu nome.',
      email: 'Informe um e-mail valido.',
      password: 'Use pelo menos 8 caracteres e inclua pelo menos uma letra maiuscula e um simbolo.'
    })
  })

  it('lists missing password requirements after minimum length is satisfied', () => {
    expect(validateAuthForm({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'senhaforte'
    }, 'register')).toEqual({
      password: 'Inclua pelo menos uma letra maiuscula, um numero e um simbolo.'
    })
  })

  it('does not count whitespace as a password symbol', () => {
    expect(validateAuthForm({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Senha 123'
    }, 'register')).toEqual({
      password: 'Inclua pelo menos um simbolo.'
    })
  })

  it('accepts a complete registration form', () => {
    expect(validateAuthForm({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Senha@123'
    }, 'register')).toEqual({})
  })
})
