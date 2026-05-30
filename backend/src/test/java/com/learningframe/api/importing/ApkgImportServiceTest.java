package com.learningframe.api.importing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningframe.api.importing.ApkgDtos.ApkgPreviewResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;

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

    private byte[] createApkg() throws Exception {
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
            zip.write("{}".getBytes());
            zip.closeEntry();
        } finally {
            Files.deleteIfExists(sqlite);
        }
        return output.toByteArray();
    }
}
