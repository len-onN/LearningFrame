<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppShell from './layouts/AppShell.vue'
import { api } from './services/api'
import type {
  CardResponse,
  DeckSummary,
  DeckVisibility,
  LocalDeck,
  ReviewRating,
  StudyCard,
  StudyCardResponse
} from './types/api'
import {
  deckDetailToLocal,
  loadLocalStates,
  localDeckToStudyCards,
  saveLocalStates
} from './utils/localStudy'
import CardEditorOverlay from './features/library/CardEditorOverlay.vue'
import { useDeckLibrary } from './features/library/useDeckLibrary'
import { cardCountLabel, deckDueLabel } from './features/library/deckFormatters'
import { cardTextSummary as summarizeCardText } from './features/library/cardText'
import { useDeckManagement } from './features/library/useDeckManagement'
import { htmlSummary } from './features/import/importPreview'
import { useApkgImport } from './features/import/useApkgImport'
import {
  studyFeedbackFromResult,
  studyFeedbackFromReviewResult,
  type StudyReviewFeedback
} from './features/study/studyFeedback'
import { useStudySession } from './features/study/useStudySession'
import {
  authRouteKey,
  createDeckRouteKey,
  importRouteKey,
  libraryRouteKey,
  progressRouteKey,
  studyRouteKey
} from './routes/routeContext'
import { nextReview } from './utils/srs'
import { validateAuthForm, type AuthErrors, type AuthField, type AuthMode } from './utils/authValidation'
import { useAppNavigation } from './app/useAppNavigation'
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
const publicStudyDeckCache = ref<LocalDeck[]>([])
const localStates = ref(loadLocalStates())
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

const deckForm = ref({
  title: '',
  description: '',
  visibility: 'PRIVATE' as DeckVisibility
})

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
  setStudySessionCards,
  completeCurrentReview
} = useStudySession()
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
  withFeedback
})

watch(librarySection, (section) => {
  if (section !== 'mine') {
    closeManagedDeck(true, false)
    exitDeckSelectionMode()
  }
  const query = currentLibraryQuery()
  if (section === 'public' && (!publicDeckPage.value || publicDeckQuery.value !== query)) {
    void withFeedback(async () => loadPublicDecks(true), { showLoading: false })
  }
  if (section === 'mine' && user.value && (!myDeckPage.value || myDeckQuery.value !== query)) {
    void withFeedback(async () => loadMyDecks(true), { showLoading: false })
  }
})

watch(tab, (nextTab) => {
  if (nextTab !== 'library') {
    closeCardEditor(true)
  }
})

onBeforeUnmount(() => {
  disposeApkgImport()
})

async function syncLibraryRoute() {
  if (route.name !== 'library-deck-manage' && managedDeck.value) {
    closeManagedDeck(true, false)
  }
  if (route.name !== 'library-mine') {
    exitDeckSelectionMode()
  }

  if (route.name === 'library-public') {
    await withFeedback(async () => {
      if (!publicDeckPage.value || publicDeckQuery.value !== currentLibraryQuery()) {
        await loadPublicDecks(true)
      }
    }, { showLoading: false, clearOnStart: false })
    return
  }

  if (route.name === 'library-mine') {
    await withFeedback(async () => {
      if (user.value && (!myDeckPage.value || myDeckQuery.value !== currentLibraryQuery())) {
        await loadMyDecks(true)
      }
    }, { showLoading: false, clearOnStart: false })
    return
  }

  if (route.name === 'library-deck-manage') {
    const deckId = routeDeckId()
    if (!deckId) {
      await router.replace({ name: 'library-mine' })
      return
    }
    if (!user.value) {
      return
    }
    librarySearch.value = ''
    await loadManagedDeckRoute(deckId)
  }
}

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

function cleanupLibraryRoute() {
  closeManagedDeck(true, false)
  exitDeckSelectionMode()
}

function cleanupStudyRoute() {
  resetStudySession()
}

async function refreshAll() {
  await withFeedback(async () => {
    await loadPublicDecks(true)
    if (user.value) {
      await loadMyDecks(true)
      await refreshStats()
    }
  }, { showLoading: false })
}

async function loadMorePublicDecks() {
  await withFeedback(async () => {
    await loadPublicDecks()
  }, { showLoading: false })
}

async function loadMoreMyDecks() {
  await withFeedback(async () => {
    await loadMyDecks()
  }, { showLoading: false })
}

async function savePublicDeck(deck: DeckSummary) {
  if (!user.value) {
    await openAuth('login')
    showNotice('Entre para salvar este baralho em Meus baralhos.')
    return
  }

  await withFeedback(async () => {
    const saved = await api.copyPublicDeck(deck.id)
    librarySearch.value = ''
    await loadMyDecks(true)
    await refreshStats()
    await router.push({ name: 'library-mine' })
    showNotice('Baralho salvo em Meus baralhos como copia privada.')
    await highlightDeck(saved.id)
  })
}

