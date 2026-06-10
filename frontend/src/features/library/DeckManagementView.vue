<script setup lang="ts">
import { ArrowLeft, Pencil, Plus, Save, Search, Trash2, Loader2 } from '@lucide/vue'
import type { CardResponse, DeckSummary, DeckVisibility } from '../../types/api'
import type { CardTextFormatter, ManagedCardsViewState, ManagedDeckFormState } from './libraryTypes'

const props = defineProps<{
  deck: DeckSummary
  form: ManagedDeckFormState
  dirty: boolean
  cardsView: ManagedCardsViewState
  cardsSearch: string
  loadingMore?: boolean
  cardTextSummary: CardTextFormatter
  cardCountLabel: (count: number) => string
}>()

const emit = defineEmits<{
  back: []
  'save-deck': []
  'delete-deck': []
  'create-card': []
  'toggle-page-selection': []
  'clear-selection': []
  'delete-selected': []
  'select-card': [card: CardResponse]
  'toggle-card-selection': [cardId: number]
  'load-more-cards': []
  'edit-card': [card: CardResponse]
  'delete-card': [card: CardResponse]
  'update:form': [form: ManagedDeckFormState]
  'update:cards-search': [value: string]
}>()

function updateForm(patch: Partial<ManagedDeckFormState>) {
  emit('update:form', { ...props.form, ...patch })
}
</script>

