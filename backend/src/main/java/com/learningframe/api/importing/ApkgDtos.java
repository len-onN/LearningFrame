package com.learningframe.api.importing;

import com.learningframe.api.model.DeckVisibility;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class ApkgDtos {
    private ApkgDtos() {
    }

    public record ApkgCard(
            String frontHtml,
            String backHtml,
            List<String> tags
    ) {
    }

    public record ApkgPreviewResponse(
            String title,
            int notesFound,
            int cardsReady,
            int cardsSkipped,
            int mediaFound,
            List<String> warnings,
            List<ApkgCard> cards
    ) {
    }

    public record ApkgImportResponse(
            Long deckId,
            String title,
            DeckVisibility visibility,
            int cardsImported,
            int cardsSkipped,
            int mediaImported,
            List<String> warnings
    ) {
    }

    public record ApkgImportOptions(
            @Size(max = 180) String title,
            DeckVisibility visibility
    ) {
    }
}
