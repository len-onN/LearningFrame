package com.learningframe.api.study;

import com.learningframe.api.model.ReviewRating;
import com.learningframe.api.model.StudyMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public final class StudyDtos {
    private StudyDtos() {
    }

    public record StudyCardResponse(
            Long cardId,
            Long deckId,
            String deckTitle,
            String frontHtml,
            String backHtml,
            List<String> tags,
            boolean newCard,
            Instant dueAt,
            int intervalDays,
            int repetitions
    ) {
    }

    public record DueResponse(
            StudyMode mode,
            List<StudyCardResponse> cards,
            boolean limitReachedNew,
            boolean limitReachedReview
    ) {
    }

    public record ReviewRequest(
            @NotNull Long cardId,
            @NotNull ReviewRating rating
    ) {
    }

    public record AnonymousReviewRequest(
            @NotNull ReviewRating rating,
            @Min(0) @Max(36500) int intervalDays,
            @Min(0) @Max(10000) int repetitions,
            @Min(1) @Max(5) double easeFactor
    ) {
    }

    public record ReviewResult(
            Long cardId,
            ReviewRating rating,
            Instant nextDueAt,
            int intervalDays,
            int repetitions,
            double easeFactor
    ) {
    }

    public record ReviewSchedule(
            Instant nextDueAt,
            int intervalDays,
            int repetitions,
            double easeFactor
    ) {
    }
}
