<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import type { UserSettings } from '../types/api'

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')

const form = ref<UserSettings>({
  dailyNewCardsLimit: 20,
  dailyReviewCardsLimit: 100
})

async function fetchSettings() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.getUserSettings()
    form.value.dailyNewCardsLimit = data.dailyNewCardsLimit
    form.value.dailyReviewCardsLimit = data.dailyReviewCardsLimit
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar configurações.'
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    await api.updateUserSettings(form.value)
    notice.value = 'Configurações salvas com sucesso!'
    setTimeout(() => {
      notice.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Erro ao salvar configurações.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="route-view limits-settings">
    <div class="content-wrapper limit-center">
      <h2>Limites Diários</h2>
      <p class="description">
        Ajuste a quantidade de cartas que você deseja estudar diariamente. Limites saudáveis evitam sobrecarga.
      </p>

      <div v-if="loading" class="status loading-status">
        Carregando...
      </div>

      <div v-if="error" class="status error">
        {{ error }}
      </div>
      <div v-if="notice" class="status success">
        {{ notice }}
      </div>

      <form v-if="!loading" @submit.prevent="saveSettings" class="settings-form">
        <div class="form-group">
          <label for="new-limit">Novas cartas por dia</label>
          <input
            id="new-limit"
            v-model.number="form.dailyNewCardsLimit"
            type="number"
            min="1"
            max="500"
            required
            class="input-control"
          />
          <small class="hint">Cartas que você nunca estudou antes.</small>
        </div>

        <div class="form-group">
          <label for="review-limit">Revisões por dia</label>
          <input
            id="review-limit"
            v-model.number="form.dailyReviewCardsLimit"
            type="number"
            min="1"
            max="2000"
            required
            class="input-control"
          />
          <small class="hint">Cartas agendadas pelo algoritmo para fixação.</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="primary" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar configurações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.limit-center {
  max-width: 500px;
  margin: 0 auto;
}

.description {
  color: var(--color-text-dimmed);
  margin-bottom: 2rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
}

.input-control {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-dimmed);
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}
</style>
