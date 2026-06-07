<script setup lang="ts">
import { onMounted } from 'vue'
import ProgressPage from '../pages/ProgressPage.vue'
import { progressRouteKey, useRequiredRouteContext } from './routeContext'

const progress = useRequiredRouteContext(progressRouteKey, 'Progress')

onMounted(() => {
  void progress.syncProgressRoute()
})
</script>

<template>
  <ProgressPage
    :user="progress.user.value"
    :stats="progress.stats.value"
  />
</template>
