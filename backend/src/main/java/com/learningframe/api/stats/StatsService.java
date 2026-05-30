package com.learningframe.api.stats;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.model.ReviewRating;
import com.learningframe.api.repository.CardRepository;
import com.learningframe.api.repository.ReviewLogRepository;
import com.learningframe.api.repository.ReviewStateRepository;
import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.stats.StatsDtos.StatsSummary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class StatsService {
    private final AuthService authService;
    private final CardRepository cards;
    private final ReviewStateRepository reviewStates;
    private final ReviewLogRepository reviewLogs;

    public StatsService(AuthService authService, CardRepository cards, ReviewStateRepository reviewStates, ReviewLogRepository reviewLogs) {
        this.authService = authService;
        this.cards = cards;
        this.reviewStates = reviewStates;
        this.reviewLogs = reviewLogs;
    }

    @Transactional(readOnly = true)
    public StatsSummary summary(AuthenticatedUser principal) {
        AppUser user = authService.requireUser(principal);
        Instant now = Instant.now();
        Instant todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant tomorrowStart = LocalDate.now(ZoneOffset.UTC).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant sevenDaysAgo = now.minusSeconds(7L * 24 * 60 * 60);
        Instant thirtyDaysAgo = now.minusSeconds(30L * 24 * 60 * 60);

        long totalRecent = reviewLogs.countByUserIdAndReviewedAtGreaterThanEqual(user.getId(), sevenDaysAgo);
        long successfulRecent = reviewLogs.countByUserIdAndRatingInAndReviewedAtGreaterThanEqual(
                user.getId(),
                List.of(ReviewRating.GOOD, ReviewRating.EASY),
                sevenDaysAgo
        );

        double accuracy = totalRecent == 0 ? 0 : Math.round((successfulRecent * 10000.0 / totalRecent)) / 100.0;
        long dueNow = cards.countMixedDue(user.getId(), now);
        return new StatsSummary(
                dueNow,
                reviewLogs.countByUserIdAndReviewedAtBetween(user.getId(), todayStart, tomorrowStart),
                accuracy,
                reviewLogs.countActiveDaysSince(user.getId(), thirtyDaysAgo),
                dueNow > 0 ? now : reviewStates.findNextDueAtForUser(user.getId()).orElse(null)
        );
    }
}
