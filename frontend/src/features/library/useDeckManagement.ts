import { computed, ref } from 'vue'
import { api } from '../../services/api'
import type { CardResponse, DeckSummary, DeckVisibility, MediaUploadResponse, PageResponse } from '../../types/api'
import { safePreviewHtml, safeStudyHtml } from '../../utils/html'
import type { FeedbackOptions } from '../../composables/useFeedback'
import { useDebouncedWatch } from '../../composables/useDebouncedWatch'
import type { CardEditorMediaKind, CardEditorMode } from './cardEditorTypes'
import type { ManagedCardsViewState, ManagedDeckFormState } from './libraryTypes'
import { deckPageCountLabel } from './useDeckLibrary'
import { mergeCardsPages, splitTags } from './cardText'

export interface DeckManagementApi {
  deckMetadata(deckId: number): Promise<DeckSummary>
  deckCards(deckId: number, page?: number, size?: number, query?: string): Promise<PageResponse<CardResponse>>
  updateDeck(deckId: number, title: string, description: string, visibility: DeckVisibility): Promise<DeckSummary>
  deleteDeck(deckId: number): Promise<void>
  createCard(deckId: number, frontHtml: string, backHtml: string, tags: string[]): Promise<CardResponse>
  updateCard(deckId: number, cardId: number, frontHtml: string, backHtml: string, tags: string[]): Promise<CardResponse>
  deleteCard(deckId: number, cardId: number): Promise<void>
  deleteCards(deckId: number, cardIds: number[]): Promise<void>
  uploadMedia(deckId: number, file: File): Promise<MediaUploadResponse>
}

export interface DeckManagementOptions {
  pageSize?: number
  searchDebounceMs?: number
  client?: DeckManagementApi
  showNotice: (message: string) => void
  showError: (message: string) => void
  withFeedback: (
    task: () => Promise<void>,
    optionsOrShowLoading?: FeedbackOptions | boolean,
    legacyClearOnStart?: boolean
  ) => Promise<void>
  loadMyDecks: (reset?: boolean) => Promise<void>
  refreshStats: () => Promise<void>
  navigateToMyDecks: () => Promise<void>
  confirm?: (message: string) => boolean
}

const emptyManagedDeckForm = (): ManagedDeckFormState => ({
  title: '',
  description: '',
  visibility: 'PRIVATE'
})

const emptyCardEditorForm = () => ({
  frontHtml: '',
  backHtml: '',
  tags: ''
})

