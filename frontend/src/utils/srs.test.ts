import { describe, expect, it } from 'vitest'
import { nextReview } from './srs'

describe('agendamento da proxima revisao', () => {
  it('agenda uma boa resposta nova para amanha', () => {
    const now = new Date('2026-05-30T10:00:00.000Z')
    const result = nextReview(undefined, 'GOOD', now)

    expect(result.intervalDays).toBe(1)
    expect(result.repetitions).toBe(1)
    expect(result.easeFactor).toBe(2.5)
    expect(result.dueAt).toBe('2026-05-31T10:00:00.000Z')
  })

  it('reinicia as repeticoes ao marcar de novo', () => {
    const now = new Date('2026-05-30T10:00:00.000Z')
    const result = nextReview({ dueAt: now.toISOString(), intervalDays: 6, repetitions: 2, easeFactor: 2.5 }, 'AGAIN', now)

    expect(result.intervalDays).toBe(0)
    expect(result.repetitions).toBe(0)
    expect(result.easeFactor).toBe(2.3)
  })
})
