package com.learningframe.api.repository;

import com.learningframe.api.model.Card;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    long countByDeckId(Long deckId);

    @Query("""
            select count(c) from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id = :deckId
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and (rs.id is null or rs.dueAt <= :now)
            """)
    long countDueForDeck(@Param("userId") Long userId, @Param("deckId") Long deckId, @Param("now") Instant now);

    @Query("""
            select count(c) from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and (rs.id is null or rs.dueAt <= :now)
            """)
    long countMixedDue(@Param("userId") Long userId, @Param("now") Instant now);

    @EntityGraph(attributePaths = {"tags", "deck"})
    List<Card> findByDeckIdOrderByCreatedAtAsc(Long deckId);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id = :deckId
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and (rs.id is null or rs.dueAt <= :now)
            order by case when rs.id is null then 1 else 0 end asc, rs.dueAt asc, c.createdAt asc
            """)
    List<Card> findDueForDeck(@Param("userId") Long userId, @Param("deckId") Long deckId, @Param("now") Instant now, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and (rs.id is null or rs.dueAt <= :now)
            order by case when rs.id is null then 1 else 0 end asc, rs.dueAt asc, d.updatedAt desc, c.createdAt asc
            """)
    List<Card> findMixedDue(@Param("userId") Long userId, @Param("now") Instant now, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id in :deckIds
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and (rs.id is null or rs.dueAt <= :now)
            order by case when rs.id is null then 1 else 0 end asc, rs.dueAt asc, d.updatedAt desc, c.createdAt asc
            """)
    List<Card> findMixedDueInDecks(@Param("userId") Long userId, @Param("deckIds") List<Long> deckIds, @Param("now") Instant now, Pageable pageable);
}
