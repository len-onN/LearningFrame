import { computed, ref, type ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import { api } from '../../services/api'
import type { AuthResponse, UserResponse } from '../../types/api'
import type { FeedbackOptions } from '../../composables/useFeedback'
import {
  validateAuthForm,
  type AuthErrors,
  type AuthField,
  type AuthFormValues,
  type AuthMode
} from '../../utils/authValidation'

export type AuthNavigationMethod = 'push' | 'replace'

export interface AuthFlowOptions {
  authMode: ComputedRef<AuthMode>
  route: RouteLocationNormalizedLoaded
  login?: (email: string, password: string) => Promise<AuthResponse>
  register?: (displayName: string, email: string, password: string) => Promise<AuthResponse>
  persistSession: (user: UserResponse, token: string) => void
  refreshAfterAuth: () => Promise<void>
  consumeReturnToImportAfterAuth: () => boolean
  closeManagedDeck: (force?: boolean, navigateToList?: boolean) => Promise<boolean> | boolean
  navigateToImport: () => Promise<void>
  navigateToRedirect: (to: RouteLocationRaw, method?: AuthNavigationMethod) => Promise<void>
  navigateToMyDecks: () => Promise<void>
  clearFeedback: () => void
  dismissError: () => void
  showNotice: (message: string) => void
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
}

const emptyAuthForm = (): AuthFormValues => ({
  displayName: '',
  email: '',
  password: ''
})

const emptyAuthTouched = (): Record<AuthField, boolean> => ({
  displayName: false,
  email: false,
  password: false
})

export function useAuthFlow({
  authMode,
  route,
  login = api.login,
  register = api.register,
  persistSession,
  refreshAfterAuth,
  consumeReturnToImportAfterAuth,
  closeManagedDeck,
  navigateToImport,
  navigateToRedirect,
  navigateToMyDecks,
  clearFeedback,
  dismissError,
  showNotice,
  withFeedback
}: AuthFlowOptions) {
  const authForm = ref<AuthFormValues>(emptyAuthForm())
  const authTouched = ref<Record<AuthField, boolean>>(emptyAuthTouched())
  const authSubmitted = ref(false)
  const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))

  async function submitAuth() {
    markAuthSubmitted()
    if (hasAuthErrors()) {
      return
    }

    await withFeedback(async () => {
      const response = authMode.value === 'login'
        ? await login(authForm.value.email, authForm.value.password)
        : await register(authForm.value.displayName, authForm.value.email, authForm.value.password)

      persistSession(response.user, response.token)
      authForm.value.password = ''
      resetAuthValidation()
      await refreshAfterAuth()
      if (consumeReturnToImportAfterAuth()) {
        await navigateToImport()
      } else if (typeof route.query.redirect === 'string' && route.query.redirect) {
        await navigateToRedirect(route.query.redirect)
      } else {
        await navigateToMyDecks()
      }
      showNotice(`Sessao iniciada como ${response.user.displayName}.`)
    })
  }

  function markAuthSubmitted() {
    authSubmitted.value = true
    authTouched.value.email = true
    authTouched.value.password = true
    if (authMode.value === 'register') {
      authTouched.value.displayName = true
    }
  }

  function hasAuthErrors() {
    return Object.keys(authErrors.value).length > 0
  }

  function touchAuthField(field: AuthField) {
    authTouched.value[field] = true
  }

  function shouldShowAuthError(field: AuthField) {
    return authSubmitted.value || authTouched.value[field]
  }

  function authFieldError(field: AuthField) {
    return shouldShowAuthError(field) ? authErrors.value[field] ?? '' : ''
  }

  function resetAuthValidation() {
    authSubmitted.value = false
    authTouched.value = emptyAuthTouched()
  }

  async function openAuth(mode: AuthMode = 'login') {
    await closeManagedDeck(true, false)
    const redirect = route.meta.requiresAuth ? route.fullPath : route.query.redirect
    await navigateToRedirect({
      name: mode === 'login' ? 'login' : 'register',
      query: typeof redirect === 'string' && redirect ? { redirect } : {}
    }, 'push')
    clearFeedback()
    resetAuthValidation()
  }

  async function toggleAuthMode() {
    await navigateToRedirect({
      name: authMode.value === 'login' ? 'register' : 'login',
      query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {}
    }, 'push')
    dismissError()
    resetAuthValidation()
  }

  return {
    authForm,
    authMode,
    authTouched,
    authSubmitted,
    authErrors,
    submitAuth,
    markAuthSubmitted,
    hasAuthErrors,
    touchAuthField,
    shouldShowAuthError,
    authFieldError,
    resetAuthValidation,
    openAuth,
    toggleAuthMode
  }
}
