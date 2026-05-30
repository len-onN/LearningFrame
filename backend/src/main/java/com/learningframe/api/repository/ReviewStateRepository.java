package com.learningframe.api.repository;

import com.learningframe.api.model.ReviewState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ReviewStateRepository extends JpaRepository<ReviewState, Long> {
    Optional<ReviewState> findByUserIdAndCardId(Long userId, Long cardId);

    long countByUserIdAndDueAtLessThanEqual(Long userId, Instant now);

    @Query("""
            select min(rs.dueAt) from ReviewState rs
            join rs.card c
            join c.deck d
            where rs.user.id = :userId
              and d.id = :deckId
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
            """)
    Optional<Instant> findNextDueAtForDeck(@Param("userId") Long userId, @Param("deckId") Long deckId);

    @Query("""
            select min(rs.dueAt) from ReviewState rs
            join rs.card c
            join c.deck d
            where rs.user.id = :userId
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
            """)
    Optional<Instant> findNextDueAtForUser(@Param("userId") Long userId);

    @Query("""
            select rs from ReviewState rs
            join rs.card c
            join c.deck d
            where rs.user.id = :userId
              and rs.dueAt <= :now
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
            """)
    List<ReviewState> findAccessibleDueStates(@Param("userId") Long userId, @Param("now") Instant now);
}
