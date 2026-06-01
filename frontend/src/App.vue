<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  User,
  Volume2,
  X
} from '@lucide/vue'
import AppShell from './layouts/AppShell.vue'
import { api, clearAuthToken, setAuthToken } from './services/api'
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
  StudyCardResponse,
  UserResponse
} from './types/api'
import {
  deckDetailToLocal,
  loadLocalStates,
  localDeckToStudyCards,
  saveLocalStates
} from './utils/localStudy'
import AuthPage from './pages/AuthPage.vue'
import CreateDeckPage from './pages/CreateDeckPage.vue'
import ProgressPage from './pages/ProgressPage.vue'
import StudyPage from './pages/StudyPage.vue'
import { nextReview } from './utils/srs'
import { extractRelativeMediaSources, safePreviewHtml, safeStudyHtml } from './utils/html'
import { createApkgMediaIndex, normalizeMediaName, type ApkgMediaIndex } from './utils/apkgMedia'
import { formatDueIn, nextDueLabel } from './utils/dueTime'
import { validateAuthForm, type AuthErrors, type AuthField, type AuthMode } from './utils/authValidation'

type Tab = 'library' | 'study' | 'import' | 'create' | 'progress' | 'auth'
type LibrarySection = 'public' | 'mine'
type LibraryView = 'decks' | 'manage-deck'
type ThemePreference = 'light' | 'dark'
type PreviewFace = 'front' | 'back'
type CardEditorMode = 'create' | 'edit'
type CardEditorFace = 'front' | 'back'
const DECK_PAGE_SIZE = 8
const CARD_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const route = useRoute()
const router = useRouter()
const tab = computed<Tab>(() => route.meta.tab ?? 'library')
const librarySection = computed<LibrarySection>(() => route.meta.librarySection ?? 'public')
const libraryView = computed<LibraryView>(() => route.meta.libraryView ?? 'decks')
const librarySearch = ref('')
const authMode = computed<AuthMode>(() => route.meta.authMode ?? 'login')
const themePreference = ref<ThemePreference>(loadStoredThemePreference())
const sidebarCollapsed = ref(false)
const user = ref<UserResponse | null>(loadStoredUser())
const publicDecks = ref<DeckSummary[]>([])
const myDecks = ref<DeckSummary[]>([])
const publicDeckPage = ref<PageResponse<DeckSummary> | null>(null)
const myDeckPage = ref<PageResponse<DeckSummary> | null>(null)
const publicDeckQuery = ref('')
const myDeckQuery = ref('')
const publicStudyDeckCache = ref<LocalDeck[]>([])
const localStates = ref(loadLocalStates())
const stats = ref<StatsSummary | null>(null)
const notice = ref('')
const error = ref('')
const loading = ref(false)

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
const activeEditorFace = ref<CardEditorFace>('front')
const frontEditorRef = ref<HTMLTextAreaElement | null>(null)
const backEditorRef = ref<HTMLTextAreaElement | null>(null)
const mediaInputRef = ref<HTMLInputElement | null>(null)
const mediaUploadKind = ref<'image' | 'audio'>('image')

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
const highlightedDeckId = ref<number | null>(null)
const importSaving = ref(false)

const studyQueue = ref<StudyCard[]>([])
const sessionTitle = ref('Selecione um baralho ou inicie a prática intercalada.')
const answerVisible = ref(false)

const currentCard = computed(() => studyQueue.value[0])
const frontHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.frontHtml, currentCard.value.deckId) : '')
const backHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.backHtml, currentCard.value.deckId) : '')
const currentDueLabel = computed(() => currentCard.value ? formatDueIn(currentCard.value.dueAt) : '')
const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))
const nextThemeLabel = computed(() => themePreference.value === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro')
const sidebarToggleLabel = computed(() => sidebarCollapsed.value ? 'Expandir menu' : 'Recolher menu')
const userDisplayName = computed(() => user.value?.displayName ?? 'Visitante')
const publicDecksHasMore = computed(() => publicDeckPage.value ? !publicDeckPage.value.last : false)
const myDecksHasMore = computed(() => myDeckPage.value ? !myDeckPage.value.last : false)
const publicDecksCountLabel = computed(() => deckPageCountLabel(publicDecks.value.length, publicDeckPage.value))
const myDecksCountLabel = computed(() => deckPageCountLabel(myDecks.value.length, myDeckPage.value))
const filteredPublicDecks = computed(() => publicDecks.value)
const filteredMyDecks = computed(() => myDecks.value)
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
const activeLibraryCountLabel = computed(() => {
  const searching = normalizeSearch(librarySearch.value).length > 0
  if (searching) {
    if (librarySection.value === 'public') {
      return publicDecksCountLabel.value
    }
    return user.value ? myDecksCountLabel.value : ''
  }
  if (librarySection.value === 'public') {
    return publicDecksCountLabel.value
  }
  return user.value ? myDecksCountLabel.value : ''
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
      void withFeedback(async () => loadPublicDecks(true), false)
    }
    if (librarySection.value === 'mine' && user.value) {
      void withFeedback(async () => loadMyDecks(true), false)
    }
  }, SEARCH_DEBOUNCE_MS)
})

