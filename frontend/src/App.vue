<script setup lang="ts">
import { computed, onMounted, provide, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppShell from './layouts/AppShell.vue'
import { api } from './services/api'
import CardEditorOverlay from './features/library/CardEditorOverlay.vue'
import { useDeckLibrary } from './features/library/useDeckLibrary'
import { useLibraryActions } from './features/library/useLibraryActions'
import { useDeckManagement } from './features/library/useDeckManagement'
import { useAuthFlow } from './features/auth/useAuthFlow'
import { useCreateDeckFlow } from './features/create/useCreateDeckFlow'
import { useStudySession } from './features/study/useStudySession'
import {
  authRouteKey,
  createDeckRouteKey,
  progressRouteKey
} from './routes/routeContext'
import type { AuthMode } from './utils/authValidation'
import { useAppNavigation } from './app/useAppNavigation'
import { useLibraryRouteSync } from './app/useLibraryRouteSync'
import { useLibrarySearchLifecycle } from './app/useLibrarySearchLifecycle'
import { useRouteLifecycle } from './app/useRouteLifecycle'
import { useStatsSummary } from './app/useStatsSummary'
import { useAuthStore } from './stores/useAuthStore'
import { useThemeStore } from './stores/useThemeStore'
import { useFeedbackStore } from './stores/useFeedbackStore'
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
  authMode,
  sidebarCollapsed,
  sidebarToggleLabel,
  visibleTabs,
  currentTitle,
  toggleSidebar,
  navigateToManagedDeck,
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
  stats,
  refreshStats,
  clearStats,
  syncProgressRoute
} = useStatsSummary()

const {
  managedDeck,
  cardEditorOpen,
  cardEditorForm,
  cardEditorTitle,
  cardEditorFrontPreview,
  cardEditorBackPreview,
  setManagedDeck,
  loadManagedDeckRoute,
  closeManagedDeck,
  closeCardEditor,
  saveCardEditor,
  uploadCardEditorMedia,
  handleCardEditorUploadError
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

const {
  refreshAll
} = useLibraryActions()

const createDeckFlow = useCreateDeckFlow({
  client: api,
  loadMyDecks,
  setManagedDeck,
  navigateToManagedDeck
})

const authFlow = useAuthFlow({
  authMode,
  route,
  login: (email, password) => api.login(email, password),
  register: (displayName, email, password) => api.register(displayName, email, password),
  persistSession: authStore.persistSession,
  refreshAfterAuth: refreshAll,
  closeManagedDeck,
  navigateToImport: async () => {
    await router.replace({ name: 'import' })
  },
  navigateToRedirect: async (to, method = 'replace') => {
    if (method === 'push') {
      await router.push(to)
      return
    }
    await router.replace(to)
  },
  navigateToMyDecks: async () => {
    await router.replace({ name: 'library-mine' })
  }
})

const userDisplayName = computed(() => user.value?.displayName ?? 'Visitante')
const loadingMessage = computed(() => 'Carregando...')
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

const studySession = useStudySession()

async function syncStudyRoute() {
  if (route.name === 'study') {
    studySession.resetStudySession()
    return
  }

  if (route.name === 'study-deck') {
    const deckId = routeDeckId()
    if (!deckId) {
      await router.replace({ name: 'study' })
      return
    }
    await studySession.loadStudyDeck(deckId)
    return
  }

  if (route.name === 'study-interleaved') {
    const ids = route.query.decks
      ? (route.query.decks as string).split(',').map(Number).filter(n => !Number.isNaN(n))
      : []
    await studySession.prepareInterleavedPracticeSelection(ids)
    if (ids.length > 0) {
      await studySession.startInterleavedPracticeSession()
    }
  }
}

function cleanupStudyRoute() {
  studySession.resetStudySession()
}

async function logout() {
  closeManagedDeck(true, false)
  exitDeckSelectionMode()
  studySession.clearPublicStudyDeckCache()
  authStore.clearSession()
  clearStats()
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
  authFlow.resetAuthValidation()
}

async function openAuth(mode: AuthMode = 'login') {
  await authFlow.openAuth(mode)
}

async function startInterleavedPractice() {
  if (route.name === 'study-interleaved') {
    await router.push({ name: 'study' })
    return
  }
  await router.push({ name: 'study-interleaved' })
}

useRouteLifecycle({
  route,
  syncLibraryRoute,
  cleanupLibraryRoute,
  syncStudyRoute,
  cleanupStudyRoute,
  syncProgressRoute
})

const authRouteContext = {
  ...authFlow,
  goHome
}

provide(authRouteKey, authRouteContext)

provide(createDeckRouteKey, {
  ...createDeckFlow,
  user,
})

provide(progressRouteKey, {
  user,
  stats
})

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

      <CardEditorOverlay
        v-if="cardEditorOpen && managedDeck"
        v-model:front-html="cardEditorForm.frontHtml"
        v-model:back-html="cardEditorForm.backHtml"
        v-model:tags="cardEditorForm.tags"
        :deck-id="managedDeck.id"
        :deck-title="managedDeck.title"
        :title="cardEditorTitle"
        :front-preview-html="cardEditorFrontPreview"
        :back-preview-html="cardEditorBackPreview"
        :upload-media="uploadCardEditorMedia"
        @save="saveCardEditor"
        @close="closeCardEditor()"
        @upload-error="handleCardEditorUploadError"
      />
  </AppShell>
</template>
