<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  LogOut,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  Sun,
  Upload,
  User,
  X
} from '@lucide/vue'
import { api, clearAuthToken, setAuthToken } from './services/api'
import type {
  ApkgImportResponse,
  ApkgPreviewResponse,
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
import { nextReview } from './utils/srs'
import { extractRelativeMediaSources, safePreviewHtml, safeStudyHtml } from './utils/html'
import { createApkgMediaIndex, normalizeMediaName, type ApkgMediaIndex } from './utils/apkgMedia'
import { formatDueIn, nextDueLabel } from './utils/dueTime'
import { validateAuthForm, type AuthErrors, type AuthField, type AuthMode } from './utils/authValidation'

type Tab = 'library' | 'study' | 'import' | 'create' | 'progress' | 'auth'
type LibrarySection = 'public' | 'mine'
type ThemePreference = 'light' | 'dark'
type PreviewFace = 'front' | 'back'
const DECK_PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 300

const tab = ref<Tab>('library')
const librarySection = ref<LibrarySection>('public')
const librarySearch = ref('')
const authMode = ref<AuthMode>('login')
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

const cardForm = ref({
  deckId: 0,
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
  { id: 'library' as const, label: 'Biblioteca', icon: BookOpen },
  { id: 'study' as const, label: 'Estudo', icon: Brain },
  { id: 'import' as const, label: 'Importar', icon: Upload },
  { id: 'create' as const, label: 'Criar', icon: Plus },
  { id: 'progress' as const, label: 'Progresso', icon: BarChart3 }
]
const visibleTabs = computed(() => navTabs.filter((item) => item.id !== 'create' || user.value))
const currentTitle = computed(() => {
  if (tab.value === 'auth') {
    return authMode.value === 'login' ? 'Entrar' : 'Criar conta'
  }
  return navTabs.find((item) => item.id === tab.value)?.label ?? 'Biblioteca'
})

onMounted(() => {
  applyThemePreference()
  refreshAll()
})

let librarySearchTimer: number | undefined

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
  const query = currentLibraryQuery()
  if (section === 'public' && (!publicDeckPage.value || publicDeckQuery.value !== query)) {
    void withFeedback(async () => loadPublicDecks(true), false)
  }
  if (section === 'mine' && user.value && (!myDeckPage.value || myDeckQuery.value !== query)) {
    void withFeedback(async () => loadMyDecks(true), false)
  }
})