watch(librarySection, (section) => {
  if (section !== 'mine') {
    closeManagedDeck(true, false)
  }
  const query = currentLibraryQuery()
  if (section === 'public' && (!publicDeckPage.value || publicDeckQuery.value !== query)) {
    void withFeedback(async () => loadPublicDecks(true), false)
  }
  if (section === 'mine' && user.value && (!myDeckPage.value || myDeckQuery.value !== query)) {
    void withFeedback(async () => loadMyDecks(true), false)
  }
})

watch(managedCardsSearch, () => {
  window.clearTimeout(managedCardsSearchTimer)
  managedCardsSearchTimer = window.setTimeout(() => {
    if (managedDeck.value) {
      void withFeedback(async () => loadManagedCards(true), false)
    }
  }, SEARCH_DEBOUNCE_MS)
})

watch(tab, (nextTab) => {
  if (nextTab !== 'library') {
    closeCardEditor(true)
  }
})

watch(() => route.fullPath, () => {
  void syncRouteState()
}, { immediate: true })

onBeforeUnmount(() => {
  revokePreviewMediaUrls()
  window.clearTimeout(highlightDeckTimer)
  window.clearTimeout(librarySearchTimer)
  window.clearTimeout(managedCardsSearchTimer)
})

function toggleThemePreference() {
  themePreference.value = themePreference.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('learningframe.theme', themePreference.value)
  applyThemePreference()
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function applyThemePreference() {
  document.documentElement.dataset.theme = themePreference.value
  document.documentElement.style.colorScheme = themePreference.value
}

async function navigateTo(to: RouteLocationRaw) {
  await router.push(to)
}

async function syncRouteState() {
  if (route.name !== 'library-deck-manage' && managedDeck.value) {
    closeManagedDeck(true, false)
  }

  if (route.name === 'library-public') {
    await withFeedback(async () => {
      if (!publicDeckPage.value || publicDeckQuery.value !== currentLibraryQuery()) {
        await loadPublicDecks(true)
      }
    }, false)
    return
  }

  if (route.name === 'library-mine') {
    await withFeedback(async () => {
      if (user.value && (!myDeckPage.value || myDeckQuery.value !== currentLibraryQuery())) {
        await loadMyDecks(true)
      }
    }, false)
    return
  }

  if (route.name === 'library-deck-manage') {
    const deckId = routeDeckId()
    if (!deckId) {
      await router.replace({ name: 'library-mine' })
      return
    }
    await loadManagedDeckRoute(deckId)
    return
  }

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
    return
  }

  if (route.name === 'progress' && user.value) {
    await withFeedback(async () => {
      stats.value = await api.stats()
    }, false)
  }
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
  }, false)
}

async function loadPublicDecks(reset = false) {
  const page = reset ? 0 : (publicDeckPage.value?.page ?? -1) + 1
  const query = currentLibraryQuery()
  const response = await api.publicDecks(page, DECK_PAGE_SIZE, query)
  publicDecks.value = reset ? response.content : mergeDeckPages(publicDecks.value, response.content)
  publicDeckPage.value = response
  publicDeckQuery.value = query
}

async function loadMyDecks(reset = false) {
  if (!user.value) {
    return
  }
  const page = reset ? 0 : (myDeckPage.value?.page ?? -1) + 1
  const query = currentLibraryQuery()
  const response = await api.myDecks(page, DECK_PAGE_SIZE, query)
  myDecks.value = reset ? response.content : mergeDeckPages(myDecks.value, response.content)
  myDeckPage.value = response
  myDeckQuery.value = query
}

async function loadMorePublicDecks() {
  await withFeedback(async () => {
    await loadPublicDecks()
  }, false)
}

async function loadMoreMyDecks() {
  await withFeedback(async () => {
    await loadMyDecks()
  }, false)
}

