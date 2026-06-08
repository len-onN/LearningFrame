<script setup lang="ts">
import { BookOpen, Brain, Eye, Maximize2, Minimize2, Shuffle } from '@lucide/vue'
import { ref } from 'vue'
import type { ReviewRating, StudyCard } from '../types/api'
import type {
  StudyEmptyReason,
  StudyReviewFeedback,
  StudySessionProgress,
  StudySessionSummary
} from '../routes/routeContext'

defineProps<{
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
}>()

defineEmits<{
  'go-library': []
  'start-interleaved': []
  'reveal-answer': []
  review: [rating: ReviewRating]
}>()

const fitMediaToScreen = ref(false)

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
        <button class="ghost compact" type="button" @click="$emit('start-interleaved')">
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

    <article v-if="currentCard" :class="['study-card', { 'media-fit': fitMediaToScreen }]">
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
