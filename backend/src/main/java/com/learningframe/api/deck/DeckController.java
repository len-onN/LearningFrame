package com.learningframe.api.deck;

import com.learningframe.api.deck.DeckDtos.CardResponse;
import com.learningframe.api.deck.DeckDtos.CardBulkDeleteRequest;
import com.learningframe.api.deck.DeckDtos.CardPage;
import com.learningframe.api.deck.DeckDtos.CardUpsertRequest;
import com.learningframe.api.deck.DeckDtos.DeckDetail;
import com.learningframe.api.deck.DeckDtos.DeckPage;
import com.learningframe.api.deck.DeckDtos.DeckSummary;
import com.learningframe.api.deck.DeckDtos.DeckUpsertRequest;
import com.learningframe.api.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/decks")
public class DeckController {
    private final DeckService deckService;

    public DeckController(DeckService deckService) {
        this.deckService = deckService;
    }

    @GetMapping("/public")
    DeckPage publicDecks(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String q
    ) {
        return deckService.publicDecks(user, page, size, q);
    }

    @GetMapping("/mine")
    DeckPage myDecks(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String q
    ) {
        return deckService.myDecks(user, page, size, q);
    }

    @GetMapping("/{deckId}")
    DeckDetail getDeck(@PathVariable Long deckId, @AuthenticationPrincipal AuthenticatedUser user) {
        return deckService.getDeck(deckId, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    DeckSummary createDeck(@Valid @RequestBody DeckUpsertRequest request, @AuthenticationPrincipal AuthenticatedUser user) {
        return deckService.createDeck(request, user);
    }

    @PostMapping("/{deckId}/copy")
    @ResponseStatus(HttpStatus.CREATED)
    DeckSummary copyPublicDeck(@PathVariable Long deckId, @AuthenticationPrincipal AuthenticatedUser user) {
        return deckService.copyPublicDeck(deckId, user);
    }

    @PutMapping("/{deckId}")
    DeckSummary updateDeck(@PathVariable Long deckId, @Valid @RequestBody DeckUpsertRequest request, @AuthenticationPrincipal AuthenticatedUser user) {
        return deckService.updateDeck(deckId, request, user);
    }

    @DeleteMapping("/{deckId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteDeck(@PathVariable Long deckId, @AuthenticationPrincipal AuthenticatedUser user) {
        deckService.deleteDeck(deckId, user);
    }

    @PostMapping("/{deckId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    CardResponse createCard(
            @PathVariable Long deckId,
            @Valid @RequestBody CardUpsertRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return deckService.createCard(deckId, request, user);
    }

    @GetMapping("/{deckId}/cards")
    CardPage deckCards(
            @PathVariable Long deckId,
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q
    ) {
        return deckService.deckCards(deckId, user, page, size, q);
    }

    @PutMapping("/{deckId}/cards/{cardId}")
    CardResponse updateCard(
            @PathVariable Long deckId,
            @PathVariable Long cardId,
            @Valid @RequestBody CardUpsertRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return deckService.updateCard(deckId, cardId, request, user);
    }

    @DeleteMapping("/{deckId}/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteCard(
            @PathVariable Long deckId,
            @PathVariable Long cardId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        deckService.deleteCard(deckId, cardId, user);
    }

    @PostMapping("/{deckId}/cards/bulk-delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteCards(
            @PathVariable Long deckId,
            @Valid @RequestBody CardBulkDeleteRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        deckService.deleteCards(deckId, request, user);
    }
}