async function deleteSelectedMyDecks() {
  const deckIds = [...selectedMyDeckIds.value]
  if (deckIds.length === 0) {
    return
  }
  const label = deckIds.length === 1 ? '1 baralho selecionado' : `${deckIds.length} baralhos selecionados`
  if (!window.confirm(`Excluir ${label} e todas as suas cartas?`)) {
    return
  }

  await withFeedback(async () => {
    await api.deleteDecks(deckIds)
    exitDeckSelectionMode()
    await loadMyDecks(true)
    if (user.value) {
      await refreshStats()
    }
    showNotice(deckIds.length === 1 ? 'Baralho excluido.' : 'Baralhos selecionados excluidos.')
  })
}

function clearSelectedMyDecks() {
  clearMyDeckSelection()
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
  publicStudyDeckCache.value = []
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

async function loadStudyDeck(deckId: number) {
  answerVisible.value = false

  await withFeedback(async () => {
    const metadata = await api.deckMetadata(deckId).catch(() => null)
    sessionTitle.value = metadata?.title ?? 'Baralho'
    let cards: StudyCard[]
    if (user.value) {
      const due = await api.due('SINGLE_DECK', deckId)
      cards = due.cards.map(serverCardToStudyCard)
    } else {
      const localDeck = await ensurePublicDeck(deckId)
      sessionTitle.value = localDeck.title
      cards = localDeckToStudyCards(localDeck, localStates.value)
    }
    setStudySessionCards(cards, metadata?.cardCount === 0 ? 'empty-deck' : 'no-due')
    if (cards.length === 0) {
      showNotice('Nenhum card vencido agora para esta sessao.')
    }
  })
}

async function loadInterleavedPractice() {
  sessionTitle.value = 'Prática intercalada'
  answerVisible.value = false

  await withFeedback(async () => {
    let cards: StudyCard[]
    if (user.value) {
      const due = await api.due('MIXED_DUE')
      cards = due.cards.map(serverCardToStudyCard)
    } else {
      if (publicDecks.value.length === 0) {
        await loadPublicDecks(true)
      }
      cards = []
      for (const deck of publicDecks.value.slice(0, 4)) {
        const localDeck = await ensurePublicDeck(deck.id)
        cards.push(...localDeckToStudyCards(localDeck, localStates.value))
      }
    }
    setStudySessionCards(cards, 'no-due')
    if (cards.length === 0) {
      showNotice('Prática intercalada sem cards vencidos agora.')
    }
  })
}

async function reviewCurrent(rating: ReviewRating) {
  const card = currentCard.value
  if (!card) {
    return
  }

  await withFeedback(async () => {
    let feedback: StudyReviewFeedback | null = null
    if (card.local) {
      const result = nextReview(localStates.value[card.clientId], rating)
      localStates.value[card.clientId] = result
      saveLocalStates(localStates.value)
      feedback = studyFeedbackFromResult(rating, result.dueAt, result.intervalDays)
    } else if (card.cardId) {
      const result = await api.review(card.cardId, rating)
      feedback = studyFeedbackFromReviewResult(result)
      if (user.value) {
        await refreshStats()
      }
    }
    completeCurrentReview(rating, feedback)
  }, false)
}

async function createDeck() {
  await withFeedback(async () => {
    const created = await api.createDeck(deckForm.value.title, deckForm.value.description, deckForm.value.visibility)
    deckForm.value = { title: '', description: '', visibility: 'PRIVATE' }
    await loadMyDecks(true)
    setManagedDeck(created)
    await router.push({ name: 'library-deck-manage', params: { deckId: created.id } })
    showNotice('Baralho criado. Adicione as primeiras cartas.')
  })
}

async function openManagedDeck(deck: DeckSummary, showLoading = true) {
  if (!user.value) {
    await openAuth('login')
    return
  }
  await withFeedback(async () => {
    setManagedDeck(deck)
    librarySearch.value = ''
    await router.push({ name: 'library-deck-manage', params: { deckId: deck.id } })
  }, showLoading)
}

async function ensurePublicDeck(deckId: number) {
  const localId = `public:${deckId}`
  const existing = publicStudyDeckCache.value.find((deck) => deck.id === localId)
  if (existing) {
    publicStudyDeckCache.value = [
      existing,
      ...publicStudyDeckCache.value.filter((deck) => deck.id !== localId)
    ]
    return existing
  }

  const detail = await api.deck(deckId)
  const localDeck = deckDetailToLocal(detail)
  publicStudyDeckCache.value = [localDeck, ...publicStudyDeckCache.value]
    .slice(0, PUBLIC_STUDY_DECK_CACHE_LIMIT)
  return localDeck
}

function serverCardToStudyCard(card: StudyCardResponse): StudyCard {
  return {
    clientId: `server:${card.cardId}`,
    cardId: card.cardId,
    deckId: card.deckId,
    deckTitle: card.deckTitle,
    frontHtml: card.frontHtml,
    backHtml: card.backHtml,
    tags: card.tags,
    dueAt: card.dueAt,
    intervalDays: card.intervalDays,
    repetitions: card.repetitions,
    easeFactor: 2.5,
    newCard: card.newCard,
    local: false
  }
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
  deckForm,
  user,
  createDeck
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
