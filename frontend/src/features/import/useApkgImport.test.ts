import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type {
  ApkgImportResponse,
  ApkgPreviewResponse,
  UserResponse
} from '../../types/api'
import type { ApkgMediaIndex } from '../../utils/apkgMedia'
import { useApkgImport, type ApkgImportApi } from './useApkgImport'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { useAuthStore } from '../../stores/useAuthStore'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: vi.fn()
}))

describe('useApkgImport', () => {
  beforeEach(() => { setActivePinia(createPinia()) })
  it('carrega preview APKG, prepara midia da primeira carta e monta opcoes de busca', async () => {
    const { client, createMediaIndex, createObjectUrl, decodeImage, flow, showNotice } = createSubject()
    const file = fakeFile()
    const { event, input } = fileChangeEvent(file)
    client.previewApkg.mockResolvedValueOnce(preview({
      title: 'Biologia',
      mediaFound: 1,
      cards: [
        previewCard('<p>Frente</p><img src="front.png">', '<p>Verso</p>'),
        previewCard('<p>Orbita</p>', '<p>Conceito</p>', ['Anatomia'])
      ]
    }))

    await flow.handleApkgChange(event)

    expect(client.previewApkg).toHaveBeenCalledWith(file)
    expect(createMediaIndex).toHaveBeenCalledWith(file)
    expect(createObjectUrl).toHaveBeenCalledOnce()
    expect(decodeImage).toHaveBeenCalledWith('blob:1')
    expect(flow.selectedFile.value).toEqual(file)
    expect(flow.importTitle.value).toBe('Biologia')
    expect(flow.currentPreviewCard.value?.frontHtml).toContain('Frente')
    expect(flow.currentPreviewHtml.value).toContain('blob:1')
    expect(flow.previewCardOptions.value.map((option) => option.label)).toEqual([
      '1 - Frente',
      '2 - Orbita'
    ])
    flow.previewCardSearch.value = 'anatomia'
    expect(flow.previewCardOptions.value.map((option) => option.index)).toEqual([1])
    expect(input.value).toBe('')
    expect(showNotice).toHaveBeenCalledWith('APKG analisado. A midia sera exibida na previa enquanto este arquivo estiver selecionado.')
  })

  it('preserva preview ao pedir login para salvar APKG', async () => {
    const { client, flow, router, route, showNotice } = createSubject()
    const file = fakeFile()
    client.previewApkg.mockResolvedValueOnce(preview({ title: 'Importado' }))
    await flow.handleApkgChange(fileChangeEvent(file).event)

    await flow.persistImport()
    route.name = 'login'
    flow.clearImportStateForRouteChange('/importar')

    expect(router.push).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/importar' } })
    expect(client.importApkg).not.toHaveBeenCalled()
    expect(flow.selectedFile.value).toEqual(file)
    expect(flow.importPreview.value?.title).toBe('Importado')
    expect(showNotice).toHaveBeenLastCalledWith('Entre para salvar o APKG com midia em Meus baralhos.')
    expect(flow.consumeReturnToImportAfterAuth()).toBe(true)
    expect(flow.consumeReturnToImportAfterAuth()).toBe(false)
  })

  it('salva APKG autenticado e limpa estado temporario antes de navegar', async () => {
    const {
      client,
      flow,
      router,
      revokeObjectUrl,
      showNotice,
      user
    } = createSubject()
    user.value = currentUser()
    const file = fakeFile()
    client.previewApkg.mockResolvedValueOnce(preview({
      title: 'Deck APKG',
      mediaFound: 1,
      cards: [previewCard('<img src="front.png">', '')]
    }))
    client.importApkg.mockResolvedValueOnce(importResult({
      deckId: 42,
      cardsImported: 3,
      mediaImported: 1
    }))
    await flow.handleApkgChange(fileChangeEvent(file).event)

    await flow.persistImport()

    expect(client.importApkg).toHaveBeenCalledWith(file, 'Deck APKG', 'PRIVATE')
    expect(flow.selectedFile.value).toBeNull()
    expect(flow.importPreview.value).toBeNull()
    expect(flow.importSaving.value).toBe(false)
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:1')
    expect(router.push).toHaveBeenCalledWith({ name: 'library-mine', query: { highlight: 42 } })
    expect(showNotice).toHaveBeenLastCalledWith('Baralho APKG salvo com 3 cartas e 1 midias.')
  })

  it('limpa arquivo, preview e object URLs ao sair da importacao fora do fluxo preservado', async () => {
    const { client, flow, revokeObjectUrl, route } = createSubject()
    const file = fakeFile()
    client.previewApkg.mockResolvedValueOnce(preview({
      mediaFound: 1,
      cards: [previewCard('<img src="front.png">', '')]
    }))
    await flow.handleApkgChange(fileChangeEvent(file).event)

    route.name = 'library-public'
    flow.clearImportStateForRouteChange('/importar')

    expect(flow.selectedFile.value).toBeNull()
    expect(flow.importPreview.value).toBeNull()
    expect(flow.previewMediaUrls.value).toEqual({})
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:1')
  })
})

