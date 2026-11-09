<script setup lang="ts">
import { BarChart3 } from '@lucide/vue'
import type { StatsSummary, UserResponse } from '../types/api'
import { formatDueIn } from '../utils/dueTime'

defineProps<{
  user: UserResponse | null
  stats: StatsSummary | null
}>()
</script>

<template>
  <section class="progress-section">
    <div v-if="user && stats" class="stats-strip">
      <article class="metric">
        <span>Due now</span>
        <strong>{{ stats.dueNow }}</strong>
      </article>
      <article class="metric">
        <span>Reviewed today</span>
        <strong>{{ stats.reviewsToday }}</strong>
      </article>
      <article class="metric">
        <span>7-day accuracy</span>
        <strong>{{ stats.accuracyLast7Days }}%</strong>
      </article>
      <article class="metric">
        <span>Active days 30d</span>
        <strong>{{ stats.activeDaysLast30 }}</strong>
      </article>
      <article class="metric">
        <span>Next review</span>
        <strong>{{ formatDueIn(stats.nextDueAt) }}</strong>
      </article>
    </div>

    <div v-else class="empty-state">
      <BarChart3 :size="36" aria-hidden="true" />
      <h2>Persistent progress requires login</h2>
      <p>Log in to keep schedule, reviews, and statistics across devices.</p>
    </div>
  </section>
</template>
