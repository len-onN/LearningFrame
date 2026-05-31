package com.learningframe.api.deck;

import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.Deck;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.ImportFormat;
import com.learningframe.api.model.MediaAsset;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.MediaAssetRepository;
import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("midia de baralhos persistidos")
class MediaControllerTest {
    @Test
    @DisplayName("serve midia acessivel com nome contendo espacos")
    void serveMidiaAcessivelComNomeContendoEspacos() {
        DeckRepository decks = mock(DeckRepository.class);
        MediaAssetRepository mediaAssets = mock(MediaAssetRepository.class);
        MediaController controller = new MediaController(decks, mediaAssets, mock(JwtService.class));
        Deck deck = new Deck(null, "Anatomia", "", DeckVisibility.PUBLIC, ImportFormat.APKG);
        byte[] content = new byte[]{1, 2, 3};

        when(decks.findAccessible(10L, null)).thenReturn(Optional.of(deck));
        when(mediaAssets.findByDeckIdAndFileName(10L, "Screen Shot 2016.png"))
                .thenReturn(Optional.of(new MediaAsset(deck, "Screen Shot 2016.png", "image/png", content)));

        var response = controller.media(10L, "Screen Shot 2016.png", null, null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("image/png");
        assertThat(response.getBody()).containsExactly(content);
    }

    @Test
    @DisplayName("bloqueia midia quando baralho nao esta acessivel")
    void bloqueiaMidiaQuandoBaralhoNaoEstaAcessivel() {
        DeckRepository decks = mock(DeckRepository.class);
        MediaAssetRepository mediaAssets = mock(MediaAssetRepository.class);
        MediaController controller = new MediaController(decks, mediaAssets, mock(JwtService.class));

        when(decks.findAccessible(10L, null)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.media(10L, "privado.png", null, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("Midia nao encontrada.");
    }

    @Test
    @DisplayName("usa token de query para autorizar midia privada")
    void usaTokenDeQueryParaAutorizarMidiaPrivada() {
        DeckRepository decks = mock(DeckRepository.class);
        MediaAssetRepository mediaAssets = mock(MediaAssetRepository.class);
        JwtService jwtService = mock(JwtService.class);
        MediaController controller = new MediaController(decks, mediaAssets, jwtService);
        Deck deck = new Deck(null, "Privado", "", DeckVisibility.PRIVATE, ImportFormat.APKG);
        byte[] content = new byte[]{4, 5, 6};

        when(jwtService.verify("token-valido")).thenReturn(new AuthenticatedUser(99L, "a@b.com", "Ana"));
        when(decks.findAccessible(20L, 99L)).thenReturn(Optional.of(deck));
        when(mediaAssets.findByDeckIdAndFileName(20L, "privado.png"))
                .thenReturn(Optional.of(new MediaAsset(deck, "privado.png", "image/png", content)));

        var response = controller.media(20L, "privado.png", "token-valido", null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).containsExactly(content);
    }
}
