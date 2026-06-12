import { createPinia, setActivePinia } from 'pinia'
import { reactive, ref } from 'vue'
import { useRouter, useRoute, type RouteLocationNormalizedLoaded, type RouteLocationRaw } from 'vue-router'
import {  describe, expect, it, vi , beforeEach } from 'vitest'
import type { AuthResponse, UserResponse } from '../../types/api'
import type { AuthMode } from '../../utils/authValidation'
import { useAuthFlow } from './useAuthFlow'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useDeckManagementStore } from '../../stores/useDeckManagementStore'
import { useLibraryStore } from '../../stores/useLibraryStore'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn()
}))

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
    expect(subject.mockRouter.replace).toHaveBeenCalledWith('/criar')
    expect(subject.events).toEqual([
      'persist',
      'refresh:password=',
      'redirect:/criar',
      'import',
      'notice:Sessao iniciada como Ada.'
    ])
  })



  it('faz login sem redirect indo para Meus baralhos', async () => {
    const subject = createSubject()
    subject.flow.authForm.value.email = 'ada@example.com'
    subject.flow.authForm.value.password = 'Senha123!'
    subject.login.mockResolvedValueOnce(authResponse('Ada'))

    await subject.flow.submitAuth()

    expect(subject.mockRouter.replace).toHaveBeenCalledWith({ name: 'library-mine' })
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
    expect(subject.mockRouter.push).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/criar' }
    })
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

    expect(subject.mockRouter.push).toHaveBeenCalledWith({
      name: 'register',
      query: { redirect: '/biblioteca/meus' }
    })
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

  const mockRouter = {
    push: vi.fn(async (to: RouteLocationRaw) => {
      events.push(`redirect:${String((to as any).name ?? to)}`)
    }),
    replace: vi.fn(async (to: RouteLocationRaw) => {
      events.push(`redirect:${typeof to === 'string' ? to : (to as any).name}`)
      if (to === '/criar') events.push('import')
      if ((to as any).name === 'library-mine') events.push('my-decks')
    }),
    currentRoute: ref(route)
  }

  vi.mocked(useRouter).mockReturnValue(mockRouter as any)
  vi.mocked(useRoute).mockReturnValue(route)

  const login = vi.fn(async (_email: string, _password: string) => authResponse('Ada'))
  const register = vi.fn(async (_displayName: string, _email: string, _password: string) => authResponse('Ada'))
  
  const authStore = useAuthStore()
  authStore.persistSession = vi.fn((_user: UserResponse, _token: string) => {
    events.push('persist')
  })

  const deckManagementStore = useDeckManagementStore()
  deckManagementStore.closeManagedDeck = vi.fn(async () => true)

  const feedbackStore = useFeedbackStore()
  feedbackStore.clearFeedback = vi.fn()
  feedbackStore.dismissError = vi.fn()
  feedbackStore.showNotice = vi.fn((message: string) => {
    events.push(`notice:${message}`)
  })
  feedbackStore.withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })
  
  const libraryStore = useLibraryStore()
  libraryStore.resetLibrary = vi.fn()
  libraryStore.loadPublicDecks = vi.fn(async () => {})
  libraryStore.loadMyDecks = vi.fn(async () => {
    events.push(`refresh:password=${flow.authForm.value.password}`)
  })

  const flow = useAuthFlow({
    clientLogin: login,
    clientRegister: register
  })

  return {
    events,
    mode,
    route,
    login,
    register,
    persistSession: authStore.persistSession,
    refreshAfterAuth: libraryStore.loadMyDecks,
    closeManagedDeck: deckManagementStore.closeManagedDeck,
    navigateToImport: vi.fn(),
    navigateToRedirect: vi.fn(),
    navigateToMyDecks: vi.fn(),
    mockRouter,
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
