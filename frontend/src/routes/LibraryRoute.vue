<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import LibraryPage from '../pages/LibraryPage.vue'
import { libraryRouteKey, useRequiredRouteContext } from './routeContext'

const library = useRequiredRouteContext(libraryRouteKey, 'Library')
const route = useRoute()

const search = computed({
  get: () => library.librarySearch.value,
  set: (value: string) => {
    library.librarySearch.value = value
  }
})
const managedDeckForm = computed({
  get: () => library.managedDeckForm.value,
  set: library.updateManagedDeckForm
})
const managedCardsSearch = computed({
  get: () => library.managedCardsSearch.value,
  set: (value: string) => {
    library.managedCardsSearch.value = value
  }
})

onMounted(() => {
  void library.syncLibraryRoute()
})

watch(() => [route.name, route.params.deckId], () => {
  if (isLibraryRoute()) {
    void library.syncLibraryRoute()
  }
})

onBeforeRouteLeave(() => {
  library.cleanupLibraryRoute()
})

function isLibraryRoute() {
  return route.name === 'library-public'
    || route.name === 'library-mine'
    || route.name === 'library-deck-manage'
}
</script>

<template>
  <LibraryPage
    v-model:search="search"
    :section="library.librarySection.value"
    :view="library.libraryView.value"
    :user="library.user.value"
    :active-count-label="library.activeLibraryCountLabel.value"
    :public-decks="library.filteredPublicDecks.value"
    :my-decks="library.filteredMyDecks.value"
    :public-decks-has-more="library.publicDecksHasMore.value"
    :my-decks-has-more="library.myDecksHasMore.value"
    :highlighted-deck-id="library.highlightedDeckId.value"
    :deck-selection-mode="library.deckSelectionMode.value"
    :selected-my-deck-ids="library.selectedMyDeckIds.value"
    :selected-my-decks-count="library.selectedMyDecksCount.value"
    :all-visible-my-decks-selected="library.allVisibleMyDecksSelected.value"
    :managed-deck="library.managedDeck.value"
    :managed-deck-form="managedDeckForm"
    :managed-deck-dirty="library.managedDeckDirty.value"
    :managed-cards-view="library.managedCardsView.value"
    :managed-cards-search="managedCardsSearch"
    :deck-formatters="library.deckFormatters"
    :card-text-summary="library.cardTextSummary"
    :card-count-label="library.cardCountLabel"
    @go-public="library.navigateTo({ name: 'library-public' })"
    @go-mine="library.navigateTo({ name: 'library-mine' })"
    @refresh="library.refreshAll"
    @start-deck="library.startDeck"
    @save-public-deck="library.savePublicDeck"
    @load-more-public="library.loadMorePublicDecks"
    @load-more-mine="library.loadMoreMyDecks"
    @open-managed-deck="library.openManagedDeck"
    @toggle-deck-selection-mode="library.toggleDeckSelectionMode"
    @toggle-visible-deck-selection="library.toggleVisibleMyDeckSelection"
    @clear-deck-selection="library.clearSelectedMyDecks"
    @delete-selected-decks="library.deleteSelectedMyDecks"
    @toggle-deck-selection="library.toggleMyDeckSelection"
    @login="library.openAuth('login')"
    @close-managed-deck="library.closeManagedDeck"
    @save-managed-deck="library.saveManagedDeck"
    @delete-managed-deck="library.deleteManagedDeck"
    @update:managed-deck-form="library.updateManagedDeckForm"
    @update:managed-cards-search="managedCardsSearch = $event"
    @create-card="library.openCreateCardEditor"
    @toggle-visible-card-selection="library.toggleVisibleManagedCardsSelection"
    @clear-card-selection="library.clearManagedCardSelection"
    @delete-selected-cards="library.deleteSelectedManagedCards"
    @select-card="library.selectManagedCard"
    @toggle-card-selection="library.toggleManagedCardSelection"
    @load-more-cards="library.loadMoreManagedCards"
    @edit-card="library.openEditCardEditor"
    @delete-card="library.deleteManagedCard"
  />
</template>
