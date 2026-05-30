package com.learningframe.api.repository;

import com.learningframe.api.model.ReviewLog;
import com.learningframe.api.model.ReviewRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {
    long countByUserIdAndReviewedAtBetween(Long userId, Instant start, Instant end);

    long countByUserIdAndReviewedAtGreaterThanEqual(Long userId, Instant start);

    long countByUserIdAndRatingInAndReviewedAtGreaterThanEqual(Long userId, Collection<ReviewRating> ratings, Instant start);

    @Query("""
            select count(distinct function('date', rl.reviewedAt)) from ReviewLog rl
            where rl.user.id = :userId and rl.reviewedAt >= :start
            """)
    long countActiveDaysSince(@Param("userId") Long userId, @Param("start") Instant start);
}
