import { reactive, ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import type { UserResponse } from '../types/api'
import { useAppNavigation } from './useAppNavigation'

describe('useAppNavigation', () => {
  it('deriva abas visiveis a partir da sessao', () => {
    const user = ref<UserResponse | null>(null)
    const navigation = useAppNavigation({
      route: route({ tab: 'library' }),
      router: createRouter(),
      user
    })

    expect(navigation.visibleTabs.value.map((item) => item.id)).toEqual([
      'library',
      'study',
      'import'
    ])

    user.value = userResponse()

    expect(navigation.visibleTabs.value.map((item) => item.id)).toEqual([
      'library',
      'study',
      'import',
      'create',
      'progress',
      'settings',
      'profile'
    ])
  })

  it('usa o titulo do baralho gerenciado quando a rota esta em gerenciamento', () => {
    const managedTitle = ref('Neurociencias')
    const navigation = useAppNavigation({
      route: route({
        tab: 'library',
        libraryView: 'manage-deck',
        title: 'Gerenciar baralho'
      }),
      router: createRouter(),
      user: ref(userResponse()),
      managedDeckTitle: () => managedTitle.value
    })

    expect(navigation.currentTitle.value).toBe('Neurociencias')

    managedTitle.value = 'Biologia celular'

    expect(navigation.currentTitle.value).toBe('Biologia celular')
  })

  it('mantem titulo de auth baseado no modo da rota', () => {
    const navigation = useAppNavigation({
      route: route({ tab: 'auth', authMode: 'register', title: 'Entrar' }),
      router: createRouter(),
      user: ref(null)
    })

    expect(navigation.currentTitle.value).toBe('Criar conta')
  })

  it('normaliza deckId da rota', () => {
    const navigation = useAppNavigation({
      route: route({}, { deckId: ['42'] }),
      router: createRouter(),
      user: ref(null)
    })

    expect(navigation.routeDeckId()).toBe(42)
  })

  it('encapsula push do router para navegacao simples', async () => {
    const router = createRouter()
    const navigation = useAppNavigation({
      route: route({}),
      router,
      user: ref(null)
    })

    await navigation.navigateTo({ name: 'study' })
    await navigation.navigateToMyDecks()

    expect(router.push).toHaveBeenNthCalledWith(1, { name: 'study' })
    expect(router.push).toHaveBeenNthCalledWith(2, { name: 'library-mine' })
  })
})

function route(
  meta: RouteLocationNormalizedLoaded['meta'],
  params: RouteLocationNormalizedLoaded['params'] = {}
) {
  return reactive({
    name: 'library-public',
    meta,
    params
  }) as RouteLocationNormalizedLoaded
}

function createRouter() {
  return {
    push: vi.fn(async () => undefined)
  } as unknown as Router
}

function userResponse(): UserResponse {
  return {
    id: 1,
    displayName: 'Ada',
    email: 'ada@example.com'
  }
}
