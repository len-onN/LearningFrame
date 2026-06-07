package com.learningframe.api.e2e;

import com.learningframe.api.e2e.E2eDtos.E2eCardSeed;
import com.learningframe.api.e2e.E2eDtos.E2eDeckSeed;
import com.learningframe.api.e2e.E2eDtos.E2eSeedResponse;
import com.learningframe.api.e2e.E2eDtos.E2eUserSeed;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.model.Card;
import com.learningframe.api.model.Deck;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.ImportFormat;
import com.learningframe.api.model.ReviewRating;
import com.learningframe.api.model.ReviewState;
import com.learningframe.api.model.Tag;
import com.learningframe.api.repository.AppUserRepository;
import com.learningframe.api.repository.CardRepository;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.ReviewStateRepository;
import com.learningframe.api.repository.TagRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Profile("e2e")
@Service
public class E2eResetService {
    private static final String PASSWORD = "Senha#1234";

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final AppUserRepository users;
    private final DeckRepository decks;
    private final CardRepository cards;
    private final ReviewStateRepository reviewStates;
    private final TagRepository tags;

    public E2eResetService(
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            AppUserRepository users,
            DeckRepository decks,
            CardRepository cards,
            ReviewStateRepository reviewStates,
            TagRepository tags
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.users = users;
        this.decks = decks;
        this.cards = cards;
        this.reviewStates = reviewStates;
        this.tags = tags;
    }

    @Transactional
    public E2eSeedResponse resetAndSeed() {
        truncateTables();

        Tag e2e = tags.save(new Tag("e2e"));
        Tag anatomia = tags.save(new Tag("anatomia"));
        Tag frontend = tags.save(new Tag("frontend"));
        Tag srs = tags.save(new Tag("srs"));

        AppUser primaryUser = users.save(new AppUser(
                "Usuario E2E",
                "e2e@learningframe.test",
                passwordEncoder.encode(PASSWORD)
        ));
        AppUser secondaryUser = users.save(new AppUser(
                "Outro Usuario E2E",
                "outro-e2e@learningframe.test",
                passwordEncoder.encode(PASSWORD)
        ));

        Deck publicDeck = decks.save(new Deck(
                null,
                "E2E Publico Basico",
                "Baralho publico deterministico para smoke e estudo anonimo.",
                DeckVisibility.PUBLIC,
                ImportFormat.MANUAL
        ));
        Card publicCardA = card(publicDeck, "E2E recordacao ativa", "Recuperar antes de consultar.", e2e, srs);
        Card publicCardB = card(publicDeck, "E2E repeticao espacada", "Revisar ao longo do tempo.", e2e, srs);
        Card publicCardC = card(publicDeck, "E2E pratica intercalada", "Misturar temas para discriminar conceitos.", e2e);

        Deck anatomyDeck = decks.save(new Deck(
                primaryUser,
                "E2E Privado Anatomia",
                "Baralho privado usado nos testes de gerenciamento.",
                DeckVisibility.PRIVATE,
                ImportFormat.MANUAL
        ));
        Card anatomyCardA = card(anatomyDeck, "E2E nervo femoral", "Inerva o compartimento anterior da coxa.", e2e, anatomia);
        Card anatomyCardB = card(anatomyDeck, "E2E musculo sartorio", "Flexiona, abduz e roda lateralmente a coxa.", e2e, anatomia);
        Card anatomyCardC = card(anatomyDeck, "E2E patela", "Osso sesamoide do tendao do quadriceps.", e2e, anatomia);

        Deck programmingDeck = decks.save(new Deck(
                primaryUser,
                "E2E Privado Programacao",
                "Baralho privado usado nos testes de estudo autenticado.",
                DeckVisibility.PRIVATE,
                ImportFormat.MANUAL
        ));
        Card programmingCardA = card(programmingDeck, "E2E Vue Router", "Mapeia URLs para componentes reais.", e2e, frontend);
        Card programmingCardB = card(programmingDeck, "E2E composable", "Concentra estado e comportamento reutilizavel.", e2e, frontend);

        Deck otherUserDeck = decks.save(new Deck(
                secondaryUser,
                "E2E Outro Usuario",
                "Baralho privado que nao deve aparecer para o usuario principal.",
                DeckVisibility.PRIVATE,
                ImportFormat.MANUAL
        ));
        Card otherUserCard = card(otherUserDeck, "E2E isolamento", "Dados privados ficam isolados por usuario.", e2e);

        seedReviewState(primaryUser, anatomyCardA, Instant.now().minusSeconds(3600), 1, 1, 2.5, ReviewRating.GOOD);
        seedReviewState(primaryUser, anatomyCardB, Instant.now().plusSeconds(86400), 7, 3, 2.7, ReviewRating.EASY);
        seedReviewState(primaryUser, programmingCardA, Instant.now().minusSeconds(1800), 0, 0, 2.5, null);

        Map<String, E2eUserSeed> userSeeds = new LinkedHashMap<>();
        userSeeds.put("primary", new E2eUserSeed(primaryUser.getId(), primaryUser.getDisplayName(), primaryUser.getEmail(), PASSWORD));
        userSeeds.put("secondary", new E2eUserSeed(secondaryUser.getId(), secondaryUser.getDisplayName(), secondaryUser.getEmail(), PASSWORD));

        Map<String, E2eDeckSeed> deckSeeds = new LinkedHashMap<>();
        deckSeeds.put("publicBasic", deckSeed(publicDeck, publicCardA, publicCardB, publicCardC));
        deckSeeds.put("privateAnatomy", deckSeed(anatomyDeck, anatomyCardA, anatomyCardB, anatomyCardC));
        deckSeeds.put("privateProgramming", deckSeed(programmingDeck, programmingCardA, programmingCardB));
        deckSeeds.put("otherUser", deckSeed(otherUserDeck, otherUserCard));

        return new E2eSeedResponse(userSeeds, deckSeeds);
    }

    private void truncateTables() {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");
        for (String table : List.of(
                "review_logs",
                "review_states",
                "media_assets",
                "card_tags",
                "cards",
                "tags",
                "decks",
                "app_users"
        )) {
            jdbcTemplate.execute("TRUNCATE TABLE " + table);
        }
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=1");
    }

    private Card card(Deck deck, String frontHtml, String backHtml, Tag... cardTags) {
        Card card = new Card(deck, frontHtml, backHtml, null);
        card.getTags().addAll(List.of(cardTags));
        return cards.save(card);
    }

    private void seedReviewState(
            AppUser user,
            Card card,
            Instant dueAt,
            int intervalDays,
            int repetitions,
            double easeFactor,
            ReviewRating lastRating
    ) {
        ReviewState state = new ReviewState(user, card);
        state.setDueAt(dueAt);
        state.setIntervalDays(intervalDays);
        state.setRepetitions(repetitions);
        state.setEaseFactor(easeFactor);
        state.setLastRating(lastRating);
        reviewStates.save(state);
    }

    private E2eDeckSeed deckSeed(Deck deck, Card... cards) {
        return new E2eDeckSeed(
                deck.getId(),
                deck.getTitle(),
                List.of(cards).stream()
                        .map(card -> new E2eCardSeed(card.getId(), card.getFrontHtml(), card.getBackHtml()))
                        .toList()
        );
    }
}
