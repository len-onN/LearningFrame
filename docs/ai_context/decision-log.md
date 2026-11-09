# LearningFrame Decision Log

This document records major directional decisions throughout the evolution of
LearningFrame. It complements the timeline: the timeline shows when milestones
occurred; this log explains why decisions evolved.

For current normative guidance, consult
[MVP Principles and Standards](../principles-and-standards.md).

## 1. Optional Accounts for Exploring

Initial consideration:
- Mandatory accounts could simplify persistence and progress tracking.

Issues:
- Added friction before users could evaluate product value;
- Weakened rapid demonstration in academic presentations;
- Made APKG preview and public deck study less accessible.

Final decision:
- Visitors can study public decks and preview APKG files without an account;
- An account is only required to persist decks, media, reviews, and progress.

Current state:
- Documented in the [MVP User Guide](../user-guide.md);
- Established as a core rule in [MVP Principles and Standards](../principles-and-standards.md).

## 2. From "Chaos Mode" to Interleaved Practice

Initial decision:
- Use an informal moniker ("Chaos Mode") for mixed-deck study sessions.

Issues:
- Failed to support the academic narrative;
- Appeared as a novelty feature rather than a scientific learning technique;
- Caused confusion among reviewers and users.

Final decision:
- Standardized on `Interleaved Practice`, aligning directly with educational literature.

Current state:
- Interleaved practice is a core, streamlined workflow;
- Advanced multi-topic session configurators are scheduled for post-MVP.

## 3. APKG: From Local Drafts to Temporary Preview

Initial decision:
- Anonymously imported APKGs could persist as local drafts in browser storage.

Issues identified:
- Production APKGs often contain substantial media volume;
- `localStorage` is inadequate for storing binary media;
- Following page refresh, drafts could linger without the original media archive;
- The Library mixed ready-to-study decks with incomplete temporary assets;
- Degraded user trust during active study.

Final decision:
- Anonymous APKG import is strictly temporary;
- Preview reads local media on demand;
- Temporary object URLs are revoked upon navigating away;
- State is preserved only during the explicit `sign in to save` workflow;
- Long-term persistence requires an authenticated account.

Current state:
- Documented in the [Anki/APKG Integration Guide](../anki-apkg-guide.md).

## 4. Anki Interoperability vs. Anki Clone

Initial consideration:
- Attempting to support deep Anki configuration and features during import.

Issues:
- Cloze deletions, complex HTML/CSS templates, and review history would inflate scope;
- Preserving original Anki scheduling algorithms conflicted with LearningFrame's custom schedule;
- Resulted in an overly complex MVP difficult to defend and explain academically.

Final decision:
- Treat `.apkg` strictly as a baseline interoperability vehicle;
- Map front, back, tags, and basic media;
- Initialize LearningFrame's own review schedule;
- Defer `.colpkg`, advanced cloze, complex templates, and history.

Current state:
- Treated as a conscious scope boundary, not an implementation gap.

## 5. Library: Ready Decks vs. Local Drafts

Initial decision:
- The Library could list both server decks and anonymously imported local decks.

Issues:
- Incomplete local APKG drafts degraded UI reliability;
- Heavy media in browser storage created fragile runtime behavior;
- Conflated ephemeral preview with production-ready decks.

Final decision:
- Library displays public decks and authenticated user decks;
- Import serves as a dedicated preview and decision boundary;
- Study sessions pull exclusively from public or persisted decks.

Current state:
- Ephemeral local decks were removed from the conceptual domain model.

## 6. Contextual Management of Decks and Cards

Initial decision:
- Deck creation and card editing were fragmented across disparate screens.

Issues:
- Users lost context when switching to card management;
- The Library view lacked comprehensive tools for managing owned decks;
- Generic modal dialogs were cramped for a card editor with preview and media attachments.

Final decision:
- `My Decks` gained contextual inline management;
- Cards are managed directly within their parent deck context;
- Card editing opens in a dedicated overlay featuring live preview;
- Media upload automatically generates markup tokens in the card HTML.

