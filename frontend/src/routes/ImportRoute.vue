<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import ImportPage from '../pages/ImportPage.vue'
import { useApkgImport } from '../features/import/useApkgImport'
import { useAuthSession } from '../composables/useAuthSession'
import { useFeedback } from '../composables/useFeedback'

const importFlow = useApkgImport()
const { user } = useAuthSession()
const { loading } = useFeedback()

onBeforeUnmount(() => {
  importFlow.disposeApkgImport()
})

const importTitle = computed({
  get: () => importFlow.importTitle.value,
  set: (value: string) => {
    importFlow.importTitle.value = value
  }
})
const importVisibility = computed({
  get: () => importFlow.importVisibility.value,
  set: (value) => {
    importFlow.importVisibility.value = value
  }
})
</script>

<template>
  <ImportPage
    v-model:import-title="importTitle"
    v-model:import-visibility="importVisibility"
    :selected-file="importFlow.selectedFile.value"
    :loading="loading"
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
