package com.learningframe.api.study;

import com.learningframe.api.model.ReviewRating;
import com.learningframe.api.study.StudyDtos.ReviewSchedule;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class SpacedRepetitionService {
    private static final double MIN_EASE = 1.3;

    public ReviewSchedule next(ReviewRating rating, int currentIntervalDays, int currentRepetitions, double currentEaseFactor, Instant now) {
        double ease = Math.max(MIN_EASE, currentEaseFactor <= 0 ? 2.5 : currentEaseFactor);
        int interval = Math.max(0, currentIntervalDays);
        int repetitions = Math.max(0, currentRepetitions);

        return switch (rating) {
            case AGAIN -> new ReviewSchedule(
                    now.plus(10, ChronoUnit.MINUTES),
                    0,
                    0,
                    roundEase(Math.max(MIN_EASE, ease - 0.20))
            );
            case HARD -> {
                int nextInterval = Math.max(1, (int) Math.ceil(Math.max(1, interval) * 1.2));
                yield new ReviewSchedule(
                        now.plus(nextInterval, ChronoUnit.DAYS),
                        nextInterval,
                        repetitions + 1,
                        roundEase(Math.max(MIN_EASE, ease - 0.15))
                );
            }
            case GOOD -> {
                int nextInterval;
                if (repetitions == 0) {
                    nextInterval = 1;
                } else if (repetitions == 1) {
                    nextInterval = 6;
                } else {
                    nextInterval = Math.max(1, (int) Math.round(Math.max(1, interval) * ease));
                }
                yield new ReviewSchedule(
                        now.plus(nextInterval, ChronoUnit.DAYS),
                        nextInterval,
                        repetitions + 1,
                        roundEase(ease)
                );
            }
            case EASY -> {
                int nextInterval = repetitions == 0
                        ? 4
                        : Math.max(2, (int) Math.round(Math.max(1, interval) * ease * 1.3));
                yield new ReviewSchedule(
                        now.plus(nextInterval, ChronoUnit.DAYS),
                        nextInterval,
                        repetitions + 1,
                        roundEase(ease + 0.15)
                );
            }
        };
    }

    private double roundEase(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