async function savePublicDeck(deck: DeckSummary) {
  if (!user.value) {
    openAuth('login')
    notice.value = 'Entre para salvar este baralho em Meus baralhos.'
    return
  }

  await withFeedback(async () => {
    const saved = await api.copyPublicDeck(deck.id)
    librarySearch.value = ''
    await loadMyDecks(true)
    stats.value = await api.stats()
    await router.push({ name: 'library-mine' })
    notice.value = 'Baralho salvo em Meus baralhos como copia privada.'
    await highlightDeck(saved.id)
  })
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

    user.value = response.user
    setAuthToken(response.token)
    localStorage.setItem('learningframe.user', JSON.stringify(response.user))
    notice.value = `Sessao iniciada como ${response.user.displayName}.`
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

function logout() {
  closeManagedDeck(true, false)
  user.value = null
  stats.value = null
  myDecks.value = []
  myDeckPage.value = null
  myDeckQuery.value = ''
  clearAuthToken()
  localStorage.removeItem('learningframe.user')
  notice.value = 'Modo anonimo ativado.'
  void router.replace({ name: 'library-public' })
}

function goHome() {
  closeManagedDeck(true, false)
  void router.push({ name: 'library-public' })
  error.value = ''
  resetAuthValidation()
}

function openAuth(mode: AuthMode = 'login') {
  closeManagedDeck(true, false)
  const redirect = route.meta.requiresAuth ? route.fullPath : route.query.redirect
  void router.push({
    name: mode === 'login' ? 'login' : 'register',
    query: typeof redirect === 'string' && redirect ? { redirect } : {}
  })
  error.value = ''
  notice.value = ''
  resetAuthValidation()
}

function toggleAuthMode() {
  void router.push({
    name: authMode.value === 'login' ? 'register' : 'login',
    query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {}
  })
  error.value = ''
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
      notice.value = 'Nenhum card vencido agora para esta sessao.'
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
      notice.value = 'Prática intercalada sem cards vencidos agora.'
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
      notice.value = 'Sessao concluida.'
    }
  }, false)
}

async function handleApkgChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
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
      previewMediaIndex.value = mediaIndex
      const requestId = ++previewMediaRequest
      const urls = preview.cards[0] ? await readPreviewMediaUrls(preview.cards[0], 'front') : {}
      if (requestId !== previewMediaRequest) {
        revokePreviewMediaUrls(urls)
        return
      }
      previewMediaUrls.value = urls
      previewCardIndex.value = 0
      previewFace.value = 'front'
      importPreview.value = preview
      importTitle.value = preview.title
      notice.value = preview.mediaFound > 0
        ? 'APKG analisado. A midia sera exibida na previa enquanto este arquivo estiver selecionado.'
        : 'APKG analisado. Revise a previa e salve em Meus baralhos.'
    } finally {
      input.value = ''
    }
  })
}