Current state:
- Documented in [Decks UX Architecture](architecture-and-decisions/decks-ux-architecture.md);
- User interactions covered in the [MVP User Guide](../user-guide.md).

## 7. Frontend: Incremental Refactoring vs. Full Rewrite

Initial consideration:
- Rewriting the frontend or immediately adopting a global store.

Issues:
- Excessive risk near final project deadlines;
- Core feature set was already stable and functional;
- A global store could introduce artificial coupling ahead of proven necessity.

Final decision:
- Introduce Vue Router;
- Extract the application shell and individual page views;
- Maintain view components as prop/event controlled surfaces;
- Use route adapters to bridge router params and application state;
- Defer broad global stores until concrete domain drivers emerge;
- Retain `App.vue` as a transitional coordinator.

Current state:
- Standardized in [MVP Principles and Standards](../principles-and-standards.md);
- Detailed in [Routing and Lifecycle](architecture-and-decisions/frontend-architecture-routing-lifecycle.md).

## 8. Dedicated E2E Testing Environment

Initial consideration:
- Running Playwright tests against the active development database.

Issues:
- Risk of destroying local manual test data;
- Tests depended on unpredictable local state;
- Reliable test resetting was difficult to guarantee;
- Reduced build reproducibility.

Final decision:
- Create `docker-compose.e2e.yml`;
- Use isolated Compose project `learningframe-e2e`;
- Connect to isolated database `learningframe_e2e`;
- Expose MySQL E2E on dedicated port `3317`;
- Execute resets via dedicated internal endpoint restricted to the `e2e` profile;
- Tear down with `docker compose down -v`.

Current state:
- Critical rule codified in developer documentation and `README.md`.

## 9. Storing Media as BLOBs in MySQL for MVP

Initial consideration:
- Integrating external cloud object storage (e.g. S3) from day one.

Issues:
- Substantially increased local setup complexity and third-party dependencies;
- Distracted engineering focus from core academic MVP objectives.

Final decision:
- Store media as BLOBs in MySQL for the duration of the MVP;
- Document BLOB storage as acceptable for prototype scale;
- Schedule cloud object storage migration for post-MVP.

Current state:
- Documented as an accepted technical compromise.

## 10. Vitest Security Audit

Problem:
- `npm audit` flagged a critical advisory in `vitest <4.1.0`.

Alternative considered:
- Running `npm audit fix --force` blindly.

Issues:
- Potential breaking changes across packages;
- Unvetted modifications to `package-lock.json`.

Final decision:
- Isolated evaluation in a focused branch;
- Upgraded specifically to `vitest@4.1.8`;
- Revalidated through `npm test`, `npm run build`, and E2E suites.

Current state:
- Resolved cleanly with zero regressions.

## 11. Study Interface: From Basic Flow to Guided Session

Initial state:
- Reveal answer, click rating, queue decrements.

Issues:
- Functional but lacked guided UX feedback;
- Users could not perceive study session milestones or remaining cards;
- Large media files distorted layout and distracted from recall.

Final decision:
- Introduce session progress indicator;
- Add immediate local rating feedback;
- Add completion summary overlay;
- Refine empty and completed states;
- Add study font size adjustments;
- Add toggle to fit oversized media within card bounds.

Current state:
- Documented in the [MVP User Guide](../user-guide.md).

## 12. Post-MVP Institutional Context and Interleaving

Identified gap:
- Early documentation described technical MVP mechanisms without articulating broader institutional purpose;
- Interleaved practice existed as a simple global mix without client-side deck selection;
- Backend supported `deckIds` in `MIXED_DUE` mode, but client did not expose it.

Context decision:
- Frame LearningFrame as a free academic study aid provided by educational institutions;
- Defer direct SIS/LMS integration to the post-MVP roadmap.

Interleaving decision:
- Classify client-side deck selection for interleaved practice as an MVP+ enhancement candidate;
- Maintain existing round-robin deck interleaving for the MVP baseline;
- Classify tag-level and pedagogical heuristic interleaving as post-MVP research.

