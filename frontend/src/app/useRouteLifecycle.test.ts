import { nextTick, reactive } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { useRouteLifecycle } from './useRouteLifecycle'

describe('useRouteLifecycle', () => {
  it('sincroniza a rota ativa no primeiro ciclo', () => {
    const callbacks = createCallbacks()

    useRouteLifecycle({
      route: route('library-public', '/biblioteca/publicos'),
      ...callbacks
    })

    expect(callbacks.syncLibraryRoute).toHaveBeenCalledTimes(1)
    expect(callbacks.syncStudyRoute).not.toHaveBeenCalled()
    expect(callbacks.syncProgressRoute).not.toHaveBeenCalled()
  })

  it('limpa o dominio anterior ao trocar entre grupos de rota', async () => {
    const callbacks = createCallbacks()
    const currentRoute = route('library-deck-manage', '/biblioteca/meus/7/gerenciar', { deckId: '7' })

    useRouteLifecycle({
      route: currentRoute,
      ...callbacks
    })

    currentRoute.name = 'study-deck'
    currentRoute.fullPath = '/estudo/baralho/7'
    currentRoute.params = { deckId: '7' }
    await nextTick()

    expect(callbacks.cleanupLibraryRoute).toHaveBeenCalledTimes(1)
    expect(callbacks.cleanupStudyRoute).not.toHaveBeenCalled()
    expect(callbacks.syncStudyRoute).toHaveBeenCalledTimes(1)
  })

  it('preserva dominio de estudo ao trocar entre rotas de estudo', async () => {
    const callbacks = createCallbacks()
    const currentRoute = route('study-deck', '/estudo/baralho/7', { deckId: '7' })

    useRouteLifecycle({
      route: currentRoute,
      ...callbacks
    })

    currentRoute.name = 'study-interleaved'
    currentRoute.fullPath = '/estudo/intercalado'
    currentRoute.params = {}
    await nextTick()

    expect(callbacks.cleanupStudyRoute).not.toHaveBeenCalled()
    expect(callbacks.syncStudyRoute).toHaveBeenCalledTimes(2)
  })

  it('mantem limpeza de feedback e importacao baseada no fullPath anterior', async () => {
    const callbacks = createCallbacks()
    const currentRoute = route('import', '/importar')

    useRouteLifecycle({
      route: currentRoute,
      ...callbacks
    })

    currentRoute.name = 'login'
    currentRoute.fullPath = '/entrar'
    await nextTick()

    expect(callbacks.clearFeedbackForRouteChange).toHaveBeenLastCalledWith('/importar', '/entrar')
  })
})

function createCallbacks() {
  return {
    syncLibraryRoute: vi.fn(async () => undefined),
    cleanupLibraryRoute: vi.fn(),
    syncStudyRoute: vi.fn(async () => undefined),
    cleanupStudyRoute: vi.fn(),
    syncProgressRoute: vi.fn(async () => undefined),
    clearFeedbackForRouteChange: vi.fn()
  }
}

function route(
  name: string,
  fullPath: string,
  params: RouteLocationNormalizedLoaded['params'] = {}
) {
  return reactive({
    name,
    fullPath,
    params,
    meta: {}
  }) as RouteLocationNormalizedLoaded
}