export function useDeckManagement({
  pageSize = 20,
  searchDebounceMs = 300,
  client = api,
  showNotice,
  showError,
  withFeedback,
  loadMyDecks,
  refreshStats,
  navigateToMyDecks,
  confirm = (message) => window.confirm(message)
}: DeckManagementOptions) {
  const managedDeck = ref<DeckSummary | null>(null)
  const managedDeckForm = ref<ManagedDeckFormState>(emptyManagedDeckForm())
  const managedCards = ref<CardResponse[]>([])
  const managedCardsPage = ref<PageResponse<CardResponse> | null>(null)
  const managedCardsSearch = ref('')
  const selectedManagedCardId = ref<number | null>(null)
  const selectedManagedCardIds = ref<Set<number>>(new Set())

  const cardEditorOpen = ref(false)
  const cardEditorMode = ref<CardEditorMode>('create')
  const cardEditorCardId = ref<number | null>(null)
  const cardEditorForm = ref(emptyCardEditorForm())
  const cardEditorInitial = ref(emptyCardEditorForm())

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

  useDebouncedWatch(managedCardsSearch, () => {
    if (managedDeck.value) {
      void withFeedback(async () => loadManagedCards(true), { showLoading: false })
    }
  }, searchDebounceMs)

  function setManagedDeck(deck: DeckSummary) {
    managedDeck.value = deck
    managedDeckForm.value = {
      title: deck.title,
      description: deck.description ?? '',
      visibility: deck.visibility
    }
  }

  function updateManagedDeckForm(nextForm: ManagedDeckFormState) {
    managedDeckForm.value = nextForm
  }

  async function loadManagedDeckRoute(deckId: number) {
    await withFeedback(async () => {
      const deck = await client.deckMetadata(deckId)
      setManagedDeck(deck)
      await loadManagedCards(true)
    }, { clearOnStart: false })
  }

  async function closeManagedDeck(force = false, navigateToList = true) {
    if (!force && managedDeckDirty.value && !confirm('Descartar alteracoes do baralho?')) {
      return false
    }
    closeCardEditor(true)
    managedDeck.value = null
    managedDeckForm.value = emptyManagedDeckForm()
    managedCards.value = []
    managedCardsPage.value = null
    managedCardsSearch.value = ''
    selectedManagedCardId.value = null
    selectedManagedCardIds.value = new Set()
    if (navigateToList) {
      await navigateToMyDecks()
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
    const response = await client.deckCards(deckId, page, pageSize, query)
    managedCards.value = reset ? response.content : mergeCardsPages(managedCards.value, response.content)
    managedCardsPage.value = response
    selectedManagedCardIds.value = new Set([...selectedManagedCardIds.value].filter((id) => (
      managedCards.value.some((card) => card.id === id)
    )))
    if (!selectedManagedCardId.value || !managedCards.value.some((card) => card.id === selectedManagedCardId.value)) {
      selectedManagedCardId.value = managedCards.value[0]?.id ?? null
    }
  }

  const loadingMoreManagedCards = ref(false)
  async function loadMoreManagedCards() {
    loadingMoreManagedCards.value = true
    try {
      await withFeedback(async () => {
        await loadManagedCards()
      }, { showLoading: false })
    } finally {
      loadingMoreManagedCards.value = false
    }
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
      const updated = await client.updateDeck(
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
    if (!deck || !confirm(`Excluir o baralho "${deck.title}" e todas as suas cartas?`)) {
      return
    }

    await withFeedback(async () => {
      await client.deleteDeck(deck.id)
      await closeManagedDeck(true)
      await loadMyDecks(true)
      await refreshStats()
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
    if (!force && cardEditorDirty.value && !confirm('Descartar alteracoes desta carta?')) {
      return
    }
    cardEditorOpen.value = false
    cardEditorCardId.value = null
    cardEditorForm.value = emptyCardEditorForm()
    cardEditorInitial.value = emptyCardEditorForm()
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
        savedCard = await client.updateCard(deck.id, cardEditorCardId.value, cardEditorForm.value.frontHtml, cardEditorForm.value.backHtml, tags)
        showNotice('Carta atualizada.')
      } else {
        savedCard = await client.createCard(deck.id, cardEditorForm.value.frontHtml, cardEditorForm.value.backHtml, tags)
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
    if (!deck || !confirm('Excluir esta carta?')) {
      return
    }
    await withFeedback(async () => {
      await client.deleteCard(deck.id, card.id)
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
    if (!confirm(`Excluir ${cardIds.length} ${cardIds.length === 1 ? 'carta selecionada' : 'cartas selecionadas'}?`)) {
      return
    }

    await withFeedback(async () => {
      await client.deleteCards(deck.id, cardIds)
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

    const uploaded = await client.uploadMedia(deck.id, file)
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

  return {
    managedDeck,
    managedDeckForm,
    managedDeckDirty,
    managedCards,
    managedCardsPage,
    managedCardsSearch,
    selectedManagedCardId,
    selectedManagedCardIds,
    selectedManagedCard,
    managedCardsView,
    cardEditorOpen,
    cardEditorMode,
    cardEditorCardId,
    cardEditorForm,
    cardEditorInitial,
    cardEditorDirty,
    cardEditorTitle,
    cardEditorFrontPreview,
    cardEditorBackPreview,
    setManagedDeck,
    updateManagedDeckForm,
    loadManagedDeckRoute,
    closeManagedDeck,
    loadManagedCards,
    loadingMoreManagedCards,
    loadMoreManagedCards,
    saveManagedDeck,
    deleteManagedDeck,
    openCreateCardEditor,
    openEditCardEditor,
    openCardEditor,
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
  }
}
