# LearningFrame Project Logbook

Consolidation Date: 2026-05-31  
Language Context: Translated from Portuguese (`docs-ptbr/diario-de-bordo.md`) to serve as canonical English documentation.

This document records the trajectory of the LearningFrame project from its inception through its current state. It was constructed from development conversation history, historical snapshots, and the repository commits.

## 1. Conception

LearningFrame originated as an academic project proposal: to build a web application solving a real professional learning problem with a scope concise enough to be presented in an academic paper. The original concept was ambitious: a comprehensive platform to assist students with scientific learning methodologies, study modules, research, references, and material authoring.

Early on, a critical boundary was established: the project must be an MVP, not a monolithic platform. Academic defensibility required the product to be demonstrable, coherent, and technically solid without ballooning into hundreds of pages just to explain operational mechanics.

The chosen domain focused on supporting study through scientifically validated techniques:
- active recall;
- spaced repetition;
- interleaved practice.

Initially, interleaved practice was informally termed "Chaos Mode", describing a randomized mix of subjects and decks. Later, to align with academic standards and remove unnecessary eccentricity, it was formally renamed to "Interleaved Practice".

## 2. Early Product Decisions

Foundational decisions shaped the MVP identity:
- The application should allow studying public decks without an account.
- Authentication should exist, but never block initial exploration.
- Authenticated users could create permanent decks, import materials, publish public decks, and persist study progress.
- Analytics should focus strictly on essential progress, avoiding complex reporting dashboards.
- Design should be minimalist, clean, and content-centric.

Treating authentication as optional for exploratory study and mandatory for data persistence established two distinct mental models:
- Visitor: Explore, review public decks, and evaluate APKG imports.
- Authenticated User: Persist knowledge, review schedules, media assets, and learning progress.

## 3. Technology Stack

Technologies were chosen for modernity, zero licensing cost, extensive documentation, and clean local execution:
- Backend: Java 21 with Eclipse Temurin.
- Framework: Spring Boot 4.0.x.
- Database: MySQL 8.4 LTS.
- Frontend: Vue 3, Vite, and TypeScript.
- Infrastructure: Docker Compose.

The operational benchmark was established early: a developer should be able to spin up the entire application using a single command:

```powershell
docker compose up --build
```

Configured services:
- `db`: MySQL;
- `backend`: Spring Boot API;
- `frontend`: Vue SPA served by Nginx.

Configured ports:
- Frontend: `http://localhost:8080`;
- Backend API: `http://localhost:8081`;
- Host MySQL: `localhost:3307`.

## 4. Initial MVP Domain Model

Core entities:
- `User`;
- `Deck`;
- `Card`;
- `Tag`;
- `ReviewState`;
- `ReviewLog`;
- `MediaAsset`.

Core enumerations:
- `StudyMode`: `SINGLE_DECK`, `MIXED_DUE`;
- `ReviewRating`: `AGAIN`, `HARD`, `GOOD`, `EASY`;
- `ImportFormat`: `APKG`, `CSV`, `TSV`.

Spaced repetition was designed as a simplified SM-2 algorithm. When importing Anki decks, LearningFrame starts its own independent review schedule, discarding historical review logs. This kept the scope tractable and avoided attempting a 1:1 replication of Anki's internal scheduler.

## 5. APKG and Interoperability Boundaries

The `.apkg` format was selected as the standard interoperability format with Anki. It was explicitly noted that importing `.apkg` does not grant unrestricted redistribution rights. It was also determined that the project would not copy Anki source code or introduce third-party libraries incompatible with academic MVP objectives.

Initial import boundaries:
- Accept `.apkg` deck packages; reject `.colpkg` collections;
- Extract basic notes and cards;
- Map front and back faces from the first two fields;
- Extract simple tags;
- Persist media assets when the deck is committed to the database;
- Do not preserve complex Anki templates;
- Do not preserve advanced cloze deletions;
- Do not import historical review logs;
- Do not inherit custom Anki scheduler settings.

## 6. Initial Application Bootstrap

The initial bootstrap delivered:
- Authentication API;
- Basic deck/card CRUD;
- Single deck study;
- Interleaved practice;
- Baseline APKG import;
- Essential statistics;
- Frontend covering Library, Study, Import, Create, and Progress;
- Docker Compose environment.

The first formal snapshot was recorded on 2026-05-30. Conventional Commits were adopted for repository hygiene.

## 7. Early Experience Refinements

