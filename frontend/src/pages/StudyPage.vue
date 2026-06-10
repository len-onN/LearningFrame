<script setup lang="ts">
import { ALargeSmall, BookOpen, Brain, Eye, Maximize2, Minimize2, Shuffle } from '@lucide/vue'
import { computed, ref } from 'vue'
import type { ReviewRating, StudyCard } from '../types/api'
import type {
  InterleavedSelectionState,
  StudyEmptyReason,
  StudyReviewFeedback,
  StudySessionProgress,
  StudySessionSummary
} from '../routes/routeContext'

const props = defineProps<{
  sessionTitle: string
  currentCard: StudyCard | undefined
  currentDueLabel: string
  frontHtml: string
  backHtml: string
  answerVisible: boolean
  progress: StudySessionProgress
  emptyReason: StudyEmptyReason
  lastFeedback: StudyReviewFeedback | null
  summary: StudySessionSummary | null
  interleavedSelection: InterleavedSelectionState
}>()

defineEmits<{
  'go-library': []
  'start-interleaved': []
  'start-selected-interleaved': []
  'toggle-interleaved-deck': [deckId: number]
  'reveal-answer': []
  review: [rating: ReviewRating]
}>()

const fitMediaToScreen = ref(false)
const STUDY_FONT_LEVEL_MIN = -2
const STUDY_FONT_LEVEL_DEFAULT = 0
const STUDY_FONT_LEVEL_MAX = 5
const STUDY_FONT_BASE_REM = 1.35
const STUDY_FONT_STEP_REM = 0.18

const studyFontLevel = ref(STUDY_FONT_LEVEL_DEFAULT)
const studyFontStyle = computed(() => ({
  '--study-card-font-size': `${(STUDY_FONT_BASE_REM + studyFontLevel.value * STUDY_FONT_STEP_REM).toFixed(2)}rem`
}))
const interleavedSelectedCount = computed(() => props.interleavedSelection.selectedIds.length)
const interleavedSelectedIds = computed(() => new Set(props.interleavedSelection.selectedIds))
const isInterleavedMode = computed(() => props.interleavedSelection.active || props.sessionTitle === 'Pratica intercalada')

function adjustStudyFont(delta: number) {
  studyFontLevel.value = Math.min(
    STUDY_FONT_LEVEL_MAX,
    Math.max(STUDY_FONT_LEVEL_MIN, studyFontLevel.value + delta)
  )
}

function emptyTitle(reason: StudyEmptyReason) {
  if (reason === 'completed') {
    return 'Sessão concluída'
  }
  if (reason === 'empty-deck') {
    return 'Baralho sem cartas'
  }
  if (reason === 'no-due') {
    return 'Nada vencido agora'
  }
  return 'Nenhuma sessão ativa'
}

function emptyCopy(reason: StudyEmptyReason) {
  if (reason === 'empty-deck') {
    return 'Adicione cartas ao baralho ou escolha outro material para estudar.'
  }
  if (reason === 'no-due') {
    return 'Sua agenda deste recorte está em dia. Volte depois ou use a prática intercalada.'
  }
  return 'Escolha um baralho público, um baralho salvo ou use a prática intercalada.'
}
function isInterleavedDeckDisabled(deckId: number) {
  return !interleavedSelectedIds.value.has(deckId)
    && interleavedSelectedCount.value >= props.interleavedSelection.maxSelected
}

function interleavedSourceLabel(source: InterleavedSelectionState['options'][number]['source']) {
  return source === 'mine' ? 'Meu baralho' : 'Publico'
}

function interleavedDueLabel(dueCount: number | null) {
  if (dueCount === null) {
    return 'Agenda local'
  }
  if (dueCount === 1) {
    return '1 vencida'
  }
  return `${dueCount} vencidas`
}
</script>

