<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import {
  BarChart3,
  BookOpen,
  Brain,
  Plus,
  Upload
} from '@lucide/vue'
import AppShell from './layouts/AppShell.vue'
import { api } from './services/api'
import type {
  ApkgImportResponse,
  ApkgPreviewResponse,
  CardResponse,
  DeckSummary,
  DeckVisibility,
  LocalDeck,
  ReviewRating,
  StatsSummary,
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
import type { LibrarySection, LibraryView } from './features/library/libraryTypes'
import { normalizeSearch, useDeckLibrary } from './features/library/useDeckLibrary'
import { cardCountLabel, deckDueLabel } from './features/library/deckFormatters'
import { cardTextSummary as summarizeCardText } from './features/library/cardText'
import { useDeckManagement } from './features/library/useDeckManagement'
import type { PreviewFace } from './features/import/importTypes'
import {
  htmlSummary,
  previewCardOptionLabel,
  previewCardSearchText,
  previewCardTitle as formatPreviewCardTitle
} from './features/import/importPreview'
import {
  emptyStudyRatingCounts,
  studyFeedbackFromResult,
  studyFeedbackFromReviewResult,
  type StudyRatingCounts,
  type StudyReviewFeedback
} from './features/study/studyFeedback'
import {
  authRouteKey,
  createDeckRouteKey,
  importRouteKey,
  libraryRouteKey,
  progressRouteKey,
  studyRouteKey,
  type StudyEmptyReason
} from './routes/routeContext'
import { nextReview } from './utils/srs'
import { extractRelativeMediaSources, safePreviewHtml, safeStudyHtml } from './utils/html'
import { createApkgMediaIndex, normalizeMediaName, type ApkgMediaIndex } from './utils/apkgMedia'
import { formatDueIn } from './utils/dueTime'
import { validateAuthForm, type AuthErrors, type AuthField, type AuthMode } from './utils/authValidation'
import { useAuthSession } from './composables/useAuthSession'
import { useFeedback } from './composables/useFeedback'
import { useTheme } from './composables/useTheme'

type Tab = 'library' | 'study' | 'import' | 'create' | 'progress' | 'auth'
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
const tab = computed<Tab>(() => route.meta.tab ?? 'library')
const librarySection = computed<LibrarySection>(() => route.meta.librarySection ?? 'public')
const libraryView = computed<LibraryView>(() => route.meta.libraryView ?? 'decks')
const authMode = computed<AuthMode>(() => route.meta.authMode ?? 'login')
const sidebarCollapsed = ref(false)
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
  clearHighlightDeckTimer,
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
const stats = ref<StatsSummary | null>(null)

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
  showNotice,
  showError,
  withFeedback,
  loadMyDecks,
  refreshStats,
  navigateToMyDecks
})

const selectedFile = ref<File | null>(null)
const importVisibility = ref<DeckVisibility>('PRIVATE')
const importTitle = ref('')
const importPreview = ref<ApkgPreviewResponse | null>(null)
const importResult = ref<ApkgImportResponse | null>(null)
const returnToImportAfterAuth = ref(false)
const previewCardIndex = ref(0)
const previewFace = ref<PreviewFace>('front')
const previewPickerOpen = ref(false)
const previewCardSearch = ref('')
const previewMediaIndex = ref<ApkgMediaIndex | null>(null)
const previewMediaUrls = ref<Record<string, string>>({})
const importSaving = ref(false)

const studyQueue = ref<StudyCard[]>([])
const sessionTitle = ref('Selecione um baralho ou inicie a prática intercalada.')
const answerVisible = ref(false)
const studyInitialTotal = ref(0)
const studyReviewedCount = ref(0)
const studyRatingCounts = ref<StudyRatingCounts>(emptyStudyRatingCounts())
const lastStudyFeedback = ref<StudyReviewFeedback | null>(null)
const studyEmptyReason = ref<StudyEmptyReason>('idle')