Initial manual testing revealed several UX improvements:
- Removed extraneous marketing taglines;
- Made the "LearningFrame" logo navigate back to the home view;
- Hid the "Create" navigation tab before logging in;
- Implemented dedicated login and registration screens;
- Refined border contrast;
- Streamlined button alignments on authentication screens;
- Replaced "Continue without login" with a clean close icon and tooltip.

These decisions steered the application toward a concise, functional, minimalist aesthetic.

## 8. Form Validation

Form validation was updated to provide immediate inline feedback beneath input fields (reminiscent of Angular `mat-error`):
- Near real-time validation;
- Specific feedback directly under input elements;
- Visual error indicators.

Password complexity rules:
- Minimum 8 characters;
- At least one uppercase letter;
- At least one digit;
- At least one special symbol.

The same validation rules were replicated on the backend to enforce security boundaries.

## 9. Branching Strategy

Development adopted a structured Git flow:
- `main`: Stable reference releases;
- `develop`: Primary integration branch;
- `feature/*`: Thematic work branches.

Following early workflow mistakes (such as accidental merges to `main`), strict PR merges to `develop` were enforced.

## 10. Light and Dark Themes

The color palette was abstracted into CSS custom properties:
- Centralized CSS theme tokens;
- Manual light/dark toggle;
- Removed the "system" preference option to reduce maintenance complexity;
- Theme toggle placed prominently in the header.

Header tagline standardized:
`ACTIVE RECALL - SPACED REPETITION - INTERLEAVED PRACTICE`

## 11. Collapsible Sidebar

To maximize screen real estate during study sessions, the navigation sidebar was made collapsible:
- Collapsed state displays compact icons;
- Expanded state displays icons and labels;
- Theme, user profile, and sign-out controls grouped cleanly at the bottom;
- Toggle handle located along the border between menu and workspace;
- Renamed "Chaos Mode" to "Interleaved Practice".

## 12. Library Pagination

Deck listings were optimized for scale:
- Pagination for Public Decks;
- Pagination for Personal Decks ("My Decks");
- Increased seed records to thoroughly test pagination;
- Responsive card grid layout (4 columns on desktop);
- Centered "Load more decks..." actions;
- Cleaned up noisy badge metadata.

The Library was structured into clear tabs:
- `Public Decks`;
- `My Decks`.

## 13. Library Search

Library search focuses on deck-level queries:
- Searches across titles and descriptions;
- In-depth card content search was deferred due to performance and pagination complexities.

In contrast, the APKG import card selector searches:
- Card index;
- Front text;
- Back text;
- Associated tags;
- Media filenames.

## 14. Local Imports and Conceptual Realignment

A major architectural lesson emerged from APKG import handling.

Initially, imported APKGs became local drafts stored in browser `localStorage`. While viable for trivial decks, real-world APKGs often contain dozens of megabytes of media assets (e.g. 101 MB medical decks).
Key realizations:
- Browser storage is ill-suited for heavy media files;
- Presenting incomplete local drafts creates a poor user experience;
- Page refreshes could leave orphaned metadata without original media archives;
- Ephemeral drafts blurred lines between Library, Import, and Study.

Decision: Eliminate persisted local APKG drafts.
Refined mental model:
- Library contains ready-to-study decks.
- Import is dedicated to previewing and evaluating packages.
- Study uses persisted or public decks.
- Anonymous APKG import is transient for the duration of the upload session.

## 15. APKG Preview with Media

To evaluate a deck before saving, the Import view must render images and audio without permanently storing heavy media:
- Backend generates pre-save preview metadata;
- Frontend parses the selected APKG archive in memory;
- A lightweight ZIP parser extracts the internal `media` map;
- Images and audio are generated on-demand as ephemeral `objectURL` blobs;
- Only the currently visible card loads media;
- Object URLs are revoked upon card transitions to prevent memory leaks;
- Zero data written to `localStorage`.

Import UI features:
- Single card inspection view;
- Previous / Next navigation;
- Click to flip card;
- Explicit toggle button for front/back;
- Searchable card browser;
- Loading message: "Preparing your deck with media...";
- Animated spinner during extraction.

Pre-buffering was added during card flipping to eliminate visual flickering.

## 16. Backend Media Persistence

For decks saved by authenticated users, APKG media is committed to the database:
- `media_assets` relational table;
- Media endpoint: `/api/decks/{deckId}/media/{fileName}`;
- Access control for private deck assets;
- Query-string token support for rendering via standard `<img>` and `<audio>` tags;
- Sanitized filenames handling spaces and special symbols;
- Transformation of `[sound:file.mp3]` markup into native HTML audio players;
- Input sanitization stripping scripts, `on*` event handlers, and `javascript:` URIs;
- Dedicated database index on `(deck_id, file_name)`.

