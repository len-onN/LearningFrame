import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import {  describe, expect, it, vi , beforeEach } from 'vitest'
import type { AuthResponse, UserResponse } from '../../types/api'
import type { AuthMode } from '../../utils/authValidation'
import { useAuthFlow, type AuthNavigationMethod } from './useAuthFlow'
import { useFeedbackStore } from '../../stores/useFeedbackStore'

describe('useAuthFlow', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('valida campos tocados e submissao sem chamar login invalido', async () => {
    const subject = createSubject({ mode: 'register' })

    expect(subject.flow.authFieldError('email')).toBe('')

    subject.flow.touchAuthField('email')

    expect(subject.flow.authFieldError('email')).toBe('Informe seu e-mail.')

    await subject.flow.submitAuth()

    expect(subject.flow.authSubmitted.value).toBe(true)
    expect(subject.flow.authTouched.value).toEqual({
      displayName: true,
      email: true,
      password: true
    })
    expect(subject.flow.authFieldError('displayName')).toBe('Informe seu nome.')
    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.withFeedback).not.toHaveBeenCalled()
    expect(subject.login).not.toHaveBeenCalled()
    expect(subject.register).not.toHaveBeenCalled()
  })

  it('faz login com redirect preservando ordem, senha e validacao', async () => {
    const subject = createSubject({ redirect: '/criar' })
    subject.flow.authForm.value.email = 'ada@example.com'
    subject.flow.authForm.value.password = 'Senha123!'
    subject.login.mockResolvedValueOnce(authResponse('Ada'))

    await subject.flow.submitAuth()

    expect(subject.login).toHaveBeenCalledWith('ada@example.com', 'Senha123!')
    expect(subject.persistSession).toHaveBeenCalledWith(userResponse('Ada'), 'token-Ada')
    expect(subject.flow.authForm.value.password).toBe('')
    expect(subject.flow.authSubmitted.value).toBe(false)
    expect(subject.flow.authTouched.value).toEqual({
      displayName: false,
      email: false,
      password: false
    })
    expect(subject.navigateToRedirect).toHaveBeenCalledWith('/criar')
    expect(subject.navigateToImport).not.toHaveBeenCalled()
    expect(subject.navigateToMyDecks).not.toHaveBeenCalled()
    expect(subject.events).toEqual([
      'persist',
      'refresh:password=',
      'redirect:/criar',
      'notice:Sessao iniciada como Ada.'
    ])
  })



  it('faz login sem redirect indo para Meus baralhos', async () => {
    const subject = createSubject()
    subject.flow.authForm.value.email = 'ada@example.com'
    subject.flow.authForm.value.password = 'Senha123!'
    subject.login.mockResolvedValueOnce(authResponse('Ada'))

    await subject.flow.submitAuth()

    expect(subject.navigateToMyDecks).toHaveBeenCalled()
    expect(subject.navigateToRedirect).not.toHaveBeenCalled()
    expect(subject.navigateToImport).not.toHaveBeenCalled()
    expect(subject.events).toContain('my-decks')
  })

  it('abre auth com redirect de rota protegida e limpa feedback visual', async () => {
    const subject = createSubject({
      routeMeta: { requiresAuth: true },
      fullPath: '/criar'
    })
    subject.flow.markAuthSubmitted()

    await subject.flow.openAuth('login')

    expect(subject.closeManagedDeck).toHaveBeenCalledWith(true, false)
    expect(subject.navigateToRedirect).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/criar' }
    }, 'push')
    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.clearFeedback).toHaveBeenCalled()
    expect(subject.flow.authSubmitted.value).toBe(false)
  })

  it('alterna login/cadastro preservando redirect', async () => {
    const subject = createSubject({
      mode: 'login',
      redirect: '/biblioteca/meus'
    })
    subject.flow.markAuthSubmitted()

    await subject.flow.toggleAuthMode()

    expect(subject.navigateToRedirect).toHaveBeenCalledWith({
      name: 'register',
      query: { redirect: '/biblioteca/meus' }
    }, 'push')
    const feedbackStore = useFeedbackStore()
    expect(feedbackStore.dismissError).toHaveBeenCalled()
    expect(subject.flow.authSubmitted.value).toBe(false)
  })
})

function createSubject(options: {
  mode?: AuthMode
  redirect?: string
  fullPath?: string
  routeMeta?: RouteLocationNormalizedLoaded['meta']
} = {}) {
  const events: string[] = []
  const mode = ref<AuthMode>(options.mode ?? 'login')
  const route = createRoute({
    fullPath: options.fullPath ?? '/entrar',
    meta: options.routeMeta ?? { authMode: mode.value },
    query: options.redirect ? { redirect: options.redirect } : {}
  })
  const login = vi.fn(async (_email: string, _password: string) => authResponse('Ada'))
  const register = vi.fn(async (_displayName: string, _email: string, _password: string) => authResponse('Ada'))
  const persistSession = vi.fn((_user: UserResponse, _token: string) => {
    events.push('persist')
  })
  let readPassword = () => ''
  const refreshAfterAuth = vi.fn(async () => {
    events.push(`refresh:password=${readPassword()}`)
  })

  const closeManagedDeck = vi.fn(async () => true)
  const navigateToImport = vi.fn(async () => {
    events.push('import')
  })
  const navigateToRedirect = vi.fn(async (to: RouteLocationRaw, _method?: AuthNavigationMethod) => {
    events.push(`redirect:${String(to)}`)
  })
  const navigateToMyDecks = vi.fn(async () => {
    events.push('my-decks')
  })
  const feedbackStore = useFeedbackStore()
  feedbackStore.clearFeedback = vi.fn()
  feedbackStore.dismissError = vi.fn()
  feedbackStore.showNotice = vi.fn((message: string) => {
    events.push(`notice:${message}`)
  })
  feedbackStore.withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })

  const flow = useAuthFlow({
    authMode: computed(() => mode.value),
    route,
    login,
    register,
    persistSession,
    refreshAfterAuth,
    closeManagedDeck,
    navigateToImport,
    navigateToRedirect,
    navigateToMyDecks
  })
  readPassword = () => flow.authForm.value.password

  return {
    events,
    mode,
    route,
    login,
    register,
    persistSession,
    refreshAfterAuth,
    closeManagedDeck,
    navigateToImport,
    navigateToRedirect,
    navigateToMyDecks,
    flow
  }
}

function createRoute(options: {
  fullPath: string
  meta: RouteLocationNormalizedLoaded['meta']
  query: RouteLocationNormalizedLoaded['query']
}) {
  return reactive({
    name: 'login',
    fullPath: options.fullPath,
    meta: options.meta,
    query: options.query,
    params: {}
  }) as RouteLocationNormalizedLoaded
}

function authResponse(displayName: string): AuthResponse {
  return {
    token: `token-${displayName}`,
    user: userResponse(displayName)
  }
}

function userResponse(displayName: string): UserResponse {
  return {
    id: 1,
    displayName,
    email: `${displayName.toLowerCase()}@example.com`
  }
}
