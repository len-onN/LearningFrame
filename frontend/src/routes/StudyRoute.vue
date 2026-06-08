<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import StudyPage from '../pages/StudyPage.vue'
import { studyRouteKey, useRequiredRouteContext } from './routeContext'

const study = useRequiredRouteContext(studyRouteKey, 'Study')
const route = useRoute()

onMounted(() => {
  void study.syncStudyRoute()
})

watch(() => [route.name, route.params.deckId], () => {
  if (isStudyRoute()) {
    void study.syncStudyRoute()
  }
})

onBeforeRouteLeave((to) => {
  if (!String(to.name ?? '').startsWith('study')) {
    study.cleanupStudyRoute()
  }
})

function isStudyRoute() {
  return route.name === 'study'
    || route.name === 'study-deck'
    || route.name === 'study-interleaved'
}
</script>

<template>
  <StudyPage
    :session-title="study.sessionTitle.value"
    :current-card="study.currentCard.value"
    :current-due-label="study.currentDueLabel.value"
    :front-html="study.frontHtml.value"
    :back-html="study.backHtml.value"
    :answer-visible="study.answerVisible.value"
    :progress="study.studyProgress.value"
    :empty-reason="study.studyEmptyReason.value"
    :last-feedback="study.lastStudyFeedback.value"
    :summary="study.studySummary.value"
    @go-library="study.goToLibrary"
    @start-interleaved="study.startInterleavedPractice"
    @reveal-answer="study.answerVisible.value = true"
    @review="study.reviewCurrent"
  />
</template>