## 17. Optimizing APKG Save Workflows

Large APKG packages (e.g., 100+ MB) experienced noticeable latency during saving.
Factors:
- The package is transmitted during preview;
- The client reads the archive for local preview;
- Upon saving, the package is transmitted again to the backend;
- The backend extracts SQLite tables and commits media BLOBs to MySQL.

Rather than implementing complex asynchronous worker queues with WebSockets for the MVP, pragmatic improvements were adopted:
- Humanized progress messages: "Preparing your deck with media...";
- Processing spinners;
- Post-save refresh limited strictly to "My Decks" and stats, rather than re-fetching the entire application;
- Visual animation highlighting newly imported decks.

## 18. Highlighting Saved Decks

To guide users immediately after importing:
- Automatically switch view to `Library > My Decks`;
- Await DOM render cycle;
- Smooth-scroll the newly added deck into view;
- Apply a prominent 10-second highlight pulse animation.

## 19. Core Functional Milestone State

Functional capabilities achieved:
- Docker Compose container orchestration;
- Java 21 / Spring Boot backend;
- Vue 3 / Vite / TypeScript frontend;
- JWT token authentication;
- Frontend and backend password complexity validation;
- Library with Public Decks and My Decks;
- Pagination and search across decks;
- Single deck study and interleaved practice;
- Simplified SM-2 spaced repetition;
- Core progress metrics;
- Light and dark themes;
- Collapsible sidebar;
- Authenticated APKG import with persistent media;
- Transient card-by-card APKG preview with media;
- Dismissible floating notifications;
- Visual highlighting for newly saved decks.

## 20. Backlog Priorities

Top priority established:
- Inline editing and deletion of personal decks in `My Decks`.

Features planned:
- Edit title, description, and visibility;
- Deletion with confirmation modal;
- Actions restricted strictly to owned decks;
- Clean action menus on deck cards.

Secondary backlog items:
- Enhanced card management within owned decks;
- "Save to My Library" for public decks;
- Bookmarking / favoriting public decks;
- Publishing / unpublishing controls;
- Backend card content search;
- Audio read-aloud features;
- Advanced analytical dashboards.

## 21. Scope Boundaries Preserved

Explicitly deferred outside the MVP:
- Complex statistical dashboards;
- Advanced cloze deletions;
- Full Anki card templates;
- Original Anki scheduling algorithms;
- `.colpkg` archives;
- IndexedDB for client media;
- Backend temporary sessions for anonymous APKG previews;
- External CDN or cloud object storage;
- Deck marketplace and multi-user collaboration.

## 22. Engineering Process

The project iterated through rapid delivery cycles:
- Problem analysis and architectural review;
- Alternative selection;
- Focused branch implementation;
- Browser-based validation;
- UX refinement;
- Conventional Commits formatting;
- Pull request review and merge into `develop`;
- Creation of subsequent focused branches.

## 23. Repository Transition

Branch prepared for deck management:
`feature/library-deck-management`

Created from updated `develop` following the merge of APKG import capabilities.

## 24. Deck Management and Authoring UX (In Progress)

To elevate library usability, core UX architectural decisions were made:
- **Contextual Management:** Rather than jumping between distant views, deck operations occur within the Library via smooth content swaps.
- **Overlay Mode for Card Authoring:** To accommodate future diagram and canvas tools, card editing opens in a dedicated fullscreen split-view overlay.
- **Markup Markers for Media:** Media uploads inject standard markup (`<img src="...">`, `[sound:...]`) directly into card content.
- **Micro vs Macro Creation:** The top-level `Create` tab focuses purely on deck creation, immediately redirecting to deck management to author cards.

## 25. Paginated Card Management and Copying Public Decks

Capabilities implemented:
- Paginated and searchable card browser inside managed decks;
- Dedicated card creation and editing overlay with live preview;
- Independent media asset uploads;
- Batch card deletion;
- "Save to My Library" action on public decks, generating an independent editable copy;
- Streamlined deck authoring redirecting straight to card management.


## 26. Finalization of the Library Management PR

The library management PR was merged into `develop` and updated locally via fast-forward.

Consolidated capabilities:
- Contextual deck management in `Library > My Decks`;
- Metadata editing, deck deletion, card creation/editing/deletion;
- Independent media uploads for persisted cards;
- Paginated, searchable card browser in management view;
- Multi-selection and batch card deletion;
- Active card preview in a split-view panel;
- "Save to My Library" action on public decks, creating an independent editable copy;
- Standardized uniform card heights across public and personal deck views;
- Containerized development workflow using `docker-compose.dev.yml` with Vite watch mode.

