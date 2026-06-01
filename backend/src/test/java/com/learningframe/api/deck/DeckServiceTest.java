package com.learningframe.api.deck;

import com.learningframe.api.auth.AuthService;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.deck.DeckDtos.CardBulkDeleteRequest;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.model.Card;
import com.learningframe.api.model.Deck;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.ImportFormat;
import com.learningframe.api.model.MediaAsset;
import com.learningframe.api.model.Tag;
import com.learningframe.api.repository.CardRepository;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.MediaAssetRepository;
import com.learningframe.api.repository.ReviewStateRepository;
import com.learningframe.api.repository.TagRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("gerenciamento de cartas do baralho")
class DeckServiceTest {
    private DeckRepository decks;
    private CardRepository cards;
    private MediaAssetRepository mediaAssets;
    private ReviewStateRepository reviewStates;
    private AuthService authService;
    private DeckService service;
    private AuthenticatedUser principal;
    private AppUser owner;
    private Deck deck;

    @BeforeEach
    void setUp() {
        decks = mock(DeckRepository.class);
        cards = mock(CardRepository.class);
        mediaAssets = mock(MediaAssetRepository.class);
        reviewStates = mock(ReviewStateRepository.class);
        TagRepository tags = mock(TagRepository.class);
        authService = mock(AuthService.class);
        service = new DeckService(decks, cards, mediaAssets, reviewStates, tags, authService);

        principal = new AuthenticatedUser(7L, "ana@example.com", "Ana");
        owner = user(7L);
        deck = deck(10L, owner);

        when(authService.requireUser(principal)).thenReturn(owner);
        when(decks.findOwned(10L, 7L)).thenReturn(Optional.of(deck));
    }

