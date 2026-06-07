package com.learningframe.api.e2e;

import java.util.List;
import java.util.Map;

public final class E2eDtos {
    private E2eDtos() {
    }

    public record E2eSeedResponse(
            Map<String, E2eUserSeed> users,
            Map<String, E2eDeckSeed> decks
    ) {
    }

    public record E2eUserSeed(
            Long id,
            String displayName,
            String email,
            String password
    ) {
    }

    public record E2eDeckSeed(
            Long id,
            String title,
            List<E2eCardSeed> cards
    ) {
    }

    public record E2eCardSeed(
            Long id,
            String frontHtml,
            String backHtml
    ) {
    }
}
