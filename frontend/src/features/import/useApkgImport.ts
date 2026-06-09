import { computed, ref, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { api } from '../../services/api'
import type {
  ApkgCard,
  ApkgImportResponse,
  ApkgPreviewResponse,
  DeckVisibility,
  UserResponse
} from '../../types/api'
import { createApkgMediaIndex, normalizeMediaName, type ApkgMediaIndex } from '../../utils/apkgMedia'
import { extractRelativeMediaSources, safePreviewHtml } from '../../utils/html'
import type { AuthMode } from '../../utils/authValidation'
import {
  previewCardOptionLabel,
  previewCardSearchText,
  previewCardTitle as formatPreviewCardTitle
} from './importPreview'
import type { PreviewFace } from './importTypes'

export interface ApkgImportApi {
  previewApkg(file: File): Promise<ApkgPreviewResponse>
  importApkg(file: File, title: string, visibility: DeckVisibility): Promise<ApkgImportResponse>
}

interface FeedbackOptions {
  showLoading?: boolean
  clearOnStart?: boolean
}

export interface ApkgImportOptions {
  route: RouteLocationNormalizedLoaded
  user: Ref<UserResponse | null>
  openAuth: (mode?: AuthMode) => Promise<void>
  loadMyDecks: (reset?: boolean) => Promise<void>
  refreshStats: () => Promise<void>
  highlightDeck: (deckId: number) => Promise<void>
  navigateToMyDecks: () => Promise<void>
  showNotice: (message: string) => void
  showError: (message: string) => void
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
  client?: ApkgImportApi
  createMediaIndex?: (file: File) => Promise<ApkgMediaIndex | null>
  createObjectUrl?: (blob: Blob) => string
  revokeObjectUrl?: (url: string) => void
  decodeImage?: (url: string) => Promise<unknown>
}

export function useApkgImport({
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
  client = api,
  createMediaIndex = readApkgMediaIndex,
  createObjectUrl = (blob) => URL.createObjectURL(blob),
  revokeObjectUrl = (url) => URL.revokeObjectURL(url),
  decodeImage = decodePreviewImage
}: ApkgImportOptions) {
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

  let previewMediaRequest = 0
  let importPreviewRequest = 0

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
    const query = normalizePreviewQuery(previewCardSearch.value)
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
          client.previewApkg(file),
          createMediaIndex(file).catch(() => null)
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
        const result = await client.importApkg(selectedFile.value as File, importTitle.value, importVisibility.value)
        importResult.value = result
        resetImportPreviewState()
        selectedFile.value = null
        await loadMyDecks(true)
        if (user.value) {
          await refreshStats()
        }
        await navigateToMyDecks()
        showNotice(result.mediaImported > 0
          ? `Baralho APKG salvo com ${result.cardsImported} cartas e ${result.mediaImported} midias.`
          : 'Baralho APKG salvo em Meus baralhos.')
        await highlightDeck(result.deckId)
      })
    } finally {
      importSaving.value = false
    }
  }

  function consumeReturnToImportAfterAuth() {
    if (!returnToImportAfterAuth.value || !importPreview.value) {
      return false
    }
    returnToImportAfterAuth.value = false
    return true
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

  async function readPreviewMediaUrls(card: Pick<ApkgCard, 'frontHtml' | 'backHtml'>, face: PreviewFace) {
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
        const url = createObjectUrl(blob)
        urls[normalized] = url
        if (blob.type.startsWith('image/')) {
          await decodeImage(url).catch(() => undefined)
        }
      }
    }
    return urls
  }

  function revokePreviewMediaUrls(urls = previewMediaUrls.value) {
    Object.values(urls).forEach((url) => revokeObjectUrl(url))
    if (urls === previewMediaUrls.value) {
      previewMediaUrls.value = {}
    }
  }

  function disposeApkgImport() {
    revokePreviewMediaUrls()
  }

  return {
    selectedFile,
    importVisibility,
    importTitle,
    importPreview,
    importResult,
    returnToImportAfterAuth,
    previewCardIndex,
    previewFace,
    previewPickerOpen,
    previewCardSearch,
    previewMediaIndex,
    previewMediaUrls,
    importSaving,
    currentPreviewCard,
    currentPreviewHtml,
    previewCardOptions,
    previewCardTitle,
    handleApkgChange,
    persistImport,
    consumeReturnToImportAfterAuth,
    resetImportPreviewState,
    clearImportWorkflowState,
    clearImportStateForRouteChange,
    selectPreviewCard,
    movePreviewCard,
    togglePreviewFace,
    showPreviewCard,
    readPreviewMediaUrls,
    revokePreviewMediaUrls,
    disposeApkgImport
  }
}

async function readApkgMediaIndex(file: File) {
  return createApkgMediaIndex(file)
}

function isAuthPath(path: string) {
  return path.startsWith('/entrar') || path.startsWith('/cadastro')
}

function decodePreviewImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode()
}

function normalizePreviewQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
