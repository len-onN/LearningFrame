package com.learningframe.api.stats;

import java.time.Instant;

public final class StatsDtos {
    private StatsDtos() {
    }

    public record StatsSummary(
            long dueNow,
            long reviewsToday,
            double accuracyLast7Days,
            long activeDaysLast30,
            Instant nextDueAt
    ) {
    }
}
