<script setup lang="ts">
import { Check, ChevronsLeft, ChevronsRight, RotateCcw, Upload } from '@lucide/vue'
import type { ApkgCard, ApkgPreviewResponse, DeckVisibility, UserResponse } from '../types/api'
import ImportPreviewPicker from '../features/import/ImportPreviewPicker.vue'
import type { PreviewCardOption, PreviewFace } from '../features/import/importTypes'

defineProps<{
  selectedFile: File | null
  loading: boolean
  importPreview: ApkgPreviewResponse | null
  currentPreviewCard: ApkgCard | null
  previewCardIndex: number
  previewFace: PreviewFace
  previewPickerOpen: boolean
  previewCardSearch: string
  previewCardOptions: PreviewCardOption[]
  previewCardTitle: string
  currentPreviewHtml: string
  user: UserResponse | null
}>()

defineEmits<{
  'file-change': [event: Event]
  'update:preview-picker-open': [value: boolean]
  'update:preview-card-search': [value: string]
  'select-preview-card': [index: number]
  'move-preview-card': [direction: -1 | 1]
  'toggle-preview-face': []
  'persist-import': []
}>()

const importTitle = defineModel<string>('importTitle', { required: true })
const importVisibility = defineModel<DeckVisibility>('importVisibility', { required: true })
</script>

<template>
  <section class="import-page">
    <div class="import-header">
      <div>
        <p class="eyebrow">Pacote Anki</p>
        <h2>Importar APKG</h2>
      </div>
      <span v-if="selectedFile" class="muted">{{ selectedFile.name }}</span>
    </div>

    <div class="import-workspace">
      <div class="panel wide">
        <label class="file-drop">
          <Upload :size="22" aria-hidden="true" />
          <span>{{ selectedFile?.name ?? 'Selecionar arquivo .apkg' }}</span>
          <input type="file" accept=".apkg" @change="$emit('file-change', $event)" />
        </label>

        <div v-if="loading && selectedFile && !importPreview" class="pending-card import-loading">
          Lendo pacote e preparando previa...
        </div>

        <div v-if="importPreview" class="import-summary">
          <div>
            <strong>{{ importPreview.title }}</strong>
            <span>{{ importPreview.notesFound }} notas encontradas · {{ importPreview.cardsReady }} cartas prontas · {{ importPreview.cardsSkipped }} ignoradas · {{ importPreview.mediaFound }} midias</span>
          </div>
          <p v-if="importPreview.mediaFound > 0" class="inline-alert">
            Este pacote contem midia. A previa mostra marcadores; o estudo com imagens fica disponivel depois de salvar em Meus baralhos.
          </p>
          <p v-for="warning in importPreview.warnings" :key="warning" class="muted">{{ warning }}</p>
        </div>

        <div v-if="importPreview && currentPreviewCard" class="preview-section">
          <div class="preview-toolbar">
            <ImportPreviewPicker
              :open="previewPickerOpen"
              :card-title="previewCardTitle"
              :face="previewFace"
              :search="previewCardSearch"
              :options="previewCardOptions"
              :active-index="previewCardIndex"
              @toggle="$emit('update:preview-picker-open', !previewPickerOpen)"
              @close="$emit('update:preview-picker-open', false)"
              @update:search="$emit('update:preview-card-search', $event)"
              @select="$emit('select-preview-card', $event)"
            />

            <div class="preview-actions">
              <button
                class="ghost compact"
                type="button"
                :disabled="previewCardIndex === 0"
                @click="$emit('move-preview-card', -1)"
              >
                <ChevronsLeft :size="16" aria-hidden="true" />
                Anterior
              </button>
              <button class="ghost compact" type="button" @click="$emit('toggle-preview-face')">
                <RotateCcw :size="16" aria-hidden="true" />
                {{ previewFace === 'front' ? 'Ver verso' : 'Ver frente' }}
              </button>
              <button
                class="ghost compact"
                type="button"
                :disabled="previewCardIndex >= importPreview.cards.length - 1"
                @click="$emit('move-preview-card', 1)"
              >
                Proxima
                <ChevronsRight :size="16" aria-hidden="true" />
              </button>
            </div>
          </div>

          <article
            class="preview-study-card"
            role="button"
            tabindex="0"
            @click="$emit('toggle-preview-face')"
            @keydown.enter.prevent="$emit('toggle-preview-face')"
            @keydown.space.prevent="$emit('toggle-preview-face')"
          >
            <div class="card-meta">
              <span>{{ previewFace === 'front' ? 'Frente' : 'Verso' }}</span>
              <span>{{ currentPreviewCard.tags.length ? currentPreviewCard.tags.join(', ') : 'sem tags' }}</span>
            </div>
            <div class="preview-study-face" v-html="currentPreviewHtml"></div>
          </article>
        </div>
      </div>

      <form v-if="importPreview" class="panel import-save-panel" @submit.prevent="$emit('persist-import')">
        <div class="section-title">
          <h2>{{ user ? 'Salvar em Meus baralhos' : 'Entrar para salvar' }}</h2>
        </div>
        <input v-model="importTitle" type="text" placeholder="Titulo do baralho" />
        <select v-model="importVisibility" :disabled="!user">
          <option value="PRIVATE">Privado</option>
          <option value="PUBLIC">Publico</option>
        </select>
        <button class="primary full" type="submit">
          <Check :size="16" aria-hidden="true" />
          {{ user ? 'Salvar APKG' : 'Entrar para salvar' }}
        </button>
        <p class="muted">
          {{ user ? 'O arquivo original sera enviado para preservar cartas e midias.' : 'A previa continua nesta tela enquanto voce entra na conta.' }}
        </p>
      </form>
    </div>
  </section>
</template>
