<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '../../services/api'
import { useAuthSession } from '../../composables/useAuthSession'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted'): void
}>()

const { user } = useAuthSession()

const confirmationEmail = ref('')
const loading = ref(false)
const error = ref('')

const isEmailMatch = computed(() => {
  if (!user.value) return false
  return confirmationEmail.value.trim().toLowerCase() === user.value.email.toLowerCase()
})

async function confirmDeletion() {
  if (!isEmailMatch.value) return
  loading.value = true
  error.value = ''
  try {
    await api.deleteAccount()
    emit('deleted')
  } catch (err: any) {
    error.value = err.message || 'Erro ao excluir a conta.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content danger-modal">
      <header class="modal-header">
        <h3>Excluir Conta</h3>
        <button class="icon-button" @click="$emit('close')" aria-label="Fechar" :disabled="loading">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </header>

      <div class="modal-body">
        <p class="warning-text">
          Você está prestes a excluir permanentemente sua conta.
          <strong>Isso apagará todos os seus baralhos, cartas, mídias e progresso. Esta ação não pode ser desfeita.</strong>
        </p>

        <div v-if="error" class="status error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="confirm-email">Digite seu e-mail (<strong>{{ user?.email }}</strong>) para confirmar:</label>
          <input
            id="confirm-email"
            v-model="confirmationEmail"
            type="email"
            class="input-control"
            placeholder="Seu e-mail..."
            :disabled="loading"
          />
        </div>
      </div>

      <footer class="modal-footer">
        <button type="button" class="secondary" @click="$emit('close')" :disabled="loading">
          Cancelar
        </button>
        <button
          type="button"
          class="danger-button"
          :disabled="!isEmailMatch || loading"
          @click="confirmDeletion"
        >
          {{ loading ? 'Excluindo...' : 'Sim, excluir minha conta' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.danger-modal {
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--color-danger);
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-text {
  color: var(--color-text);
  line-height: 1.5;
}

.warning-text strong {
  display: block;
  margin-top: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.input-control {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: var(--color-surface);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.danger-button {
  background-color: var(--color-danger-surface);
  color: var(--color-danger-strong);
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-danger-border-soft);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}
.danger-button:hover:not(:disabled) {
  background-color: var(--color-danger-focus);
  border-color: var(--color-danger-border);
}
.danger-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