onBeforeUnmount(() => {
  revokePreviewMediaUrls()
  window.clearTimeout(highlightDeckTimer)
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
      tab.value = 'import'
      returnToImportAfterAuth.value = false
    } else {
      tab.value = 'library'
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
  user.value = null
  stats.value = null
  myDecks.value = []
  myDeckPage.value = null
  myDeckQuery.value = ''
  clearAuthToken()
  localStorage.removeItem('learningframe.user')
  notice.value = 'Modo anonimo ativado.'
  tab.value = 'library'
}

function goHome() {
  tab.value = 'library'
  error.value = ''
  resetAuthValidation()
}

function openAuth(mode: AuthMode = 'login') {
  authMode.value = mode
  tab.value = 'auth'
  error.value = ''
  notice.value = ''
  resetAuthValidation()
}

function toggleAuthMode() {
  authMode.value = authMode.value === 'login' ? 'register' : 'login'
  error.value = ''
  resetAuthValidation()
}

async function startDeck(deck: DeckSummary) {
  tab.value = 'study'
  sessionTitle.value = deck.title
  answerVisible.value = false

  await withFeedback(async () => {
    if (user.value) {
      const due = await api.due('SINGLE_DECK', deck.id)
      studyQueue.value = due.cards.map(serverCardToStudyCard)
    } else {
      const localDeck = await ensurePublicDeck(deck.id)
      studyQueue.value = localDeckToStudyCards(localDeck, localStates.value)
    }
    if (studyQueue.value.length === 0) {
      notice.value = 'Nenhum card vencido agora para esta sessao.'
    }
  })
}

async function startInterleavedPractice() {
  tab.value = 'study'
  sessionTitle.value = 'Prática intercalada'
  answerVisible.value = false

  await withFeedback(async () => {
    if (user.value) {
      const due = await api.due('MIXED_DUE')
      studyQueue.value = due.cards.map(serverCardToStudyCard)
    } else {
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
      librarySection.value = 'mine'
      tab.value = 'library'
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
    cardForm.value.deckId = created.id
    notice.value = 'Baralho criado.'
    await refreshAll()
  })
}

async function createCard() {
  if (!cardForm.value.deckId) {
    error.value = 'Escolha um baralho para adicionar o card.'
    return
  }
  await withFeedback(async () => {
    const tags = cardForm.value.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    await api.createCard(cardForm.value.deckId, cardForm.value.frontHtml, cardForm.value.backHtml, tags)
    cardForm.value.frontHtml = ''
    cardForm.value.backHtml = ''
    cardForm.value.tags = ''
    notice.value = 'Card adicionado.'
    await refreshAll()
  })
}

function mergeDeckPages(current: DeckSummary[], incoming: DeckSummary[]) {
  const merged = new Map<number, DeckSummary>()
  for (const deck of [...current, ...incoming]) {
    merged.set(deck.id, deck)
  }
  return [...merged.values()]
}

function deckPageCountLabel(loaded: number, page: PageResponse<DeckSummary> | null) {
  if (!page) {
    return ''
  }
  return `${loaded} de ${page.totalElements} baralhos`
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
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button class="brand-button" type="button" title="Pagina inicial" @click="goHome">
        <Brain :size="24" aria-hidden="true" />
        <strong>LearningFrame</strong>
      </button>

      <button
        class="ghost icon-button sidebar-toggle"
        type="button"
        :title="sidebarToggleLabel"
        :aria-label="sidebarToggleLabel"
        @click="toggleSidebar"
      >
        <ChevronsRight v-if="sidebarCollapsed" :size="16" aria-hidden="true" />
        <ChevronsLeft v-else :size="16" aria-hidden="true" />
      </button>

      <nav class="nav-list" aria-label="Navegacao principal">
        <button
          v-for="item in visibleTabs"
          :key="item.id"
          class="nav-button"
          :class="{ active: tab === item.id }"
          type="button"
          @click="tab = item.id"
        >
          <component :is="item.icon" :size="18" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button
        class="primary full interleaved-button"
        type="button"
        @click="startInterleavedPractice"
      >
        <Shuffle :size="18" aria-hidden="true" />
        <span>Prática intercalada</span>
      </button>

      <section class="sidebar-footer" aria-label="Conta">
        <div v-if="user" class="sidebar-user">
          <div class="user-summary" :title="userDisplayName">
            <User :size="16" aria-hidden="true" />
            <span>{{ userDisplayName }}</span>
          </div>
          <button class="ghost icon-button" type="button" title="Sair" aria-label="Sair" @click="logout">
            <LogOut :size="16" aria-hidden="true" />
          </button>
        </div>

        <button v-else class="primary compact sidebar-login" type="button" @click="openAuth('login')">
          <User :size="16" aria-hidden="true" />
          <span>Entrar</span>
        </button>
      </section>
    </aside>

    <main class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow concept-strip">
            <button
              class="icon-button theme-toggle inline-theme-toggle"
              type="button"
              :title="nextThemeLabel"
              :aria-label="nextThemeLabel"
              @click="toggleThemePreference"
            >
              <Sun v-if="themePreference === 'light'" :size="14" aria-hidden="true" />
              <Moon v-else :size="14" aria-hidden="true" />
            </button>
            <span>Recordação ativa · Repetição espaçada · Prática intercalada</span>
          </p>
          <h1>{{ currentTitle }}</h1>
        </div>
      </header>

      <div v-if="loading" class="status loading-status">
        <RotateCcw :size="16" aria-hidden="true" />
        <span>{{ loadingMessage }}</span>
      </div>
      <div v-if="notice" class="status success dismissible">
        <span>{{ notice }}</span>
        <button class="status-close" type="button" title="Fechar notificacao" aria-label="Fechar notificacao" @click="dismissNotice">
          <X :size="15" aria-hidden="true" />
        </button>
      </div>
      <div v-if="error" class="status error dismissible">
        <span>{{ error }}</span>
        <button class="status-close" type="button" title="Fechar notificacao" aria-label="Fechar notificacao" @click="dismissError">
          <X :size="15" aria-hidden="true" />
        </button>
      </div>

      <section v-if="tab === 'auth'" class="auth-page">
        <form class="auth-card" novalidate @submit.prevent="submitAuth">
          <button class="auth-close" type="button" title="Continuar sem login" aria-label="Continuar sem login" @click="goHome">
            ×
          </button>

          <div>
            <p class="eyebrow">Conta opcional</p>
            <h2>{{ authMode === 'login' ? 'Acesse seu progresso' : 'Crie sua conta' }}</h2>
            <p class="muted">
              Continue estudando sem login ou entre para salvar baralhos, publicar decks e acompanhar seu progresso.
            </p>
          </div>

          <div v-if="authMode === 'register'" class="form-field">
            <label class="field-label" for="auth-display-name">Nome</label>
            <input
              id="auth-display-name"
              v-model.trim="authForm.displayName"
              class="field-control"
              :class="{ invalid: Boolean(authFieldError('displayName')) }"
              type="text"
              autocomplete="name"
              placeholder="Seu nome"
              :aria-invalid="Boolean(authFieldError('displayName'))"
              :aria-describedby="authFieldError('displayName') ? 'auth-display-name-error' : undefined"
              @blur="touchAuthField('displayName')"
            />
            <p v-if="authFieldError('displayName')" id="auth-display-name-error" class="field-error">
              {{ authFieldError('displayName') }}
            </p>
          </div>

          <div class="form-field">
            <label class="field-label" for="auth-email">E-mail</label>
            <input
              id="auth-email"
              v-model.trim="authForm.email"
              class="field-control"
              :class="{ invalid: Boolean(authFieldError('email')) }"
              type="email"
              autocomplete="email"
              placeholder="voce@email.com"
              :aria-invalid="Boolean(authFieldError('email'))"
              :aria-describedby="authFieldError('email') ? 'auth-email-error' : undefined"
              @blur="touchAuthField('email')"
            />
            <p v-if="authFieldError('email')" id="auth-email-error" class="field-error">
              {{ authFieldError('email') }}
            </p>
          </div>

          <div class="form-field">
            <label class="field-label" for="auth-password">Senha</label>
            <input
              id="auth-password"
              v-model="authForm.password"
              class="field-control"
              :class="{ invalid: Boolean(authFieldError('password')) }"
              type="password"
              :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
              placeholder="Sua senha"
              :aria-invalid="Boolean(authFieldError('password'))"
              :aria-describedby="authFieldError('password') ? 'auth-password-error' : undefined"
              @blur="touchAuthField('password')"
            />
            <p v-if="authFieldError('password')" id="auth-password-error" class="field-error">
              {{ authFieldError('password') }}
            </p>
          </div>

          <button class="primary full" type="submit">
            <User :size="16" aria-hidden="true" />
            {{ authMode === 'login' ? 'Entrar' : 'Criar conta' }}
          </button>

          <div class="auth-actions">
            <button class="ghost compact" type="button" @click="toggleAuthMode">
              {{ authMode === 'login' ? 'Criar conta' : 'Ja tenho conta' }}
            </button>
          </div>
        </form>
      </section>

      <section v-if="tab === 'library'" class="library-grid">
        <div class="library-shell">
          <div class="library-tabs" role="tablist" aria-label="Tipos de baralho">
            <button
              class="library-tab"
              :class="{ active: librarySection === 'public' }"
              type="button"
              role="tab"
              :aria-selected="librarySection === 'public'"
              @click="librarySection = 'public'"
            >
              Baralhos públicos
            </button>
            <button
              class="library-tab"
              :class="{ active: librarySection === 'mine' }"
              type="button"
              role="tab"
              :aria-selected="librarySection === 'mine'"
              @click="librarySection = 'mine'"
            >
              Meus baralhos
            </button>
          </div>

          <div class="library-toolbar">
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

          <div class="library-content">
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
        </div>
      </section>

      <section v-if="tab === 'study'" class="study-layout">
        <div class="study-header">
          <div>
            <p class="eyebrow">{{ sessionTitle }}</p>
            <h2>{{ studyQueue.length }} cards na fila</h2>
          </div>
          <button class="ghost compact" type="button" @click="startInterleavedPractice">
            <Shuffle :size="16" aria-hidden="true" />
            Prática intercalada
          </button>
        </div>

        <article v-if="currentCard" class="study-card">
          <div class="card-meta">
            <span>{{ currentCard.deckTitle }}</span>
            <span>{{ currentCard.newCard ? 'Novo' : `${currentCard.intervalDays} dias` }} · volta {{ currentDueLabel }}</span>
          </div>
          <div class="prompt" v-html="frontHtml"></div>

          <button v-if="!answerVisible" class="primary reveal" type="button" @click="answerVisible = true">
            <Eye :size="18" aria-hidden="true" />
            Revelar resposta
          </button>

          <template v-else>
            <div class="answer" v-html="backHtml"></div>
            <div class="ratings" aria-label="Avaliar resposta">
              <button class="rating again" type="button" @click="reviewCurrent('AGAIN')">De novo</button>
              <button class="rating hard" type="button" @click="reviewCurrent('HARD')">Dificil</button>
              <button class="rating good" type="button" @click="reviewCurrent('GOOD')">Bom</button>
              <button class="rating easy" type="button" @click="reviewCurrent('EASY')">Facil</button>
            </div>
          </template>
        </article>

        <div v-else class="empty-state">
          <Brain :size="36" aria-hidden="true" />
          <h2>Nenhuma sessao ativa</h2>
          <p>Escolha um baralho publico, um baralho salvo ou use a pratica intercalada.</p>
        </div>
      </section>

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

      <section v-if="tab === 'create'" class="content-grid">
        <form class="panel" @submit.prevent="createDeck">
          <div class="section-title">
            <h2>Novo baralho</h2>
          </div>
          <input v-model="deckForm.title" required type="text" placeholder="Titulo" :disabled="!user" />
          <textarea v-model="deckForm.description" rows="4" placeholder="Descricao" :disabled="!user"></textarea>
          <select v-model="deckForm.visibility" :disabled="!user">
            <option value="PRIVATE">Privado</option>
            <option value="PUBLIC">Publico</option>
          </select>
          <button class="primary full" type="submit" :disabled="!user">
            <Plus :size="16" aria-hidden="true" />
            Criar baralho
          </button>
          <p v-if="!user" class="muted">Criacao persistente exige login.</p>
        </form>

        <form class="panel wide" @submit.prevent="createCard">
          <div class="section-title">
            <h2>Novo card</h2>
          </div>
          <select v-model.number="cardForm.deckId" :disabled="!user">
            <option :value="0">Escolha um baralho</option>
            <option v-for="deck in myDecks" :key="deck.id" :value="deck.id">{{ deck.title }}</option>
          </select>
          <textarea v-model="cardForm.frontHtml" required rows="4" placeholder="Frente" :disabled="!user"></textarea>
          <textarea v-model="cardForm.backHtml" required rows="4" placeholder="Verso" :disabled="!user"></textarea>
          <input v-model="cardForm.tags" type="text" placeholder="tags separadas por virgula" :disabled="!user" />
          <button class="primary full" type="submit" :disabled="!user">
            <Plus :size="16" aria-hidden="true" />
            Adicionar card
          </button>
        </form>
      </section>

      <section v-if="tab === 'progress'" class="progress-section">
        <div v-if="user && stats" class="stats-strip">
          <article class="metric">
            <span>Vencidos agora</span>
            <strong>{{ stats.dueNow }}</strong>
          </article>
          <article class="metric">
            <span>Revisados hoje</span>
            <strong>{{ stats.reviewsToday }}</strong>
          </article>
          <article class="metric">
            <span>Acerto 7 dias</span>
            <strong>{{ stats.accuracyLast7Days }}%</strong>
          </article>
          <article class="metric">
            <span>Dias ativos 30d</span>
            <strong>{{ stats.activeDaysLast30 }}</strong>
          </article>
          <article class="metric">
            <span>Proxima revisao</span>
            <strong>{{ formatDueIn(stats.nextDueAt) }}</strong>
          </article>
        </div>

        <div v-else class="empty-state">
          <BarChart3 :size="36" aria-hidden="true" />
          <h2>Progresso persistente exige login</h2>
          <p>Entre para manter agenda, revisoes e estatisticas entre dispositivos.</p>
        </div>
      </section>
    </main>
  </div>
</template>
