<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { DeckVisibility, UserResponse } from '../types/api'

defineProps<{
  user: UserResponse | null
}>()

defineEmits<{
  submit: []
}>()

const title = defineModel<string>('title', { required: true })
const description = defineModel<string>('description', { required: true })
const visibility = defineModel<DeckVisibility>('visibility', { required: true })
</script>

<template>
  <section class="create-deck-section">
    <form class="panel create-deck-panel" @submit.prevent="$emit('submit')">
      <div class="section-title">
        <h2>New deck</h2>
      </div>
      <input v-model="title" required type="text" placeholder="Title" aria-label="Deck title" :disabled="!user" />
      <textarea v-model="description" rows="4" placeholder="Description" aria-label="Deck description" :disabled="!user"></textarea>
      <select v-model="visibility" aria-label="Deck visibility" :disabled="!user">
        <option value="PRIVATE">Private</option>
        <option value="PUBLIC">Public</option>
      </select>
      <button class="primary full" type="submit" :disabled="!user">
        <Plus :size="16" aria-hidden="true" />
        Create deck
      </button>
      <p v-if="!user" class="muted">Persistent creation requires login.</p>
    </form>
  </section>
</template>