Preserved decisions:
- "Save to My Library" creates an editable private copy of a public deck.
- "Favoriting" is deferred as a lightweight reference to original public decks without duplicating content.
- Card management strictly adheres to paginated contracts rather than fetching full collections.
- Card editor resides in a dedicated overlay to support future rich diagramming extensions.

## 27. Architectural Alert: Monolithic Frontend

With the completion of library management, `App.vue` accumulated excessive responsibilities: tab routing, authentication, library, study, APKG import, deck management, card editor overlays, preview state, floating notifications, and direct API calls. This increased cognitive burden, regression risk, and test isolation difficulty.

Given the late MVP timeframe, a full rewrite was avoided in favor of incremental decomposition:
1. **Extract UI components by surface area:** Deconstruct views into `LibraryPage`, `DeckCard`, `DeckManagementPage`, `CardEditorOverlay`, `StudySessionPage`, `ApkgImportPage`, and `AuthPage`.
2. **Extract domain composables:** Move reactive state logic into composables such as `useAuth`, `useDeckLibrary`, `useDeckManagement`, `useStudySession`, and `useApkgImport`.
3. **Keep `api.ts` as the infrastructure boundary:** Ensure components consume domain methods rather than scattering HTTP details.
4. **Defer formal global stores until concrete cross-cutting requirements arise:** Evaluate Pinia only after views and composables establish modular boundaries.
5. **Avoid microfrontends and excessive route hierarchies:** Internal modularization is sufficient for MVP scale.

## 28. Detailed Planning for Routing, Componentization, and Memory Lifecycle

The refactoring roadmap was formalized to address critical system properties:
- Deciding which user workflows warrant genuine addressable routes;
- Distinguishing permanent application state from view-scoped ephemeral state;
- Enforcing explicit teardown policies for heavy assets (APKG arrays, object URLs, study queues);
- Defining minimal backend contracts needed for direct URL access;
- Ensuring traceability via atomic pull requests.

The architectural reference document `docs/ai_context/architecture-and-decisions/frontend-architecture-routing-lifecycle.md` was established.

Refined execution sequence:
1. Backend contract for lightweight deck metadata (`GET /api/decks/{deckId}/metadata`).
2. Vue Router as the single source of truth for navigation.
3. Converting `App.vue` into a shell coordinator and extracting page components.
4. Modularizing Library and Deck Management.
5. Modularizing Import and Study sessions.
6. Extracting domain composables.
7. Implementing strict memory and asset lifecycle policies.

## 29. Integration Buffer Branch: `frontend-refactor`

Because the architectural overhaul comprised multiple milestones, an intermediate integration branch, `frontend-refactor`, was introduced.

Workflow:
- `frontend-refactor` created from up-to-date `develop`;
- Individual milestone branches branched off `frontend-refactor`;
- Milestone PRs merged directly into `frontend-refactor`;
- Full containerized validations executed after every merge;
- Final consolidated PR merged from `frontend-refactor` into `develop` once all milestones stabilized.

Benefits:
- Prevented unverified intermediate states from destabilizing `develop`;
- Maintained small, reviewable pull requests;
- Preserved atomic Git history;
- Provided an isolated environment for cross-milestone integration issues.

## 30. Milestone 1: Lightweight Deck Metadata Contract

Branch: `codex/backend-deck-route-contracts`  
Destination: `frontend-refactor`

Implementation:
- New endpoint `GET /api/decks/{deckId}/metadata`;
- Reused `DeckSummary` DTO without populating card collections;
- Enforced `findAccessible` permissions, restricting metadata of private decks to owners while allowing anonymous access for public decks;
- Added client wrapper `deckMetadata(deckId)` in `frontend/src/services/api.ts`;
- Unit and controller tests verifying metadata retrieval, security access rules, and public fallback.

Decisions:
- Preserved `GET /api/decks/{deckId}` to support anonymous public study in the short term;
- Kept direct deck management routes dependent on lightweight metadata plus paginated card queries.

## 31. Milestone 2 Planning: Router Foundation

Branch: `codex/frontend-router-foundation`

Preliminary analysis:
- Verified Nginx fallback routing for SPA history mode;
- Audited route metadata requirements and authentication guard behaviors;
- Reaffirmed that Milestone 2 should establish router navigation as the source of truth without attempting premature page extraction.

## 32. Milestone 2 Implementation: Core Router

