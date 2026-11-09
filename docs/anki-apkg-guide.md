# Anki/APKG Integration Guide

LearningFrame uses `.apkg` files for baseline interoperability with Anki. This
integration provides preview and import capabilities for decks, though the MVP
does not attempt to replicate Anki entirely.

## 1. What Is Supported

In the MVP, APKG import covers:
- Reading `.apkg` deck packages;
- Preview before saving;
- Card-by-card navigation within preview;
- Toggling between front and back;
- Card search within the preview selector;
- Detection and rendering of basic media in the preview;
- Deck persistence for authenticated users;
- Backend persistence of associated media for saved decks;
- Subsequent study sessions with rendered images and audio.

LearningFrame maps basic note fields directly into front and back card faces.

## 2. Previewing Without an Account

Flow:
1. Open `Import`.
2. Select an `.apkg` file.
3. Wait for the preview to generate.
4. Navigate through cards.
5. Toggle front and back views.
6. Verify that essential images and audio load properly.

Anonymous preview is temporary. Navigating away from the import route clears the
file, preview, media index, and object URLs.

## 3. Signing In to Save

If a visitor decides to save the previewed APKG:
1. Click the save action.
2. The application redirects to login or registration.
3. After authentication, the preview is intentionally preserved to complete the flow.
4. Save the deck.
5. The deck appears under `My Decks`.

This preservation is intentional: it prevents users from having to select and
re-parse the file just because they logged in.

## 4. What Happens Upon Saving

When saved, the APKG is submitted to the backend. The backend:
- Extracts package contents;
- Creates the deck entity;
- Generates card entities;
- Extracts simple tags;
- Persists associated media assets;
- Initializes a fresh, internal spaced repetition schedule.

After saving completes, the temporary import state is discarded.

## 5. Media Handling

During preview:
- Media is read locally from the selected package file;
- Images and audio load on demand;
- Temporary object URLs are revoked upon leaving the import view.

After saving:
- Media assets are persisted as BLOBs in MySQL;
- The backend serves media through deck-scoped endpoints;
- Private media may pass tokens in query strings for `<img>` and `<audio>` tags.

This approach is pragmatic and acceptable for an academic MVP, though external
cloud object storage is recommended for scalable production deployments.

## 6. What Is Not Preserved

Outside the MVP scope:
- `.colpkg` collections;
- Advanced cloze deletions;
- Complex Anki card templates;
- Original Anki review schedules;
- Historical review logs;
- Original scheduler algorithms;
- Historical statistics from Anki;
- Custom add-ons;
- Specialized custom card model templates.

Upon import, LearningFrame initializes its own internal spaced repetition schedule.

## 7. Large Files

Large APKGs may require extra time to preview and save, especially when they
contain numerous high-resolution images or audio tracks.

Reasons:
- The file must be processed client-side for media preview;
- The backend must extract the archive;
- Media assets must be committed to the database;
- The MVP does not use background worker queues, polling, SSE, or WebSockets for
  granular progress indicators.

Configurable backend upload limits:
- `MAX_APKG_UPLOAD_SIZE`;
- `MAX_APKG_BYTES`.

Current defaults permit uploads up to approximately 200 MB, though very large
packages are not recommended for continuous usage in the MVP.

## 8. Content Rights and Licensing

Importing an `.apkg` does not grant the right to redistribute its content.

Guidelines:
- Use your own decks or those with appropriate licensing;
- Review license terms for third-party decks;
- Avoid publishing copyrighted materials without explicit authorization.

## 9. Validating an Import

Recommended verification checklist:
1. Preview opened without errors.
2. Card count appears accurate.
3. Front and back faces are legible.
4. Essential images render correctly.
5. Essential audio tracks play properly.
6. Relevant tags were preserved where applicable.
7. The saved deck appears under `My Decks`.
8. Study sessions correctly display media after saving.

If a deck relies on complex Anki-specific features, it may require manual
adjustments after import.

