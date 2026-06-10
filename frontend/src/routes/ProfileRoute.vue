<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { useAuthSession } from '../composables/useAuthSession'
import { useRouter } from 'vue-router'
import AccountDeleteModal from '../features/profile/AccountDeleteModal.vue'

const { user, updateDisplayName, clearSession } = useAuthSession()
const router = useRouter()

const loading = ref(false)
const savingName = ref(false)
const savingPass = ref(false)
const errorName = ref('')
const noticeName = ref('')
const errorPass = ref('')
const noticePass = ref('')

const formName = ref({
  displayName: ''
})

const formPass = ref({
  oldPassword: '',
  newPassword: ''
})

const showDeleteModal = ref(false)

onMounted(() => {
  if (user.value) {
    formName.value.displayName = user.value.displayName
  }
})

async function saveDisplayName() {
  savingName.value = true
  errorName.value = ''
  noticeName.value = ''
  try {
    await api.updateDisplayName(formName.value.displayName)
    updateDisplayName(formName.value.displayName)
    noticeName.value = 'Nome de exibição atualizado com sucesso!'
    setTimeout(() => { noticeName.value = '' }, 3000)
  } catch (err: any) {
    errorName.value = err.message || 'Erro ao salvar o nome.'
  } finally {
    savingName.value = false
  }
}

async function savePassword() {
  savingPass.value = true
  errorPass.value = ''
  noticePass.value = ''
  try {
    await api.updatePassword(formPass.value.oldPassword, formPass.value.newPassword)
    noticePass.value = 'Senha atualizada com sucesso!'
    formPass.value.oldPassword = ''
    formPass.value.newPassword = ''
    setTimeout(() => { noticePass.value = '' }, 3000)
  } catch (err: any) {
    errorPass.value = err.message || 'Erro ao alterar a senha.'
  } finally {
    savingPass.value = false
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function handleAccountDeleted() {
  showDeleteModal.value = false
  clearSession()
  await router.push('/entrar')
}
</script>

<template>
  <div class="route-view profile-settings">
    <div class="content-wrapper limit-center">
      <h2>Meu Perfil</h2>
      <p class="description">Gerencie suas informações pessoais e a segurança da conta.</p>

      <section class="profile-section">
        <h3>Informações Pessoais</h3>
        <div v-if="errorName" class="status error">{{ errorName }}</div>
        <div v-if="noticeName" class="status success">{{ noticeName }}</div>
        <form @submit.prevent="saveDisplayName" class="settings-form">
          <div class="form-group">
            <label for="display-name">Nome de Exibição</label>
            <input
              id="display-name"
              v-model="formName.displayName"
              type="text"
              maxlength="120"
              required
              class="input-control"
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="primary" :disabled="savingName">
              {{ savingName ? 'Salvando...' : 'Salvar Nome' }}
            </button>
          </div>
        </form>
      </section>

      <section class="profile-section">
        <h3>Segurança</h3>
        <div v-if="errorPass" class="status error">{{ errorPass }}</div>
        <div v-if="noticePass" class="status success">{{ noticePass }}</div>
        <form @submit.prevent="savePassword" class="settings-form">
          <div class="form-group">
            <label for="old-password">Senha Atual</label>
            <input
              id="old-password"
              v-model="formPass.oldPassword"
              type="password"
              required
              class="input-control"
            />
          </div>
          <div class="form-group">
            <label for="new-password">Nova Senha</label>
            <input
              id="new-password"
              v-model="formPass.newPassword"
              type="password"
              minlength="8"
              required
              class="input-control"
            />
            <small class="hint">A nova senha deve ter no mínimo 8 caracteres.</small>
          </div>
          <div class="form-actions">
            <button type="submit" class="primary" :disabled="savingPass">
              {{ savingPass ? 'Alterando...' : 'Alterar Senha' }}
            </button>
          </div>
        </form>
      </section>

      <section class="profile-section danger-zone">
        <h3>Zona de Perigo</h3>
        <p class="hint">Excluir a conta removerá permanentemente todos os seus baralhos, cartas, mídias e progresso.</p>
        <button type="button" class="danger-button" @click="confirmDelete">
          Excluir minha conta
        </button>
      </section>
    </div>

    <AccountDeleteModal
      v-if="showDeleteModal"
      @close="showDeleteModal = false"
      @deleted="handleAccountDeleted"
    />
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

.profile-section {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.profile-section h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
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

.danger-zone {
  border-bottom: none;
}

.danger-zone p {
  margin-bottom: 1rem;
}

.danger-button {
  background-color: var(--color-danger);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}
.danger-button:hover {
  background-color: var(--color-danger-hover);
}
</style>
