# Architecture and UX Plan: Deck and Card Management

**Status:** Implemented and validated.
**Originating Branch:** `feature/library-deck-management`

This document captures the frontend and UX architectural decisions for deck
and card management, covering listing, editing, selection, batch deletion, and
card media lifecycle (creation and media attachments).

## 1. The Original Problem

Prior to this architectural milestone, the platform separated user intentions across
disconnected views. The legacy "Create" view required selecting a target deck
from a blind dropdown to author cards, losing visual contact with existing deck
content. Deck editing and deletion lacked a natural location in the Library,
fragmenting the navigation experience.

## 2. Core UX Decisions

The design is built upon the principle of **Contextual Proximity**: where users
view a deck, they should be able to manage it directly.

### 2.1 Contextual Management View (Content Swap)
- **Location:** In the Library view under the `My Decks` tab.
- **Trigger:** Compact secondary `[Manage]` button adjacent to `[Study]` on owned deck cards.
- **Mechanism:** To avoid premature routing sprawl in early prototypes, the view used a
  clean **Content Swap**. The deck listing view swapped smoothly with the "Management View"
  while keeping the global application shell intact.
- **Capabilities:**
  - Inline metadata editing (Title, Description, and Visibility);
  - Deck deletion with safety confirmation modal;
  - Paginated list of deck cards;
  - Search, individual deletion, and creation/editing triggers.

### 2.2 Dedicated Card Editor Overlay
- Creating or editing cards was deliberately separated from generic small modal dialogs.
- **Approach:** Dedicated **Editor Overlay** over the workspace.
- **Layout:** *Split View* (Form inputs and tags on the left, live rendered preview on the right).
- **Future-Proofing:** An overlay provides an isolated canvas capable of accommodating
  richer authoring tools (such as WYSIWYG editors and diagram surfaces) without
  interfering with list scrolling.
- **Guard Logic:** Clear close action with confirmation if unsaved changes are present.

### 2.3 Media Handling (Images and Audio)
- Adopting proven patterns (e.g., Anki), media injection uses **markup markers**.
- Media uploads are independent from final card form submission.
- Triggering "Insert image" or "Insert audio" invokes the upload API, returning a
  tokenized filename. The editor inserts `<img src="xx">` or `[sound:xx]` directly
  at the cursor position.
- Technical debt: Orphaned media assets (uploaded but never saved) will require
  scheduled database garbage-collection routines in production.

### 2.4 Streamlined Global Navigation
- The top-level `[Create]` tab focuses purely on **macro creation** (New Deck).
- Immediately after deck creation, users are navigated directly to the Management
  View of that deck to start adding cards.

---

## 3. Technical Topology

### Backend (Java Spring Boot)
- `PUT /api/decks/{id}`: Update metadata.
- `DELETE /api/decks/{id}`: Delete deck.
- `POST /api/decks/{id}/media`: Binary file upload (`MultipartFile`). Validates
  ownership, sanitizes paths against traversal attacks, normalizes filenames,
  sets Content-Type, and persists to `MediaAsset`. Overwrites existing assets of the
  same name via `updateContent()`.
- `GET /api/decks/{id}/cards?page&size&q`: Paginated card search by front, back, and tags.
- `POST /api/decks/{id}/cards/bulk-delete`: Batch card deletion validating deck ownership.
- `POST /api/decks/{id}/copy`: Deep copy of a public deck to personal `My Decks`,
  including cards, tags, and media assets.

### Frontend (Vue 3 + TypeScript)
- State architecture:
  - Contextual views for deck management;
  - Dedicated card editor overlay with dirty form tracking;
  - Sanitized preview via `safeStudyHtml()`;
  - Independent media uploads.

