import type { LocalReviewState, ReviewRating } from '../types/api'

export function nextReview(
  current: LocalReviewState | undefined,
  rating: ReviewRating,
  now = new Date()
): LocalReviewState {
  const currentEase = Math.max(1.3, current?.easeFactor ?? 2.5)
  const interval = Math.max(0, current?.intervalDays ?? 0)
  const repetitions = Math.max(0, current?.repetitions ?? 0)

  if (rating === 'AGAIN') {
    return {
      dueAt: addMinutes(now, 10).toISOString(),
      intervalDays: 0,
      repetitions: 0,
      easeFactor: roundEase(Math.max(1.3, currentEase - 0.2))
    }
  }

  if (rating === 'HARD') {
    const nextInterval = Math.max(1, Math.ceil(Math.max(1, interval) * 1.2))
    return {
      dueAt: addDays(now, nextInterval).toISOString(),
      intervalDays: nextInterval,
      repetitions: repetitions + 1,
      easeFactor: roundEase(Math.max(1.3, currentEase - 0.15))
    }
  }

  if (rating === 'EASY') {
    const nextInterval = repetitions === 0 ? 4 : Math.max(2, Math.round(Math.max(1, interval) * currentEase * 1.3))
    return {
      dueAt: addDays(now, nextInterval).toISOString(),
      intervalDays: nextInterval,
      repetitions: repetitions + 1,
      easeFactor: roundEase(currentEase + 0.15)
    }
  }

  const nextInterval = repetitions === 0
    ? 1
    : repetitions === 1
      ? 6
      : Math.max(1, Math.round(Math.max(1, interval) * currentEase))

  return {
    dueAt: addDays(now, nextInterval).toISOString(),
    intervalDays: nextInterval,
    repetitions: repetitions + 1,
    easeFactor: roundEase(currentEase)
  }
}

export function isDue(state: LocalReviewState | undefined, now = new Date()) {
  return !state || new Date(state.dueAt).getTime() <= now.getTime()
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60_000)
}

function roundEase(value: number) {
  return Math.round(value * 100) / 100
}
