<script setup lang="ts">
import ProgressPage from '../pages/ProgressPage.vue'
import { progressRouteKey, useRequiredRouteContext } from './routeContext'

const progress = useRequiredRouteContext(progressRouteKey, 'Progress')
</script>

<template>
  <ProgressPage
    :user="progress.user.value"
    :stats="progress.stats.value"
  />
</template>
