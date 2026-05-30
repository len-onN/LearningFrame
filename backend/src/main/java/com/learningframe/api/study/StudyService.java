package com.learningframe.api.study;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.model.Card;
import com.learningframe.api.model.ReviewLog;
import com.learningframe.api.model.ReviewState;
import com.learningframe.api.model.StudyMode;
import com.learningframe.api.model.Tag;
import com.learningframe.api.repository.CardRepository;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.ReviewLogRepository;
import com.learningframe.api.repository.ReviewStateRepository;
import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.study.StudyDtos.AnonymousReviewRequest;
import com.learningframe.api.study.StudyDtos.DueResponse;
import com.learningframe.api.study.StudyDtos.ReviewRequest;
import com.learningframe.api.study.StudyDtos.ReviewResult;
import com.learningframe.api.study.StudyDtos.ReviewSchedule;
import com.learningframe.api.study.StudyDtos.StudyCardResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudyService {
    private final AuthService authService;
    private final CardRepository cards;
    private final DeckRepository decks;
    private final ReviewStateRepository reviewStates;
    private final ReviewLogRepository reviewLogs;
    private final SpacedRepetitionService spacedRepetition;

    public StudyService(
            AuthService authService,
            CardRepository cards,
            DeckRepository decks,
            ReviewStateRepository reviewStates,
            ReviewLogRepository reviewLogs,
            SpacedRepetitionService spacedRepetition
    ) {
        this.authService = authService;
        this.cards = cards;
        this.decks = decks;
        this.reviewStates = reviewStates;
        this.reviewLogs = reviewLogs;
        this.spacedRepetition = spacedRepetition;
    }

    @Transactional(readOnly = true)
    public DueResponse due(
            StudyMode mode,
            Long deckId,
            List<Long> deckIds,
            int limit,
            AuthenticatedUser principal
    ) {
        AppUser user = authService.requireUser(principal);
        Instant now = Instant.now();
        int boundedLimit = Math.max(1, Math.min(limit, 50));

        List<Card> dueCards;
        if (mode == StudyMode.SINGLE_DECK) {
            if (deckId == null) {
                throw ApiException.badRequest("deckId e obrigatorio no estudo de baralho unico.");
            }
            decks.findAccessible(deckId, user.getId()).orElseThrow(() -> ApiException.notFound("Baralho nao encontrado."));
            dueCards = cards.findDueForDeck(user.getId(), deckId, now, PageRequest.of(0, boundedLimit));
        } else {
            PageRequest page = PageRequest.of(0, boundedLimit * 3);
            if (deckIds == null || deckIds.isEmpty()) {
                dueCards = cards.findMixedDue(user.getId(), now, page);
            } else {
                dueCards = cards.findMixedDueInDecks(user.getId(), deckIds, now, page);
            }
            dueCards = interleaveByDeck(dueCards, boundedLimit);
        }

        return new DueResponse(mode, dueCards.stream()
                .limit(boundedLimit)
                .map(card -> toStudyCard(card, user.getId()))
                .toList());
    }

    @Transactional
    public ReviewResult review(ReviewRequest request, AuthenticatedUser principal) {
        AppUser user = authService.requireUser(principal);
        Card card = cards.findById(request.cardId())
                .orElseThrow(() -> ApiException.notFound("Card nao encontrado."));
        decks.findAccessible(card.getDeck().getId(), user.getId())
                .orElseThrow(() -> ApiException.notFound("Card nao encontrado."));

        ReviewState state = reviewStates.findByUserIdAndCardId(user.getId(), card.getId())
                .orElseGet(() -> reviewStates.save(new ReviewState(user, card)));

        int previousInterval = state.getIntervalDays();
        ReviewSchedule schedule = spacedRepetition.next(
                request.rating(),
                state.getIntervalDays(),
                state.getRepetitions(),
                state.getEaseFactor(),
                Instant.now()
        );

        state.setLastRating(request.rating());
        state.setIntervalDays(schedule.intervalDays());
        state.setRepetitions(schedule.repetitions());
        state.setEaseFactor(schedule.easeFactor());
        state.setDueAt(schedule.nextDueAt());
        reviewLogs.save(new ReviewLog(user, card, request.rating(), previousInterval, schedule.intervalDays(), Instant.now()));

        return new ReviewResult(card.getId(), request.rating(), schedule.nextDueAt(), schedule.intervalDays(), schedule.repetitions(), schedule.easeFactor());
    }

    public ReviewResult anonymousReview(AnonymousReviewRequest request) {
        ReviewSchedule schedule = spacedRepetition.next(
                request.rating(),
                request.intervalDays(),
                request.repetitions(),
                request.easeFactor(),
                Instant.now()
        );
        return new ReviewResult(null, request.rating(), schedule.nextDueAt(), schedule.intervalDays(), schedule.repetitions(), schedule.easeFactor());
    }

    private StudyCardResponse toStudyCard(Card card, Long userId) {
        ReviewState state = reviewStates.findByUserIdAndCardId(userId, card.getId()).orElse(null);
        boolean newCard = state == null;
        return new StudyCardResponse(
                card.getId(),
                card.getDeck().getId(),
                card.getDeck().getTitle(),
                card.getFrontHtml(),
                card.getBackHtml(),
                card.getTags().stream().map(Tag::getName).sorted().toList(),
                newCard,
                state == null ? Instant.now() : state.getDueAt(),
                state == null ? 0 : state.getIntervalDays(),
                state == null ? 0 : state.getRepetitions()
        );
    }

    private List<Card> interleaveByDeck(List<Card> source, int limit) {
        Map<Long, List<Card>> byDeck = new LinkedHashMap<>();
        for (Card card : source) {
            byDeck.computeIfAbsent(card.getDeck().getId(), ignored -> new ArrayList<>()).add(card);
        }
        List<Card> mixed = new ArrayList<>();
        boolean added;
        do {
            added = false;
            for (List<Card> group : byDeck.values()) {
                if (!group.isEmpty()) {
                    mixed.add(group.remove(0));
                    added = true;
                    if (mixed.size() >= limit) {
                        return mixed;
                    }
                }
            }
        } while (added);
        return mixed;
    }
}
