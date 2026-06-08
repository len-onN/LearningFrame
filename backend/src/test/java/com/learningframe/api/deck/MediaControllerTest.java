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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@DisplayName("midia de baralhos persistidos")
class MediaControllerTest {
    private DeckRepository decks;
    private MediaAssetRepository mediaAssets;
    private MediaController controller;

    @BeforeEach
    void setUp() {
        decks = mock(DeckRepository.class);
        mediaAssets = mock(MediaAssetRepository.class);
        controller = new MediaController(decks, mediaAssets, mock(JwtService.class));
    }

    @Test
    @DisplayName("serve midia acessivel com nome contendo espacos")
    void serveMidiaAcessivelComNomeContendoEspacos() {
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
        when(decks.findAccessible(10L, null)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.media(10L, "privado.png", null, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("Midia nao encontrada.");
    }

    @Test
    @DisplayName("usa token de query para autorizar midia privada")
    void usaTokenDeQueryParaAutorizarMidiaPrivada() {
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

    @Test
    @DisplayName("envia midia propria normalizando nome e inferindo tipo")
    void enviaMidiaPropriaNormalizandoNomeEInferindoTipo() throws Exception {
        Deck deck = new Deck(null, "Anatomia", "", DeckVisibility.PRIVATE, ImportFormat.MANUAL);
        AuthenticatedUser user = new AuthenticatedUser(99L, "ana@example.com", "Ana");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "pasta\\Screen Shot 2016.png",
                MediaType.APPLICATION_OCTET_STREAM_VALUE,
                new byte[]{7, 8, 9}
        );

        when(decks.findOwned(20L, 99L)).thenReturn(Optional.of(deck));
        when(mediaAssets.findByDeckIdAndFileName(20L, "pasta_Screen_Shot_2016.png")).thenReturn(Optional.empty());

        var response = controller.uploadMedia(20L, file, user);

        ArgumentCaptor<MediaAsset> captor = ArgumentCaptor.forClass(MediaAsset.class);
        verify(mediaAssets).save(captor.capture());
        MediaAsset saved = captor.getValue();
        assertThat(response.fileName()).isEqualTo("pasta_Screen_Shot_2016.png");
        assertThat(response.contentType()).isEqualTo("image/png");
        assertThat(saved.getDeck()).isSameAs(deck);
        assertThat(saved.getFileName()).isEqualTo("pasta_Screen_Shot_2016.png");
        assertThat(saved.getContentType()).isEqualTo("image/png");
        assertThat(saved.getContent()).containsExactly(7, 8, 9);
    }

    @Test
    @DisplayName("sobrescreve midia existente do baralho")
    void sobrescreveMidiaExistenteDoBaralho() throws Exception {
        Deck deck = new Deck(null, "Audio", "", DeckVisibility.PRIVATE, ImportFormat.MANUAL);
        AuthenticatedUser user = new AuthenticatedUser(99L, "ana@example.com", "Ana");
        MediaAsset existing = new MediaAsset(deck, "voz.mp3", "audio/ogg", new byte[]{1});
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "voz.mp3",
                MediaType.APPLICATION_OCTET_STREAM_VALUE,
                new byte[]{2, 3}
        );

        when(decks.findOwned(20L, 99L)).thenReturn(Optional.of(deck));
        when(mediaAssets.findByDeckIdAndFileName(20L, "voz.mp3")).thenReturn(Optional.of(existing));

        var response = controller.uploadMedia(20L, file, user);

        verify(mediaAssets).save(existing);
        assertThat(response.fileName()).isEqualTo("voz.mp3");
        assertThat(response.contentType()).isEqualTo("audio/mpeg");
        assertThat(existing.getContentType()).isEqualTo("audio/mpeg");
        assertThat(existing.getContent()).containsExactly(2, 3);
    }

    @Test
    @DisplayName("exige autenticacao para enviar midia")
    void exigeAutenticacaoParaEnviarMidia() {
        MockMultipartFile file = new MockMultipartFile("file", "imagem.png", "image/png", new byte[]{1});

        assertThatThrownBy(() -> controller.uploadMedia(20L, file, null))
                .isInstanceOf(ApiException.class)
                .hasMessage("Autenticacao necessaria para enviar midia.");
        verifyNoInteractions(decks, mediaAssets);
    }

    @Test
    @DisplayName("bloqueia envio para baralho de outro usuario")
    void bloqueiaEnvioParaBaralhoDeOutroUsuario() {
        AuthenticatedUser user = new AuthenticatedUser(99L, "ana@example.com", "Ana");
        MockMultipartFile file = new MockMultipartFile("file", "imagem.png", "image/png", new byte[]{1});

        when(decks.findOwned(20L, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.uploadMedia(20L, file, user))
                .isInstanceOf(ApiException.class)
                .hasMessage("Este baralho nao pertence ao usuario logado.");
    }

    @Test
    @DisplayName("recusa arquivo vazio")
    void recusaArquivoVazio() {
        Deck deck = new Deck(null, "Vazio", "", DeckVisibility.PRIVATE, ImportFormat.MANUAL);
        AuthenticatedUser user = new AuthenticatedUser(99L, "ana@example.com", "Ana");
        MockMultipartFile file = new MockMultipartFile("file", "vazio.png", "image/png", new byte[0]);

        when(decks.findOwned(20L, 99L)).thenReturn(Optional.of(deck));

        assertThatThrownBy(() -> controller.uploadMedia(20L, file, user))
                .isInstanceOf(ApiException.class)
                .hasMessage("Arquivo vazio.");
    }
}
