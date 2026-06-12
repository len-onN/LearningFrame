<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppShell from './layouts/AppShell.vue'
import CardEditorOverlay from './features/library/CardEditorOverlay.vue'
import { useDeckLibrary } from './features/library/useDeckLibrary'
import { useDeckManagement } from './features/library/useDeckManagement'
import type { AuthMode } from './utils/authValidation'
import { useAppNavigation } from './app/useAppNavigation'
import { useLibraryRouteSync } from './app/useLibraryRouteSync'
import { useLibrarySearchLifecycle } from './app/useLibrarySearchLifecycle'
import { useAuthStore } from './stores/useAuthStore'
import { useThemeStore } from './stores/useThemeStore'
import { useFeedbackStore } from './stores/useFeedbackStore'
import { useStudyStore } from './stores/useStudyStore'
import { storeToRefs } from 'pinia'

const DECK_PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 300

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const themeStore = useThemeStore()
const { themePreference, nextThemeLabel } = storeToRefs(themeStore)

const feedbackStore = useFeedbackStore()
const {
  tab,
  librarySection,
  sidebarCollapsed,
  sidebarToggleLabel,
  visibleTabs,
  currentTitle,
  toggleSidebar,
  routeDeckId
} = useAppNavigation({
  route,
  router,
  user,
  managedDeckTitle: () => managedDeck.value?.title
})
const {
  librarySearch,
  myDecks,
  publicDeckPage,
  myDeckPage,
  publicDeckQuery,
  myDeckQuery,
  currentLibraryQuery,
  loadPublicDecks,
  loadMyDecks,
  exitDeckSelectionMode
} = useDeckLibrary({
  librarySection,
  pageSize: DECK_PAGE_SIZE
})


const {
  managedDeck,
  cardEditorOpen,
  loadManagedDeckRoute,
  closeManagedDeck,
  closeCardEditor
} = useDeckManagement()

const {
  syncLibraryRoute,
  cleanupLibraryRoute,
  shouldLoadPublicDecks,
  shouldLoadMyDecks
} = useLibraryRouteSync({
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
  replaceWithMyDecks: async () => {
    await router.replace({ name: 'library-mine' })
  }
})

const userDisplayName = computed(() => user.value?.displayName ?? 'Visitante')

onMounted(() => {
  themeStore.applyThemePreference()
})

useLibrarySearchLifecycle({
  librarySearch,
  librarySection,
  user,
  delayMs: SEARCH_DEBOUNCE_MS,
  loadPublicDecks,
  loadMyDecks,
  shouldLoadPublicDecks,
  shouldLoadMyDecks
})

watch(tab, (nextTab) => {
  if (nextTab !== 'library') {
    closeCardEditor(true)
  }
})

const studyStore = useStudyStore()

function isLibraryRoute(name: string | symbol | null | undefined) {
  return name === 'library-public'
    || name === 'library-mine'
    || name === 'library-deck-manage'
}

watch(() => [route.name, route.params.deckId] as const, ([nextName], previous) => {
  const previousName = previous?.[0]
  if (previousName && isLibraryRoute(previousName) && !isLibraryRoute(nextName)) {
    cleanupLibraryRoute()
  }

  if (isLibraryRoute(nextName)) {
    void syncLibraryRoute()
  }
}, { immediate: true })

async function logout() {
  closeManagedDeck(true, false)
  exitDeckSelectionMode()
  studyStore.clearPublicStudyDeckCache()
  authStore.clearSession()
  myDecks.value = []
  myDeckPage.value = null
  myDeckQuery.value = ''
  await router.replace({ name: 'library-public' })
  feedbackStore.showNotice('Modo anonimo ativado.')
}

async function goHome() {
  closeManagedDeck(true, false)
  await router.push({ name: 'library-public' })
  feedbackStore.dismissError()
}

async function openAuth(mode: AuthMode = 'login') {
  await router.push({
    name: mode === 'login' ? 'login' : 'register',
    query: route.meta.requiresAuth ? { redirect: route.fullPath } : (route.query.redirect ? { redirect: route.query.redirect } : {})
  })
}

async function startInterleavedPractice() {
  if (route.name === 'study-interleaved') {
    await router.push({ name: 'study' })
    return
  }
  await router.push({ name: 'study-interleaved' })
}

</script>

<template>
  <AppShell
    :sidebar-collapsed="sidebarCollapsed"
    :nav-items="visibleTabs"
    :active-tab="tab"
    :current-title="currentTitle"
    :theme-preference="themePreference"
    :next-theme-label="nextThemeLabel"
    :sidebar-toggle-label="sidebarToggleLabel"
    :user="user"
    :user-display-name="userDisplayName"
    @go-home="goHome"
    @toggle-sidebar="toggleSidebar"
    @toggle-theme="themeStore.toggleThemePreference"
    @start-interleaved="startInterleavedPractice"
    @login="openAuth('login')"
    @logout="logout"
  >

      <RouterView />

      <CardEditorOverlay v-if="cardEditorOpen && managedDeck" />
  </AppShell>
</template>
