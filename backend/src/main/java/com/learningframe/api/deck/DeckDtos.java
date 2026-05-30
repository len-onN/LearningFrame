package com.learningframe.api.deck;

import com.learningframe.api.model.DeckVisibility;
import com.learningframe.api.model.ImportFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class DeckDtos {
    private DeckDtos() {
    }

    public record DeckSummary(
            Long id,
            String title,
            String description,
            DeckVisibility visibility,
            ImportFormat sourceFormat,
            long cardCount,
            Long dueCount,
            Instant nextDueAt,
            String ownerName,
            Instant updatedAt
    ) {
    }

    public record CardResponse(
            Long id,
            Long deckId,
            String frontHtml,
            String backHtml,
            List<String> tags
    ) {
    }

    public record DeckDetail(
            Long id,
            String title,
            String description,
            DeckVisibility visibility,
            ImportFormat sourceFormat,
            String ownerName,
            List<CardResponse> cards
    ) {
    }

    public record DeckUpsertRequest(
            @NotBlank @Size(max = 180) String title,
            @Size(max = 2000) String description,
            @NotNull DeckVisibility visibility
    ) {
    }

    public record CardUpsertRequest(
            @NotBlank @Size(max = 12000) String frontHtml,
            @NotBlank @Size(max = 12000) String backHtml,
            List<@Size(max = 80) String> tags
    ) {
    }
}
