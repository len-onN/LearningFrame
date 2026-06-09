import { computed, ref, type Component, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from 'vue-router'
import {
  BarChart3,
  BookOpen,
  Brain,
  Plus,
  Upload
} from '@lucide/vue'
import type { UserResponse } from '../types/api'
import type { AuthMode } from '../utils/authValidation'
import type { LibrarySection, LibraryView } from '../features/library/libraryTypes'

export type AppTab = 'library' | 'study' | 'import' | 'create' | 'progress' | 'auth'
export type AppNavTab = Exclude<AppTab, 'auth'>

export interface AppNavItem {
  id: AppNavTab
  label: string
  icon: Component
  to: RouteLocationRaw
}

export interface AppNavigationOptions {
  route: RouteLocationNormalizedLoaded
  router: Router
  user: Ref<UserResponse | null>
  managedDeckTitle?: () => string | null | undefined
}

const navTabs: AppNavItem[] = [
  { id: 'library', label: 'Biblioteca', icon: BookOpen, to: { name: 'library-public' } },
  { id: 'study', label: 'Estudo', icon: Brain, to: { name: 'study' } },
  { id: 'import', label: 'Importar', icon: Upload, to: { name: 'import' } },
  { id: 'create', label: 'Criar', icon: Plus, to: { name: 'create' } },
  { id: 'progress', label: 'Progresso', icon: BarChart3, to: { name: 'progress' } }
]

export function useAppNavigation({
  route,
  router,
  user,
  managedDeckTitle = () => null
}: AppNavigationOptions) {
  const tab = computed<AppTab>(() => route.meta.tab ?? 'library')
  const librarySection = computed<LibrarySection>(() => route.meta.librarySection ?? 'public')
  const libraryView = computed<LibraryView>(() => route.meta.libraryView ?? 'decks')
  const authMode = computed<AuthMode>(() => route.meta.authMode ?? 'login')
  const sidebarCollapsed = ref(false)

  const sidebarToggleLabel = computed(() => sidebarCollapsed.value ? 'Expandir menu' : 'Recolher menu')
  const visibleTabs = computed(() => navTabs.filter((item) => item.id !== 'create' || user.value))
  const currentTitle = computed(() => {
    if (tab.value === 'auth') {
      return authMode.value === 'login' ? 'Entrar' : 'Criar conta'
    }
    if (tab.value === 'library' && libraryView.value === 'manage-deck') {
      return managedDeckTitle() ?? 'Gerenciar baralho'
    }
    return route.meta.title ?? navTabs.find((item) => item.id === tab.value)?.label ?? 'Biblioteca'
  })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  async function navigateTo(to: RouteLocationRaw) {
    await router.push(to)
  }

  async function navigateToMyDecks() {
    await router.push({ name: 'library-mine' })
  }

  function routeDeckId() {
    const raw = Array.isArray(route.params.deckId) ? route.params.deckId[0] : route.params.deckId
    const deckId = Number(raw)
    return Number.isFinite(deckId) && deckId > 0 ? deckId : null
  }

  return {
    tab,
    librarySection,
    libraryView,
    authMode,
    sidebarCollapsed,
    sidebarToggleLabel,
    navTabs,
    visibleTabs,
    currentTitle,
    toggleSidebar,
    navigateTo,
    navigateToMyDecks,
    routeDeckId
  }
}
