<script setup lang="ts">
import { RotateCcw, Search, User } from '@lucide/vue'
import type { CardResponse, DeckSummary, UserResponse } from '../types/api'
import DeckListPanel from '../features/library/DeckListPanel.vue'
import DeckManagementView from '../features/library/DeckManagementView.vue'
import type {
  CardTextFormatter,
  DeckListFormatters,
  LibrarySection,
  LibraryView,
  ManagedCardsViewState,
  ManagedDeckFormState
} from '../features/library/libraryTypes'

defineProps<{
  section: LibrarySection
  view: LibraryView
  user: UserResponse | null
  search: string
  activeCountLabel: string
  publicDecks: DeckSummary[]
  myDecks: DeckSummary[]
  publicDecksHasMore: boolean
  myDecksHasMore: boolean
  highlightedDeckId: number | null
  managedDeck: DeckSummary | null
  managedDeckForm: ManagedDeckFormState
  managedDeckDirty: boolean
  managedCardsView: ManagedCardsViewState
  managedCardsSearch: string
  deckFormatters: DeckListFormatters
  cardTextSummary: CardTextFormatter
  cardCountLabel: (count: number) => string
}>()

defineEmits<{
  'go-public': []
  'go-mine': []
  'update:search': [value: string]
  refresh: []
  'start-deck': [deck: DeckSummary]
  'save-public-deck': [deck: DeckSummary]
  'load-more-public': []
  'load-more-mine': []
  'open-managed-deck': [deck: DeckSummary]
  login: []
  'close-managed-deck': []
  'save-managed-deck': []
  'delete-managed-deck': []
  'update:managed-deck-form': [form: ManagedDeckFormState]
  'update:managed-cards-search': [value: string]
  'create-card': []
  'toggle-visible-card-selection': []
  'clear-card-selection': []
  'delete-selected-cards': []
  'select-card': [card: CardResponse]
  'toggle-card-selection': [cardId: number]
  'load-more-cards': []
  'edit-card': [card: CardResponse]
  'delete-card': [card: CardResponse]
}>()
</script>

<template>
  <section class="library-grid">
    <div class="library-shell">
      <div class="library-tabs" role="tablist" aria-label="Tipos de baralho">
        <button
          class="library-tab"
          :class="{ active: section === 'public' }"
          type="button"
          role="tab"
          :aria-selected="section === 'public'"
          @click="$emit('go-public')"
        >
          Baralhos públicos
        </button>
        <button
          class="library-tab"
          :class="{ active: section === 'mine' }"
          type="button"
          role="tab"
          :aria-selected="section === 'mine'"
          @click="$emit('go-mine')"
        >
          Meus baralhos
        </button>
      </div>

      <div v-if="view === 'decks'" class="library-toolbar">
        <label class="library-search">
          <Search :size="17" aria-hidden="true" />
          <input
            :value="search"
            type="search"
            placeholder="Buscar baralhos"
            @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          />
        </label>
        <div class="row-actions">
          <span v-if="activeCountLabel" class="muted">{{ activeCountLabel }}</span>
          <button class="ghost compact" type="button" @click="$emit('refresh')">
            <RotateCcw :size="16" aria-hidden="true" />
            Atualizar
          </button>
        </div>
      </div>

      <div v-if="view === 'decks'" class="library-content">
        <DeckListPanel
          v-if="section === 'public'"
          :decks="publicDecks"
          empty-message="Nenhum baralho público encontrado."
          :has-more="publicDecksHasMore"
          show-save-action
          :formatters="deckFormatters"
          @start="$emit('start-deck', $event)"
          @save="$emit('save-public-deck', $event)"
          @load-more="$emit('load-more-public')"
        />

        <DeckListPanel
          v-if="section === 'mine' && user"
          :decks="myDecks"
          empty-message="Nenhum baralho seu encontrado."
          :has-more="myDecksHasMore"
          :highlighted-deck-id="highlightedDeckId"
          show-manage-action
          :formatters="deckFormatters"
          @start="$emit('start-deck', $event)"
          @manage="$emit('open-managed-deck', $event)"
          @load-more="$emit('load-more-mine')"
        />

        <div v-else-if="section === 'mine'" class="panel wide">
          <div class="empty-state compact-empty">
            <h2>Entre para ver seus baralhos</h2>
            <p>Baralhos criados, importados e publicados pela sua conta aparecem aqui.</p>
            <button class="primary compact" type="button" @click="$emit('login')">
              <User :size="16" aria-hidden="true" />
              Entrar
            </button>
          </div>
        </div>
      </div>

      <DeckManagementView
        v-else-if="managedDeck"
        :deck="managedDeck"
        :form="managedDeckForm"
        :dirty="managedDeckDirty"
        :cards-view="managedCardsView"
        :cards-search="managedCardsSearch"
        :card-text-summary="cardTextSummary"
        :card-count-label="cardCountLabel"
        @back="$emit('close-managed-deck')"
        @save-deck="$emit('save-managed-deck')"
        @delete-deck="$emit('delete-managed-deck')"
        @update:form="$emit('update:managed-deck-form', $event)"
        @update:cards-search="$emit('update:managed-cards-search', $event)"
        @create-card="$emit('create-card')"
        @toggle-page-selection="$emit('toggle-visible-card-selection')"
        @clear-selection="$emit('clear-card-selection')"
        @delete-selected="$emit('delete-selected-cards')"
        @select-card="$emit('select-card', $event)"
        @toggle-card-selection="$emit('toggle-card-selection', $event)"
        @load-more-cards="$emit('load-more-cards')"
        @edit-card="$emit('edit-card', $event)"
        @delete-card="$emit('delete-card', $event)"
      />
    </div>
  </section>
</template>
