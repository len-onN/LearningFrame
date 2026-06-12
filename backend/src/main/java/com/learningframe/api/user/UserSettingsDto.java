package com.learningframe.api.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UserSettingsDto(
        @NotNull @Min(1) @Max(500) Integer dailyNewCardsLimit,
        @NotNull @Min(1) @Max(2000) Integer dailyReviewCardsLimit
) {
}
