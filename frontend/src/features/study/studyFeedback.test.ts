import { describe, expect, it } from 'vitest'
import type { ReviewResult } from '../../types/api'
import {
  emptyStudyRatingCounts,
  intervalLabel,
  ratingLabel,
  studyFeedbackFromResult,
  studyFeedbackFromReviewResult
} from './studyFeedback'

describe('studyFeedback', () => {
  it('cria contadores zerados para todos os ratings', () => {
    expect(emptyStudyRatingCounts()).toEqual({
      AGAIN: 0,
      HARD: 0,
      GOOD: 0,
      EASY: 0
    })
  })

  it('formata labels de ratings e intervalos', () => {
    expect(ratingLabel('AGAIN')).toBe('De novo')
    expect(ratingLabel('HARD')).toBe('Dif\u00edcil')
    expect(ratingLabel('GOOD')).toBe('Bom')
    expect(ratingLabel('EASY')).toBe('F\u00e1cil')
    expect(intervalLabel(0)).toBe('intervalo menor que 1 dia')
    expect(intervalLabel(1)).toBe('intervalo de 1 dia')
    expect(intervalLabel(3)).toBe('intervalo de 3 dias')
  })

  it('monta feedback a partir de resultado local ou do backend', () => {
    const result: ReviewResult = {
      cardId: 1,
      rating: 'GOOD',
      nextDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      intervalDays: 1,
      repetitions: 2,
      easeFactor: 2.5
    }

    expect(studyFeedbackFromReviewResult(result)).toMatchObject({
      rating: 'GOOD',
      ratingLabel: 'Bom',
      intervalLabel: 'intervalo de 1 dia'
    })
    expect(studyFeedbackFromResult('EASY', result.nextDueAt, 3)).toMatchObject({
      rating: 'EASY',
      ratingLabel: 'F\u00e1cil',
      intervalLabel: 'intervalo de 3 dias'
    })
  })
})
