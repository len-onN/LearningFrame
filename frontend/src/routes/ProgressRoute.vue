<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ProgressPage from '../pages/ProgressPage.vue'
import { useStatsStore } from '../stores/useStatsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useFeedbackStore } from '../stores/useFeedbackStore'

const statsStore = useStatsStore()
const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()

const { stats } = storeToRefs(statsStore)
const { user } = storeToRefs(authStore)

onMounted(async () => {
  if (user.value) {
    await feedbackStore.withFeedback(async () => {
      await statsStore.refreshStats()
    }, { showLoading: false, clearOnStart: false })
  }
})
</script>

<template>
  <ProgressPage
    :user="user"
    :stats="stats"
  />
</template>