function createSubject() {
  setActivePinia(createPinia())
  const route = { name: 'import' }
  const router = { push: vi.fn() }
  const user = ref<UserResponse | null>(null)
  const showNotice = vi.fn()
  const showError = vi.fn()
  const withFeedback = vi.fn(async (task: () => Promise<void>) => {
    await task()
  })
  const feedbackStore = useFeedbackStore()
  try { feedbackStore.showError = showError as any } catch(e) {}
  try { feedbackStore.showNotice = showNotice as any } catch(e) {}
  try { feedbackStore.withFeedback = withFeedback as any } catch(e) {}

  vi.mocked(useRoute).mockReturnValue(route as any)
  vi.mocked(useRouter).mockReturnValue(router as any)
  vi.mocked(useAuthStore).mockReturnValue({ user } as any)

  const client = createClient()
  const mediaIndex = createMediaIndex()
  let urlIndex = 0
  const createObjectUrl = vi.fn(() => `blob:${++urlIndex}`)
  const revokeObjectUrl = vi.fn()
  const decodeImage = vi.fn(async () => undefined)
  const createMediaIndexMock = vi.fn(async () => mediaIndex)

  const flow = useApkgImport({
    client,
    createMediaIndex: createMediaIndexMock,
    createObjectUrl,
    revokeObjectUrl,
    decodeImage
  })

  return {
    route,
    router,
    user,
    client,
    mediaIndex,
    createMediaIndex: createMediaIndexMock,
    createObjectUrl,
    revokeObjectUrl,
    decodeImage,
    showNotice,
    showError,
    withFeedback,
    flow
  }
}

function createClient() {
  return {
    previewApkg: vi.fn(async () => preview()),
    importApkg: vi.fn(async () => importResult())
  } satisfies Record<keyof ApkgImportApi, ReturnType<typeof vi.fn>>
}

function createMediaIndex(): ApkgMediaIndex {
  return {
    hasMediaMap: true,
    fileNames: ['front.png', 'back.mp3'],
    readBlob: vi.fn(async (fileName: string) => (
      new Blob(['media'], { type: fileName.endsWith('.png') ? 'image/png' : 'audio/mpeg' })
    ))
  }
}

function fileChangeEvent(file: File | null) {
  const input = {
    files: file ? [file] : [],
    value: 'C:\\fakepath\\deck.apkg'
  } as unknown as HTMLInputElement
  return {
    input,
    event: { target: input } as unknown as Event
  }
}

function fakeFile() {
  return { name: 'deck.apkg' } as File
}

function preview(overrides: Partial<ApkgPreviewResponse> = {}): ApkgPreviewResponse {
  return {
    title: 'Deck',
    notesFound: 1,
    cardsReady: 1,
    cardsSkipped: 0,
    mediaFound: 0,
    warnings: [],
    cards: [previewCard('<p>Frente</p>', '<p>Verso</p>')],
    ...overrides
  }
}

function previewCard(frontHtml: string, backHtml: string, tags: string[] = []) {
  return {
    frontHtml,
    backHtml,
    tags
  }
}

function importResult(overrides: Partial<ApkgImportResponse> = {}): ApkgImportResponse {
  return {
    deckId: 7,
    title: 'Deck',
    visibility: 'PRIVATE',
    cardsImported: 1,
    cardsSkipped: 0,
    mediaImported: 0,
    warnings: [],
    ...overrides
  }
}

function currentUser(): UserResponse {
  return {
    id: 1,
    displayName: 'Lia',
    email: 'lia@example.com'
  }
}
