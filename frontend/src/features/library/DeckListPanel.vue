<script setup lang="ts">
import { Brain, Pencil, Save } from '@lucide/vue'
import type { DeckSummary } from '../../types/api'
import type { DeckListFormatters } from './libraryTypes'

defineProps<{
  decks: DeckSummary[]
  emptyMessage: string
  hasMore: boolean
  highlightedDeckId?: number | null
  showSaveAction?: boolean
  showManageAction?: boolean
  formatters: DeckListFormatters
}>()

defineEmits<{
  start: [deck: DeckSummary]
  save: [deck: DeckSummary]
  manage: [deck: DeckSummary]
  'load-more': []
}>()
</script>

<template>
  <div class="panel wide">
    <div v-if="decks.length" class="deck-list">
      <article
        v-for="deck in decks"
        :key="deck.id"
        :data-deck-id="deck.id"
        class="deck-card"
        :class="{ highlighted: highlightedDeckId === deck.id }"
      >
        <div>
          <h3>{{ deck.title }}</h3>
          <p>{{ deck.description }}</p>
          <span>{{ formatters.cardCount(deck.cardCount) }} · {{ formatters.due(deck) }}</span>
        </div>
        <div class="row-actions">
          <button class="primary compact" type="button" @click="$emit('start', deck)">
            <Brain :size="16" aria-hidden="true" />
            Estudar
          </button>
          <button
            v-if="showSaveAction"
            class="ghost compact"
            type="button"
            @click="$emit('save', deck)"
          >
            <Save :size="16" aria-hidden="true" />
            Salvar para mim
          </button>
          <button
            v-if="showManageAction"
            class="ghost compact"
            type="button"
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
      href="#"
      @click.prevent="$emit('load-more')"
    >
      Carregar mais baralhos...
    </a>
  </div>
</template>
