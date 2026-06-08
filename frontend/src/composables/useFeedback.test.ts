import { describe, expect, it } from 'vitest'
import { useFeedback } from './useFeedback'

describe('useFeedback', () => {
  it('mostra notice limpando erro e definindo lifetime', () => {
    const feedback = useFeedback()

    feedback.showError('Falhou.')
    feedback.showNotice('Salvo.', 'next-route')

    expect(feedback.notice.value).toBe('Salvo.')
    expect(feedback.error.value).toBe('')
    expect(feedback.feedbackLifetime.value).toBe('next-route')
  })

  it('mostra erro limpando notice e definindo lifetime', () => {
    const feedback = useFeedback()

    feedback.showNotice('Salvo.')
    feedback.showError('Falhou.', 'sticky')

    expect(feedback.error.value).toBe('Falhou.')
    expect(feedback.notice.value).toBe('')
    expect(feedback.feedbackLifetime.value).toBe('sticky')
  })

  it('limpa feedback route-scoped ao trocar de rota', () => {
    const feedback = useFeedback()

    feedback.showNotice('Baralho excluido.')
    feedback.clearFeedbackForRouteChange('/biblioteca/meus/1/gerenciar', '/biblioteca/meus')

    expect(feedback.notice.value).toBe('')
    expect(feedback.error.value).toBe('')
    expect(feedback.feedbackLifetime.value).toBe('route')
  })

  it('preserva next-route uma vez e limpa na troca seguinte', () => {
    const feedback = useFeedback()

    feedback.showNotice('Sessao iniciada.', 'next-route')
    feedback.clearFeedbackForRouteChange('/entrar', '/biblioteca/meus')

    expect(feedback.notice.value).toBe('Sessao iniciada.')
    expect(feedback.feedbackLifetime.value).toBe('route')

    feedback.clearFeedbackForRouteChange('/biblioteca/meus', '/estudo')

    expect(feedback.notice.value).toBe('')
  })

  it('nao limpa feedback sticky ao trocar de rota', () => {
    const feedback = useFeedback()

    feedback.showError('Backend indisponivel.', 'sticky')
    feedback.clearFeedbackForRouteChange('/biblioteca/publicos', '/estudo')

    expect(feedback.error.value).toBe('Backend indisponivel.')
    expect(feedback.feedbackLifetime.value).toBe('sticky')
  })

  it('encerra loading quando a task termina com sucesso', async () => {
    const feedback = useFeedback()

    await feedback.withFeedback(async () => {
      expect(feedback.loading.value).toBe(true)
    })

    expect(feedback.loading.value).toBe(false)
    expect(feedback.error.value).toBe('')
  })

  it('encerra loading e traduz falha de conexao', async () => {
    const feedback = useFeedback()

    await feedback.withFeedback(async () => {
      throw new Error('Failed to fetch')
    })

    expect(feedback.loading.value).toBe(false)
    expect(feedback.error.value).toBe('Backend indisponivel. Verifique se o Docker Compose esta ativo e tente novamente.')
  })

  it('preserva feedback existente quando clearOnStart e falso', async () => {
    const feedback = useFeedback()

    feedback.showNotice('Mensagem preservada.')
    await feedback.withFeedback(async () => undefined, { showLoading: false, clearOnStart: false })

    expect(feedback.notice.value).toBe('Mensagem preservada.')
    expect(feedback.loading.value).toBe(false)
  })
})
