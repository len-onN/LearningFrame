<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppShell from './layouts/AppShell.vue'
import { api } from './services/api'
import type {
  CardResponse,
  DeckSummary
} from './types/api'
import CardEditorOverlay from './features/library/CardEditorOverlay.vue'
import { useDeckLibrary } from './features/library/useDeckLibrary'
import { useLibraryActions } from './features/library/useLibraryActions'
import { cardCountLabel, deckDueLabel } from './features/library/deckFormatters'
import { cardTextSummary as summarizeCardText } from './features/library/cardText'
import { useDeckManagement } from './features/library/useDeckManagement'
import { useCreateDeckFlow } from './features/create/useCreateDeckFlow'
import { htmlSummary } from './features/import/importPreview'
import { useApkgImport } from './features/import/useApkgImport'
import { useStudySession } from './features/study/useStudySession'
import {
  authRouteKey,
  createDeckRouteKey,
  importRouteKey,
  libraryRouteKey,
  progressRouteKey,
  studyRouteKey
} from './routes/routeContext'
import { validateAuthForm, type AuthErrors, type AuthField, type AuthMode } from './utils/authValidation'
import { useAppNavigation } from './app/useAppNavigation'
import { useLibraryRouteSync } from './app/useLibraryRouteSync'
import { useLibrarySearchLifecycle } from './app/useLibrarySearchLifecycle'
import { useRouteLifecycle } from './app/useRouteLifecycle'
import { useStatsSummary } from './app/useStatsSummary'
import { useAuthSession } from './composables/useAuthSession'
import { useFeedback } from './composables/useFeedback'
import { useTheme } from './composables/useTheme'

const DECK_PAGE_SIZE = 8
const CARD_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300
const PUBLIC_STUDY_DECK_CACHE_LIMIT = 6

const route = useRoute()
const router = useRouter()
const { user, persistSession, clearSession } = useAuthSession()
const {
  themePreference,
  nextThemeLabel,
  toggleThemePreference,
  applyThemePreference
} = useTheme()
const {
  notice,
  error,
  loading,
  showNotice,
  showError,
  clearFeedback,
  clearFeedbackForRouteChange,
  withFeedback,
  dismissNotice,
  dismissError
} = useFeedback()
const {
  tab,
  librarySection,
  libraryView,
  authMode,
  sidebarCollapsed,
  sidebarToggleLabel,
  visibleTabs,
  currentTitle,
  toggleSidebar,
  navigateTo,
  navigateToMyDecks,
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
  publicDecks,
  myDecks,
  publicDeckPage,
  myDeckPage,
  publicDeckQuery,
  myDeckQuery,
  highlightedDeckId,
  deckSelectionMode,
  selectedMyDeckIds,
  publicDecksHasMore,
  myDecksHasMore,
  filteredPublicDecks,
  filteredMyDecks,
  selectedMyDecksCount,
  allVisibleMyDecksSelected,
  activeLibraryCountLabel,
  currentLibraryQuery,
  loadPublicDecks,
  loadMyDecks,
  highlightDeck,
  toggleDeckSelectionMode,
  exitDeckSelectionMode,
  toggleMyDeckSelection,
  toggleVisibleMyDeckSelection,
  clearMyDeckSelection
} = useDeckLibrary({
  librarySection,
  user,
  pageSize: DECK_PAGE_SIZE
})
const {
  stats,
  refreshStats,
  clearStats,
  syncProgressRoute
} = useStatsSummary({
  route,
  user,
  withFeedback
})

const authForm = ref({
  displayName: '',
  email: '',
  password: ''
})
const authTouched = ref<Record<AuthField, boolean>>({
  displayName: false,
  email: false,
  password: false
})
const authSubmitted = ref(false)

const {
  managedDeck,
  managedDeckForm,
  managedDeckDirty,
  managedCards,
  managedCardsSearch,
  selectedManagedCardIds,
  managedCardsView,
  cardEditorOpen,
  cardEditorForm,
  cardEditorTitle,
  cardEditorFrontPreview,
  cardEditorBackPreview,
  setManagedDeck,
  updateManagedDeckForm,
  loadManagedDeckRoute,
  closeManagedDeck,
  loadManagedCards,
  loadMoreManagedCards,
  saveManagedDeck,
  deleteManagedDeck,
  openCreateCardEditor,
  openEditCardEditor,
  closeCardEditor,
  saveCardEditor,
  deleteManagedCard,
  deleteSelectedManagedCards,
  selectManagedCard,
  toggleManagedCardSelection,
  toggleVisibleManagedCardsSelection,
  clearManagedCardSelection,
  uploadCardEditorMedia,
  handleCardEditorUploadError
} = useDeckManagement({
  pageSize: CARD_PAGE_SIZE,
  searchDebounceMs: SEARCH_DEBOUNCE_MS,
  showNotice,
  showError,
  withFeedback,
  loadMyDecks,
  refreshStats,
  navigateToMyDecks
})

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
  },
  withFeedback
})

