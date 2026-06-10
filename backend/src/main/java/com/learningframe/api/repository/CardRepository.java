package com.learningframe.api.repository;

import com.learningframe.api.model.Card;
import org.springframework.data.domain.Page;
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

    @EntityGraph(attributePaths = {"deck"})
    Page<Card> findPageByDeckIdOrderByCreatedAtDesc(Long deckId, Pageable pageable);

    @EntityGraph(attributePaths = {"deck"})
    @Query(
            value = """
                    select distinct c from Card c
                    left join c.tags t
                    where c.deck.id = :deckId
                      and (
                        lower(c.frontHtml) like lower(concat('%', :query, '%'))
                        or lower(c.backHtml) like lower(concat('%', :query, '%'))
                        or lower(t.name) like lower(concat('%', :query, '%'))
                      )
                    order by c.createdAt desc
                    """,
            countQuery = """
                    select count(distinct c) from Card c
                    left join c.tags t
                    where c.deck.id = :deckId
                      and (
                        lower(c.frontHtml) like lower(concat('%', :query, '%'))
                        or lower(c.backHtml) like lower(concat('%', :query, '%'))
                        or lower(t.name) like lower(concat('%', :query, '%'))
                      )
                    """
    )
    Page<Card> searchPageByDeckId(@Param("deckId") Long deckId, @Param("query") String query, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id = :deckId
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and rs.id is null
            order by c.createdAt asc
            """)
    List<Card> findNewForDeck(@Param("userId") Long userId, @Param("deckId") Long deckId, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id = :deckId
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and rs.dueAt <= :now
            order by rs.dueAt asc, c.createdAt asc
            """)
    List<Card> findReviewForDeck(@Param("userId") Long userId, @Param("deckId") Long deckId, @Param("now") Instant now, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and rs.id is null
            order by d.updatedAt desc, c.createdAt asc
            """)
    List<Card> findMixedNew(@Param("userId") Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            join ReviewState rs on rs.card = c and rs.user.id = :userId
            where (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and rs.dueAt <= :now
            order by rs.dueAt asc, d.updatedAt desc, c.createdAt asc
            """)
    List<Card> findMixedReview(@Param("userId") Long userId, @Param("now") Instant now, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            left join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id in :deckIds
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and rs.id is null
            order by d.updatedAt desc, c.createdAt asc
            """)
    List<Card> findMixedNewInDecks(@Param("userId") Long userId, @Param("deckIds") List<Long> deckIds, Pageable pageable);

    @EntityGraph(attributePaths = {"tags", "deck"})
    @Query("""
            select c from Card c
            join c.deck d
            join ReviewState rs on rs.card = c and rs.user.id = :userId
            where d.id in :deckIds
              and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC or d.owner.id = :userId)
              and rs.dueAt <= :now
            order by rs.dueAt asc, d.updatedAt desc, c.createdAt asc
            """)
    List<Card> findMixedReviewInDecks(@Param("userId") Long userId, @Param("deckIds") List<Long> deckIds, @Param("now") Instant now, Pageable pageable);
}
