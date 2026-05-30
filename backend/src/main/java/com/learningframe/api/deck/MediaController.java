package com.learningframe.api.deck;

import com.learningframe.api.common.ApiException;
import com.learningframe.api.model.MediaAsset;
import com.learningframe.api.repository.DeckRepository;
import com.learningframe.api.repository.MediaAssetRepository;
import com.learningframe.api.security.AuthenticatedUser;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/decks/{deckId}/media")
public class MediaController {
    private final DeckRepository decks;
    private final MediaAssetRepository mediaAssets;

    public MediaController(DeckRepository decks, MediaAssetRepository mediaAssets) {
        this.decks = decks;
        this.mediaAssets = mediaAssets;
    }

    @GetMapping("/{fileName:.+}")
    ResponseEntity<byte[]> media(
            @PathVariable Long deckId,
            @PathVariable String fileName,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        Long userId = user == null ? null : user.id();
        decks.findAccessible(deckId, userId).orElseThrow(() -> ApiException.notFound("Midia nao encontrada."));
        MediaAsset media = mediaAssets.findByDeckIdAndFileName(deckId, fileName)
                .orElseThrow(() -> ApiException.notFound("Midia nao encontrada."));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
                .contentType(MediaType.parseMediaType(media.getContentType()))
                .body(media.getContent());
    }
}
