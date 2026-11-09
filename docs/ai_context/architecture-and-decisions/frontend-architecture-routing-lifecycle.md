# Architecture Plan: Routing, Componentization, and Frontend Lifecycle

**Status:** Historical reference; completed across the `frontend-refactor` initiative.
**Planning Branch:** `codex/frontend-routing-lifecycle-plan`
**Integration Branch:** `frontend-refactor`
**Context:** Following the merge of the library management milestone, `App.vue` accumulated
navigation, state, business workflows, views, and overlays. While functional, the cognitive load
and regression risk grew too large for late MVP phases.

## 1. Objectives

This architectural roadmap guided an incremental, traceable, low-risk refactoring effort.

Primary objectives:
- Transition from implicit state/tab-based navigation to real, URL-addressable routes;
- Componentize the frontend without breaking existing user workflows;
- Separate permanent application state, view-scoped state, and heavy ephemeral data;
- Reduce the footprint and coordination burden of `App.vue`;
- Protect validated MVP behavior throughout structural refactoring;
- Define specific backend endpoint adjustments needed to support direct route access.

Non-goals:
- Wholesale rewrite of the frontend;
- Adopting microfrontends;
- Overly nested or complex routing hierarchies;
- Shifting all state into a global store prematurely;
- Reversioning the entire API to `/api/v1` for purely aesthetic reasons;
- Modifying core study, import, or deck management rules during structural refactoring.

## 2. Baseline Diagnosis

### 2.1 Frontend

Initially, the application lacked `vue-router`, controlling navigation via local variables:
- `tab`: `library`, `study`, `import`, `create`, `progress`, `auth`;
- `librarySection`: `public`, `mine`;
- `libraryView`: `decks`, `manage-deck`.

Templates used `v-if` toggles to unmount inactive DOM trees. While reducing active DOM nodes,
reactive data remained in memory at the top of `App.vue`.

Consequences:
- Page refresh always reset users to the home tab;
- No shareable or bookmarkable URLs existed;
- Browser forward/back buttons did not reflect internal navigation;
- The sidebar lacked genuine hyperlinks;
- Views, state, and side effects were co-located in a single monolithic component;
- Reclaiming memory from offscreen data required manual cleanup routines.

### 2.2 Backend

The backend maintained a structured domain controller layout:
- Authentication: `/api/auth`;
- Decks and Cards: `/api/decks`;
- Deck Media: `/api/decks/{deckId}/media`;
- Study: `/api/study`;
- Analytics / Stats: `/api/stats`;
- APKG Preview & Import: `/api/import/apkg/preview` and `/api/decks/import/apkg`.

The primary obstacle for direct route navigation was:
- `GET /api/decks/{deckId}` returned full `DeckDetail`, including all cards.

This conflicted with the requirement to avoid loading all cards at once when managing
a deck. Direct deck management routes required a lightweight metadata endpoint.

## 3. Navigation and State Taxonomy

### 3.1 What Should Be a Route

A route should represent a distinct conceptual space where refreshing the page makes sense,
or where navigating creates a logical history entry.

Core MVP routes:
- Public deck library;
- User deck library;
- Deck management view;
- Study landing / empty state;
- Focused study session per deck;
- Interleaved practice study session;
- APKG import;
- Deck creation;
- Progress dashboard;
- Login;
- Registration.

### 3.2 What Should Remain View-Level State

Internal states that do not warrant independent routes in the MVP:
- Current pagination page loaded via "Load More";
- Search queries (unless synchronized via query string);
- Active card preview in management view;
- Multi-select checkbox states;
- Card editor overlay toggle;
- Front/back face toggle in APKG preview;
- Active card index in APKG preview;
- Floating notifications / toasts;
- Application theme toggle;
- Collapsible sidebar state.

### 3.3 Heavy Ephemeral State Requiring Explicit Lifecycle Cleanup

States requiring deterministic teardown policies:
- Selected `.apkg` File handles;
- Parsed APKG card preview arrays;
- Local media indexes holding raw `ArrayBuffer` data;
- Ephemeral blob object URLs created for images and audio previews;
- Active study review queues;
- Anonymous public deck study cache;
- Managed cards cached in memory;
- Search debounce timers;
- In-flight fetch / pagination requests.

## 4. Proposed Route Map

### 4.1 Primary Routes

```txt
/                              -> redirect to /library/public
/library/public
/library/mine
/library/mine/:deckId/manage
/study
/study/deck/:deckId
/study/interleaved
/import
/create
/progress
/login
/register
```

### 4.2 Authentication Rules

Public routes:
- `/`;
- `/library/public`;
- `/study`;
- `/study/deck/:deckId` (when deck visibility is public);
- `/import` (for anonymous preview);
- `/login`;
- `/register`.

Authenticated routes:
- `/library/mine`;
- `/library/mine/:deckId/manage`;
- `/create`;
- `/progress`.

Redirect behavior:
- Anonymous access to a protected route redirects to `/login?redirect=<target-path>`;
- Upon successful login, navigation returns to `redirect` if present;
- Defaults to `/library/mine` or `/library/public` when no redirect is present.

## 5. Workflow Transitions and Memory Policies

### 5.1 Library and Decks
- Retain paginated lists while the library module is mounted;
- Clear or replace lists when search queries change;
- Avoid loading full card collections during metadata inspections.

### 5.2 Deck Management
- Clean up `managedDeck`, `managedCards`, selections, and editor state upon leaving the route;
- Confirm navigation if unsaved changes exist in deck metadata or card editor forms;
- Abort previous search queries when input parameters change.

### 5.3 APKG Import
- Clear the selected file, parsed preview, media index, and object URLs upon navigating away;
- Preserve import state only when redirecting to authentication via the explicit "Sign in to save" action;
- Discard all temporary import assets immediately upon successful persistence.

### 5.4 Study Sessions
- Discard `studyQueue` upon exiting `/study/*` in the baseline MVP;
- Cap anonymous public deck caching with LRU limits;
- Revoke study media URLs upon completion.

## 6. Component Architecture

```txt
frontend/src/
  router/
    index.ts
  layouts/
    AppShell.vue
  pages/
    LibraryPage.vue
    StudyPage.vue
    ImportPage.vue
    CreateDeckPage.vue
    ProgressPage.vue
    AuthPage.vue
  features/
    library/
      PublicDeckList.vue
      MyDeckList.vue
      DeckCard.vue
      DeckManagementPage.vue
      CardEditorOverlay.vue
      useDeckLibrary.ts
      useDeckManagement.ts
    import/
      ApkgImportPage.vue
      useApkgImport.ts
    study/
      StudySessionPage.vue
      useStudySession.ts
  services/
    api.ts
```

## 7. Refactoring Sequence

The architectural overhaul was executed via dedicated phases:
1. Architectural planning and route specification;
2. Lightweight backend metadata contracts (`GET /api/decks/{deckId}/metadata`);
3. Vue Router setup and navigation guards;
4. Extraction of application shell and top-level pages;
5. Library and management module componentization;
6. Import and Study session componentization;
7. Domain composables extraction;
8. Memory lifecycle cleanup routines;
9. Dedicated end-to-end test suite (`docker-compose.e2e.yml`).

## 8. Acceptance Criteria

- All core views load directly via address bar URLs;
- Browser navigation buttons (back/forward) navigate predictably;
- Ephemeral import assets and object URLs clean up upon view unmount;
- Existing test suites and dedicated E2E suites pass with zero regressions;
- Local containerized deployment remains functional on `http://localhost:8080`.

