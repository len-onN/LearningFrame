<script setup lang="ts">
import { useRouter } from 'vue-router'
import StudyPage from '../pages/StudyPage.vue'
import { useStudySession } from '../features/study/useStudySession'

const router = useRouter()
const study = useStudySession()

function goToLibrary() {
  router.push({ name: 'library-public' })
}

function startInterleavedPractice() {
  router.push({ name: 'study-interleaved' })
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
    :predicted-intervals="study.predictedIntervals.value"
    :interleaved-selection="study.interleavedSelection.value"
    @go-library="goToLibrary"
    @start-interleaved="startInterleavedPractice"
    @start-selected-interleaved="study.startInterleavedPracticeSession"
    @toggle-interleaved-deck="study.toggleInterleavedDeckSelection"
    @reveal-answer="study.answerVisible.value = true"
    @review="study.reviewCurrent"
    @skip="study.skipCurrentCard"
  />
</template>
