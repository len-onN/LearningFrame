package com.learningframe.api.deck;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.deck.DeckDtos.CardResponse;
import com.learningframe.api.deck.DeckDtos.CardUpsertRequest;
import com.learningframe.api.deck.DeckDtos.DeckDetail;
import com.learningframe.api.deck.DeckDtos.DeckPage;
import com.learningframe.api.deck.DeckDtos.DeckSummary;
import com.learningframe.api.deck.DeckDtos.DeckUpsertRequest;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.model.Card;
import com.learningframe.api.model.Deck;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.ImportFormat;
import com.learningframe.api.model.Tag;
import com.learningframe.api.repository.CardRepository;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.ReviewStateRepository;
import com.learningframe.api.repository.TagRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class DeckService {
    private static final int MAX_PAGE_SIZE = 24;

    private final DeckRepository decks;
    private final CardRepository cards;
    private final ReviewStateRepository reviewStates;
    private final TagRepository tags;
    private final AuthService authService;

    public DeckService(DeckRepository decks, CardRepository cards, ReviewStateRepository reviewStates, TagRepository tags, AuthService authService) {
        this.decks = decks;
        this.cards = cards;
        this.reviewStates = reviewStates;
        this.tags = tags;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public DeckPage publicDecks(AuthenticatedUser principal, int page, int size, String query) {
        Long userId = principal == null ? null : principal.id();
        String normalizedQuery = normalizeSearchQuery(query);
        PageRequest pageRequest = pageRequest(page, size);
        Page<Deck> result = normalizedQuery == null
                ? decks.findByVisibilityOrderByUpdatedAtDesc(DeckVisibility.PUBLIC, pageRequest)
                : decks.searchByVisibility(DeckVisibility.PUBLIC, normalizedQuery, pageRequest);
        return toPage(result, userId);
    }

    @Transactional(readOnly = true)
    public DeckPage myDecks(AuthenticatedUser principal, int page, int size, String query) {
        AppUser user = authService.requireUser(principal);
        String normalizedQuery = normalizeSearchQuery(query);
        PageRequest pageRequest = pageRequest(page, size);
        Page<Deck> result = normalizedQuery == null
                ? decks.findByOwnerIdOrderByUpdatedAtDesc(user.getId(), pageRequest)
                : decks.searchByOwnerId(user.getId(), normalizedQuery, pageRequest);
        return toPage(result, user.getId());
    }

    @Transactional(readOnly = true)
    public DeckDetail getDeck(Long deckId, AuthenticatedUser principal) {
        Long userId = principal == null ? null : principal.id();
        Deck deck = decks.findAccessible(deckId, userId)
                .orElseThrow(() -> ApiException.notFound("Baralho nao encontrado."));
        return toDetail(deck);
    }

    @Transactional
    public DeckSummary createDeck(DeckUpsertRequest request, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        Deck deck = decks.save(new Deck(
                owner,
                request.title().trim(),
                trimToNull(request.description()),
                request.visibility(),
                ImportFormat.MANUAL
        ));
        return toSummary(deck, owner.getId());
    }

    @Transactional
    public DeckSummary updateDeck(Long deckId, DeckUpsertRequest request, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        Deck deck = ownedDeck(deckId, owner.getId());
        deck.setTitle(request.title().trim());
        deck.setDescription(trimToNull(request.description()));
        deck.setVisibility(request.visibility());
        return toSummary(deck, owner.getId());
    }

    @Transactional
    public void deleteDeck(Long deckId, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        decks.delete(ownedDeck(deckId, owner.getId()));
    }

    @Transactional
    public CardResponse createCard(Long deckId, CardUpsertRequest request, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        Deck deck = ownedDeck(deckId, owner.getId());
        Card card = new Card(deck, request.frontHtml().trim(), request.backHtml().trim(), null);
        replaceTags(card, request.tags());
        return toCard(cards.save(card));
    }

    @Transactional
    public CardResponse updateCard(Long deckId, Long cardId, CardUpsertRequest request, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        ownedDeck(deckId, owner.getId());
        Card card = cards.findById(cardId)
                .filter(existing -> existing.getDeck().getId().equals(deckId))
                .orElseThrow(() -> ApiException.notFound("Card nao encontrado."));
        card.setFrontHtml(request.frontHtml().trim());
        card.setBackHtml(request.backHtml().trim());
        replaceTags(card, request.tags());
        return toCard(card);
    }

    @Transactional
    public void deleteCard(Long deckId, Long cardId, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        ownedDeck(deckId, owner.getId());
        Card card = cards.findById(cardId)
                .filter(existing -> existing.getDeck().getId().equals(deckId))
                .orElseThrow(() -> ApiException.notFound("Card nao encontrado."));
        cards.delete(card);
    }

    private Deck ownedDeck(Long deckId, Long ownerId) {
        return decks.findOwned(deckId, ownerId)
                .orElseThrow(() -> ApiException.forbidden("Este baralho nao pertence ao usuario logado."));
    }

    private DeckSummary toSummary(Deck deck, Long userId) {
        Instant now = Instant.now();
        Long dueCount = userId == null ? null : cards.countDueForDeck(userId, deck.getId(), now);
        Instant nextDueAt = userId == null ? null : nextDueAtForDeck(userId, deck.getId(), now, dueCount);
        return new DeckSummary(
                deck.getId(),
                deck.getTitle(),
                deck.getDescription(),
                deck.getVisibility(),
                deck.getSourceFormat(),
                cards.countByDeckId(deck.getId()),
                dueCount,
                nextDueAt,
                deck.getOwner() == null ? "LearningFrame" : deck.getOwner().getDisplayName(),
                deck.getUpdatedAt()
        );
    }

    private DeckPage toPage(Page<Deck> page, Long userId) {
        return new DeckPage(
                page.getContent().stream().map(deck -> toSummary(deck, userId)).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    private PageRequest pageRequest(int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(normalizedPage, normalizedSize);
    }

    private String normalizeSearchQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim();
    }

    private Instant nextDueAtForDeck(Long userId, Long deckId, Instant now, Long dueCount) {
        if (dueCount != null && dueCount > 0) {
            return now;
        }
        Optional<Instant> nextDueAt = reviewStates.findNextDueAtForDeck(userId, deckId);
        return nextDueAt.orElse(null);
    }

    private DeckDetail toDetail(Deck deck) {
        return new DeckDetail(
                deck.getId(),
                deck.getTitle(),
                deck.getDescription(),
                deck.getVisibility(),
                deck.getSourceFormat(),
                deck.getOwner() == null ? "LearningFrame" : deck.getOwner().getDisplayName(),
                cards.findByDeckIdOrderByCreatedAtAsc(deck.getId()).stream().map(this::toCard).toList()
        );
    }

    private CardResponse toCard(Card card) {
        return new CardResponse(
                card.getId(),
                card.getDeck().getId(),
                card.getFrontHtml(),
                card.getBackHtml(),
                card.getTags().stream().map(Tag::getName).sorted().toList()
        );
    }

    private void replaceTags(Card card, List<String> requestedTags) {
        card.getTags().clear();
        for (String tagName : normalizeTags(requestedTags)) {
            Tag tag = tags.findByNameIgnoreCase(tagName).orElseGet(() -> tags.save(new Tag(tagName)));
            card.getTags().add(tag);
        }
    }

    private List<String> normalizeTags(List<String> requestedTags) {
        if (requestedTags == null) {
            return List.of();
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (String tag : requestedTags) {
            if (tag == null) {
                continue;
            }
            String value = tag.trim().toLowerCase(Locale.ROOT);
            if (!value.isBlank()) {
                normalized.add(value);
            }
        }
        return new ArrayList<>(normalized);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
