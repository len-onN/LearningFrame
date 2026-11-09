# Test Coverage Analysis (Frontend, Backend, and E2E)

This document provides a detailed assessment of the application's automated
testing architecture, highlighting existing coverage strengths and areas for
future improvement.

---

## 1. Frontend (Unit & Integration via Vitest)

Currently: **107 passing tests** across **21 files**.

**✅ Strengths (Well Covered):**
- **Business Rules and State Logic**: Critical composables and facades (`useDeckLibrary`, `useDeckManagement`, `useStudySession`, `useApkgImport`, `useAuthFlow`) have strong behavioral coverage (API interactions, state transitions, pagination logic).
- **Pure Utilities**: Core algorithms such as `srs.ts` (Spaced Repetition), HTML sanitizers (`html.ts`), and media parsing utilities (`apkgMedia.ts`) are rigorously verified.

**⚠️ Areas for Enhancement:**
- **Component Unit Tests (Vue Test Utils / Testing Library)**: Existing tests concentrate on TypeScript logic (composables and stores) with limited mounting of Vue SFC components directly (e.g., `CardEditorOverlay.vue`, `StudyPage.vue`). Testing template interactions, reactive DOM updates, event emissions (`@click`), and template directives (`v-if`, `v-for`) would strengthen UI reliability.
- **Form Error Integration**: Ensure client-side form validation states and inline feedback correctly render in the DOM upon user interaction.

## 2. Backend (Unit & Integration via JUnit / Mockito)

Currently: **7 test classes** in the backend (e.g., `DeckServiceTest`, `SpacedRepetitionServiceTest`, `ApkgImportServiceTest`).

**✅ Strengths (Well Covered):**
- **Core Domain**: Heavy application logic, including the scheduling algorithm in `SpacedRepetitionService`, archive extraction in `ApkgImportService`, and authorization logic in `DeckService`, has isolated tests verifying business rules.

**⚠️ Areas for Enhancement:**
- **Repository Layer (`@DataJpaTest`)**: Custom Spring Data JPA queries (`@Query`) can harbor dialect-specific issues or N+1 queries. Adding transactional repository tests against an embedded database or Testcontainers ensures query safety.
- **Controller Tests (`@WebMvcTest`)**: Adding web layer integration tests verifies HTTP contracts: rejecting unauthenticated requests (401/403) missing valid JWTs, and validating DTO `@Valid` constraints (required fields, password entropy) returning 400 Bad Request.
- **Authentication Controller**: The JWT issuance and validation pipeline is central to security and warrants dedicated integration coverage.

## 3. End-to-End (E2E via Playwright)

Currently: **14 tests** passing across **7 specification files**.

**✅ Strengths (Well Covered):**
- **Happy Paths**: Core user journeys (Login, Deck Creation, Authenticated Study, Public Library, and APKG Import) are validated against a dedicated test database container.
- **Risk Mitigation**: High-risk state scenarios, such as batch deletion and browser back/forward navigation, have targeted coverage (`routing-risk.spec.ts`, `deck-risk-flows.spec.ts`).

**⚠️ Areas for Enhancement:**
- **Negative Flows & Error Handling**: Intercept network requests using `page.route()` to verify UI resilience and user feedback when backend endpoints return 500 or timeout.
- **Mobile Viewport Emulation**: Playwright supports running the suite across mobile viewports. Adding mobile device profiles to `playwright.config.ts` ensures drawer menus and overlays render smoothly on compact screens.
- **Profile Management Flows**: Account settings, password changes, and account deletion should have end-to-end automated scenarios.

---

## Strategic Focus Areas

1. **Frontend**: Introduce **Vue Component Tests (VTU)** to validate rich interfaces (e.g., Card Editor, Study View).
2. **Backend**: Add **Security and Controller Integration Tests**, validating API request validation and authorization gates.
3. **E2E**: Add **Resilience Testing (Network Fault Injection)** and mobile device viewport emulation.

