package com.learningframe.api.repository;

import com.learningframe.api.model.Deck;
import com.learningframe.api.model.DeckVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DeckRepository extends JpaRepository<Deck, Long> {
    Page<Deck> findByVisibilityOrderByUpdatedAtDesc(DeckVisibility visibility, Pageable pageable);

    Page<Deck> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId, Pageable pageable);

    @Query("""
            select d from Deck d
            where d.visibility = :visibility
                and (lower(d.title) like lower(concat('%', :query, '%'))
                or lower(coalesce(d.description, '')) like lower(concat('%', :query, '%')))
            order by d.updatedAt desc
            """)
    Page<Deck> searchByVisibility(
            @Param("visibility") DeckVisibility visibility,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select d from Deck d
            where d.owner.id = :ownerId
                and (lower(d.title) like lower(concat('%', :query, '%'))
                or lower(coalesce(d.description, '')) like lower(concat('%', :query, '%')))
            order by d.updatedAt desc
            """)
    Page<Deck> searchByOwnerId(
            @Param("ownerId") Long ownerId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select d from Deck d
            where d.id = :deckId and (d.visibility = com.learningframe.api.model.DeckVisibility.PUBLIC
                or (:userId is not null and d.owner.id = :userId))
            """)
    Optional<Deck> findAccessible(@Param("deckId") Long deckId, @Param("userId") Long userId);

    @Query("""
            select d from Deck d
            where d.id = :deckId and d.owner.id = :ownerId
            """)
    Optional<Deck> findOwned(@Param("deckId") Long deckId, @Param("ownerId") Long ownerId);
}
