import type { Ref } from 'vue'
import type { UserResponse } from '../types/api'
import type { FeedbackOptions } from '../composables/useFeedback'
import { useDebouncedWatch } from '../composables/useDebouncedWatch'
import type { LibrarySection } from '../features/library/libraryTypes'

export interface LibrarySearchLifecycleOptions {
  librarySearch: Ref<string>
  librarySection: Ref<LibrarySection>
  user: Ref<UserResponse | null>
  delayMs: number
  loadPublicDecks: (reset?: boolean) => Promise<void>
  loadMyDecks: (reset?: boolean) => Promise<void>
  shouldLoadPublicDecks?: () => boolean
  shouldLoadMyDecks?: () => boolean
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
}

export function useLibrarySearchLifecycle({
  librarySearch,
  librarySection,
  user,
  delayMs,
  loadPublicDecks,
  loadMyDecks,
  shouldLoadPublicDecks = () => true,
  shouldLoadMyDecks = () => true,
  withFeedback
}: LibrarySearchLifecycleOptions) {
  useDebouncedWatch(librarySearch, () => {
    if (librarySection.value === 'public' && shouldLoadPublicDecks()) {
      void withFeedback(async () => loadPublicDecks(true), { showLoading: false })
    }
    if (librarySection.value === 'mine' && user.value && shouldLoadMyDecks()) {
      void withFeedback(async () => loadMyDecks(true), { showLoading: false })
    }
  }, delayMs)
}