Current state:
- Formalized in the [Post-MVP Professionalization Roadmap](../post-mvp-professionalization-roadmap.md).

## 13. Incremental App.vue Decoupling

Problem:
- `frontend/src/App.vue` accumulated excessive coordinator logic;
- Monolithic root coupled shell, navigation, auth, library, and study lifecycles;
- Premature lines-of-code reductions risked leaking reactive side effects.

Final decision:
- Decouple through small, verified architectural slices;
- Extract pure helpers and deck management first;
- Keep `App.vue` as composition root while boundaries solidify;
- Pass cross-cutting dependencies via explicit callbacks (`showNotice`, `showError`, `withFeedback`);
- Refactor domain composables (`useDeckLibrary`, `useStudySession`) to instantiate inside route view scopes rather than loose in root, resolving Vue `onScopeDispose` lifecycle warnings.

Current state:
- Clean modular composables in place (`useDeckManagement`, `useStudySession`, `useApkgImport`, `useDeckLibrary`);
- Root coordination reduced without compromising lifecycle safety.

## 14. Daily Study Limits on AppUser vs. SRP

Problem:
- Storage needed for user study preferences (daily new card limit and daily review limit);
- Single Responsibility Principle (SRP) suggests isolating settings from core user credentials.

Decision:
- Added `daily_new_cards_limit` and `daily_review_cards_limit` directly to `AppUser`;
- Accepted minor SRP compromise in the MVP to eliminate redundant 1:1 entity joins and simplify queries;
- Domain settings can be split into a dedicated entity when more complex preferences arrive.

Current state:
- Implemented and validated under `feature/daily-study-limits`.

## 15. WYSIWYG Editor and Native Audio Recording

Problem:
- Cards previously required raw HTML and strict markup for audio (`[sound:xxx]`);
- Lack of integrated recording hindered language and pronunciation learning.

Decision:
- **Tiptap**: Adopted as headless editor preserving design system typography;
- **AnkiSoundExtension**: Custom Tiptap extension enabling bidirectional translation between `[sound:xxx]` and native `<audio>` players, maintaining full Anki database compatibility;
- **MediaRecorder API**: Native browser audio capture streaming `.webm` blobs, capped at 60 seconds with toolbar protection during capture.

Current state:
- Fully operational card editor with inline audio recording.

## 16. Pinia Migration for Global Feedback State

Problem:
- Module-level reactive refs (`useFeedback`) exhibited state leakage across Vitest test suites;
- Unscoped composable calls triggered `onScopeDispose` memory leak warnings in Vue.

Decision:
- **Pinia**: Adopted for cross-cutting application feedback (`useFeedbackStore`);
- Standardized `setActivePinia(createPinia())` in Vitest `beforeEach` hooks for total test isolation;
- Moved reactive instances outside template loops.

Current state:
- `useFeedbackStore` standard across the frontend codebase.

## 17. State Decoupling (Auth and Library Stores)

Problem:
- `App.vue` retained shared state for authentication and deck collections, complicating E2E and unit test setup.

Decision:
- **useAuthStore**: Encapsulates JWT tokens, user profiles, and storage persistence;
- **useLibraryStore** & **useDeckManagementStore**: Encapsulate deck queries, pagination, and inline CRUD;
- Components interact with Pinia stores directly without passing props through root views.

Current state:
- Significant codebase decoupling with 100% test pass rates.

## 18. Pinia Finalization and Codebase Hygiene

Problem:
- Iterative refactoring left unused variables, deprecated injects, unconsumed imports, and debug console logs.

Decision:
- Enabled strict TypeScript verification (`noUnusedLocals`, `noUnusedParameters`) via `vue-tsc`;
- Systematically removed dead imports, unused state declarations, and stray `console.log` statements.

Current state:
- 100% warning-free TypeScript compilation;
- Clean and optimized production Vite builds.