const currentCard = computed(() => studyQueue.value[0])
const frontHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.frontHtml, currentCard.value.deckId) : '')
const backHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.backHtml, currentCard.value.deckId) : '')
const currentDueLabel = computed(() => currentCard.value ? formatDueIn(currentCard.value.dueAt) : '')
const studyProgress = computed(() => {
  const initialTotal = studyInitialTotal.value
  const reviewed = studyReviewedCount.value
  return {
    initialTotal,
    reviewed,
    remaining: Math.max(0, initialTotal - reviewed),
    percent: initialTotal > 0 ? Math.round((reviewed / initialTotal) * 100) : 0
  }
})
const studySummary = computed(() => studyEmptyReason.value === 'completed' && studyReviewedCount.value > 0
  ? {
      reviewed: studyReviewedCount.value,
      ratingCounts: studyRatingCounts.value,
      lastFeedback: lastStudyFeedback.value
    }
  : null
)
const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))
const sidebarToggleLabel = computed(() => sidebarCollapsed.value ? 'Expandir menu' : 'Recolher menu')
const userDisplayName = computed(() => user.value?.displayName ?? 'Visitante')
const deckFormatters = {
  cardCount: cardCountLabel,
  due: (deck: DeckSummary) => deckDueLabel(deck, Boolean(user.value))
}
const cardTextSummary = (card: CardResponse) => summarizeCardText(card, managedCards.value, htmlSummary)
const loadingMessage = computed(() => importSaving.value ? 'Preparando seu baralho com mídia...' : 'Carregando...')
const currentPreviewCard = computed(() => importPreview.value?.cards[previewCardIndex.value] ?? null)
const currentPreviewHtml = computed(() => {
  const card = currentPreviewCard.value
  if (!card) {
    return ''
  }
  const html = previewFace.value === 'front' ? card.frontHtml : card.backHtml
  return safePreviewHtml(html, {
    resolveMediaUrl: (fileName) => previewMediaUrls.value[normalizeMediaName(fileName)] ?? null
  })
})
const previewCardOptions = computed(() => {
  const query = normalizeSearch(previewCardSearch.value)
  const cards = importPreview.value?.cards ?? []
  return cards
    .map((card, index) => ({
      index,
      label: previewCardOptionLabel(card, index),
      searchText: previewCardSearchText(card, index)
    }))
    .filter((card) => !query || card.searchText.includes(query))
})
const previewCardTitle = (index: number) => formatPreviewCardTitle(index, importPreview.value?.cards.length ?? 0)
const navTabs = [
  { id: 'library' as const, label: 'Biblioteca', icon: BookOpen, to: { name: 'library-public' } },
  { id: 'study' as const, label: 'Estudo', icon: Brain, to: { name: 'study' } },
  { id: 'import' as const, label: 'Importar', icon: Upload, to: { name: 'import' } },
  { id: 'create' as const, label: 'Criar', icon: Plus, to: { name: 'create' } },
  { id: 'progress' as const, label: 'Progresso', icon: BarChart3, to: { name: 'progress' } }
]
const visibleTabs = computed(() => navTabs.filter((item) => item.id !== 'create' || user.value))
const currentTitle = computed(() => {
  if (tab.value === 'auth') {
    return authMode.value === 'login' ? 'Entrar' : 'Criar conta'
  }
  if (tab.value === 'library' && libraryView.value === 'manage-deck') {
    return managedDeck.value?.title ?? 'Gerenciar baralho'
  }
  return route.meta.title ?? navTabs.find((item) => item.id === tab.value)?.label ?? 'Biblioteca'
})

onMounted(() => {
  applyThemePreference()
})

let librarySearchTimer: number | undefined
let managedCardsSearchTimer: number | undefined