<template>
  <section class="study-layout">
    <div class="study-header">
      <div>
        <p class="eyebrow">{{ sessionTitle }}</p>
        <h2 v-if="summary">Sessão concluída</h2>
        <h2 v-else-if="progress.initialTotal > 0">{{ progress.reviewed }} de {{ progress.initialTotal }} revisadas</h2>
        <h2 v-else>{{ emptyTitle(emptyReason) }}</h2>
        <p v-if="progress.initialTotal > 0" class="study-progress-copy">{{ progress.remaining }} restantes</p>
      </div>
      <div class="study-header-actions">
        <div class="font-size-control" aria-label="Tamanho da fonte">
          <ALargeSmall :size="16" aria-hidden="true" />
          <button
            class="font-size-option"
            type="button"
            title="Fonte menor"
            aria-label="Diminuir tamanho da fonte"
            :disabled="studyFontLevel === STUDY_FONT_LEVEL_MIN"
            @click="adjustStudyFont(-1)"
          >
            A-
          </button>
          <button
            class="font-size-option"
            type="button"
            title="Fonte maior"
            aria-label="Aumentar tamanho da fonte"
            :disabled="studyFontLevel === STUDY_FONT_LEVEL_MAX"
            @click="adjustStudyFont(1)"
          >
            A+
          </button>
        </div>
        <button
          class="ghost compact"
          type="button"
          :aria-pressed="fitMediaToScreen"
          @click="fitMediaToScreen = !fitMediaToScreen"
        >
          <Minimize2 v-if="fitMediaToScreen" :size="16" aria-hidden="true" />
          <Maximize2 v-else :size="16" aria-hidden="true" />
          {{ fitMediaToScreen ? 'Mídia natural' : 'Ajustar mídia' }}
        </button>
        <button
          :class="[{ 'primary': isInterleavedMode, 'ghost': !isInterleavedMode }, 'compact']"
          type="button"
          @click="isInterleavedMode ? null : $emit('start-interleaved')"
        >
          <Shuffle :size="16" aria-hidden="true" />
          Prática intercalada
        </button>
      </div>
    </div>

    <div
      v-if="progress.initialTotal > 0"
      class="study-progress"
      role="progressbar"
      :aria-valuenow="progress.percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${progress.reviewed} de ${progress.initialTotal} cartas revisadas`"
    >
      <span :style="{ width: `${progress.percent}%` }"></span>
    </div>

    <article v-if="interleavedSelection.active" class="interleaved-selector">
      <div class="interleaved-selector-heading">
        <Shuffle :size="28" aria-hidden="true" />
        <div>
          <p class="eyebrow">Pratica intercalada</p>
          <h2>Escolha os baralhos</h2>
          <p class="study-progress-copy">
            {{ interleavedSelectedCount }} de {{ interleavedSelection.maxSelected }} selecionados
          </p>
        </div>
      </div>

      <div v-if="interleavedSelection.options.length > 0" class="interleaved-deck-grid">
        <label
          v-for="deck in interleavedSelection.options"
          :key="deck.id"
          :class="[
            'interleaved-deck-option-wrapper',
            {
              selected: interleavedSelectedIds.has(deck.id),
              disabled: isInterleavedDeckDisabled(deck.id)
            }
          ]"
        >
          <div class="interleaved-deck-option">
            <div class="interleaved-deck-header">
              <input
                type="checkbox"
                :checked="interleavedSelectedIds.has(deck.id)"
                :disabled="isInterleavedDeckDisabled(deck.id)"
                @change="$emit('toggle-interleaved-deck', deck.id)"
              />
              <strong>{{ deck.title }}</strong>
            </div>
            <span class="interleaved-deck-meta">
              {{ interleavedSourceLabel(deck.source) }} · {{ deck.cardCount }} cartas · {{ interleavedDueLabel(deck.dueCount) }}
            </span>
            <div v-if="deck.description" class="interleaved-deck-desc-wrapper">
              <small class="interleaved-deck-desc">{{ deck.description }}</small>
              <div class="interleaved-deck-tooltip">{{ deck.description }}</div>
            </div>
          </div>
        </label>
      </div>

      <div v-else class="compact-empty">
        <Brain :size="32" aria-hidden="true" />
        <h2>Nenhum baralho disponivel</h2>
        <p>Abra a Biblioteca para carregar ou criar baralhos.</p>
      </div>

      <div class="study-summary-actions">
        <button class="ghost compact" type="button" @click="$emit('go-library')">
          <BookOpen :size="16" aria-hidden="true" />
          Biblioteca
        </button>
        <button
          class="primary compact"
          type="button"
          :disabled="interleavedSelectedCount === 0"
          @click="$emit('start-selected-interleaved')"
        >
          <Shuffle :size="16" aria-hidden="true" />
          Iniciar pratica
        </button>
      </div>
    </article>

    <article v-else-if="currentCard" :class="['study-card', { 'media-fit': fitMediaToScreen }]" :style="studyFontStyle">
      <div class="card-meta">
        <span>{{ currentCard.deckTitle }}</span>
        <span>{{ currentCard.newCard ? 'Novo' : `${currentCard.intervalDays} dias` }} · volta {{ currentDueLabel }}</span>
      </div>

      <div v-if="lastFeedback" class="study-feedback" role="status">
        <strong>{{ lastFeedback.ratingLabel }} registrado</strong>
        <span>{{ lastFeedback.nextDueLabel }} · {{ lastFeedback.intervalLabel }}</span>
      </div>

      <div class="prompt" v-html="frontHtml"></div>

      <button v-if="!answerVisible" class="primary reveal" type="button" @click="$emit('reveal-answer')">
        <Eye :size="18" aria-hidden="true" />
        Revelar resposta
      </button>

      <template v-else>
        <div class="answer" v-html="backHtml"></div>
        <div class="ratings" aria-label="Avaliar resposta">
          <button class="rating again" type="button" @click="$emit('review', 'AGAIN')">De novo</button>
          <button class="rating hard" type="button" @click="$emit('review', 'HARD')">Dificil</button>
          <button class="rating good" type="button" @click="$emit('review', 'GOOD')">Bom</button>
          <button class="rating easy" type="button" @click="$emit('review', 'EASY')">Facil</button>
        </div>
      </template>
    </article>

    <article v-else-if="summary" class="study-summary">
      <Brain :size="34" aria-hidden="true" />
      <div>
        <p class="eyebrow">Resumo da sessão</p>
        <h2>{{ summary.reviewed }} {{ summary.reviewed === 1 ? 'carta revisada' : 'cartas revisadas' }}</h2>
        <p v-if="summary.lastFeedback" class="study-progress-copy">
          Última revisão: {{ summary.lastFeedback.ratingLabel }} · {{ summary.lastFeedback.nextDueLabel }}
        </p>
      </div>

      <div class="study-rating-summary" aria-label="Distribuição por rating">
        <div class="rating-count again">
          <span>De novo</span>
          <strong>{{ summary.ratingCounts.AGAIN }}</strong>
        </div>
        <div class="rating-count hard">
          <span>Difícil</span>
          <strong>{{ summary.ratingCounts.HARD }}</strong>
        </div>
        <div class="rating-count good">
          <span>Bom</span>
          <strong>{{ summary.ratingCounts.GOOD }}</strong>
        </div>
        <div class="rating-count easy">
          <span>Fácil</span>
          <strong>{{ summary.ratingCounts.EASY }}</strong>
        </div>
      </div>

      <div class="study-summary-actions">
        <button class="ghost compact" type="button" @click="$emit('go-library')">
          <BookOpen :size="16" aria-hidden="true" />
          Biblioteca
        </button>
        <button class="primary compact" type="button" @click="$emit('start-interleaved')">
          <Shuffle :size="16" aria-hidden="true" />
          Prática intercalada
        </button>
      </div>
    </article>

    <div v-else class="empty-state">
      <Brain :size="36" aria-hidden="true" />
      <h2>{{ emptyTitle(emptyReason) }}</h2>
      <p>{{ emptyCopy(emptyReason) }}</p>
      <div class="study-summary-actions">
        <button class="ghost compact" type="button" @click="$emit('go-library')">
          <BookOpen :size="16" aria-hidden="true" />
          Biblioteca
        </button>
        <button class="primary compact" type="button" @click="$emit('start-interleaved')">
          <Shuffle :size="16" aria-hidden="true" />
          Prática intercalada
        </button>
      </div>
    </div>
  </section>
</template>