const {
  refreshAll,
  loadMorePublicDecks,
  loadMoreMyDecks,
  savePublicDeck,
  deleteSelectedMyDecks,
  clearSelectedMyDecks,
  openManagedDeck
} = useLibraryActions({
  user,
  librarySearch,
  selectedMyDeckIds,
  loadPublicDecks,
  loadMyDecks,
  setManagedDeck,
  highlightDeck,
  exitDeckSelectionMode,
  clearMyDeckSelection,
  openAuth,
  navigateToMyDecks,
  navigateToManagedDeck,
  refreshStats,
  showNotice,
  withFeedback
})

const createDeckFlow = useCreateDeckFlow({
  client: api,
  loadMyDecks,
  setManagedDeck,
  navigateToManagedDeck,
  showNotice,
  withFeedback
})

const {
  selectedFile,
  importVisibility,
  importTitle,
  importPreview,
  importSaving,
  currentPreviewCard,
  currentPreviewHtml,
  previewCardIndex,
  previewFace,
  previewPickerOpen,
  previewCardSearch,
  previewCardOptions,
  previewCardTitle,
  handleApkgChange,
  selectPreviewCard,
  movePreviewCard,
  togglePreviewFace,
  persistImport,
  consumeReturnToImportAfterAuth,
  clearImportStateForRouteChange,
  disposeApkgImport
} = useApkgImport({
  route,
  user,
  openAuth,
  loadMyDecks,
  refreshStats,
  highlightDeck,
  navigateToMyDecks,
  showNotice,
  showError,
  withFeedback,
  client: api
})

const {
  studyQueue,
  sessionTitle,
  answerVisible,
  lastStudyFeedback,
  studyEmptyReason,
  currentCard,
  frontHtml,
  backHtml,
  currentDueLabel,
  studyProgress,
  studySummary,
  resetStudySession,
  loadStudyDeck,
  loadInterleavedPractice,
  reviewCurrent,
  clearPublicStudyDeckCache
} = useStudySession({
  user,
  publicDecks,
  loadPublicDecks,
  refreshStats,
  showNotice,
  withFeedback,
  client: api,
  publicDeckCacheLimit: PUBLIC_STUDY_DECK_CACHE_LIMIT
})
const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))
const userDisplayName = computed(() => user.value?.displayName ?? 'Visitante')
const deckFormatters = {
  cardCount: cardCountLabel,
  due: (deck: DeckSummary) => deckDueLabel(deck, Boolean(user.value))
}
const cardTextSummary = (card: CardResponse) => summarizeCardText(card, managedCards.value, htmlSummary)
const loadingMessage = computed(() => importSaving.value ? 'Preparando seu baralho com mídia...' : 'Carregando...')
onMounted(() => {
  applyThemePreference()
})

useLibrarySearchLifecycle({
  librarySearch,
  librarySection,
  user,
  delayMs: SEARCH_DEBOUNCE_MS,
  loadPublicDecks,
  loadMyDecks,
  shouldLoadPublicDecks,
  shouldLoadMyDecks,
  withFeedback
})

watch(tab, (nextTab) => {
  if (nextTab !== 'library') {
    closeCardEditor(true)
  }
})

onBeforeUnmount(() => {
  disposeApkgImport()
})

async function syncStudyRoute() {
  if (route.name === 'study') {
    resetStudySession()
    return
  }

  if (route.name === 'study-deck') {
    const deckId = routeDeckId()
    if (!deckId) {
      await router.replace({ name: 'study' })
      return
    }
    await loadStudyDeck(deckId)
    return
  }

  if (route.name === 'study-interleaved') {
    await loadInterleavedPractice()
  }
}

function cleanupStudyRoute() {
  resetStudySession()
}

