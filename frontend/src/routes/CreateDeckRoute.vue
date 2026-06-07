<script setup lang="ts">
import { computed } from 'vue'
import CreateDeckPage from '../pages/CreateDeckPage.vue'
import { createDeckRouteKey, useRequiredRouteContext } from './routeContext'

const createDeckRoute = useRequiredRouteContext(createDeckRouteKey, 'Create deck')

const title = computed({
  get: () => createDeckRoute.deckForm.value.title,
  set: (value: string) => {
    createDeckRoute.deckForm.value.title = value
  }
})
const description = computed({
  get: () => createDeckRoute.deckForm.value.description,
  set: (value: string) => {
    createDeckRoute.deckForm.value.description = value
  }
})
const visibility = computed({
  get: () => createDeckRoute.deckForm.value.visibility,
  set: (value) => {
    createDeckRoute.deckForm.value.visibility = value
  }
})
</script>

<template>
  <CreateDeckPage
    v-model:title="title"
    v-model:description="description"
    v-model:visibility="visibility"
    :user="createDeckRoute.user.value"
    @submit="createDeckRoute.createDeck"
  />
</template>
