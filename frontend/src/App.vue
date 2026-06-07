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
  PageResponse,
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
import type { CardEditorMediaKind, CardEditorMode } from './features/library/cardEditorTypes'
import type { LibrarySection, LibraryView, ManagedCardsViewState } from './features/library/libraryTypes'
import { deckPageCountLabel, normalizeSearch, useDeckLibrary } from './features/library/useDeckLibrary'
import type { PreviewFace } from './features/import/importTypes'
import {
  authRouteKey,
  createDeckRouteKey,
  importRouteKey,
  libraryRouteKey,
  progressRouteKey,
  studyRouteKey
} from './routes/routeContext'
import { nextReview } from './utils/srs'
import { extractRelativeMediaSources, safePreviewHtml, safeStudyHtml } from './utils/html'
import { createApkgMediaIndex, normalizeMediaName, type ApkgMediaIndex } from './utils/apkgMedia'
import { formatDueIn, nextDueLabel } from './utils/dueTime'
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

const managedDeck = ref<DeckSummary | null>(null)
const managedDeckForm = ref({
  title: '',
  description: '',
  visibility: 'PRIVATE' as DeckVisibility
})
const managedCards = ref<CardResponse[]>([])
const managedCardsPage = ref<PageResponse<CardResponse> | null>(null)
const managedCardsSearch = ref('')
const selectedManagedCardId = ref<number | null>(null)
const selectedManagedCardIds = ref<Set<number>>(new Set())

const cardEditorOpen = ref(false)
const cardEditorMode = ref<CardEditorMode>('create')
const cardEditorCardId = ref<number | null>(null)
const cardEditorForm = ref({
  frontHtml: '',
  backHtml: '',
  tags: ''
})
const cardEditorInitial = ref({
  frontHtml: '',
  backHtml: '',
  tags: ''
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

const currentCard = computed(() => studyQueue.value[0])
const frontHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.frontHtml, currentCard.value.deckId) : '')
const backHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.backHtml, currentCard.value.deckId) : '')
const currentDueLabel = computed(() => currentCard.value ? formatDueIn(currentCard.value.dueAt) : '')
const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))
const sidebarToggleLabel = computed(() => sidebarCollapsed.value ? 'Expandir menu' : 'Recolher menu')
const userDisplayName = computed(() => user.value?.displayName ?? 'Visitante')
const managedCardsHasMore = computed(() => managedCardsPage.value ? !managedCardsPage.value.last : false)
const managedCardsCountLabel = computed(() => deckPageCountLabel(managedCards.value.length, managedCardsPage.value, 'cartas'))
const selectedManagedCard = computed(() => managedCards.value.find((card) => card.id === selectedManagedCardId.value) ?? null)
const selectedManagedCardsCount = computed(() => selectedManagedCardIds.value.size)
const allVisibleManagedCardsSelected = computed(() => (
  managedCards.value.length > 0
  && managedCards.value.every((card) => selectedManagedCardIds.value.has(card.id))
))
const selectedManagedCardFrontPreview = computed(() => managedDeck.value && selectedManagedCard.value
  ? safeStudyHtml(selectedManagedCard.value.frontHtml, managedDeck.value.id)
  : ''
)
const selectedManagedCardBackPreview = computed(() => managedDeck.value && selectedManagedCard.value
  ? safeStudyHtml(selectedManagedCard.value.backHtml, managedDeck.value.id)
  : ''
)
const managedCardsView = computed<ManagedCardsViewState>(() => ({
  cards: managedCards.value,
  selectedCard: selectedManagedCard.value,
  selectedCardId: selectedManagedCardId.value,
  selectedCardIds: selectedManagedCardIds.value,
  selectedCount: selectedManagedCardsCount.value,
  allVisibleSelected: allVisibleManagedCardsSelected.value,
  hasMore: managedCardsHasMore.value,
  countLabel: managedCardsCountLabel.value,
  frontPreview: selectedManagedCardFrontPreview.value,
  backPreview: selectedManagedCardBackPreview.value
}))
const deckFormatters = {
  cardCount: cardCountLabel,
  due: deckDueLabel
}
const managedDeckDirty = computed(() => {
  const deck = managedDeck.value
  return Boolean(deck)
    && (
      managedDeckForm.value.title !== deck?.title
      || managedDeckForm.value.description !== (deck?.description ?? '')
      || managedDeckForm.value.visibility !== deck?.visibility
    )
})
const cardEditorDirty = computed(() => (
  cardEditorForm.value.frontHtml !== cardEditorInitial.value.frontHtml
  || cardEditorForm.value.backHtml !== cardEditorInitial.value.backHtml
  || cardEditorForm.value.tags !== cardEditorInitial.value.tags
))
const cardEditorTitle = computed(() => cardEditorMode.value === 'edit' ? 'Editar carta' : 'Nova carta')
const cardEditorFrontPreview = computed(() => managedDeck.value
  ? safeStudyHtml(cardEditorForm.value.frontHtml, managedDeck.value.id)
  : safePreviewHtml(cardEditorForm.value.frontHtml)
)
const cardEditorBackPreview = computed(() => managedDeck.value
  ? safeStudyHtml(cardEditorForm.value.backHtml, managedDeck.value.id)
  : safePreviewHtml(cardEditorForm.value.backHtml)
)
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
      stats.value = await api.stats()
    }, { showLoading: false, clearOnStart: false })
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
    if (user.value) {
      const due = await api.due('SINGLE_DECK', deckId)
      studyQueue.value = due.cards.map(serverCardToStudyCard)
    } else {
      const localDeck = await ensurePublicDeck(deckId)
      sessionTitle.value = localDeck.title
      studyQueue.value = localDeckToStudyCards(localDeck, localStates.value)
    }
    if (studyQueue.value.length === 0) {
      showNotice('Nenhum card vencido agora para esta sessao.')
    }
  })
}

