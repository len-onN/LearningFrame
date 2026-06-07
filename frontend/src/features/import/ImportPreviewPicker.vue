<script setup lang="ts">
import { Search } from '@lucide/vue'
import type { PreviewCardOption, PreviewFace } from './importTypes'

defineProps<{
  open: boolean
  cardTitle: string
  face: PreviewFace
  search: string
  options: PreviewCardOption[]
  activeIndex: number
}>()

defineEmits<{
  toggle: []
  close: []
  'update:search': [value: string]
  select: [index: number]
}>()
</script>

<template>
  <div class="preview-picker">
    <label class="field-label" for="preview-card-search">Carta</label>
    <button class="preview-picker-trigger" type="button" @click="$emit('toggle')">
      <span>{{ cardTitle }}</span>
      <span>{{ face === 'front' ? 'Frente' : 'Verso' }}</span>
    </button>
    <div v-if="open" class="preview-picker-menu">
      <label class="library-search preview-search">
        <Search :size="16" aria-hidden="true" />
        <input
          id="preview-card-search"
          :value="search"
          type="search"
          placeholder="Buscar carta"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          @keydown.esc="$emit('close')"
        />
      </label>
      <div class="preview-picker-list">
        <button
          v-for="option in options"
          :key="option.index"
          class="preview-picker-option"
          :class="{ active: option.index === activeIndex }"
          type="button"
          @click="$emit('select', option.index)"
        >
          {{ option.label }}
        </button>
        <p v-if="options.length === 0" class="muted empty-copy">Nenhuma carta encontrada.</p>
      </div>
    </div>
  </div>
</template>