<template>
  <div class="manage-deck-view">
    <div class="manage-deck-header">
      <button class="ghost compact" type="button" @click="$emit('back')">
        <ArrowLeft :size="16" aria-hidden="true" />
        Voltar
      </button>
      <div class="row-actions">
        <button class="primary compact" type="button" :disabled="!dirty" @click="$emit('save-deck')">
          <Save :size="16" aria-hidden="true" />
          Salvar
        </button>
        <button class="ghost compact danger-action" type="button" @click="$emit('delete-deck')">
          <Trash2 :size="16" aria-hidden="true" />
          Excluir baralho
        </button>
      </div>
    </div>

    <section class="manage-deck-layout">
      <form class="panel manage-meta-panel" @submit.prevent="$emit('save-deck')">
        <div class="section-title">
          <h2>Dados do baralho</h2>
        </div>
        <label class="form-field">
          <span class="field-label">Titulo</span>
          <input
            :value="form.title"
            type="text"
            maxlength="180"
            required
            @input="updateForm({ title: ($event.target as HTMLInputElement).value.trim() })"
          />
        </label>
        <label class="form-field">
          <span class="field-label">Descricao</span>
          <textarea
            :value="form.description"
            rows="5"
            maxlength="2000"
            @input="updateForm({ description: ($event.target as HTMLTextAreaElement).value })"
          ></textarea>
        </label>
        <label class="form-field">
          <span class="field-label">Visibilidade</span>
          <select
            :value="form.visibility"
            @change="updateForm({ visibility: ($event.target as HTMLSelectElement).value as DeckVisibility })"
          >
            <option value="PRIVATE">Privado</option>
            <option value="PUBLIC">Publico</option>
          </select>
        </label>
      </form>

      <section class="panel manage-cards-panel">
        <div class="section-title">
          <div>
            <h2>Cartas</h2>
            <p class="muted">{{ cardsView.countLabel || cardCountLabel(deck.cardCount) }}</p>
          </div>
          <button class="primary compact" type="button" @click="$emit('create-card')">
            <Plus :size="16" aria-hidden="true" />
            Nova carta
          </button>
        </div>

        <div class="managed-cards-toolbar">
          <label class="library-search managed-card-search">
            <Search :size="17" aria-hidden="true" />
            <input
              :value="cardsSearch"
              type="search"
              placeholder="Buscar em frente, verso ou tags"
              @input="$emit('update:cards-search', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <div class="row-actions">
            <button
              class="ghost compact"
              type="button"
              :disabled="cardsView.cards.length === 0"
              @click="$emit('toggle-page-selection')"
            >
              {{ cardsView.allVisibleSelected ? 'Desmarcar pagina' : 'Selecionar pagina' }}
            </button>
            <button
              class="ghost compact"
              type="button"
              :disabled="cardsView.selectedCount === 0"
              @click="$emit('clear-selection')"
            >
              Limpar
            </button>
            <button
              class="ghost compact danger-action"
              type="button"
              :disabled="cardsView.selectedCount === 0"
              @click="$emit('delete-selected')"
            >
              <Trash2 :size="16" aria-hidden="true" />
              Excluir {{ cardsView.selectedCount || '' }}
            </button>
          </div>
        </div>

        <section class="managed-cards-browser">
          <div class="managed-card-list">
            <article
              v-for="card in cardsView.cards"
              :key="card.id"
              class="managed-card-row"
              :class="{ active: cardsView.selectedCardId === card.id }"
            >
              <label class="card-selection" :aria-label="`Selecionar ${cardTextSummary(card)}`">
                <input
                  type="checkbox"
                  :checked="cardsView.selectedCardIds.has(card.id)"
                  @change="$emit('toggle-card-selection', card.id)"
                />
              </label>
              <button class="managed-card-summary" type="button" @click="$emit('select-card', card)">
                <span>{{ cardTextSummary(card) }}</span>
                <small>{{ card.tags.length ? card.tags.join(', ') : 'sem tags' }}</small>
              </button>
            </article>
            <p v-if="cardsView.cards.length === 0" class="muted empty-copy">
              {{ cardsSearch ? 'Nenhuma carta encontrada para esta busca.' : 'Nenhuma carta ainda.' }}
            </p>
            <a
              v-if="cardsView.hasMore"
              class="load-more-link"
              :class="{ 'is-loading': loadingMore }"
              href="#"
              @click.prevent="!loadingMore && $emit('load-more-cards')"
            >
              <Loader2 v-if="loadingMore" :size="16" aria-hidden="true" class="icon-spin" />
              {{ loadingMore ? 'Carregando...' : 'Carregar mais cartas...' }}
            </a>
          </div>

          <article v-if="cardsView.selectedCard" class="managed-card-preview">
            <div class="section-title">
              <div>
                <h3>{{ cardTextSummary(cardsView.selectedCard) }}</h3>
                <p class="muted">
                  {{ cardsView.selectedCard.tags.length ? cardsView.selectedCard.tags.join(', ') : 'sem tags' }}
                </p>
              </div>
              <div class="row-actions">
                <button
                  class="ghost icon-button"
                  type="button"
                  title="Editar carta"
                  aria-label="Editar carta"
                  @click="$emit('edit-card', cardsView.selectedCard)"
                >
                  <Pencil :size="16" aria-hidden="true" />
                </button>
                <button
                  class="ghost icon-button danger-action"
                  type="button"
                  title="Excluir carta"
                  aria-label="Excluir carta"
                  @click="$emit('delete-card', cardsView.selectedCard)"
                >
                  <Trash2 :size="16" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div class="managed-preview-faces">
              <div>
                <span class="field-label">Frente</span>
                <div class="preview-study-face" v-html="cardsView.frontPreview"></div>
              </div>
              <div>
                <span class="field-label">Verso</span>
                <div class="preview-study-face" v-html="cardsView.backPreview"></div>
              </div>
            </div>
          </article>

          <div v-else class="empty-state compact-empty">
            <h2>{{ cardsSearch ? 'Busca sem resultados' : 'Nenhuma carta ainda' }}</h2>
            <p>{{ cardsSearch ? 'Ajuste o termo de busca ou limpe o filtro.' : 'Crie a primeira carta para estudar este baralho.' }}</p>
            <button v-if="!cardsSearch" class="primary compact" type="button" @click="$emit('create-card')">
              <Plus :size="16" aria-hidden="true" />
              Nova carta
            </button>
          </div>
        </section>
      </section>
    </section>
  </div>
</template>