async function loadInterleavedPractice() {
  sessionTitle.value = 'Prática intercalada'
  answerVisible.value = false

  await withFeedback(async () => {
    if (user.value) {
      const due = await api.due('MIXED_DUE')
      studyQueue.value = due.cards.map(serverCardToStudyCard)
    } else {
      if (publicDecks.value.length === 0) {
        await loadPublicDecks(true)
      }
      studyQueue.value = []
      for (const deck of publicDecks.value.slice(0, 4)) {
        const localDeck = await ensurePublicDeck(deck.id)
        studyQueue.value.push(...localDeckToStudyCards(localDeck, localStates.value))
      }
    }
    if (studyQueue.value.length === 0) {
      showNotice('Prática intercalada sem cards vencidos agora.')
    }
  })
}

function resetStudySession() {
  studyQueue.value = []
  sessionTitle.value = 'Selecione um baralho ou inicie a prática intercalada.'
  answerVisible.value = false
}

async function reviewCurrent(rating: ReviewRating) {
  const card = currentCard.value
  if (!card) {
    return
  }

  await withFeedback(async () => {
    if (card.local) {
      localStates.value[card.clientId] = nextReview(localStates.value[card.clientId], rating)
      saveLocalStates(localStates.value)
    } else if (card.cardId) {
      await api.review(card.cardId, rating)
      if (user.value) {
        stats.value = await api.stats()
      }
    }
    studyQueue.value.shift()
    answerVisible.value = false
    if (studyQueue.value.length === 0) {
      showNotice('Sessao concluida.')
    }
  }, false)
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

function previewCardTitle(index: number) {
  const total = importPreview.value?.cards.length ?? 0
  return total ? `Carta ${index + 1} de ${total}` : `Carta ${index + 1}`
}

function previewCardOptionLabel(card: { frontHtml: string; backHtml: string }, index: number) {
  const text = htmlSummary(card.frontHtml) || htmlSummary(card.backHtml)
  if (!text) {
    return `Carta ${index + 1}`
  }
  return `${index + 1} - ${text}`
}

function previewCardSearchText(card: { frontHtml: string; backHtml: string; tags: string[] }, index: number) {
  const mediaSources = [
    ...extractRelativeMediaSources(card.frontHtml),
    ...extractRelativeMediaSources(card.backHtml)
  ]
  return normalizeSearch([
    index + 1,
    `carta ${index + 1}`,
    card.frontHtml,
    card.backHtml,
    card.tags.join(' '),
    mediaSources.join(' ')
  ].join(' '))
}

function htmlSummary(html: string) {
  const text = html
    .replace(/\[sound:[^\]]+]/gi, 'audio')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 64 ? `${text.slice(0, 61)}...` : text
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

async function loadManagedDeckRoute(deckId: number) {
  if (!user.value) {
    return
  }
  await withFeedback(async () => {
    const deck = await api.deckMetadata(deckId)
    setManagedDeck(deck)
    librarySearch.value = ''
    await loadManagedCards(true)
  }, { clearOnStart: false })
}

function setManagedDeck(deck: DeckSummary) {
  managedDeck.value = deck
  managedDeckForm.value = {
    title: deck.title,
    description: deck.description ?? '',
    visibility: deck.visibility
  }
}

function updateManagedDeckForm(nextForm: typeof managedDeckForm.value) {
  managedDeckForm.value = nextForm
}

async function closeManagedDeck(force = false, navigateToList = true) {
  if (!force && managedDeckDirty.value && !window.confirm('Descartar alteracoes do baralho?')) {
    return false
  }
  closeCardEditor(true)
  managedDeck.value = null
  managedDeckForm.value = { title: '', description: '', visibility: 'PRIVATE' }
  managedCards.value = []
  managedCardsPage.value = null
  managedCardsSearch.value = ''
  selectedManagedCardId.value = null
  selectedManagedCardIds.value = new Set()
  if (navigateToList) {
    await router.push({ name: 'library-mine' })
  }
  return true
}

async function loadManagedCards(reset = false) {
  const deckId = managedDeck.value?.id
  if (!deckId) {
    return
  }
  const page = reset ? 0 : (managedCardsPage.value?.page ?? -1) + 1
  const query = managedCardsSearch.value.trim()
  const response = await api.deckCards(deckId, page, CARD_PAGE_SIZE, query)
  managedCards.value = reset ? response.content : mergeCardsPages(managedCards.value, response.content)
  managedCardsPage.value = response
  selectedManagedCardIds.value = new Set([...selectedManagedCardIds.value].filter((id) => (
    managedCards.value.some((card) => card.id === id)
  )))
  if (!selectedManagedCardId.value || !managedCards.value.some((card) => card.id === selectedManagedCardId.value)) {
    selectedManagedCardId.value = managedCards.value[0]?.id ?? null
  }
}

async function loadMoreManagedCards() {
  await withFeedback(async () => {
    await loadManagedCards()
  }, { showLoading: false })
}

async function saveManagedDeck() {
  const deck = managedDeck.value
  if (!deck) {
    return
  }
  if (!managedDeckForm.value.title.trim()) {
    showError('Informe o titulo do baralho.')
    return
  }

  await withFeedback(async () => {
    const updated = await api.updateDeck(
      deck.id,
      managedDeckForm.value.title,
      managedDeckForm.value.description,
      managedDeckForm.value.visibility
    )
    setManagedDeck(updated)
    await loadMyDecks(true)
    showNotice('Baralho atualizado.')
  })
}

async function deleteManagedDeck() {
  const deck = managedDeck.value
  if (!deck || !window.confirm(`Excluir o baralho "${deck.title}" e todas as suas cartas?`)) {
    return
  }

  await withFeedback(async () => {
    await api.deleteDeck(deck.id)
    await closeManagedDeck(true)
    await loadMyDecks(true)
    if (user.value) {
      stats.value = await api.stats()
    }
    selectedManagedCardIds.value = new Set()
    showNotice('Baralho excluido.')
  })
}

function openCreateCardEditor() {
  if (!managedDeck.value) {
    return
  }
  openCardEditor('create')
}

function openEditCardEditor(card: CardResponse) {
  openCardEditor('edit', card)
}

function openCardEditor(mode: CardEditorMode, card?: CardResponse) {
  cardEditorMode.value = mode
  cardEditorCardId.value = card?.id ?? null
  cardEditorForm.value = {
    frontHtml: card?.frontHtml ?? '',
    backHtml: card?.backHtml ?? '',
    tags: card ? card.tags.join(', ') : ''
  }
  cardEditorInitial.value = { ...cardEditorForm.value }
  cardEditorOpen.value = true
}

function closeCardEditor(force = false) {
  if (!cardEditorOpen.value) {
    return
  }
  if (!force && cardEditorDirty.value && !window.confirm('Descartar alteracoes desta carta?')) {
    return
  }
  cardEditorOpen.value = false
  cardEditorCardId.value = null
  cardEditorForm.value = { frontHtml: '', backHtml: '', tags: '' }
  cardEditorInitial.value = { frontHtml: '', backHtml: '', tags: '' }
}

async function saveCardEditor() {
  const deck = managedDeck.value
  if (!deck) {
    return
  }
  if (!cardEditorForm.value.frontHtml.trim() || !cardEditorForm.value.backHtml.trim()) {
    showError('Preencha frente e verso da carta.')
    return
  }

  await withFeedback(async () => {
    const tags = splitTags(cardEditorForm.value.tags)
    let savedCard: CardResponse
    if (cardEditorMode.value === 'edit' && cardEditorCardId.value) {
      savedCard = await api.updateCard(deck.id, cardEditorCardId.value, cardEditorForm.value.frontHtml, cardEditorForm.value.backHtml, tags)
      showNotice('Carta atualizada.')
    } else {
      savedCard = await api.createCard(deck.id, cardEditorForm.value.frontHtml, cardEditorForm.value.backHtml, tags)
      showNotice('Carta adicionada.')
    }
    closeCardEditor(true)
    selectedManagedCardId.value = savedCard.id
    await Promise.all([
      loadManagedCards(true),
      loadMyDecks(true)
    ])
  })
}

async function deleteManagedCard(card: CardResponse) {
  const deck = managedDeck.value
  if (!deck || !window.confirm('Excluir esta carta?')) {
    return
  }
  await withFeedback(async () => {
    await api.deleteCard(deck.id, card.id)
    await Promise.all([
      loadManagedCards(true),
      loadMyDecks(true)
    ])
    selectedManagedCardIds.value = new Set([...selectedManagedCardIds.value].filter((id) => id !== card.id))
    showNotice('Carta excluida.')
  })
}

async function deleteSelectedManagedCards() {
  const deck = managedDeck.value
  const cardIds = [...selectedManagedCardIds.value]
  if (!deck || cardIds.length === 0) {
    return
  }
  if (!window.confirm(`Excluir ${cardIds.length} ${cardIds.length === 1 ? 'carta selecionada' : 'cartas selecionadas'}?`)) {
    return
  }

  await withFeedback(async () => {
    await api.deleteCards(deck.id, cardIds)
    selectedManagedCardIds.value = new Set()
    selectedManagedCardId.value = null
    await Promise.all([
      loadManagedCards(true),
      loadMyDecks(true)
    ])
    showNotice('Cartas selecionadas excluidas.')
  })
}

function selectManagedCard(card: CardResponse) {
  selectedManagedCardId.value = card.id
}

function toggleManagedCardSelection(cardId: number) {
  const selected = new Set(selectedManagedCardIds.value)
  if (selected.has(cardId)) {
    selected.delete(cardId)
  } else {
    selected.add(cardId)
  }
  selectedManagedCardIds.value = selected
}

function toggleVisibleManagedCardsSelection() {
  if (allVisibleManagedCardsSelected.value) {
    const selected = new Set(selectedManagedCardIds.value)
    managedCards.value.forEach((card) => selected.delete(card.id))
    selectedManagedCardIds.value = selected
    return
  }
  selectedManagedCardIds.value = new Set([
    ...selectedManagedCardIds.value,
    ...managedCards.value.map((card) => card.id)
  ])
}

function clearManagedCardSelection() {
  selectedManagedCardIds.value = new Set()
}

async function uploadCardEditorMedia(file: File, kind: CardEditorMediaKind) {
  const deck = managedDeck.value
  if (!deck) {
    throw new Error('Abra um baralho antes de inserir midia.')
  }

  const uploaded = await api.uploadMedia(deck.id, file)
  showNotice(kind === 'image'
    ? 'Imagem inserida na carta.'
    : 'Audio inserido na carta.')

  return kind === 'image'
    ? `<img src="${uploaded.fileName}" alt="">`
    : `[sound:${uploaded.fileName}]`
}

function handleCardEditorUploadError(message: string) {
  showError(message)
}

function splitTags(tags: string) {
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
}

function cardTextSummary(card: CardResponse) {
  return htmlSummary(card.frontHtml) || htmlSummary(card.backHtml) || fallbackCardLabel(card)
}

function fallbackCardLabel(card: CardResponse) {
  const index = managedCards.value.findIndex((managedCard) => managedCard.id === card.id)
  return index >= 0 ? `Carta ${index + 1}` : 'Carta'
}

function mergeCardsPages(current: CardResponse[], incoming: CardResponse[]) {
  const merged = new Map<number, CardResponse>()
  for (const card of [...current, ...incoming]) {
    merged.set(card.id, card)
  }
  return [...merged.values()]
}

function cardCountLabel(count: number) {
  return `${count} ${count === 1 ? 'carta' : 'cartas'}`
}

function deckDueLabel(deck: DeckSummary) {
  if (!user.value && deck.dueCount == null) {
    return 'disponivel agora'
  }
  return nextDueLabel(deck.dueCount, deck.nextDueAt)
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
