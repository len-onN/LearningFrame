<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Image as ImageIcon, Volume2, Heading1, Heading2, Heading3
} from '@lucide/vue'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
  uploadingMedia?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'upload-media': [kind: 'image' | 'audio']
}>()

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Image.configure({
      inline: true,
      allowBase64: true
    })
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Update editor content when v-model changes from outside
watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  const isSame = editor.value.getHTML() === value
  if (!isSame) {
    editor.value.commands.setContent(value)
  }
})

// Expose insert method so parent can insert media
function insertHtml(html: string) {
  if (editor.value) {
    editor.value.commands.insertContent(html)
    editor.value.commands.focus()
  }
}
defineExpose({ insertHtml })

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="toolbar">
      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Negrito">
        <Bold :size="16" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Itálico">
        <Italic :size="16" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }" title="Sublinhado">
        <UnderlineIcon :size="16" />
      </button>
      <div class="divider"></div>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" title="Título 1">
        <Heading1 :size="16" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" title="Título 2">
        <Heading2 :size="16" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }" title="Título 3">
        <Heading3 :size="16" />
      </button>
      <div class="divider"></div>
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" title="Lista com marcadores">
        <List :size="16" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" title="Lista numerada">
        <ListOrdered :size="16" />
      </button>
      <div class="divider"></div>
      <button type="button" :disabled="uploadingMedia" @click="$emit('upload-media', 'image')" title="Inserir Imagem">
        <ImageIcon :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia" @click="$emit('upload-media', 'audio')" title="Inserir Áudio">
        <Volume2 :size="16" />
      </button>
    </div>
    
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 8px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--surface-color, #ffffff);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: var(--background-color, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  flex-wrap: wrap;
}

.toolbar button {
  background: none;
  border: none;
  padding: 0.35rem;
  border-radius: var(--radius-sm, 4px);
  color: var(--text-muted, #64748b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toolbar button:hover:not(:disabled) {
  background-color: var(--surface-color-hover, rgba(0,0,0,0.05));
  color: var(--text-color, #0f172a);
}

.toolbar button.is-active {
  background-color: var(--primary-light, rgba(0, 102, 255, 0.1));
  color: var(--primary-color, #0066ff);
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-color, #e2e8f0);
  margin: 0 0.25rem;
}

.editor-content {
  padding: 0.75rem;
  min-height: 200px;
  cursor: text;
  flex: 1;
  overflow-y: auto;
}

:deep(.tiptap) {
  outline: none;
  min-height: 100%;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  color: var(--text-muted, #64748b);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.tiptap img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm, 4px);
}

:deep(.tiptap audio) {
  max-width: 100%;
}
</style>
