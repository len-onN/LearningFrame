import type { Ref } from 'vue'
import type { UserResponse } from '../types/api'
import { useFeedbackStore } from '../stores/useFeedbackStore'
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
}

export function useLibrarySearchLifecycle({
  librarySearch,
  librarySection,
  user,
  delayMs,
  loadPublicDecks,
  loadMyDecks,
  shouldLoadPublicDecks = () => true,
  shouldLoadMyDecks = () => true
}: LibrarySearchLifecycleOptions) {
  const feedbackStore = useFeedbackStore()

  useDebouncedWatch(librarySearch, () => {
    if (librarySection.value === 'public' && shouldLoadPublicDecks()) {
      void feedbackStore.withFeedback(async () => loadPublicDecks(true), { showLoading: false })
    }
    if (librarySection.value === 'mine' && user.value && shouldLoadMyDecks()) {
      void feedbackStore.withFeedback(async () => loadMyDecks(true), { showLoading: false })
    }
  }, delayMs)
}
