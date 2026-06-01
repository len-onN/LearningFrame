<script setup lang="ts">
import { Brain, Eye, Shuffle } from '@lucide/vue'
import type { ReviewRating, StudyCard } from '../types/api'

defineProps<{
  sessionTitle: string
  queueLength: number
  currentCard: StudyCard | undefined
  currentDueLabel: string
  frontHtml: string
  backHtml: string
  answerVisible: boolean
}>()

defineEmits<{
  'start-interleaved': []
  'reveal-answer': []
  review: [rating: ReviewRating]
}>()
</script>

<template>
  <section class="study-layout">
    <div class="study-header">
      <div>
        <p class="eyebrow">{{ sessionTitle }}</p>
        <h2>{{ queueLength }} cards na fila</h2>
      </div>
      <button class="ghost compact" type="button" @click="$emit('start-interleaved')">
        <Shuffle :size="16" aria-hidden="true" />
        Prática intercalada
      </button>
    </div>

    <article v-if="currentCard" class="study-card">
      <div class="card-meta">
        <span>{{ currentCard.deckTitle }}</span>
        <span>{{ currentCard.newCard ? 'Novo' : `${currentCard.intervalDays} dias` }} · volta {{ currentDueLabel }}</span>
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

    <div v-else class="empty-state">
      <Brain :size="36" aria-hidden="true" />
      <h2>Nenhuma sessao ativa</h2>
      <p>Escolha um baralho publico, um baralho salvo ou use a pratica intercalada.</p>
    </div>
  </section>
</template>