async function persistImport() {
  if (!selectedFile.value) {
    error.value = 'Selecione o arquivo .apkg novamente.'
    return
  }

  if (!user.value) {
    returnToImportAfterAuth.value = true
    openAuth('login')
    notice.value = 'Entre para salvar o APKG com midia em Meus baralhos.'
    return
  }

  importSaving.value = true
  try {
    await withFeedback(async () => {
      const result = await api.importApkg(selectedFile.value as File, importTitle.value, importVisibility.value)
      importResult.value = result
      notice.value = result.mediaImported > 0
        ? `Baralho APKG salvo com ${result.cardsImported} cartas e ${result.mediaImported} midias.`
        : 'Baralho APKG salvo em Meus baralhos.'
      resetImportPreviewState()
      selectedFile.value = null
      await loadMyDecks(true)
      if (user.value) {
        stats.value = await api.stats()
      }
      await router.push({ name: 'library-mine' })
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

let highlightDeckTimer: number | undefined

async function highlightDeck(deckId: number) {
  highlightedDeckId.value = null
  window.clearTimeout(highlightDeckTimer)
  await nextTick()
  document.querySelector(`[data-deck-id="${deckId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  window.requestAnimationFrame(() => {
    highlightedDeckId.value = deckId
    highlightDeckTimer = window.setTimeout(() => {
      if (highlightedDeckId.value === deckId) {
        highlightedDeckId.value = null
      }
    }, 10000)
  })
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
    notice.value = 'Baralho criado. Adicione as primeiras cartas.'
  })
}

async function openManagedDeck(deck: DeckSummary, showLoading = true) {
  if (!user.value) {
    openAuth('login')
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
  })
}

function setManagedDeck(deck: DeckSummary) {
  managedDeck.value = deck
  managedDeckForm.value = {
    title: deck.title,
    description: deck.description ?? '',
    visibility: deck.visibility
  }
}

function closeManagedDeck(force = false, navigateToList = true) {
  if (!force && managedDeckDirty.value && !window.confirm('Descartar alteracoes do baralho?')) {
    return
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
    void router.push({ name: 'library-mine' })
  }
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
  }, false)
}

async function saveManagedDeck() {
  const deck = managedDeck.value
  if (!deck) {
    return
  }
  if (!managedDeckForm.value.title.trim()) {
    error.value = 'Informe o titulo do baralho.'
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
    notice.value = 'Baralho atualizado.'
  })
}

async function deleteManagedDeck() {
  const deck = managedDeck.value
  if (!deck || !window.confirm(`Excluir o baralho "${deck.title}" e todas as suas cartas?`)) {
    return
  }

  await withFeedback(async () => {
    await api.deleteDeck(deck.id)
    closeManagedDeck(true)
    await loadMyDecks(true)
    if (user.value) {
      stats.value = await api.stats()
    }
    selectedManagedCardIds.value = new Set()
    notice.value = 'Baralho excluido.'
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
  activeEditorFace.value = 'front'
  cardEditorOpen.value = true
  void nextTick(() => frontEditorRef.value?.focus())
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
    error.value = 'Preencha frente e verso da carta.'
    return
  }

  await withFeedback(async () => {
    const tags = splitTags(cardEditorForm.value.tags)
    let savedCard: CardResponse
    if (cardEditorMode.value === 'edit' && cardEditorCardId.value) {
      savedCard = await api.updateCard(deck.id, cardEditorCardId.value, cardEditorForm.value.frontHtml, cardEditorForm.value.backHtml, tags)
      notice.value = 'Carta atualizada.'
    } else {
      savedCard = await api.createCard(deck.id, cardEditorForm.value.frontHtml, cardEditorForm.value.backHtml, tags)
      notice.value = 'Carta adicionada.'
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
    notice.value = 'Carta excluida.'
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
    notice.value = 'Cartas selecionadas excluidas.'
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

function triggerMediaUpload(kind: 'image' | 'audio', face: CardEditorFace) {
  mediaUploadKind.value = kind
  activeEditorFace.value = face
  mediaInputRef.value?.click()
}

async function handleEditorMediaChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  if (!file || !managedDeck.value) {
    return
  }

  await withFeedback(async () => {
    const uploaded = await api.uploadMedia(managedDeck.value!.id, file)
    const marker = mediaUploadKind.value === 'image'
      ? `<img src="${uploaded.fileName}" alt="">`
      : `[sound:${uploaded.fileName}]`
    insertIntoEditor(activeEditorFace.value, marker)
    notice.value = mediaUploadKind.value === 'image'
      ? 'Imagem inserida na carta.'
      : 'Audio inserido na carta.'
  })
}

function insertIntoEditor(face: CardEditorFace, text: string) {
  const field = face === 'front' ? 'frontHtml' : 'backHtml'
  const textarea = face === 'front' ? frontEditorRef.value : backEditorRef.value
  const current = cardEditorForm.value[field]
  const start = textarea?.selectionStart ?? current.length
  const end = textarea?.selectionEnd ?? current.length
  const nextValue = `${current.slice(0, start)}${text}${current.slice(end)}`
  cardEditorForm.value[field] = nextValue
  void nextTick(() => {
    const target = face === 'front' ? frontEditorRef.value : backEditorRef.value
    target?.focus()
    const cursor = start + text.length
    target?.setSelectionRange(cursor, cursor)
  })
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

function mergeDeckPages(current: DeckSummary[], incoming: DeckSummary[]) {
  const merged = new Map<number, DeckSummary>()
  for (const deck of [...current, ...incoming]) {
    merged.set(deck.id, deck)
  }
  return [...merged.values()]
}

function mergeCardsPages(current: CardResponse[], incoming: CardResponse[]) {
  const merged = new Map<number, CardResponse>()
  for (const card of [...current, ...incoming]) {
    merged.set(card.id, card)
  }
  return [...merged.values()]
}

function deckPageCountLabel<T>(loaded: number, page: PageResponse<T> | null, label = 'baralhos') {
  if (!page) {
    return ''
  }
  return `${loaded} de ${page.totalElements} ${label}`
}

function cardCountLabel(count: number) {
  return `${count} ${count === 1 ? 'carta' : 'cartas'}`
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function currentLibraryQuery() {
  return librarySearch.value.trim()
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
    return existing
  }

  const detail = await api.deck(deckId)
  const localDeck = deckDetailToLocal(detail)
  publicStudyDeckCache.value = [localDeck, ...publicStudyDeckCache.value]
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

async function withFeedback(task: () => Promise<void>, showLoading = true) {
  error.value = ''
  notice.value = ''
  if (showLoading) {
    loading.value = true
  }
  try {
    await task()
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Erro inesperado.'
    error.value = message === 'Failed to fetch'
      ? 'Backend indisponivel. Verifique se o Docker Compose esta ativo e tente novamente.'
      : message
  } finally {
    loading.value = false
  }
}

function dismissNotice() {
  notice.value = ''
}

function dismissError() {
  error.value = ''
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('learningframe.user')
    return raw ? JSON.parse(raw) as UserResponse : null
  } catch {
    return null
  }
}

function loadStoredThemePreference(): ThemePreference {
  const storedTheme = localStorage.getItem('learningframe.theme')
  return storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : 'light'
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

      <AuthPage
        v-if="tab === 'auth'"
        v-model:display-name="authForm.displayName"
        v-model:email="authForm.email"
        v-model:password="authForm.password"
        :mode="authMode"
        :field-error="authFieldError"
        @submit="submitAuth"
        @close="goHome"
        @toggle-mode="toggleAuthMode"
        @touch-field="touchAuthField"
      />

      <section v-if="tab === 'library'" class="library-grid">
        <div class="library-shell">
          <div class="library-tabs" role="tablist" aria-label="Tipos de baralho">
            <button
              class="library-tab"
              :class="{ active: librarySection === 'public' }"
              type="button"
              role="tab"
              :aria-selected="librarySection === 'public'"
              @click="navigateTo({ name: 'library-public' })"
            >
              Baralhos públicos
            </button>
            <button
              class="library-tab"
              :class="{ active: librarySection === 'mine' }"
              type="button"
              role="tab"
              :aria-selected="librarySection === 'mine'"
              @click="navigateTo({ name: 'library-mine' })"
            >
              Meus baralhos
            </button>
          </div>

          <div v-if="libraryView === 'decks'" class="library-toolbar">
            <label class="library-search">
              <Search :size="17" aria-hidden="true" />
              <input v-model="librarySearch" type="search" placeholder="Buscar baralhos" />
            </label>
            <div class="row-actions">
              <span v-if="activeLibraryCountLabel" class="muted">{{ activeLibraryCountLabel }}</span>
              <button class="ghost compact" type="button" @click="refreshAll">
                <RotateCcw :size="16" aria-hidden="true" />
                Atualizar
              </button>
            </div>
          </div>

          <div v-if="libraryView === 'decks'" class="library-content">
            <div v-if="librarySection === 'public'" class="panel wide">
              <div v-if="filteredPublicDecks.length" class="deck-list">
                <article v-for="deck in filteredPublicDecks" :key="deck.id" class="deck-card">
                  <div>
                    <h3>{{ deck.title }}</h3>
                    <p>{{ deck.description }}</p>
                    <span>{{ cardCountLabel(deck.cardCount) }} · {{ deckDueLabel(deck) }}</span>
                  </div>
                  <div class="row-actions">
                    <button class="primary compact" type="button" @click="startDeck(deck)">
                      <Brain :size="16" aria-hidden="true" />
                      Estudar
                    </button>
                    <button class="ghost compact" type="button" @click="savePublicDeck(deck)">
                      <Save :size="16" aria-hidden="true" />
                      Salvar para mim
                    </button>
                  </div>
                </article>
              </div>
              <p v-else class="muted empty-copy">Nenhum baralho público encontrado.</p>
              <a
                v-if="publicDecksHasMore"
                class="load-more-link"
                href="#"
                @click.prevent="loadMorePublicDecks"
              >
                Carregar mais baralhos...
              </a>
            </div>

            <div v-if="librarySection === 'mine'" class="panel wide">
              <div v-if="user && filteredMyDecks.length" class="deck-list">
                <article
                  v-for="deck in filteredMyDecks"
                  :key="deck.id"
                  :data-deck-id="deck.id"
                  class="deck-card"
                  :class="{ highlighted: highlightedDeckId === deck.id }"
                >
                  <div>
                    <h3>{{ deck.title }}</h3>
                    <p>{{ deck.description }}</p>
                    <span>{{ cardCountLabel(deck.cardCount) }} · {{ deckDueLabel(deck) }}</span>
                  </div>
                  <div class="row-actions">
                    <button class="primary compact" type="button" @click="startDeck(deck)">
                      <Brain :size="16" aria-hidden="true" />
                      Estudar
                    </button>
                    <button class="ghost compact" type="button" @click="openManagedDeck(deck)">
                      <Pencil :size="16" aria-hidden="true" />
                      Gerenciar
                    </button>
                  </div>
                </article>
              </div>
              <div v-else-if="!user" class="empty-state compact-empty">
                <h2>Entre para ver seus baralhos</h2>
                <p>Baralhos criados, importados e publicados pela sua conta aparecem aqui.</p>
                <button class="primary compact" type="button" @click="openAuth('login')">
                  <User :size="16" aria-hidden="true" />
                  Entrar
                </button>
              </div>
              <p v-else class="muted empty-copy">Nenhum baralho seu encontrado.</p>
              <a
                v-if="user && myDecksHasMore"
                class="load-more-link"
                href="#"
                @click.prevent="loadMoreMyDecks"
              >
                Carregar mais baralhos...
              </a>
            </div>
          </div>

          <div v-else-if="managedDeck" class="manage-deck-view">
            <div class="manage-deck-header">
              <button class="ghost compact" type="button" @click="closeManagedDeck()">
                <ArrowLeft :size="16" aria-hidden="true" />
                Voltar
              </button>
              <div class="row-actions">
                <button class="primary compact" type="button" :disabled="!managedDeckDirty" @click="saveManagedDeck">
                  <Save :size="16" aria-hidden="true" />
                  Salvar
                </button>
                <button class="ghost compact danger-action" type="button" @click="deleteManagedDeck">
                  <Trash2 :size="16" aria-hidden="true" />
                  Excluir baralho
                </button>
              </div>
            </div>

            <section class="manage-deck-layout">
              <form class="panel manage-meta-panel" @submit.prevent="saveManagedDeck">
                <div class="section-title">
                  <h2>Dados do baralho</h2>
                </div>
                <label class="form-field">
                  <span class="field-label">Titulo</span>
                  <input v-model.trim="managedDeckForm.title" type="text" maxlength="180" required />
                </label>
                <label class="form-field">
                  <span class="field-label">Descricao</span>
                  <textarea v-model="managedDeckForm.description" rows="5" maxlength="2000"></textarea>
                </label>
                <label class="form-field">
                  <span class="field-label">Visibilidade</span>
                  <select v-model="managedDeckForm.visibility">
                    <option value="PRIVATE">Privado</option>
                    <option value="PUBLIC">Publico</option>
                  </select>
                </label>
              </form>

              <section class="panel manage-cards-panel">
                <div class="section-title">
                  <div>
                    <h2>Cartas</h2>
                    <p class="muted">{{ managedCardsCountLabel || cardCountLabel(managedDeck.cardCount) }}</p>
                  </div>
                  <button class="primary compact" type="button" @click="openCreateCardEditor">
                    <Plus :size="16" aria-hidden="true" />
                    Nova carta
                  </button>
                </div>

                <div class="managed-cards-toolbar">
                  <label class="library-search managed-card-search">
                    <Search :size="17" aria-hidden="true" />
                    <input v-model="managedCardsSearch" type="search" placeholder="Buscar em frente, verso ou tags" />
                  </label>
                  <div class="row-actions">
                    <button class="ghost compact" type="button" :disabled="managedCards.length === 0" @click="toggleVisibleManagedCardsSelection">
                      {{ allVisibleManagedCardsSelected ? 'Desmarcar pagina' : 'Selecionar pagina' }}
                    </button>
                    <button class="ghost compact" type="button" :disabled="selectedManagedCardsCount === 0" @click="clearManagedCardSelection">
                      Limpar
                    </button>
                    <button class="ghost compact danger-action" type="button" :disabled="selectedManagedCardsCount === 0" @click="deleteSelectedManagedCards">
                      <Trash2 :size="16" aria-hidden="true" />
                      Excluir {{ selectedManagedCardsCount || '' }}
                    </button>
                  </div>
                </div>

                <section class="managed-cards-browser">
                  <div class="managed-card-list">
                    <article
                      v-for="card in managedCards"
                      :key="card.id"
                      class="managed-card-row"
                      :class="{ active: selectedManagedCardId === card.id }"
                    >
                      <label class="card-selection" :aria-label="`Selecionar ${cardTextSummary(card)}`">
                        <input
                          type="checkbox"
                          :checked="selectedManagedCardIds.has(card.id)"
                          @change="toggleManagedCardSelection(card.id)"
                        />
                      </label>
                      <button class="managed-card-summary" type="button" @click="selectManagedCard(card)">
                        <span>{{ cardTextSummary(card) }}</span>
                        <small>{{ card.tags.length ? card.tags.join(', ') : 'sem tags' }}</small>
                      </button>
                    </article>
                    <p v-if="managedCards.length === 0" class="muted empty-copy">
                      {{ managedCardsSearch ? 'Nenhuma carta encontrada para esta busca.' : 'Nenhuma carta ainda.' }}
                    </p>
                    <a
                      v-if="managedCardsHasMore"
                      class="load-more-link"
                      href="#"
                      @click.prevent="loadMoreManagedCards"
                    >
                      Carregar mais cartas...
                    </a>
                  </div>

                  <article v-if="selectedManagedCard" class="managed-card-preview">
                    <div class="section-title">
                      <div>
                        <h3>{{ cardTextSummary(selectedManagedCard) }}</h3>
                        <p class="muted">{{ selectedManagedCard.tags.length ? selectedManagedCard.tags.join(', ') : 'sem tags' }}</p>
                      </div>
                      <div class="row-actions">
                        <button class="ghost icon-button" type="button" title="Editar carta" aria-label="Editar carta" @click="openEditCardEditor(selectedManagedCard)">
                          <Pencil :size="16" aria-hidden="true" />
                        </button>
                        <button class="ghost icon-button danger-action" type="button" title="Excluir carta" aria-label="Excluir carta" @click="deleteManagedCard(selectedManagedCard)">
                          <Trash2 :size="16" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div class="managed-preview-faces">
                      <div>
                        <span class="field-label">Frente</span>
                        <div class="preview-study-face" v-html="selectedManagedCardFrontPreview"></div>
                      </div>
                      <div>
                        <span class="field-label">Verso</span>
                        <div class="preview-study-face" v-html="selectedManagedCardBackPreview"></div>
                      </div>
                    </div>
                  </article>

                  <div v-else class="empty-state compact-empty">
                    <h2>{{ managedCardsSearch ? 'Busca sem resultados' : 'Nenhuma carta ainda' }}</h2>
                    <p>{{ managedCardsSearch ? 'Ajuste o termo de busca ou limpe o filtro.' : 'Crie a primeira carta para estudar este baralho.' }}</p>
                    <button v-if="!managedCardsSearch" class="primary compact" type="button" @click="openCreateCardEditor">
                      <Plus :size="16" aria-hidden="true" />
                      Nova carta
                    </button>
                  </div>
                </section>
              </section>
            </section>
          </div>
        </div>
      </section>

      <StudyPage
        v-if="tab === 'study'"
        :session-title="sessionTitle"
        :queue-length="studyQueue.length"
        :current-card="currentCard"
        :current-due-label="currentDueLabel"
        :front-html="frontHtml"
        :back-html="backHtml"
        :answer-visible="answerVisible"
        @start-interleaved="startInterleavedPractice"
        @reveal-answer="answerVisible = true"
        @review="reviewCurrent"
      />

      <section v-if="tab === 'import'" class="import-page">
        <div class="import-header">
          <div>
            <p class="eyebrow">Pacote Anki</p>
            <h2>Importar APKG</h2>
          </div>
          <span v-if="selectedFile" class="muted">{{ selectedFile.name }}</span>
        </div>

        <div class="import-workspace">
          <div class="panel wide">
            <label class="file-drop">
              <Upload :size="22" aria-hidden="true" />
              <span>{{ selectedFile?.name ?? 'Selecionar arquivo .apkg' }}</span>
              <input type="file" accept=".apkg" @change="handleApkgChange" />
            </label>

            <div v-if="loading && selectedFile && !importPreview" class="pending-card import-loading">
              Lendo pacote e preparando previa...
            </div>

            <div v-if="importPreview" class="import-summary">
              <div>
                <strong>{{ importPreview.title }}</strong>
                <span>{{ importPreview.notesFound }} notas encontradas · {{ importPreview.cardsReady }} cartas prontas · {{ importPreview.cardsSkipped }} ignoradas · {{ importPreview.mediaFound }} midias</span>
              </div>
              <p v-if="importPreview.mediaFound > 0" class="inline-alert">
                Este pacote contem midia. A previa mostra marcadores; o estudo com imagens fica disponivel depois de salvar em Meus baralhos.
              </p>
              <p v-for="warning in importPreview.warnings" :key="warning" class="muted">{{ warning }}</p>
            </div>

            <div v-if="importPreview && currentPreviewCard" class="preview-section">
              <div class="preview-toolbar">
                <div class="preview-picker">
                  <label class="field-label" for="preview-card-search">Carta</label>
                  <button class="preview-picker-trigger" type="button" @click="previewPickerOpen = !previewPickerOpen">
                    <span>{{ previewCardTitle(previewCardIndex) }}</span>
                    <span>{{ previewFace === 'front' ? 'Frente' : 'Verso' }}</span>
                  </button>
                  <div v-if="previewPickerOpen" class="preview-picker-menu">
                    <label class="library-search preview-search">
                      <Search :size="16" aria-hidden="true" />
                      <input
                        id="preview-card-search"
                        v-model="previewCardSearch"
                        type="search"
                        placeholder="Buscar carta"
                        @keydown.esc="previewPickerOpen = false"
                      />
                    </label>
                    <div class="preview-picker-list">
                      <button
                        v-for="option in previewCardOptions"
                        :key="option.index"
                        class="preview-picker-option"
                        :class="{ active: option.index === previewCardIndex }"
                        type="button"
                        @click="selectPreviewCard(option.index)"
                      >
                        {{ option.label }}
                      </button>
                      <p v-if="previewCardOptions.length === 0" class="muted empty-copy">Nenhuma carta encontrada.</p>
                    </div>
                  </div>
                </div>

                <div class="preview-actions">
                  <button class="ghost compact" type="button" :disabled="previewCardIndex === 0" @click="movePreviewCard(-1)">
                    <ChevronsLeft :size="16" aria-hidden="true" />
                    Anterior
                  </button>
                  <button class="ghost compact" type="button" @click="togglePreviewFace">
                    <RotateCcw :size="16" aria-hidden="true" />
                    {{ previewFace === 'front' ? 'Ver verso' : 'Ver frente' }}
                  </button>
                  <button
                    class="ghost compact"
                    type="button"
                    :disabled="previewCardIndex >= importPreview.cards.length - 1"
                    @click="movePreviewCard(1)"
                  >
                    Proxima
                    <ChevronsRight :size="16" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <article class="preview-study-card" role="button" tabindex="0" @click="togglePreviewFace" @keydown.enter.prevent="togglePreviewFace" @keydown.space.prevent="togglePreviewFace">
                <div class="card-meta">
                  <span>{{ previewFace === 'front' ? 'Frente' : 'Verso' }}</span>
                  <span>{{ currentPreviewCard.tags.length ? currentPreviewCard.tags.join(', ') : 'sem tags' }}</span>
                </div>
                <div class="preview-study-face" v-html="currentPreviewHtml"></div>
              </article>
            </div>
          </div>

          <form v-if="importPreview" class="panel import-save-panel" @submit.prevent="persistImport">
            <div class="section-title">
              <h2>{{ user ? 'Salvar em Meus baralhos' : 'Entrar para salvar' }}</h2>
            </div>
            <input v-model="importTitle" type="text" placeholder="Titulo do baralho" />
            <select v-model="importVisibility" :disabled="!user">
              <option value="PRIVATE">Privado</option>
              <option value="PUBLIC">Publico</option>
            </select>
            <button class="primary full" type="submit">
              <Check :size="16" aria-hidden="true" />
              {{ user ? 'Salvar APKG' : 'Entrar para salvar' }}
            </button>
            <p class="muted">
              {{ user ? 'O arquivo original sera enviado para preservar cartas e midias.' : 'A previa continua nesta tela enquanto voce entra na conta.' }}
            </p>
          </form>
        </div>
      </section>

      <CreateDeckPage
        v-if="tab === 'create'"
        v-model:title="deckForm.title"
        v-model:description="deckForm.description"
        v-model:visibility="deckForm.visibility"
        :user="user"
        @submit="createDeck"
      />

      <ProgressPage
        v-if="tab === 'progress'"
        :user="user"
        :stats="stats"
      />

      <section v-if="cardEditorOpen && managedDeck" class="card-editor-overlay" aria-label="Editor de carta">
        <div class="card-editor-shell">
          <header class="card-editor-header">
            <div>
              <p class="eyebrow">{{ managedDeck.title }}</p>
              <h2>{{ cardEditorTitle }}</h2>
            </div>
            <div class="row-actions">
              <button class="primary compact" type="button" @click="saveCardEditor">
                <Save :size="16" aria-hidden="true" />
                Salvar carta
              </button>
              <button class="ghost icon-button" type="button" title="Fechar editor" aria-label="Fechar editor" @click="closeCardEditor()">
                <X :size="16" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div class="card-editor-body">
            <form class="card-editor-form" @submit.prevent="saveCardEditor">
              <section class="editor-face-block">
                <div class="section-title compact-title">
                  <h3>Frente</h3>
                  <div class="row-actions">
                    <button class="ghost icon-button" type="button" title="Inserir imagem na frente" aria-label="Inserir imagem na frente" @click="triggerMediaUpload('image', 'front')">
                      <ImageIcon :size="16" aria-hidden="true" />
                    </button>
                    <button class="ghost icon-button" type="button" title="Inserir audio na frente" aria-label="Inserir audio na frente" @click="triggerMediaUpload('audio', 'front')">
                      <Volume2 :size="16" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref="frontEditorRef"
                  v-model="cardEditorForm.frontHtml"
                  rows="10"
                  maxlength="12000"
                  required
                  @focus="activeEditorFace = 'front'"
                ></textarea>
              </section>

              <section class="editor-face-block">
                <div class="section-title compact-title">
                  <h3>Verso</h3>
                  <div class="row-actions">
                    <button class="ghost icon-button" type="button" title="Inserir imagem no verso" aria-label="Inserir imagem no verso" @click="triggerMediaUpload('image', 'back')">
                      <ImageIcon :size="16" aria-hidden="true" />
                    </button>
                    <button class="ghost icon-button" type="button" title="Inserir audio no verso" aria-label="Inserir audio no verso" @click="triggerMediaUpload('audio', 'back')">
                      <Volume2 :size="16" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref="backEditorRef"
                  v-model="cardEditorForm.backHtml"
                  rows="10"
                  maxlength="12000"
                  required
                  @focus="activeEditorFace = 'back'"
                ></textarea>
              </section>

              <label class="form-field">
                <span class="field-label">Tags</span>
                <input v-model="cardEditorForm.tags" type="text" maxlength="400" placeholder="separadas por virgula" />
              </label>
            </form>

            <section class="card-editor-preview">
              <article class="preview-pane">
                <div class="card-meta">
                  <span>Frente</span>
                </div>
                <div class="preview-study-face" v-html="cardEditorFrontPreview"></div>
              </article>
              <article class="preview-pane">
                <div class="card-meta">
                  <span>Verso</span>
                </div>
                <div class="preview-study-face" v-html="cardEditorBackPreview"></div>
              </article>
            </section>
          </div>

          <input
            ref="mediaInputRef"
            class="visually-hidden"
            type="file"
            :accept="mediaUploadKind === 'image' ? 'image/*' : 'audio/*'"
            @change="handleEditorMediaChange"
          />
        </div>
      </section>
  </AppShell>
</template>
