<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import ImportPage from '../pages/ImportPage.vue'
import { useApkgImport } from '../features/import/useApkgImport'
import { useAuthStore } from '../stores/useAuthStore'
import { storeToRefs } from 'pinia'
import { useFeedbackStore } from '../stores/useFeedbackStore'


const importFlow = useApkgImport()
const importTitle = importFlow.importTitle
const importVisibility = importFlow.importVisibility
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const feedbackStore = useFeedbackStore()


onBeforeUnmount(() => {
  importFlow.disposeApkgImport()
})

onMounted(() => {
  if (importFlow.importPreview.value) {
    importFlow.showPreviewCard(importFlow.previewCardIndex.value, importFlow.previewFace.value)
  }
})

</script>

<template>
  <ImportPage
    v-model:importTitle="importTitle"
    v-model:importVisibility="importVisibility"
    :selected-file="importFlow.selectedFile.value"
    :loading="feedbackStore.loading"
    :import-preview="importFlow.importPreview.value"
    :current-preview-card="importFlow.currentPreviewCard.value"
    :preview-card-index="importFlow.previewCardIndex.value"
    :preview-face="importFlow.previewFace.value"
    :preview-picker-open="importFlow.previewPickerOpen.value"
    :preview-card-search="importFlow.previewCardSearch.value"
    :preview-card-options="importFlow.previewCardOptions.value"
    :preview-card-title="importFlow.previewCardTitle(importFlow.previewCardIndex.value)"
    :current-preview-html="importFlow.currentPreviewHtml.value"
    :user="user"
    @file-change="importFlow.handleApkgChange"
    @update:preview-picker-open="importFlow.previewPickerOpen.value = $event"
    @update:preview-card-search="importFlow.previewCardSearch.value = $event"
    @select-preview-card="importFlow.selectPreviewCard"
    @move-preview-card="importFlow.movePreviewCard"
    @toggle-preview-face="importFlow.togglePreviewFace"
    @persist-import="importFlow.persistImport"
  />
</template>
