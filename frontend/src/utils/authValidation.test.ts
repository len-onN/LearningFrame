import { describe, expect, it } from 'vitest'
import { validateAuthForm } from './authValidation'

describe('validacao do formulario de autenticacao', () => {
  it('exige e-mail e senha para login', () => {
    expect(validateAuthForm({ displayName: '', email: '', password: '' }, 'login')).toEqual({
      email: 'Informe seu e-mail.',
      password: 'Informe sua senha.'
    })
  })

  it('valida nome, formato de e-mail e politica de senha no cadastro', () => {
    expect(validateAuthForm({ displayName: '', email: 'sem-arroba', password: '123' }, 'register')).toEqual({
      displayName: 'Informe seu nome.',
      email: 'Informe um e-mail valido.',
      password: 'Use pelo menos 8 caracteres e inclua pelo menos uma letra maiuscula e um simbolo.'
    })
  })

  it('lista requisitos ausentes de senha depois do tamanho minimo', () => {
    expect(validateAuthForm({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'senhaforte'
    }, 'register')).toEqual({
      password: 'Inclua pelo menos uma letra maiuscula, um numero e um simbolo.'
    })
  })

  it('nao conta espaco em branco como simbolo de senha', () => {
    expect(validateAuthForm({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Senha 123'
    }, 'register')).toEqual({
      password: 'Inclua pelo menos um simbolo.'
    })
  })

  it('aceita um formulario de cadastro completo', () => {
    expect(validateAuthForm({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Senha@123'
    }, 'register')).toEqual({})
  })
})
