<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import StudyPage from '../pages/StudyPage.vue'
import { useStudyStore } from '../stores/useStudyStore'

const router = useRouter()
const route = useRoute()
const studyStore = useStudyStore()

function goToLibrary() {
  router.push({ name: 'library-public' })
}

function startInterleavedPractice() {
  router.push({ name: 'study-interleaved' })
}

function routeDeckId() {
  const raw = Array.isArray(route.params.deckId) ? route.params.deckId[0] : route.params.deckId
  const deckId = Number(raw)
  return Number.isFinite(deckId) && deckId > 0 ? deckId : null
}

async function syncStudyRoute() {
  if (route.name === 'study') {
    studyStore.resetStudySession()
    return
  }

  if (route.name === 'study-deck') {
    const deckId = routeDeckId()
    if (!deckId) {
      await router.replace({ name: 'study' })
      return
    }
    await studyStore.loadStudyDeck(deckId)
    return
  }

  if (route.name === 'study-interleaved') {
    const ids = route.query.decks
      ? (route.query.decks as string).split(',').map(Number).filter(n => !Number.isNaN(n))
      : []
    await studyStore.prepareInterleavedPracticeSelection(ids)
    if (ids.length > 0) {
      await studyStore.startInterleavedPracticeSession()
    }
  }
}

watch(() => [route.name, route.params.deckId, route.query.decks], () => {
  const isStudyRoute = route.name === 'study' || route.name === 'study-deck' || route.name === 'study-interleaved'
  if (isStudyRoute) {
    void syncStudyRoute()
  }
}, { immediate: true })

onUnmounted(() => {
  studyStore.resetStudySession()
})
</script>

<template>
  <StudyPage
    :session-title="studyStore.sessionTitle"
    :current-card="studyStore.currentCard"
    :current-due-label="studyStore.currentDueLabel"
    :front-html="studyStore.frontHtml"
    :back-html="studyStore.backHtml"
    :answer-visible="studyStore.answerVisible"
    :progress="studyStore.studyProgress"
    :empty-reason="studyStore.studyEmptyReason"
    :last-feedback="studyStore.lastStudyFeedback"
    :summary="studyStore.studySummary"
    :predicted-intervals="studyStore.predictedIntervals"
    :interleaved-selection="studyStore.interleavedSelection"
    @go-library="goToLibrary"
    @start-interleaved="startInterleavedPractice"
    @start-selected-interleaved="studyStore.startInterleavedPracticeSession"
    @toggle-interleaved-deck="studyStore.toggleInterleavedDeckSelection"
    @reveal-answer="studyStore.answerVisible = true"
    @review="studyStore.reviewCurrent"
    @skip="studyStore.skipCurrentCard"
  />
</template>