watch(librarySearch, () => {
  window.clearTimeout(librarySearchTimer)
  librarySearchTimer = window.setTimeout(() => {
    if (librarySection.value === 'public') {
      void withFeedback(async () => loadPublicDecks(true), { showLoading: false })
    }
    if (librarySection.value === 'mine' && user.value) {
      void withFeedback(async () => loadMyDecks(true), { showLoading: false })
    }
  }, SEARCH_DEBOUNCE_MS)
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

watch(managedCardsSearch, () => {
  window.clearTimeout(managedCardsSearchTimer)
  managedCardsSearchTimer = window.setTimeout(() => {
    if (managedDeck.value) {
      void withFeedback(async () => loadManagedCards(true), { showLoading: false })
    }
  }, SEARCH_DEBOUNCE_MS)
})

watch(tab, (nextTab) => {
  if (nextTab !== 'library') {
    closeCardEditor(true)
  }
})

watch(() => route.fullPath, (nextFullPath, previousFullPath) => {
  clearFeedbackForRouteChange(previousFullPath, nextFullPath)
  clearImportStateForRouteChange(previousFullPath)
}, { immediate: true })

onBeforeUnmount(() => {
  revokePreviewMediaUrls()
  clearHighlightDeckTimer()
  window.clearTimeout(librarySearchTimer)
  window.clearTimeout(managedCardsSearchTimer)
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

async function syncProgressRoute() {
  if (route.name === 'progress' && user.value) {
    await withFeedback(async () => {
      await refreshStats()
    }, { showLoading: false, clearOnStart: false })
  }
}

async function refreshStats() {
  if (user.value) {
    stats.value = await api.stats()
  }
}

function cleanupLibraryRoute() {
  closeManagedDeck(true, false)
  exitDeckSelectionMode()
}

function cleanupStudyRoute() {
  resetStudySession()
}

function routeDeckId() {
  const raw = Array.isArray(route.params.deckId) ? route.params.deckId[0] : route.params.deckId
  const deckId = Number(raw)
  return Number.isFinite(deckId) && deckId > 0 ? deckId : null
}

async function refreshAll() {
  await withFeedback(async () => {
    await loadPublicDecks(true)
    if (user.value) {
      await loadMyDecks(true)
      stats.value = await api.stats()
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
    stats.value = await api.stats()
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
      stats.value = await api.stats()
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
    if (returnToImportAfterAuth.value && importPreview.value) {
      await router.replace({ name: 'import' })
      returnToImportAfterAuth.value = false
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
  stats.value = null
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

function resetStudySession() {
  studyQueue.value = []
  sessionTitle.value = 'Selecione um baralho ou inicie a prática intercalada.'
  answerVisible.value = false
  studyInitialTotal.value = 0
  studyReviewedCount.value = 0
  studyRatingCounts.value = emptyStudyRatingCounts()
  lastStudyFeedback.value = null
  studyEmptyReason.value = 'idle'
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
        stats.value = await api.stats()
      }
    }
    studyReviewedCount.value += 1
    studyRatingCounts.value = {
      ...studyRatingCounts.value,
      [rating]: studyRatingCounts.value[rating] + 1
    }
    lastStudyFeedback.value = feedback
    studyQueue.value.shift()
    answerVisible.value = false
    if (studyQueue.value.length === 0) {
      studyEmptyReason.value = 'completed'
    }
  }, false)
}

function setStudySessionCards(cards: StudyCard[], emptyReason: StudyEmptyReason) {
  studyQueue.value = cards
  studyInitialTotal.value = cards.length
  studyReviewedCount.value = 0
  studyRatingCounts.value = emptyStudyRatingCounts()
  lastStudyFeedback.value = null
  studyEmptyReason.value = cards.length > 0 ? 'idle' : emptyReason
  answerVisible.value = false
}

async function handleApkgChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  const requestId = ++importPreviewRequest
  resetImportPreviewState()
  selectedFile.value = file

  if (!file) {
    return
  }

  await withFeedback(async () => {
    try {
      const [preview, mediaIndex] = await Promise.all([
        api.previewApkg(file),
        createApkgMediaIndex(file).catch(() => null)
      ])
      if (requestId !== importPreviewRequest) {
        return
      }
      previewMediaIndex.value = mediaIndex
      const mediaRequestId = ++previewMediaRequest
      const urls = preview.cards[0] ? await readPreviewMediaUrls(preview.cards[0], 'front') : {}
      if (mediaRequestId !== previewMediaRequest || requestId !== importPreviewRequest) {
        revokePreviewMediaUrls(urls)
        return
      }
      previewMediaUrls.value = urls
      previewCardIndex.value = 0
      previewFace.value = 'front'
      importPreview.value = preview
      importTitle.value = preview.title
      showNotice(preview.mediaFound > 0
        ? 'APKG analisado. A midia sera exibida na previa enquanto este arquivo estiver selecionado.'
        : 'APKG analisado. Revise a previa e salve em Meus baralhos.')
    } finally {
      input.value = ''
    }
  })
}

async function persistImport() {
  if (!selectedFile.value) {
    showError('Selecione o arquivo .apkg novamente.')
    return
  }

  if (!user.value) {
    returnToImportAfterAuth.value = true
    await openAuth('login')
    showNotice('Entre para salvar o APKG com midia em Meus baralhos.')
    return
  }

  importSaving.value = true
  try {
    await withFeedback(async () => {
      const result = await api.importApkg(selectedFile.value as File, importTitle.value, importVisibility.value)
      importResult.value = result
      resetImportPreviewState()
      selectedFile.value = null
      await loadMyDecks(true)
      if (user.value) {
        stats.value = await api.stats()
      }
      await router.push({ name: 'library-mine' })
      showNotice(result.mediaImported > 0
        ? `Baralho APKG salvo com ${result.cardsImported} cartas e ${result.mediaImported} midias.`
        : 'Baralho APKG salvo em Meus baralhos.')
      await highlightDeck(result.deckId)
    })
  } finally {
    importSaving.value = false
  }
}

function resetImportPreviewState() {
  previewMediaRequest++
  revokePreviewMediaUrls()
  importPreview.value = null
  importResult.value = null
  importTitle.value = ''
  previewCardIndex.value = 0
  previewFace.value = 'front'
  previewPickerOpen.value = false
  previewCardSearch.value = ''
  previewMediaIndex.value = null
}

function clearImportWorkflowState() {
  importPreviewRequest++
  resetImportPreviewState()
  selectedFile.value = null
  importSaving.value = false
  returnToImportAfterAuth.value = false
}

function clearImportStateForRouteChange(previousFullPath?: string) {
  if (!previousFullPath) {
    return
  }

  const leftImport = previousFullPath.startsWith('/importar') && route.name !== 'import'
  const leftPreservedAuth = returnToImportAfterAuth.value
    && isAuthPath(previousFullPath)
    && route.name !== 'import'
    && route.name !== 'login'
    && route.name !== 'register'

  if (leftImport && shouldPreserveImportAcrossAuth()) {
    return
  }

  if (leftImport || leftPreservedAuth) {
    clearImportWorkflowState()
  }
}

function shouldPreserveImportAcrossAuth() {
  return returnToImportAfterAuth.value && (route.name === 'login' || route.name === 'register')
}

function isAuthPath(path: string) {
  return path.startsWith('/entrar') || path.startsWith('/cadastro')
}

async function selectPreviewCard(index: number) {
  await showPreviewCard(index, 'front')
  previewPickerOpen.value = false
}

async function movePreviewCard(direction: -1 | 1) {
  const total = importPreview.value?.cards.length ?? 0
  if (!total) {
    return
  }
  const nextIndex = Math.min(Math.max(previewCardIndex.value + direction, 0), total - 1)
  await showPreviewCard(nextIndex, 'front')
}

async function togglePreviewFace() {
  await showPreviewCard(previewCardIndex.value, previewFace.value === 'front' ? 'back' : 'front')
}

let previewMediaRequest = 0
let importPreviewRequest = 0

async function showPreviewCard(index: number, face: PreviewFace) {
  const card = importPreview.value?.cards[index]
  if (!card) {
    return
  }

  const requestId = ++previewMediaRequest
  const urls = await readPreviewMediaUrls(card, face)
  if (requestId !== previewMediaRequest) {
    revokePreviewMediaUrls(urls)
    return
  }

  const previousUrls = previewMediaUrls.value
  previewMediaUrls.value = urls
  previewCardIndex.value = index
  previewFace.value = face
  revokePreviewMediaUrls(previousUrls)
}

async function readPreviewMediaUrls(card: { frontHtml: string; backHtml: string }, face: PreviewFace) {
  const mediaIndex = previewMediaIndex.value
  if (!card || !mediaIndex) {
    return {}
  }

  const html = face === 'front' ? card.frontHtml : card.backHtml
  const references = extractRelativeMediaSources(html)
  if (references.length === 0) {
    return {}
  }

  const urls: Record<string, string> = {}
  for (const reference of references) {
    const normalized = normalizeMediaName(reference)
    const blob = await mediaIndex.readBlob(reference).catch(() => null)
    if (blob) {
      const url = URL.createObjectURL(blob)
      urls[normalized] = url
      if (blob.type.startsWith('image/')) {
        await decodeImage(url).catch(() => undefined)
      }
    }
  }
  return urls
}

function decodeImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode()
}

function revokePreviewMediaUrls(urls = previewMediaUrls.value) {
  Object.values(urls).forEach((url) => URL.revokeObjectURL(url))
  if (urls === previewMediaUrls.value) {
    previewMediaUrls.value = {}
  }
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
  deleteManagedCard,
  syncLibraryRoute,
  cleanupLibraryRoute
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
  reviewCurrent,
  syncStudyRoute,
  cleanupStudyRoute
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
  stats,
  syncProgressRoute
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
