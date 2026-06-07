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
        <span>Vencidos agora</span>
        <strong>{{ stats.dueNow }}</strong>
      </article>
      <article class="metric">
        <span>Revisados hoje</span>
        <strong>{{ stats.reviewsToday }}</strong>
      </article>
      <article class="metric">
        <span>Acerto 7 dias</span>
        <strong>{{ stats.accuracyLast7Days }}%</strong>
      </article>
      <article class="metric">
        <span>Dias ativos 30d</span>
        <strong>{{ stats.activeDaysLast30 }}</strong>
      </article>
      <article class="metric">
        <span>Proxima revisao</span>
        <strong>{{ formatDueIn(stats.nextDueAt) }}</strong>
      </article>
    </div>

    <div v-else class="empty-state">
      <BarChart3 :size="36" aria-hidden="true" />
      <h2>Progresso persistente exige login</h2>
      <p>Entre para manter agenda, revisoes e estatisticas entre dispositivos.</p>
    </div>
  </section>
</template>