Implementation:
- Installed `vue-router`;
- Created `frontend/src/router/index.ts` and registered it in `frontend/src/main.ts`;
- Defined addressable routes for public library, personal decks, deck management, study, study per deck, interleaved practice, import, create, progress, login, and registration;
- Authentication guard redirecting unauthorized access to `/login?redirect=<target>`;
- Catch-all redirecting unknown routes to `/library/public`;
- Converted sidebar navigation to routed links;
- Derived navigation states (`tab`, `librarySection`, `libraryView`, `authMode`) dynamically from active routes;
- Migrated primary workflows to `router.push` and `router.replace`;
- Direct deck management route configured to load metadata via `api.deckMetadata(deckId)` and cards via `api.deckCards`.

Validation:
- TypeScript compilation and Vite build verified;
- All Vitest unit tests passing;
- HTTP 200 responses verified on containerized direct route loads.

## 33. Label Fallback for Non-Text Cards

During card management verification, cards containing only media attachments rendered with the generic label "Card without text". To enhance usability during repeated reviews, the fallback was updated:
- Fallback labels dynamically assign sequential names based on loaded order (`Card 1`, `Card 2`, etc.);
- Aligned card management behavior with the APKG import preview;
- Search, selection, and batch deletion contracts remained intact.

## 34. Milestone 3 Planning: Shell and Simple Pages

Investigated decomposition of `App.vue`:
- Separating top-level application chrome (`AppShell`) from route views;
- Preparing simple views (`CreateDeckPage`, `ProgressPage`, `AuthPage`) for clean extraction.

## 35. Milestone 3 Implementation: Shell and Simple Pages

Implementation:
- Extracted `frontend/src/layouts/AppShell.vue` handling header, navigation, sidebar toggle, and theme switching;
- Extracted standalone page views: `CreateDeckPage.vue`, `ProgressPage.vue`, and `AuthPage.vue`;
- Transferred form input and local submission handling to dedicated views;
- Connected views to router transitions via explicit events;
- Preserved zero functional regressions across auth and creation workflows.

## 36. Milestone 4 Planning: Library and Import Modules

Analyzed structural breakdown of the Library view:
- Splitting monolithic deck lists into `PublicDeckList` and `MyDeckList`;
- Extracting deck cards into `DeckCard.vue`;
- Decoupling APKG import parsing and preview into `ApkgImportPage.vue`.

## 37. Milestone 4A Implementation: Library and Import

Implementation:
- Created `PublicDeckList.vue` and `MyDeckList.vue` with paginated browsing;
- Extracted reusable `DeckCard.vue` component;
- Extracted `ApkgImportPage.vue` handling client-side preview, card selector, and save triggers;
- Preserved temporary object URL cleanup routines;
- Reduced `App.vue` complexity significantly.

## 38. Milestone 4B Planning: Card Editor Overlay

Analyzed decoupling the split-view card editor from `App.vue`:
- Isolating front/back editor fields, tag inputs, and live preview;
- Managing independent media upload triggers and marker insertions;
- Ensuring unsaved form changes prompt confirmation before unmounting.

## 39. Milestone 4B Implementation: Card Editor Overlay

Implementation:
- Created `frontend/src/features/library/CardEditorOverlay.vue`;
- Encapsulated form state, dirty tracking, and split-view preview;
- Integrated sanitized HTML preview with `safeStudyHtml`;
- Attached independent media upload handlers for image and audio markers;
- Embedded dirty-form protection dialogs on overlay close.

## 40. Bugfix: Notification Lifecycle

Identified issue where floating alerts persisted across route transitions or stacked indefinitely:
- Introduced route-scoped notification lifecycles;
- Ensured notifications auto-dismiss or clear upon navigating between major views;
- Added manual dismissal controls.

## 41. Milestone 5 Implementation: Infrastructure Composables

Implementation:
- Extracted `useFeedback`: centralized notice and error state management;
- Extracted `useTheme`: encapsulated light/dark mode toggling and local persistence;
- Extracted `useAuthSession`: managed JWT token storage, current user parsing, and logout actions;
- Replaced loose reactive variables in `App.vue` with composable hooks.

## 42. Milestone 6 Planning: Domain Composables

Mapped domain state extraction:
- `useDeckLibrary`: deck search, pagination, filtering, and highlight animations;
- `useDeckManagement`: card pagination, metadata editing, and batch deletion;
- `useStudySession`: review queues, rating submissions, and interleaving logic;
- `useApkgImport`: package extraction, media indexing, and persistence.

## 43. Milestone 6A1 Implementation: `useDeckLibrary`