async function submitAuth() {
  markAuthSubmitted()
  if (hasAuthErrors()) {
    return
  }

  await withFeedback(async () => {
    const response = authMode.value === 'login'
      ? await api.login(authForm.value.email, authForm.value.password)
      : await api.register(authForm.value.displayName, authForm.value.email, authForm.value.password)

    persistSession(response.user, response.token)
    authForm.value.password = ''
    resetAuthValidation()
    await refreshAll()
    if (consumeReturnToImportAfterAuth()) {
      await router.replace({ name: 'import' })
    } else if (typeof route.query.redirect === 'string' && route.query.redirect) {
      await router.replace(route.query.redirect)
    } else {
      await router.replace({ name: 'library-mine' })
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
  authTouched.value = {
    displayName: false,
    email: false,
    password: false
  }
}

async function logout() {
  closeManagedDeck(true, false)
  exitDeckSelectionMode()
  clearPublicStudyDeckCache()
  clearSession()
  clearStats()
  myDecks.value = []
  myDeckPage.value = null
  myDeckQuery.value = ''
  await router.replace({ name: 'library-public' })
  showNotice('Modo anonimo ativado.')
}

async function goHome() {
  closeManagedDeck(true, false)
  await router.push({ name: 'library-public' })
  dismissError()
  resetAuthValidation()
}

async function openAuth(mode: AuthMode = 'login') {
  closeManagedDeck(true, false)
  const redirect = route.meta.requiresAuth ? route.fullPath : route.query.redirect
  await router.push({
    name: mode === 'login' ? 'login' : 'register',
    query: typeof redirect === 'string' && redirect ? { redirect } : {}
  })
  clearFeedback()
  resetAuthValidation()
}

async function toggleAuthMode() {
  await router.push({
    name: authMode.value === 'login' ? 'register' : 'login',
    query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {}
  })
  dismissError()
  resetAuthValidation()
}

async function startDeck(deck: DeckSummary) {
  sessionTitle.value = deck.title
  if (route.name === 'study-deck' && routeDeckId() === deck.id) {
    await loadStudyDeck(deck.id)
    return
  }
  await router.push({ name: 'study-deck', params: { deckId: deck.id } })
}

async function startInterleavedPractice() {
  if (route.name === 'study-interleaved') {
    await loadInterleavedPractice()
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
  syncProgressRoute,
  clearFeedbackForRouteChange,
  clearImportStateForRouteChange
})

provide(authRouteKey, {
  authForm,
  authMode,
  authFieldError,
  submitAuth,
  goHome,
  toggleAuthMode,
  touchAuthField
})

provide(libraryRouteKey, {
  librarySearch,
  librarySection,
  libraryView,
  user,
  activeLibraryCountLabel,
  filteredPublicDecks,
  filteredMyDecks,
  publicDecksHasMore,
  myDecksHasMore,
  highlightedDeckId,
  deckSelectionMode,
  selectedMyDeckIds,
  selectedMyDecksCount,
  allVisibleMyDecksSelected,
  managedDeck,
  managedDeckForm,
  managedDeckDirty,
  managedCardsView,
  managedCardsSearch,
  deckFormatters,
  cardTextSummary,
  cardCountLabel,
  navigateTo,
  refreshAll,
  startDeck,
  savePublicDeck,
  loadMorePublicDecks,
  loadMoreMyDecks,
  openManagedDeck,
  toggleDeckSelectionMode,
  toggleVisibleMyDeckSelection,
  clearSelectedMyDecks,
  deleteSelectedMyDecks,
  toggleMyDeckSelection,
  openAuth,
  closeManagedDeck,
  saveManagedDeck,
  deleteManagedDeck,
  updateManagedDeckForm,
  openCreateCardEditor,
  toggleVisibleManagedCardsSelection,
  clearManagedCardSelection,
  deleteSelectedManagedCards,
  selectManagedCard,
  toggleManagedCardSelection,
  loadMoreManagedCards,
  openEditCardEditor,
  deleteManagedCard
})

provide(studyRouteKey, {
  sessionTitle,
  studyQueue,
  currentCard,
  currentDueLabel,
  frontHtml,
  backHtml,
  answerVisible,
  studyProgress,
  studyEmptyReason,
  lastStudyFeedback,
  studySummary,
  goToLibrary: goHome,
  startInterleavedPractice,
  reviewCurrent
})

provide(importRouteKey, {
  importTitle,
  importVisibility,
  selectedFile,
  loading,
  importPreview,
  currentPreviewCard,
  previewCardIndex,
  previewFace,
  previewPickerOpen,
  previewCardSearch,
  previewCardOptions,
  previewCardTitle,
  currentPreviewHtml,
  user,
  handleApkgChange,
  selectPreviewCard,
  movePreviewCard,
  togglePreviewFace,
  persistImport
})

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
    :loading="loading"
    :loading-message="loadingMessage"
    :notice="notice"
    :error="error"
    @go-home="goHome"
    @toggle-sidebar="toggleSidebar"
    @toggle-theme="toggleThemePreference"
    @start-interleaved="startInterleavedPractice"
    @login="openAuth('login')"
    @logout="logout"
    @dismiss-notice="dismissNotice"
    @dismiss-error="dismissError"
  >

      <RouterView />

      <CardEditorOverlay
        v-if="cardEditorOpen && managedDeck"
        v-model:front-html="cardEditorForm.frontHtml"
        v-model:back-html="cardEditorForm.backHtml"
        v-model:tags="cardEditorForm.tags"
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
