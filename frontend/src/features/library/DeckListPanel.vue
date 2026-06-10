<script setup lang="ts">
import { Brain, Pencil, Save, Loader2 } from '@lucide/vue'
import type { DeckSummary } from '../../types/api'
import type { DeckListFormatters } from './libraryTypes'

const props = defineProps<{
  decks: DeckSummary[]
  emptyMessage: string
  hasMore: boolean
  loadingMore?: boolean
  highlightedDeckId?: number | null
  showSaveAction?: boolean
  showManageAction?: boolean
  selectable?: boolean
  selectionMode?: boolean
  selectedDeckIds?: Set<number>
  formatters: DeckListFormatters
}>()

const emit = defineEmits<{
  start: [deck: DeckSummary]
  save: [deck: DeckSummary]
  manage: [deck: DeckSummary]
  'load-more': []
  'toggle-selection': [deckId: number]
}>()

function isSelectionActive() {
  return Boolean(props.selectable && props.selectionMode)
}

function isDeckSelected(deckId: number) {
  return Boolean(props.selectedDeckIds?.has(deckId))
}

function toggleDeckSelection(deckId: number) {
  if (isSelectionActive()) {
    emit('toggle-selection', deckId)
  }
}

function handleSelectionKey(event: KeyboardEvent, deckId: number) {
  if (!isSelectionActive() || !['Enter', ' '].includes(event.key)) {
    return
  }
  event.preventDefault()
  emit('toggle-selection', deckId)
}
</script>

<template>
  <div class="panel wide">
    <div v-if="decks.length" class="deck-list">
      <article
        v-for="deck in decks"
        :key="deck.id"
        :data-deck-id="deck.id"
        class="deck-card"
        :class="{
          highlighted: highlightedDeckId === deck.id,
          selectable: selectable && selectionMode,
          selected: isDeckSelected(deck.id)
        }"
        :role="selectable && selectionMode ? 'checkbox' : undefined"
        :aria-checked="selectable && selectionMode ? isDeckSelected(deck.id) : undefined"
        :tabindex="selectable && selectionMode ? 0 : undefined"
        @click="toggleDeckSelection(deck.id)"
        @keydown="handleSelectionKey($event, deck.id)"
      >
        <label
          v-if="selectable && selectionMode"
          class="deck-selection"
          :aria-label="`Selecionar ${deck.title}`"
          @click.stop
        >
          <input
            type="checkbox"
            :checked="isDeckSelected(deck.id)"
            @change="toggleDeckSelection(deck.id)"
          />
        </label>
        <div>
          <h3>{{ deck.title }}</h3>
          <p>{{ deck.description }}</p>
          <span>{{ formatters.cardCount(deck.cardCount) }} · {{ formatters.due(deck) }}</span>
        </div>
        <div class="row-actions">
          <button
            class="primary compact"
            type="button"
            :disabled="selectionMode"
            @click="$emit('start', deck)"
          >
            <Brain :size="16" aria-hidden="true" />
            Estudar
          </button>
          <button
            v-if="showSaveAction"
            class="ghost compact"
            type="button"
            :disabled="selectionMode"
            @click="$emit('save', deck)"
          >
            <Save :size="16" aria-hidden="true" />
            Salvar para mim
          </button>
          <button
            v-if="showManageAction"
            class="ghost compact"
            type="button"
            :disabled="selectionMode"
            @click="$emit('manage', deck)"
          >
            <Pencil :size="16" aria-hidden="true" />
            Gerenciar
          </button>
        </div>
      </article>
    </div>
    <p v-else class="muted empty-copy">{{ emptyMessage }}</p>
    <a
      v-if="hasMore"
      class="load-more-link"
      :class="{ 'is-loading': loadingMore }"
      href="#"
      @click.prevent="!loadingMore && $emit('load-more')"
    >
      <Loader2 v-if="loadingMore" :size="16" aria-hidden="true" class="icon-spin" />
      {{ loadingMore ? 'Carregando...' : 'Carregar mais baralhos...' }}
    </a>
  </div>
</template>
