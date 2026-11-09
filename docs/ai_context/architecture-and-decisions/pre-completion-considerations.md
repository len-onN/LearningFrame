# Pre-Completion Considerations for the MVP

Evaluation Date: 2026-06-02  
Historical Origin: Evaluated during the `frontend-refactor` and Milestone 7-8 phases.  
Context: Replaced intermediate staging notes, providing an executive evaluation of MVP completeness,
architecture risks, and final delivery criteria.

## 1. Executive Summary

LearningFrame is well-positioned as a functional and defensible academic MVP.

The product successfully delivers on its core academic premise:
- Active recall;
- Spaced repetition;
- Interleaved practice;
- Anonymous study of public decks;
- Optional accounts to persist decks, reviews, and progress;
- Baseline interoperability with Anki via APKG;
- Library management covering creation, editing, importing, copying, and deletion.

The application has matured significantly across architectural dimensions:
- Router introduced and integrated;
- Application shell and layout extracted;
- Visual view components extracted;
- Library and Import componentized;
- Card editor overlay decoupled;
- Infrastructure and domain composables extracted;
- Predictable notification lifecycles;
- Real addressable routes established.

Key takeaway: The MVP is no longer blocked by missing core capabilities. It is focused on
polish, risk mitigation, and study session refinement.

## 2. Product State Assessment

### 2.1 Accounts and Authentication
- Implemented: Registration, login, local JWT persistence, route guards, redirect preservation,
  form validation, and anonymous study flows.
- Scope decisions: Password recovery, global session termination, and SSO are deferred to post-MVP.
  Local token storage in `localStorage` and query string tokens for private media rendering are
  pragmatic MVP compromises to be hardened in production.

### 2.2 Public Library
- Implemented: Paginated public deck listings, search, direct study, "Save to My Library" copying,
  visual highlighting of copied decks, and uniform card layouts.
- Scope decisions: Public deck favorites, advanced tag filtering, and full-text card search are
  deferred to post-MVP.

### 2.3 User Decks (My Decks)
- Implemented: Paginated personal deck list, search, manual deck authoring, inline metadata editing,
  individual and batch deletion with transactional ownership checks, sticky contextual toolbars,
  and "back to top" actions for long listings.

### 2.4 Card Management
- Implemented: Paginated card browsing per deck, front/back/tag search, batch card deletion,
  split-view preview, card creation/editing overlay, and persistent media attachment uploads.
- Scope decisions: Full WYSIWYG toolbars, card reordering, and mass tag modifications are
  scheduled for subsequent releases.

### 2.5 APKG Import
- Implemented: File selection, temporary pre-save card preview, card-by-card inspection,
  front/back toggle, media detection and local playback, authenticated persistence, and automatic
  cleanup of temporary object URLs.
- Scope decisions: Cloze deletions, complex Anki HTML templates, and historical review logs are
  explicitly outside the MVP scope.

### 2.6 Study Mode
- Implemented: Single deck study, interleaved practice, due card queues, answer reveals, rating
  controls (`Again`, `Hard`, `Good`, `Easy`), local and backend SRS synchronization, and media
  rendering.
- Refinements applied: Guided study progression, immediate feedback following ratings, and
  end-of-session summaries.

## 3. Architectural Assessment

### 3.1 Backend
- Strengths: Clear domain boundaries (auth, deck, import, study, stats), clean REST endpoints,
  Spring Data JPA with pagination queries, ownership validation, cascade deletion, and Flyway
  migrations.
- Technical debt: Media stored as BLOBs in MySQL is acceptable for local prototypes but requires
  external cloud storage (e.g. S3) for production scale.

### 3.2 Frontend
- Stack: Vue 3, Vite, TypeScript, Vue Router, and Pinia.
- Strengths: Decoupled shell and visual views, prop/event contracts, composable-driven domain
  operations, and strict memory lifecycle teardown policies.

## 4. Definition of Done for the Academic MVP

The MVP is deemed complete when:
- Anonymous users can study public decks without friction;
- Anonymous users can preview APKG packages and understand that persistence requires signing in;
- Authenticated users can persist, copy, and create decks;
- Authenticated users can manage cards, attach media, and execute reviews;
- Essential progress metrics display accurately;
- Interleaved practice functions reliably across accessible decks;
- Primary views are addressable via direct browser URLs;
- Navigating away from heavy views Deterministically tears down memory and object URLs;
- Documentation honestly articulates APKG and security boundaries;
- Unit, component, and E2E test suites pass deterministically.

## 5. Post-Milestone 8 Addendum

Following the integration of Milestone 8 (`develop` branch):
- Playwright was integrated with dedicated Compose (`docker-compose.e2e.yml`) and isolated database;
- The E2E suite expanded to 14 passing automated browser tests covering critical paths,
  direct route refreshes, browser navigation buttons, and batch deletions;
- The Vitest dependency was updated to `4.1.8`, resolving all security advisory warnings;
- The test coverage now spans frontend unit tests (Vitest), backend integration tests (Maven),
  and end-to-end browser specifications (Playwright).

