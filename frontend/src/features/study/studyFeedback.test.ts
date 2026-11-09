import { createPinia, setActivePinia } from 'pinia'
import {  describe, expect, it , beforeEach } from 'vitest'
import type { ReviewResult } from '../../types/api'
import {
  emptyStudyRatingCounts,
  intervalLabel,
  ratingLabel,
  studyFeedbackFromResult,
  studyFeedbackFromReviewResult
} from './studyFeedback'

describe('studyFeedback', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('cria contadores zerados para todos os ratings', () => {
    expect(emptyStudyRatingCounts()).toEqual({
      AGAIN: 0,
      HARD: 0,
      GOOD: 0,
      EASY: 0
    })
  })

  it('formata labels de ratings e intervalos', () => {
    expect(ratingLabel('AGAIN')).toBe('Again')
    expect(ratingLabel('HARD')).toBe('Hard')
    expect(ratingLabel('GOOD')).toBe('Good')
    expect(ratingLabel('EASY')).toBe('Easy')
    expect(intervalLabel(0)).toBe('interval less than 1 day')
    expect(intervalLabel(1)).toBe('interval of 1 day')
    expect(intervalLabel(3)).toBe('interval of 3 days')
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
      ratingLabel: 'Good',
      intervalLabel: 'interval of 1 day'
    })
    expect(studyFeedbackFromResult('EASY', result.nextDueAt, 3)).toMatchObject({
      rating: 'EASY',
      ratingLabel: 'Easy',
      intervalLabel: 'interval of 3 days'
    })
  })
})
