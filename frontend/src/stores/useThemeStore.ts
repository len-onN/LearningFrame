import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ThemePreference = 'light' | 'dark'

const THEME_STORAGE_KEY = 'learningframe.theme'

function loadStoredThemePreference(): ThemePreference {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const themePreference = ref<ThemePreference>(loadStoredThemePreference())
  const nextThemeLabel = computed(() => themePreference.value === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro')

  function toggleThemePreference() {
    themePreference.value = themePreference.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_STORAGE_KEY, themePreference.value)
    applyThemePreference()
  }

  function applyThemePreference() {
    document.documentElement.dataset.theme = themePreference.value
    document.documentElement.style.colorScheme = themePreference.value
  }

  return {
    themePreference,
    nextThemeLabel,
    toggleThemePreference,
    applyThemePreference
  }
})
