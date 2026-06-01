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
        <h2>Novo baralho</h2>
      </div>
      <input v-model="title" required type="text" placeholder="Titulo" :disabled="!user" />
      <textarea v-model="description" rows="4" placeholder="Descricao" :disabled="!user"></textarea>
      <select v-model="visibility" :disabled="!user">
        <option value="PRIVATE">Privado</option>
        <option value="PUBLIC">Publico</option>
      </select>
      <button class="primary full" type="submit" :disabled="!user">
        <Plus :size="16" aria-hidden="true" />
        Criar baralho
      </button>
      <p v-if="!user" class="muted">Criacao persistente exige login.</p>
    </form>
  </section>
</template>
