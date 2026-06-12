import { ref } from 'vue'
import { api } from '../../services/api'
import type { DeckSummary, DeckVisibility } from '../../types/api'
import { useFeedbackStore } from '../../stores/useFeedbackStore'

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
  loadMyDecks: (reset?: boolean) => Promise<void>
  setManagedDeck: (deck: DeckSummary) => void
  navigateToManagedDeck: (deckId: number) => Promise<void>
}

const emptyDeckForm = (): CreateDeckFormState => ({
  title: '',
  description: '',
  visibility: 'PRIVATE'
})

export function useCreateDeckFlow({
  client = api,
  loadMyDecks,
  setManagedDeck,
  navigateToManagedDeck
}: CreateDeckFlowOptions) {
  const feedbackStore = useFeedbackStore()
  const deckForm = ref<CreateDeckFormState>(emptyDeckForm())

  async function createDeck() {
    await feedbackStore.withFeedback(async () => {
      const created = await client.createDeck(
        deckForm.value.title,
        deckForm.value.description,
        deckForm.value.visibility
      )
      deckForm.value = emptyDeckForm()
      await loadMyDecks(true)
      setManagedDeck(created)
      await navigateToManagedDeck(created.id)
      feedbackStore.showNotice('Baralho criado. Adicione as primeiras cartas.')
    })
  }

  return {
    deckForm,
    createDeck
  }
}
