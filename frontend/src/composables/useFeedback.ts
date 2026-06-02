import { ref } from 'vue'

export type FeedbackLifetime = 'route' | 'next-route' | 'sticky'

export interface FeedbackOptions {
  showLoading?: boolean
  clearOnStart?: boolean
}

export function useFeedback() {
  const notice = ref('')
  const error = ref('')
  const loading = ref(false)
  const feedbackLifetime = ref<FeedbackLifetime>('route')

  function showNotice(message: string, lifetime: FeedbackLifetime = 'route') {
    notice.value = message
    error.value = ''
    feedbackLifetime.value = lifetime
  }

  function showError(message: string, lifetime: FeedbackLifetime = 'route') {
    error.value = message
    notice.value = ''
    feedbackLifetime.value = lifetime
  }

  function clearFeedback() {
    notice.value = ''
    error.value = ''
    feedbackLifetime.value = 'route'
  }

  function clearFeedbackForRouteChange(previousFullPath?: string, currentFullPath?: string) {
    if (!previousFullPath || previousFullPath === currentFullPath) {
      return
    }

    if (feedbackLifetime.value === 'sticky') {
      return
    }

    if (feedbackLifetime.value === 'next-route') {
      feedbackLifetime.value = 'route'
      return
    }

    clearFeedback()
  }

  async function withFeedback(
    task: () => Promise<void>,
    optionsOrShowLoading: FeedbackOptions | boolean = {},
    legacyClearOnStart = true
  ) {
    const options = typeof optionsOrShowLoading === 'boolean'
      ? { showLoading: optionsOrShowLoading, clearOnStart: legacyClearOnStart }
      : optionsOrShowLoading
    const showLoading = options.showLoading ?? true
    const clearOnStart = options.clearOnStart ?? true

    if (clearOnStart) {
      clearFeedback()
    }
    if (showLoading) {
      loading.value = true
    }
    try {
      await task()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Erro inesperado.'
      showError(message === 'Failed to fetch'
        ? 'Backend indisponivel. Verifique se o Docker Compose esta ativo e tente novamente.'
        : message)
    } finally {
      loading.value = false
    }
  }

  function dismissNotice() {
    notice.value = ''
    if (!error.value) {
      feedbackLifetime.value = 'route'
    }
  }

  function dismissError() {
    error.value = ''
    if (!notice.value) {
      feedbackLifetime.value = 'route'
    }
  }

  return {
    notice,
    error,
    loading,
    feedbackLifetime,
    showNotice,
    showError,
    clearFeedback,
    clearFeedbackForRouteChange,
    withFeedback,
    dismissNotice,
    dismissError
  }
}