Implementation:
- Created `frontend/src/features/library/useDeckLibrary.ts`;
- Encapsulated deck search queries, pagination state, `hasMore` flags, and temporary deck highlight timers;
- Exported pure utility helpers `mergeDeckPages`, `deckPageCountLabel`, and `normalizeSearch`;
- Created dedicated unit tests in `useDeckLibrary.test.ts` (30 passing tests);
- Connected `App.vue` to the composable while retaining cross-cutting orchestration.

## 44. Batch Deletion and Selection Polish

Enhanced deck management ergonomics:
- Added multi-select mode in `My Decks` allowing batch deletion of owned decks;
- Added transactional backend validation ensuring all deleted decks belong to the authenticated user;
- Implemented sticky contextual action bar showing selection counts and batch deletion triggers;
- Restamped selections to visible cards to prevent hidden off-screen deletions.

## 45. Partial Milestone 7 Implementation: Route Adapters and Lifecycle

Implementation:
- Replaced temporary route surface switches with real `<RouterView />` mounting;
- Introduced route adapters bridging Vue Router params to component props;
- Bound view lifecycles to route unmounting: discarding study queues and revoking preview object URLs;
- Enforced route-level redirect handling post-authentication.

## 46. Milestone 8 Planning: Dedicated E2E Testing Suite

Designed end-to-end testing environment with automated browser validation:
- Requirement: Zero execution against development databases;
- Architecture: Dedicated Compose project (`learningframe-e2e`) with isolated MySQL database (`learningframe_e2e`);
- Test runner: Playwright on Chromium;
- State resetting: Dedicated internal endpoint `POST /api/e2e/reset` gated behind `X-E2E-Token` and restricted to the `e2e` backend profile.

## 47. Milestone 8 Implementation: Dedicated E2E Testing Suite

Implementation:
- Created `docker-compose.e2e.yml`;
- Configured dedicated ports: frontend `18080`, backend `18081`, MySQL `3317`;
- Created deterministic seed scripts for test runs;
- Authored initial Playwright suite covering anonymous exploration, authentication, deck creation, card management, study sessions, APKG preview/import, and progress;
- Automated teardown via `docker compose down -v`.

## 48. Post-Milestone 8 Evaluation and Transition to Stabilization

Base branch: `develop` (Commit `4a52077`)

Following the merge of `frontend-refactor` into `develop`:
- Validated test suites: 33 frontend unit tests, 27 backend container tests, 9 Playwright E2E browser tests;
- Verified complete isolation of the E2E database environment;
- Determined that the MVP achieved full functional completeness;
- Shifted engineering priorities from broad feature additions to stabilization, risk mitigation, manual QA, and documentation consolidation.


## 49. Strategy for Stabilization Branches

Date: 2026-06-07  
Working branch: `codex/mvp-finalization-planning`

Following the consolidation of Milestone 8, the stabilization phase prioritized focused, short-lived branches rather than prolonged abstract planning:
- Maintain small, thematic branches directly off the consolidated base;
- Begin each branch with an audit of affected files before modifying code or dependencies;
- Maintain Conventional Commits;
- Sequence of stabilization topics:
  1. `codex/audit-vitest-decision`: evaluate and resolve `npm audit` advisory;
  2. `codex/e2e-risk-flows`: expand E2E coverage for high-risk browser behaviors;
  3. `codex/study-session-polish`: add guided session progress, rating feedback, and completion summaries;
  4. Containerized manual QA and documentation consolidation.

## 50. Decision on the Vitest Security Audit

Date: 2026-06-07  
Working branch: `codex/audit-vitest-decision`

The critical advisory flagged by `npm audit` in `vitest <4.1.0` was addressed without running blind automated fixes:
- Evaluated dependency graph in an isolated branch;
- Upgraded `vitest` from `3.2.4` to `4.1.8`;
- Retested all frontend suites (33 tests passing) and E2E Playwright tests (9 tests passing);
- Confirmed `npm ci` in Docker E2E builds reported 0 vulnerabilities.

## 51. E2E Testing of Risk Flows

Date: 2026-06-07  
Working branch: `codex/e2e-risk-flows`

Targeted browser tests were added for workflows vulnerable to state desynchronization:
- Playwright suite expanded from 9 to 14 automated tests;
- Added coverage for direct page refreshes on core addressable routes;
- Added coverage for browser forward and backward navigation buttons;
- Added coverage for deck metadata updates;
- Added coverage for batch selection and deletion of cards and decks;
- All tests executed deterministically against `learningframe-e2e`.

## 52. Study Session Polish

Date: 2026-06-07  
Working branch: `codex/study-session-polish`

