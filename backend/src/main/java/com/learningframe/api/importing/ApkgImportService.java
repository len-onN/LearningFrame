package com.learningframe.api.importing;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningframe.api.auth.AuthService;
import com.learningframe.api.common.ApiException;
import com.learningframe.api.importing.ApkgDtos.ApkgCard;
import com.learningframe.api.importing.ApkgDtos.ApkgImportResponse;
import com.learningframe.api.importing.ApkgDtos.ApkgPreviewResponse;
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
import com.learningframe.api.repository.TagRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@Service
public class ApkgImportService {
    private static final TypeReference<Map<String, String>> MEDIA_MAP_TYPE = new TypeReference<>() {
    };
    private static final int MAX_ANONYMOUS_CARDS = 1000;

    private final ObjectMapper objectMapper;
    private final AuthService authService;
    private final DeckRepository decks;
    private final CardRepository cards;
    private final TagRepository tags;
    private final MediaAssetRepository mediaAssets;
    private final long maxApkgBytes;

    public ApkgImportService(
            ObjectMapper objectMapper,
            AuthService authService,
            DeckRepository decks,
            CardRepository cards,
            TagRepository tags,
            MediaAssetRepository mediaAssets,
            @Value("${learningframe.uploads.max-apkg-bytes}") long maxApkgBytes
    ) {
        this.objectMapper = objectMapper;
        this.authService = authService;
        this.decks = decks;
        this.cards = cards;
        this.tags = tags;
        this.mediaAssets = mediaAssets;
        this.maxApkgBytes = maxApkgBytes;
    }

    public ApkgPreviewResponse preview(MultipartFile file) {
        ParsedApkg parsed = parse(file, false);
        List<String> warnings = new ArrayList<>(parsed.warnings());
        if (parsed.mediaCount() > 0) {
            warnings.add("Midia e preservada ao salvar logado; no preview anonimo, cards com imagens podem aparecer sem arquivo associado.");
        }
        List<ApkgCard> visibleCards = parsed.cards();
        if (visibleCards.size() > MAX_ANONYMOUS_CARDS) {
            warnings.add("Preview anonimo limitado aos primeiros " + MAX_ANONYMOUS_CARDS + " cards.");
            visibleCards = visibleCards.subList(0, MAX_ANONYMOUS_CARDS);
        }
        return new ApkgPreviewResponse(
                parsed.title(),
                parsed.notesFound(),
                visibleCards.size(),
                parsed.skipped(),
                parsed.mediaCount(),
                warnings,
                visibleCards
        );
    }

    @Transactional
    public ApkgImportResponse importDeck(MultipartFile file, String title, DeckVisibility visibility, AuthenticatedUser principal) {
        AppUser owner = authService.requireUser(principal);
        ParsedApkg parsed = parse(file, true);
        String resolvedTitle = title == null || title.isBlank() ? parsed.title() : title.trim();
        Deck deck = decks.save(new Deck(
                owner,
                resolvedTitle,
                "Importado de arquivo .apkg. A agenda original do Anki foi descartada.",
                visibility == null ? DeckVisibility.PRIVATE : visibility,
                ImportFormat.APKG
        ));

        int importedCards = 0;
        for (ApkgCard parsedCard : parsed.cards()) {
            Card card = new Card(deck, parsedCard.frontHtml(), parsedCard.backHtml(), null);
            for (String tagName : parsedCard.tags()) {
                Tag tag = tags.findByNameIgnoreCase(tagName).orElseGet(() -> tags.save(new Tag(tagName)));
                card.getTags().add(tag);
            }
            cards.save(card);
            importedCards++;
        }

        int importedMedia = 0;
        for (ParsedMedia media : parsed.media()) {
            mediaAssets.save(new MediaAsset(deck, media.fileName(), media.contentType(), media.content()));
            importedMedia++;
        }

        return new ApkgImportResponse(deck.getId(), deck.getTitle(), deck.getVisibility(), importedCards, parsed.skipped(), importedMedia, parsed.warnings());
    }

