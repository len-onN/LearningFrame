import { describe, expect, it } from 'vitest'
import type { ReviewRating, StudyCard } from '../../types/api'
import { useStudySession } from './useStudySession'

describe('useStudySession', () => {
  it('inicia sessao com cartas e calcula progresso', () => {
    const session = useStudySession()

    session.setStudySessionCards([
      studyCard('a'),
      studyCard('b')
    ], 'no-due')

    expect(session.currentCard.value?.clientId).toBe('a')
    expect(session.studyProgress.value).toEqual({
      initialTotal: 2,
      reviewed: 0,
      remaining: 2,
      percent: 0
    })
    expect(session.studyEmptyReason.value).toBe('idle')
  })

  it('registra revisao e conclui a sessao ao acabar a fila', () => {
    const session = useStudySession()
    session.setStudySessionCards([studyCard('a')], 'no-due')

    session.completeCurrentReview('GOOD', {
      rating: 'GOOD',
      ratingLabel: 'Bom',
      nextDueLabel: 'amanha',
      intervalLabel: '1 dia'
    })

    expect(session.studyQueue.value).toEqual([])
    expect(session.studyEmptyReason.value).toBe('completed')
    expect(session.studySummary.value?.reviewed).toBe(1)
    expect(session.studySummary.value?.ratingCounts.GOOD).toBe(1)
  })

  it('reseta estado da sessao', () => {
    const session = useStudySession()
    session.setStudySessionCards([studyCard('a')], 'no-due')
    session.answerVisible.value = true

    session.resetStudySession()

    expect(session.studyQueue.value).toEqual([])
    expect(session.answerVisible.value).toBe(false)
    expect(session.studyEmptyReason.value).toBe('idle')
    expect(session.studyProgress.value.initialTotal).toBe(0)
  })
})

function studyCard(clientId: string, rating: ReviewRating = 'GOOD'): StudyCard {
  return {
    clientId,
    deckId: 7,
    deckTitle: 'Deck',
    frontHtml: `Frente ${rating}`,
    backHtml: 'Verso',
    tags: [],
    dueAt: '2026-06-08T12:00:00Z',
    intervalDays: 0,
    repetitions: 0,
    easeFactor: 2.5,
    newCard: true,
    local: true
  }
}