Enhanced the study interface from an operational card flip into a guided learning session:
- Added session progress indicator displaying reviewed count against session total;
- Added immediate local feedback upon card rating (e.g., displaying next review interval);
- Added session completion summary modal highlighting review distributions (`Again`, `Hard`, `Good`, `Easy`);
- Added font scaling controls directly within the study view;
- Added toggle to constrain oversized card media within the viewport;
- Verified that leaving the study route cleanly discards active review queues.

## 53. Preparation for Final Manual QA

Date: 2026-06-08  
Working branch: `codex/qa-manual-final`

Established a comprehensive verification checklist covering all end-to-end flows in production-like Docker containers:
- Anonymous public deck browsing and study;
- Account registration, login, private route protection, and logout;
- Saving public decks to personal library;
- Manual deck creation, card management, and media uploads;
- APKG package preview, card inspection, and persistence;
- Interleaved practice and session completion;
- Progress dashboard metrics;
- Theme toggles, direct refreshes, and responsive layouts.

## 54. Final Manual QA Planning

Defined testing criteria to focus exclusively on blocker bugs and documentation discrepancies, preventing last-minute feature creep before project delivery.

## 55. Execution of Final Manual QA

Date: 2026-06-08  
Base commit: `0bb77cf`

The final manual QA of the academic MVP was executed against the primary Docker Compose environment (`http://localhost:8080`):
- All 18 out of 18 test scenarios passed successfully;
- Zero blocking defects identified;
- Automated test suites verified: 33 Vitest tests, 27 Spring Boot tests, and 14 Playwright E2E tests passing;
- The application was verified ready for academic delivery and presentation.

## 56. Preparation for Final Documentation

Date: 2026-06-08  
Working branch: `codex/mvp-final-documentation`

Transitioned focus to restructuring project documentation, cleanly separating active canonical user guides from historical AI-assisted development context.

## 57. Final MVP Documentation Consolidation

Finalized primary documentation artifacts:
- Core `README.md` updated with architecture, Docker run instructions, and MVP boundaries;
- `docs/user-guide.md` documenting end-to-end user workflows;
- `docs/anki-apkg-guide.md` articulating Anki interoperability limits;
- `docs/local-execution-guide.md` providing developer environment instructions;
- `docs/principles-and-standards.md` establishing normative engineering standards.

## 58. Organization of Historical and AI Context

To maintain clear separation between end-user documentation and developmental history, all transitional planning artifacts, prompts, and architecture records were organized under `docs/ai_context/`:
- `timeline.md`: mapping milestones and branch lifecycles;
- `decision-log.md`: recording architectural shifts and rationales;
- `architecture-and-decisions/`: preserving foundational UX and routing designs.

## 59. Post-MVP Decoupling of App.vue (Slice 1)

Date: 2026-06-08  
Working branch: `codex/refactor-app-vue-responsibilities`

Began incremental reduction of `App.vue` responsibilities:
- Extracted pure helper functions for study, import, and library formatting;
- Extracted `useDeckManagement` composable handling card queries and batch operations;
- Maintained `App.vue` as composition root passing dependencies via explicit callbacks.

## 60. Post-MVP Decoupling of App.vue (Slice 2)

Extracted navigation and routing composables from root:
- Created `useStatsSummary`: encapsulated stats queries and cache invalidation;
- Created `useAppNavigation`: centralized router navigation helpers;
- Created `useRouteLifecycle`: coordinated route transitions and teardowns.

## 61. Post-MVP Decoupling of App.vue (Slice 3)

Extracted APKG import coordination:
- Created `useApkgImport`: encapsulated client-side package extraction, temporary media indexing, object URL generation, and cleanup routines.

## 62. Post-MVP Decoupling of App.vue (Slice 4)

Cleaned up timers and reactive debounces:
- Created `useDebouncedWatch` to eliminate manual `setTimeout` calls from `App.vue`;
- Bound highlight animations to `onScopeDispose` in `useDeckLibrary` to eliminate animation frame memory leaks;
- Reduced `App.vue` size to approximately 850 lines.

## 63. Final Review of App.vue as Composition Root

Date: 2026-06-09  
Consolidated `App.vue` into a clean composition root (~580 lines):
- Instantiates global and domain composables;
- Wire cross-cutting callbacks;
- Binds route lifecycle hooks;
- Renders `AppShell` and `RouterView`.

## 64. Study Session Polish and DX Enhancements

Date: 2026-06-10  
Working branch: `codex/study-mode-interleaved-polish`