    private ParsedApkg parse(MultipartFile file, boolean includeMediaContent) {
        validateFile(file);
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("learningframe-apkg-");
            Path apkgPath = tempDir.resolve("deck.apkg");
            file.transferTo(apkgPath);

            try (ZipFile zipFile = new ZipFile(apkgPath.toFile())) {
                ZipEntry collectionEntry = firstExisting(zipFile, "collection.anki2", "collection.anki21");
                if (collectionEntry == null) {
                    throw ApiException.badRequest("Arquivo .apkg sem collection.anki2 compativel.");
                }
                Path sqlitePath = tempDir.resolve("collection.sqlite");
                try (var input = zipFile.getInputStream(collectionEntry)) {
                    Files.copy(input, sqlitePath);
                }

                List<String> warnings = new ArrayList<>();
                ParsedCards parsedCards = readCards(sqlitePath, warnings);
                if (parsedCards.cards().isEmpty()) {
                    throw ApiException.badRequest("Nenhum card basico foi encontrado no .apkg.");
                }
                Map<String, String> mediaMap = readMediaMap(zipFile, warnings);
                List<ParsedMedia> media = includeMediaContent ? readMedia(zipFile, mediaMap, warnings) : List.of();
                int mediaCount = includeMediaContent ? media.size() : countExistingMedia(zipFile, mediaMap);
                return new ParsedApkg(resolveTitle(file), parsedCards.cards(), warnings, media, mediaCount, parsedCards.notesFound(), parsedCards.skipped());
            }
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw ApiException.badRequest("Nao foi possivel importar o .apkg informado.");
        } finally {
            deleteTempDir(tempDir);
        }
    }

    private ParsedCards readCards(Path sqlitePath, List<String> warnings) throws Exception {
        List<ApkgCard> parsedCards = new ArrayList<>();
        int notesFound = 0;
        int skipped = 0;
        try (Connection connection = DriverManager.getConnection("jdbc:sqlite:" + sqlitePath);
             Statement statement = connection.createStatement();
             ResultSet notes = statement.executeQuery("select id, flds, tags from notes order by id")) {
            while (notes.next()) {
                notesFound++;
                String[] fields = notes.getString("flds").split("\u001f", -1);
                if (fields.length < 2 || fields[0].isBlank() || fields[1].isBlank()) {
                    skipped++;
                    continue;
                }
                parsedCards.add(new ApkgCard(
                        sanitizeHtml(fields[0]),
                        sanitizeHtml(fields[1]),
                        normalizeTags(notes.getString("tags"))
                ));
            }
        }
        if (skipped > 0) {
            warnings.add(skipped + " notas foram ignoradas por nao terem frente e verso basicos.");
        }
        return new ParsedCards(parsedCards, notesFound, skipped);
    }

    private Map<String, String> readMediaMap(ZipFile zipFile, List<String> warnings) {
        ZipEntry mediaEntry = zipFile.getEntry("media");
        if (mediaEntry == null) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(zipFile.getInputStream(mediaEntry), MEDIA_MAP_TYPE);
        } catch (IOException exception) {
            warnings.add("Mapa de midia do .apkg nao pode ser lido.");
            return Map.of();
        }
    }

    private List<ParsedMedia> readMedia(ZipFile zipFile, Map<String, String> mediaMap, List<String> warnings) {
        List<ParsedMedia> media = new ArrayList<>();
        for (Map.Entry<String, String> entry : mediaMap.entrySet()) {
            ZipEntry mediaEntry = zipFile.getEntry(entry.getKey());
            if (mediaEntry == null || mediaEntry.isDirectory()) {
                continue;
            }
            try (var input = zipFile.getInputStream(mediaEntry)) {
                byte[] content = input.readAllBytes();
                media.add(new ParsedMedia(entry.getValue(), contentType(entry.getValue()), content));
            } catch (IOException exception) {
                warnings.add("Midia ignorada: " + entry.getValue());
            }
        }
        return media;
    }

    private int countExistingMedia(ZipFile zipFile, Map<String, String> mediaMap) {
        int count = 0;
        for (String mediaKey : mediaMap.keySet()) {
            ZipEntry mediaEntry = zipFile.getEntry(mediaKey);
            if (mediaEntry != null && !mediaEntry.isDirectory()) {
                count++;
            }
        }
        return count;
    }

    private ZipEntry firstExisting(ZipFile zipFile, String... names) {
        for (String name : names) {
            ZipEntry entry = zipFile.getEntry(name);
            if (entry != null) {
                return entry;
            }
        }
        return null;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Envie um arquivo .apkg.");
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (originalName.endsWith(".colpkg")) {
            throw ApiException.badRequest(".colpkg fica fora do MVP; envie um deck package .apkg.");
        }
        if (!originalName.endsWith(".apkg")) {
            throw ApiException.badRequest("Formato invalido. Envie um arquivo .apkg.");
        }
        if (file.getSize() > maxApkgBytes) {
            throw ApiException.badRequest("Arquivo .apkg maior que o limite configurado.");
        }
    }

    private String resolveTitle(MultipartFile file) {
        String name = file.getOriginalFilename() == null ? "Baralho importado" : file.getOriginalFilename();
        return name.replaceFirst("(?i)\\.apkg$", "").replace('_', ' ').trim();
    }

    private List<String> normalizeTags(String rawTags) {
        if (rawTags == null || rawTags.isBlank()) {
            return List.of();
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (String tag : rawTags.trim().split("\\s+")) {
            String value = tag.trim().toLowerCase(Locale.ROOT);
            if (!value.isBlank()) {
                normalized.add(value);
            }
        }
        return new ArrayList<>(normalized);
    }

    private String sanitizeHtml(String html) {
        return html
                .replaceAll("(?is)<script.*?>.*?</script>", "")
                .replaceAll("(?is)<style.*?>.*?</style>", "")
                .replaceAll("(?i)\\son[a-z]+\\s*=\\s*\"[^\"]*\"", "")
                .replaceAll("(?i)\\son[a-z]+\\s*=\\s*'[^']*'", "")
                .replaceAll("(?i)javascript:", "")
                .trim();
    }

    private String contentType(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        if (lower.endsWith(".mp3")) {
            return "audio/mpeg";
        }
        if (lower.endsWith(".ogg")) {
            return "audio/ogg";
        }
        return "application/octet-stream";
    }

    private void deleteTempDir(Path tempDir) {
        if (tempDir == null) {
            return;
        }
        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                        }
                    });
        } catch (IOException ignored) {
        }
    }

    private record ParsedApkg(
            String title,
            List<ApkgCard> cards,
            List<String> warnings,
            List<ParsedMedia> media,
            int mediaCount,
            int notesFound,
            int skipped
    ) {
    }

    private record ParsedCards(List<ApkgCard> cards, int notesFound, int skipped) {
    }

    private record ParsedMedia(String fileName, String contentType, byte[] content) {
    }
}
