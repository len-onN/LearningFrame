import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../services/api'
import type { DeckSummary, DeckVisibility } from '../../types/api'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useDeckManagementStore } from '../../stores/useDeckManagementStore'

export interface CreateDeckApi {
  createDeck(title: string, description: string, visibility: DeckVisibility): Promise<DeckSummary>
}

export interface CreateDeckFormState {
  title: string
  description: string
  visibility: DeckVisibility
}

export interface CreateDeckFlowOptions {
  client?: CreateDeckApi
}

const emptyDeckForm = (): CreateDeckFormState => ({
  title: '',
  description: '',
  visibility: 'PRIVATE'
})

export function useCreateDeckFlow({
  client = api
}: CreateDeckFlowOptions = {}) {
  const router = useRouter()
  const feedbackStore = useFeedbackStore()
  const libraryStore = useLibraryStore()
  const deckManagementStore = useDeckManagementStore()
  
  const deckForm = ref<CreateDeckFormState>(emptyDeckForm())

  async function createDeck() {
    await feedbackStore.withFeedback(async () => {
      const created = await client.createDeck(
        deckForm.value.title,
        deckForm.value.description,
        deckForm.value.visibility
      )
      deckForm.value = emptyDeckForm()
      await libraryStore.loadMyDecks(undefined, undefined, true)
      deckManagementStore.setManagedDeck(created)
      await router.push({ name: 'library-deck-manage', params: { deckId: created.id } })
      feedbackStore.showNotice('Baralho criado. Adicione as primeiras cartas.')
    })
  }

  return {
    deckForm,
    createDeck
  }
}