    @Test
    @DisplayName("pagina cartas pesquisadas sem carregar o baralho inteiro")
    void paginaCartasPesquisadasSemCarregarBaralhoInteiro() {
        Card card = card(100L, deck, "Nervo trigemeo", "Sensibilidade da face", "anatomia");
        when(cards.searchPageByDeckId(eq(10L), eq("nervo"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(card), PageRequest.of(1, 20), 42));

        var page = service.deckCards(10L, principal, 1, 20, " nervo ");

        assertThat(page.page()).isEqualTo(1);
        assertThat(page.size()).isEqualTo(20);
        assertThat(page.totalElements()).isEqualTo(42);
        assertThat(page.totalPages()).isEqualTo(3);
        assertThat(page.content()).hasSize(1);
        assertThat(page.content().getFirst().tags()).containsExactly("anatomia");

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(cards).searchPageByDeckId(eq(10L), eq("nervo"), pageable.capture());
        assertThat(pageable.getValue().getPageNumber()).isEqualTo(1);
        assertThat(pageable.getValue().getPageSize()).isEqualTo(20);
        verify(cards, never()).findByDeckIdOrderByCreatedAtAsc(anyLong());
    }

    @Test
    @DisplayName("exclui cartas selecionadas do baralho")
    void excluiCartasSelecionadasDoBaralho() {
        Card first = card(100L, deck, "Frente 1", "Verso 1");
        Card second = card(101L, deck, "Frente 2", "Verso 2");
        List<Long> ids = List.of(100L, 101L);
        when(cards.findAllById(ids)).thenReturn(List.of(first, second));

        service.deleteCards(10L, new CardBulkDeleteRequest(ids), principal);

        verify(cards).deleteAll(List.of(first, second));
    }

    @Test
    @DisplayName("bloqueia exclusao de carta fora do baralho")
    void bloqueiaExclusaoDeCartaForaDoBaralho() {
        Deck anotherDeck = deck(99L, owner);
        Card selected = card(100L, deck, "Frente 1", "Verso 1");
        Card foreign = card(102L, anotherDeck, "Frente 3", "Verso 3");
        List<Long> ids = List.of(100L, 102L);
        when(cards.findAllById(ids)).thenReturn(List.of(selected, foreign));

        assertThatThrownBy(() -> service.deleteCards(10L, new CardBulkDeleteRequest(ids), principal))
                .isInstanceOf(ApiException.class)
                .hasMessage("Uma ou mais cartas nao foram encontradas.");

        verify(cards, never()).deleteAll(any());
    }

    @Test
    @DisplayName("salva baralho publico como copia privada do usuario")
    void salvaBaralhoPublicoComoCopiaPrivadaDoUsuario() {
        Deck publicDeck = deck(20L, null, DeckVisibility.PUBLIC, ImportFormat.APKG);
        Card sourceCard = card(200L, publicDeck, "Frente publica", "Verso publico", "neuro");
        MediaAsset sourceMedia = new MediaAsset(publicDeck, "imagem.png", "image/png", new byte[]{1, 2, 3});

        when(decks.findById(20L)).thenReturn(Optional.of(publicDeck));
        when(decks.save(any(Deck.class))).thenAnswer(invocation -> {
            Deck saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 30L);
            return saved;
        });
        when(cards.findByDeckIdOrderByCreatedAtAsc(20L)).thenReturn(List.of(sourceCard));
        when(mediaAssets.findByDeckId(20L)).thenReturn(List.of(sourceMedia));
        when(cards.countByDeckId(30L)).thenReturn(1L);
        when(cards.countDueForDeck(eq(7L), eq(30L), any())).thenReturn(1L);

        var summary = service.copyPublicDeck(20L, principal);

        assertThat(summary.id()).isEqualTo(30L);
        assertThat(summary.visibility()).isEqualTo(DeckVisibility.PRIVATE);
        assertThat(summary.sourceFormat()).isEqualTo(ImportFormat.APKG);

        ArgumentCaptor<Deck> deckCaptor = ArgumentCaptor.forClass(Deck.class);
        verify(decks).save(deckCaptor.capture());
        assertThat(deckCaptor.getValue().getOwner()).isEqualTo(owner);
        assertThat(deckCaptor.getValue().getTitle()).isEqualTo("Anatomia");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Card>> cardCaptor = ArgumentCaptor.forClass(List.class);
        verify(cards).saveAll(cardCaptor.capture());
        Card copiedCard = cardCaptor.getValue().getFirst();
        assertThat(copiedCard.getDeck().getId()).isEqualTo(30L);
        assertThat(copiedCard.getFrontHtml()).isEqualTo("Frente publica");
        assertThat(copiedCard.getTags()).extracting(Tag::getName).containsExactly("neuro");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<MediaAsset>> mediaCaptor = ArgumentCaptor.forClass(List.class);
        verify(mediaAssets).saveAll(mediaCaptor.capture());
        MediaAsset copiedMedia = mediaCaptor.getValue().getFirst();
        assertThat(copiedMedia.getDeck().getId()).isEqualTo(30L);
        assertThat(copiedMedia.getFileName()).isEqualTo("imagem.png");
        assertThat(copiedMedia.getContent()).containsExactly(1, 2, 3);
        assertThat(copiedMedia.getContent()).isNotSameAs(sourceMedia.getContent());
    }

    private static AppUser user(Long id) {
        AppUser user = new AppUser("Ana", "ana@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static Deck deck(Long id, AppUser owner) {
        return deck(id, owner, DeckVisibility.PRIVATE, ImportFormat.MANUAL);
    }

    private static Deck deck(Long id, AppUser owner, DeckVisibility visibility, ImportFormat sourceFormat) {
        Deck deck = new Deck(owner, "Anatomia", "", visibility, sourceFormat);
        ReflectionTestUtils.setField(deck, "id", id);
        return deck;
    }

    private static Card card(Long id, Deck deck, String frontHtml, String backHtml, String... tags) {
        Card card = new Card(deck, frontHtml, backHtml, null);
        ReflectionTestUtils.setField(card, "id", id);
        for (String tag : tags) {
            card.getTags().add(new Tag(tag));
        }
        return card;
    }
}
