package com.learningframe.api.deck;

import com.learningframe.api.deck.DeckDtos.DeckBulkDeleteRequest;
import com.learningframe.api.deck.DeckDtos.DeckSummary;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.ImportFormat;
import com.learningframe.api.security.AuthenticatedUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("contratos de baralho")
class DeckControllerTest {
    @Test
    @DisplayName("delega metadata leve ao servico")
    void delegaMetadataLeveAoServico() {
        DeckService deckService = mock(DeckService.class);
        DeckController controller = new DeckController(deckService);
        AuthenticatedUser principal = new AuthenticatedUser(7L, "ana@example.com", "Ana");
        DeckSummary expected = new DeckSummary(
                10L,
                "Anatomia",
                "Nervos cranianos",
                DeckVisibility.PRIVATE,
                ImportFormat.MANUAL,
                12L,
                3L,
                Instant.parse("2026-06-01T12:00:00Z"),
                "Ana",
                Instant.parse("2026-06-01T10:00:00Z")
        );
        when(deckService.deckMetadata(10L, principal)).thenReturn(expected);

        DeckSummary response = controller.deckMetadata(10L, principal);

        assertThat(response).isSameAs(expected);
        verify(deckService).deckMetadata(10L, principal);
    }

    @Test
    @DisplayName("delega exclusao em lote ao servico")
    void delegaExclusaoEmLoteAoServico() {
        DeckService deckService = mock(DeckService.class);
        DeckController controller = new DeckController(deckService);
        AuthenticatedUser principal = new AuthenticatedUser(7L, "ana@example.com", "Ana");
        DeckBulkDeleteRequest request = new DeckBulkDeleteRequest(List.of(10L, 11L));

        controller.deleteDecks(request, principal);

        verify(deckService).deleteDecks(request, principal);
    }
}