Enhanced study session mechanics and developer experience:
- **Interleaved Practice Trigger:** Integrated multi-deck selection directly into the Library view, eliminating the isolated global navigation tab in favor of selecting decks and clicking "Study selected".
- **Skip Card Action:** Rejected a "back card" button because retroactively altering reviews corrupts SM-2 interval calculations; implemented "Skip Card" instead, moving the active card to the end of the local queue without submitting an API review.
- **Predicted Interval Badges:** Replaced intrusive toast notifications with interval badges embedded directly into rating buttons ("< 10m", "1 d", "4 d", etc.).
- **Vite Native Dev Server:** Upgraded `docker-compose.dev.yml` to run the native Vite Dev Server (`npm run dev`) with Hot Module Replacement (HMR) and polling for seamless Windows file synchronization.

## 65. Library Selection Integration with Study and Visual Adjustments

Date: 2026-06-10  
Working branch: `fix/deck_selection`

- Added "Study Selected" button in the library action bar when in multi-select mode;
- Updated `/study/interleaved` route to read deck query parameters (`?decks=x,y`), automatically starting the study session without redundant confirmation clicks;
- Lightened library background color in light mode and increased deck card hover contrast.

## 66. Profile Management and Card Formatting Planning

Date: 2026-06-10  
Working branch: `feature/profile-management`

Mapped next major capability additions:
1. User Profile Management: Display name updates, password change requiring old password verification, and account hard deletion with cascade.
2. Rich Card Formatting: Integrated WYSIWYG authoring for flashcards.

## 67. Completion of Profile Management

Date: 2026-06-10  
Working branch: `feature/profile-management`

Implementation:
- Backend: Created `ProfileController` with protected endpoints for updating profile names, changing passwords, and hard deleting accounts;
- Database: Added Flyway migration `V6__add_cascade_delete_to_decks.sql` ensuring `ON DELETE CASCADE` removes user decks, cards, media, and progress cleanly;
- Frontend: Added `ProfileRoute.vue` with form validation and confirmation modal for account deletion.

## 68. WYSIWYG Card Editor (Tiptap)

Date: 2026-06-11  
Working branch: `feature/card-editor-wysiwyg`

Replaced raw HTML card editing with a rich text editor:
- Integrated headless **Tiptap** editor conforming to the design system typography;
- Created `RichTextEditor.vue` component with formatting toolbar (Bold, Italic, Underline, Bullet Lists, and Media);
- Removed redundant preview pane since the editor natively renders WYSIWYG output;
- Configured `.tiptap` styling with `min-height: 100%` so clicking anywhere in the container focuses the editor.

## 69. Native Audio Extension and Microphone Recording

Date: 2026-06-11  
Working branch: `feature/card-editor-wysiwyg`

Added complete multimedia authoring:
- **AnkiSoundExtension:** Custom Tiptap extension parsing `[sound:xxx]` syntax into inline `<audio>` players in the editor, and serializing back to standard Anki markup on save;
- **Native Audio Recording:** Created `useAudioRecorder` composable using the browser Web Audio `MediaRecorder` API; added microphone button to the editor toolbar allowing direct audio recording (up to 60 seconds) with automated server upload.

## 70. Global State Decoupling (Pinia Migration)

Date: 2026-06-11  
Working branch: `refactor/app-vue-architecture`

Resolved state leakage across test suites:
- Adopted **Pinia** for cross-cutting state management;
- Converted `useFeedback` into `useFeedbackStore` with identical method signatures;
- Standardized `setActivePinia(createPinia())` in Vitest `beforeEach` hooks for clean test sandboxing;
- Fixed `onScopeDispose` memory leak warnings in `LibraryRoute.vue`.

## 71. Pinia Transition (Phases 2 and 3)

Date: 2026-06-12  
Working branch: `feature/pinia-auth-e-library`

Expanded Pinia to encapsulate Authentication and Library domains:
- **AuthStore:** Created `useAuthStore` managing active user state, JWT tokens, and login/logout flows;
- **LibraryStore & DeckManagementStore:** Created stores to coordinate public and private deck browsing, search, and inline deck/card CRUD;
- All 107 Vitest unit tests and 14 Playwright E2E tests passing.

## 72. UX Improvements for Password Forms

Date: 2026-06-12  
Working branch: `feature/profile-password-ux`

Visual and semantic improvements to authentication and profile forms (`ProfileRoute.vue` and `AuthPage.vue`):
- **Password Visibility:** Added Lucide eye toggle icons allowing users to view or hide entered passwords;
- **Real-Time Password Strength:** Interactive checklist displaying green check and red X icons as password complexity criteria are satisfied;
- **HTML Semantics:** Added standard `autocomplete` attributes for password manager compatibility.
