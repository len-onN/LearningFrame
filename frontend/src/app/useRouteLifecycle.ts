import { watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type RouteName = RouteLocationNormalizedLoaded['name']

export interface RouteLifecycleOptions {
  route: RouteLocationNormalizedLoaded
  syncLibraryRoute: () => Promise<void>
  cleanupLibraryRoute: () => void
  syncStudyRoute: () => Promise<void>
  cleanupStudyRoute: () => void
  syncProgressRoute: () => Promise<void>
  clearFeedbackForRouteChange: (previousFullPath?: string, currentFullPath?: string) => void
  clearImportStateForRouteChange: (previousFullPath?: string) => void
}

export function useRouteLifecycle({
  route,
  syncLibraryRoute,
  cleanupLibraryRoute,
  syncStudyRoute,
  cleanupStudyRoute,
  syncProgressRoute,
  clearFeedbackForRouteChange,
  clearImportStateForRouteChange
}: RouteLifecycleOptions) {
  watch(() => route.fullPath, (nextFullPath, previousFullPath) => {
    clearFeedbackForRouteChange(previousFullPath, nextFullPath)
    clearImportStateForRouteChange(previousFullPath)
  }, { immediate: true })

  watch(() => [route.name, route.params.deckId] as const, ([nextName], previous) => {
    const previousName = previous?.[0]
    if (previousName && isLibraryRoute(previousName) && !isLibraryRoute(nextName)) {
      cleanupLibraryRoute()
    }
    if (previousName && isStudyRoute(previousName) && !isStudyRoute(nextName)) {
      cleanupStudyRoute()
    }

    if (isLibraryRoute(nextName)) {
      void syncLibraryRoute()
      return
    }
    if (isStudyRoute(nextName)) {
      void syncStudyRoute()
      return
    }
    if (nextName === 'progress') {
      void syncProgressRoute()
    }
  }, { immediate: true })
}

function isLibraryRoute(name: RouteName) {
  return name === 'library-public'
    || name === 'library-mine'
    || name === 'library-deck-manage'
}

function isStudyRoute(name: RouteName) {
  return name === 'study'
    || name === 'study-deck'
    || name === 'study-interleaved'
}
