import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../../services/api'
import type { AuthResponse } from '../../types/api'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useDeckManagementStore } from '../../stores/useDeckManagementStore'
import {
  validateAuthForm,
  type AuthErrors,
  type AuthField,
  type AuthFormValues,
  type AuthMode
} from '../../utils/authValidation'


export interface AuthFlowOptions {
  clientLogin?: (email: string, password: string) => Promise<AuthResponse>
  clientRegister?: (displayName: string, email: string, password: string) => Promise<AuthResponse>
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
  clientLogin = api.login,
  clientRegister = api.register
}: AuthFlowOptions = {}) {
  const router = useRouter()
  const route = useRoute()
  const feedbackStore = useFeedbackStore()
  const authStore = useAuthStore()
  const libraryStore = useLibraryStore()
  const deckManagementStore = useDeckManagementStore()
  
  const authMode = computed<AuthMode>(() => route.meta.authMode ?? 'login')

  const authForm = ref<AuthFormValues>(emptyAuthForm())
  const authTouched = ref<Record<AuthField, boolean>>(emptyAuthTouched())
  const authSubmitted = ref(false)
  const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))

  async function submitAuth() {
    markAuthSubmitted()
    if (hasAuthErrors()) {
      return
    }

    await feedbackStore.withFeedback(async () => {
      const response = authMode.value === 'login'
        ? await clientLogin(authForm.value.email, authForm.value.password)
        : await clientRegister(authForm.value.displayName, authForm.value.email, authForm.value.password)

      authStore.persistSession(response.user, response.token)
      authForm.value.password = ''
      resetAuthValidation()
      libraryStore.resetLibrary()
      await Promise.all([
        libraryStore.loadMyDecks(api, 8, true),
        libraryStore.loadPublicDecks(api, 8, true)
      ])
      
      if (typeof route.query.redirect === 'string' && route.query.redirect) {
        await router.replace(route.query.redirect)
      } else {
        await router.replace({ name: 'library-mine' })
      }
      feedbackStore.showNotice(`Sessao iniciada como ${response.user.displayName}.`)
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
    deckManagementStore.closeManagedDeck(async () => {}, true)
    const redirect = route.meta.requiresAuth ? route.fullPath : route.query.redirect
    await router.push({
      name: mode === 'login' ? 'login' : 'register',
      query: typeof redirect === 'string' && redirect ? { redirect } : {}
    })
    feedbackStore.clearFeedback()
    resetAuthValidation()
  }

  async function toggleAuthMode() {
    await router.push({
      name: authMode.value === 'login' ? 'register' : 'login',
      query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {}
    })
    feedbackStore.dismissError()
    resetAuthValidation()
  }
  
  async function goHome() {
    deckManagementStore.closeManagedDeck(async () => {}, true)
    await router.push({ name: 'library-public' })
    feedbackStore.dismissError()
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
    toggleAuthMode,
    goHome
  }
}
