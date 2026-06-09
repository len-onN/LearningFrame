import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { FeedbackOptions } from '../composables/useFeedback'
import type { DeckSummary, PageResponse, UserResponse } from '../types/api'

export interface LibraryRouteSyncOptions {
  route: RouteLocationNormalizedLoaded
  user: Ref<UserResponse | null>
  managedDeck: Ref<DeckSummary | null>
  librarySearch: Ref<string>
  publicDeckPage: Ref<PageResponse<DeckSummary> | null>
  myDeckPage: Ref<PageResponse<DeckSummary> | null>
  publicDeckQuery: Ref<string>
  myDeckQuery: Ref<string>
  currentLibraryQuery: () => string
  routeDeckId: () => number | null
  loadPublicDecks: (reset?: boolean) => Promise<void>
  loadMyDecks: (reset?: boolean) => Promise<void>
  loadManagedDeckRoute: (deckId: number) => Promise<void>
  closeManagedDeck: (force?: boolean, navigateToList?: boolean) => Promise<boolean>
  exitDeckSelectionMode: () => void
  replaceWithMyDecks: () => Promise<void>
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
}

export function useLibraryRouteSync({
  route,
  user,
  managedDeck,
  librarySearch,
  publicDeckPage,
  myDeckPage,
  publicDeckQuery,
  myDeckQuery,
  currentLibraryQuery,
  routeDeckId,
  loadPublicDecks,
  loadMyDecks,
  loadManagedDeckRoute,
  closeManagedDeck,
  exitDeckSelectionMode,
  replaceWithMyDecks,
  withFeedback
}: LibraryRouteSyncOptions) {
  async function syncLibraryRoute() {
    if (route.name !== 'library-deck-manage' && managedDeck.value) {
      void closeManagedDeck(true, false)
    }
    if (route.name !== 'library-mine') {
      exitDeckSelectionMode()
    }

    if (route.name === 'library-public') {
      await withFeedback(async () => {
        if (shouldLoadPublicDecks()) {
          await loadPublicDecks(true)
        }
      }, { showLoading: false, clearOnStart: false })
      return
    }

    if (route.name === 'library-mine') {
      await withFeedback(async () => {
        if (user.value && shouldLoadMyDecks()) {
          await loadMyDecks(true)
        }
      }, { showLoading: false, clearOnStart: false })
      return
    }

    if (route.name === 'library-deck-manage') {
      const deckId = routeDeckId()
      if (!deckId) {
        await replaceWithMyDecks()
        return
      }
      if (!user.value) {
        return
      }
      librarySearch.value = ''
      await loadManagedDeckRoute(deckId)
    }
  }

  function cleanupLibraryRoute() {
    void closeManagedDeck(true, false)
    exitDeckSelectionMode()
  }

  function shouldLoadPublicDecks() {
    return !publicDeckPage.value || publicDeckQuery.value !== currentLibraryQuery()
  }

  function shouldLoadMyDecks() {
    return !myDeckPage.value || myDeckQuery.value !== currentLibraryQuery()
  }

  return {
    syncLibraryRoute,
    cleanupLibraryRoute,
    shouldLoadPublicDecks,
    shouldLoadMyDecks
  }
}
