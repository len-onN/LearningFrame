package com.learningframe.api.deck;

import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.MediaAsset;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.MediaAssetRepository;
import com.learningframe.api.security.AuthenticatedUser;
import com.learningframe.api.security.JwtService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/decks/{deckId}/media")
public class MediaController {
    private final DeckRepository decks;
    private final MediaAssetRepository mediaAssets;
    private final JwtService jwtService;

    public MediaController(DeckRepository decks, MediaAssetRepository mediaAssets, JwtService jwtService) {
        this.decks = decks;
        this.mediaAssets = mediaAssets;
        this.jwtService = jwtService;
    }

    @GetMapping("/{fileName:.+}")
    ResponseEntity<byte[]> media(
            @PathVariable Long deckId,
            @PathVariable String fileName,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        Long userId = resolveUserId(user, token);
        decks.findAccessible(deckId, userId).orElseThrow(() -> ApiException.notFound("Midia nao encontrada."));
        MediaAsset media = mediaAssets.findByDeckIdAndFileName(deckId, fileName)
                .orElseThrow(() -> ApiException.notFound("Midia nao encontrada."));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
                .contentType(MediaType.parseMediaType(media.getContentType()))
                .body(media.getContent());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    DeckDtos.MediaUploadResponse uploadMedia(
            @PathVariable Long deckId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser user
    ) throws IOException {
        if (user == null) {
            throw ApiException.forbidden("Autenticacao necessaria para enviar midia.");
        }
        var deck = decks.findOwned(deckId, user.id())
                .orElseThrow(() -> ApiException.forbidden("Este baralho nao pertence ao usuario logado."));

        if (file.isEmpty()) {
            throw ApiException.badRequest("Arquivo vazio.");
        }

        String originalName = file.getOriginalFilename();
        String sanitizedName = sanitizeFileName(originalName != null ? originalName : "arquivo");
        String contentType = resolveContentType(file, sanitizedName);

        MediaAsset asset = mediaAssets.findByDeckIdAndFileName(deckId, sanitizedName)
                .map(existing -> {
                    existing.updateContent(contentType, readBytes(file));
                    return existing;
                })
                .orElseGet(() -> new MediaAsset(deck, sanitizedName, contentType, readBytes(file)));

        mediaAssets.save(asset);
        return new DeckDtos.MediaUploadResponse(sanitizedName, contentType);
    }

    private static String sanitizeFileName(String name) {
        // remove path separators e normaliza espacos
        String sanitized = name
                .replaceAll("[/\\\\]", "_")
                .replaceAll("\\s+", "_")
                .trim();
        return sanitized.isBlank() ? "arquivo" : sanitized;
    }

    private static String resolveContentType(MultipartFile file, String fileName) {
        String declared = file.getContentType();
        if (declared != null && !declared.isBlank() && !declared.equals(MediaType.APPLICATION_OCTET_STREAM_VALUE)) {
            return declared;
        }
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".m4a")) return "audio/mp4";
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    private static byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Falha ao ler arquivo enviado.", e);
        }
    }

    private Long resolveUserId(AuthenticatedUser user, String token) {
        if (user != null) {
            return user.id();
        }
        if (token == null || token.isBlank()) {
            return null;
        }
        return jwtService.verify(token).id();
    }
}
