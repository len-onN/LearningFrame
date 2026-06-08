package com.learningframe.api.importing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningframe.api.auth.AuthService;
import com.learningframe.api.importing.ApkgDtos.ApkgPreviewResponse;
import com.learningframe.api.model.AppUser;
import com.learningframe.api.model.Deck;
import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.MediaAsset;
import com.learningframe.api.repository.CardRepository;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.MediaAssetRepository;
import com.learningframe.api.repository.TagRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("importacao de arquivos apkg")
class ApkgImportServiceTest {
    @Test
    @DisplayName("previsualiza notas basicas de um arquivo apkg")
    void previsualizaNotasBasicasDeArquivoApkg() throws Exception {
        byte[] apkg = createApkg();
        ApkgImportService service = new ApkgImportService(
                new ObjectMapper(),
                null,
                null,
                null,
                null,
                null,
                1024 * 1024
        );

        ApkgPreviewResponse preview = service.preview(new MockMultipartFile(
                "file",
                "sample.apkg",
                "application/octet-stream",
                apkg
        ));

        assertThat(preview.title()).isEqualTo("sample");
        assertThat(preview.notesFound()).isEqualTo(2);
        assertThat(preview.cardsReady()).isEqualTo(1);
        assertThat(preview.cardsSkipped()).isEqualTo(1);
        assertThat(preview.cards().getFirst().frontHtml()).isEqualTo("Frente");
        assertThat(preview.cards().getFirst().backHtml()).isEqualTo("Verso");
        assertThat(preview.cards().getFirst().tags()).containsExactly("tag1", "tag2");
    }

    @Test
    @DisplayName("previsualiza midia sem carregar conteudo pesado no retorno")
    void previsualizaMidiaSemCarregarConteudoPesadoNoRetorno() throws Exception {
        byte[] apkg = createApkg("{\"0\":\"Screen Shot 2016.png\"}", MapEntry.of("0", new byte[]{1, 2, 3}));
        ApkgImportService service = new ApkgImportService(
                new ObjectMapper(),
                null,
                null,
                null,
                null,
                null,
                1024 * 1024
        );

        ApkgPreviewResponse preview = service.preview(new MockMultipartFile(
                "file",
                "sample.apkg",
                "application/octet-stream",
                apkg
        ));

        assertThat(preview.mediaFound()).isEqualTo(1);
        assertThat(preview.warnings()).contains("Midia e preservada ao salvar logado; no preview anonimo, cards com imagens podem aparecer sem arquivo associado.");
    }

    @Test
    @DisplayName("importa midia para baralho persistido")
    void importaMidiaParaBaralhoPersistido() throws Exception {
        byte[] apkg = createApkg("{\"0\":\"Screen Shot 2016.png\"}", MapEntry.of("0", new byte[]{1, 2, 3}));
        AuthService authService = mock(AuthService.class);
        DeckRepository deckRepository = mock(DeckRepository.class);
        CardRepository cardRepository = mock(CardRepository.class);
        TagRepository tagRepository = mock(TagRepository.class);
        MediaAssetRepository mediaAssetRepository = mock(MediaAssetRepository.class);
        when(authService.requireUser(any())).thenReturn(new AppUser("Lenon", "lenon@example.com", "hash"));
        when(deckRepository.save(any(Deck.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tagRepository.findByNameIgnoreCase(any())).thenReturn(Optional.empty());
        when(mediaAssetRepository.save(any(MediaAsset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApkgImportService service = new ApkgImportService(
                new ObjectMapper(),
                authService,
                deckRepository,
                cardRepository,
                tagRepository,
                mediaAssetRepository,
                1024 * 1024
        );

        var response = service.importDeck(
                new MockMultipartFile("file", "sample.apkg", "application/octet-stream", apkg),
                "Anatomia",
                DeckVisibility.PRIVATE,
                new AuthenticatedUser(1L, "lenon@example.com", "Lenon")
        );

        assertThat(response.cardsImported()).isEqualTo(1);
        assertThat(response.mediaImported()).isEqualTo(1);
        assertThat(response.cardsSkipped()).isEqualTo(1);
    }

    private byte[] createApkg() throws Exception {
        return createApkg("{}", null);
    }

    private byte[] createApkg(String mediaJson, MapEntry mediaEntry) throws Exception {
        Path sqlite = Files.createTempFile("learningframe-test", ".anki2");
        try (Connection connection = DriverManager.getConnection("jdbc:sqlite:" + sqlite);
             Statement statement = connection.createStatement()) {
            statement.execute("create table notes(id integer primary key, flds text not null, tags text)");
            statement.execute("insert into notes(id, flds, tags) values (1, 'Frente' || char(31) || 'Verso', ' tag1 tag2 ')");
            statement.execute("insert into notes(id, flds, tags) values (2, 'Sem verso', '')");
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(output)) {
            zip.putNextEntry(new ZipEntry("collection.anki2"));
            zip.write(Files.readAllBytes(sqlite));
            zip.closeEntry();

            zip.putNextEntry(new ZipEntry("media"));
            zip.write(mediaJson.getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();

            if (mediaEntry != null) {
                zip.putNextEntry(new ZipEntry(mediaEntry.key()));
                zip.write(mediaEntry.content());
                zip.closeEntry();
            }
        } finally {
            Files.deleteIfExists(sqlite);
        }
        return output.toByteArray();
    }

    private record MapEntry(String key, byte[] content) {
        static MapEntry of(String key, byte[] content) {
            return new MapEntry(key, content);
        }
    }
}
