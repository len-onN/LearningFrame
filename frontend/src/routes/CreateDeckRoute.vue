<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import CreateDeckPage from '../pages/CreateDeckPage.vue'
import { useCreateDeckFlow } from '../features/create/useCreateDeckFlow'
import { useAuthStore } from '../stores/useAuthStore'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const { deckForm, createDeck } = useCreateDeckFlow()

const title = computed({
  get: () => deckForm.value.title,
  set: (value: string) => {
    deckForm.value.title = value
  }
})
const description = computed({
  get: () => deckForm.value.description,
  set: (value: string) => {
    deckForm.value.description = value
  }
})
const visibility = computed({
  get: () => deckForm.value.visibility,
  set: (value) => {
    deckForm.value.visibility = value
  }
})
</script>

<template>
  <CreateDeckPage
    v-model:title="title"
    v-model:description="description"
    v-model:visibility="visibility"
    :user="user"
    @submit="createDeck"
  />
</template>
