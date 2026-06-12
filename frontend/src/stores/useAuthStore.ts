import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clearAuthToken, setAuthToken } from '../services/api'
import type { UserResponse } from '../types/api'

const USER_STORAGE_KEY = 'learningframe.user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) as UserResponse : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserResponse | null>(loadStoredUser())

  function persistSession(nextUser: UserResponse, token: string) {
    user.value = nextUser
    setAuthToken(token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
  }

  function clearSession() {
    user.value = null
    clearAuthToken()
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  function updateDisplayName(displayName: string) {
    if (user.value) {
      user.value.displayName = displayName
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user.value))
    }
  }

  return {
    user,
    persistSession,
    clearSession,
    updateDisplayName
  }
})
