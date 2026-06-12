import { api } from '../../services/api'
import type { DeckManagementApi } from '../../stores/useDeckManagementStore'
import { useDeckManagementStore, emptyManagedDeckForm, emptyCardEditorForm } from '../../stores/useDeckManagementStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

export { emptyManagedDeckForm, emptyCardEditorForm }
export type { DeckManagementApi }

export function useDeckManagement({
  pageSize = 20,
  client = api,
  confirm = (message) => window.confirm(message)
}: {
  pageSize?: number
  client?: DeckManagementApi
  confirm?: (message: string) => boolean
} = {}) {
  const router = useRouter()
  const store = useDeckManagementStore()

  const {
    managedDeck,
    managedDeckForm,
    managedCards,
    managedCardsPage,
    managedCardsSearch,
    selectedManagedCardId,
    selectedManagedCardIds,
    cardEditorOpen,
    cardEditorMode,
    cardEditorCardId,
    cardEditorForm,
    cardEditorInitial
  } = storeToRefs(store)

  const {
    managedCardsView,
    managedDeckDirty,
    cardEditorDirty,
    cardEditorTitle,
    cardEditorFrontPreview,
    cardEditorBackPreview,
    selectedManagedCard,
    loadingMoreManagedCards
  } = storeToRefs(store) // We can treat computeds as refs from the store

  async function navigateToMyDecks() {
    await router.replace({ name: 'library-mine' })
  }

  async function loadManagedDeckRoute(deckId: number) {
    await store.loadManagedDeckRoute(deckId, client, pageSize)
  }

  async function closeManagedDeck(force = false, navigateToList = true) {
    if (navigateToList) {
      return store.closeManagedDeck(navigateToMyDecks, force, confirm)
    }
    // Just close and do not navigate
    return store.closeManagedDeck(async () => {}, force, confirm)
  }

  async function loadManagedCards(reset = false) {
    await store.loadManagedCards(client, pageSize, reset)
  }

  async function loadMoreManagedCards() {
    await store.loadMoreManagedCards(client, pageSize)
  }

  async function saveManagedDeck() {
    await store.saveManagedDeck(client)
  }

  async function deleteManagedDeck() {
    await store.deleteManagedDeck(navigateToMyDecks, client, confirm)
  }

  function closeCardEditor(force = false) {
    store.closeCardEditor(force, confirm)
  }

  async function saveCardEditor() {
    await store.saveCardEditor(client, pageSize)
  }

  async function deleteManagedCard(card: any) {
    await store.deleteManagedCard(card, client, pageSize, confirm)
  }

  async function deleteSelectedManagedCards() {
    await store.deleteSelectedManagedCards(client, pageSize, confirm)
  }

  async function uploadCardEditorMedia(file: File, kind: any) {
    return store.uploadCardEditorMedia(file, kind, client)
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
    setManagedDeck: store.setManagedDeck,
    updateManagedDeckForm: store.updateManagedDeckForm,
    loadManagedDeckRoute,
    closeManagedDeck,
    loadManagedCards,
    loadingMoreManagedCards,
    loadMoreManagedCards,
    saveManagedDeck,
    deleteManagedDeck,
    openCreateCardEditor: store.openCreateCardEditor,
    openEditCardEditor: store.openEditCardEditor,
    openCardEditor: store.openCardEditor,
    closeCardEditor,
    saveCardEditor,
    deleteManagedCard,
    deleteSelectedManagedCards,
    selectManagedCard: store.selectManagedCard,
    toggleManagedCardSelection: store.toggleManagedCardSelection,
    toggleVisibleManagedCardsSelection: store.toggleVisibleManagedCardsSelection,
    clearManagedCardSelection: store.clearManagedCardSelection,
    uploadCardEditorMedia,
    handleCardEditorUploadError: store.handleCardEditorUploadError
  }
}
