# Planning and Decisions Timeline

This timeline maps the planning documents, prompts, and architectural decision
records of LearningFrame. It acts as an index to navigate development history
without confusing early working plans with the current state.

For the current canonical state, consult:
- [MVP Principles and Standards](../principles-and-standards.md);
- [Post-MVP Professionalization Roadmap](../post-mvp-professionalization-roadmap.md);
- [Decision Log](decision-log.md).

## 1. Summary Overview

| Date | Phase | Branch / Artifact | Key Milestone | Outcome |
| --- | --- | --- | --- | --- |
| 2026-05-30 | Initial Snapshot | Initial Snapshot | Baseline snapshot of initial MVP state | Project historical baseline |
| 2026-05-31 | Consolidated Logbook | [Logbook](../logbook.md) | Initial project narrative and scope boundaries | Logbook became the primary historical narrative |
| 2026-06-02 | Pre-Finalization | [Pre-Completion Considerations](architecture-and-decisions/pre-completion-considerations.md) | Assessment of remaining MVP gaps | Prioritized routing, E2E, study polish, QA, and docs |
| 2026-06-02 | Decks UX | [Decks UX Architecture](architecture-and-decisions/decks-ux-architecture.md) | Contextual management and card overlay | Library evolved into the primary management surface |
| 2026-06-02 to 2026-06-07 | Frontend Architecture | [Routing and Lifecycle](architecture-and-decisions/frontend-architecture-routing-lifecycle.md) | Planning dedicated routing, visual views, and lifecycle | Foundation for incremental refactoring |
| 2026-06-07 | Milestone 8 | E2E Testing Plan | Dedicated Docker Compose and database for E2E | Initial Playwright test suite established |
| 2026-06-07 | Stabilization | Stabilization Brief | Transition to MVP finalization | Short-lived stabilization branch strategy |
| 2026-06-07 | Vitest Audit | Vitest Audit Brief | Resolved Vitest vulnerability | Upgraded to `vitest@4.1.8` |
| 2026-06-07 | Risk E2E Flows | Risk E2E Flows Plan | Direct refresh, browser back/forward, batch deletion | E2E suite expanded from 9 to 14 tests |
| 2026-06-07 | Study Session Polish | Study Polish Plan | Session progress, immediate feedback, summary, typography | Study experience guided and streamlined |
| 2026-06-08 | Final Manual QA | Manual QA Plan | Final containerized QA execution | 18 out of 18 test scenarios passed |
| 2026-06-08 | Final Documentation | Final Documentation Plan | Guides finalized and documentation reorganized | Clear separation between active guides and historical context |
| 2026-06-08 | Post-MVP Roadmap | [Post-MVP Roadmap](../post-mvp-professionalization-roadmap.md) | Institutional context, interleaved practice, professionalization | Foundation for subsequent evolutions |
| 2026-06-08 | Post-MVP Refactor | App.vue Slice 1 | First slice reducing composition root | Pure helpers and `useDeckManagement` extracted |
| 2026-06-08 | Post-MVP Refactor | App.vue Slice 2 | Second slice reducing composition root | `useStatsSummary`, `useAppNavigation`, `useRouteLifecycle`, and `useStudySession` base extracted |
| 2026-06-08 | Post-MVP Refactor | App.vue Slice 3 | Third slice reducing composition root | `useApkgImport` extracted preview, persistence, and cleanup |
| 2026-06-09 | Post-MVP Refactor | App.vue Polish | Timers, debounce, and local cleanup | Manual timers eliminated from `App.vue`; highlights gained rAF/timeout cleanup |
| 2026-06-09 | Post-MVP Refactor | Deck Creation Flow | Deck creation extraction | `useCreateDeckFlow` encapsulated form state and persistence |
| 2026-06-09 | Post-MVP Refactor | Study Flow | Study extraction | `useStudySession` encapsulated loading, caching, review, and interleaving |

## 2. Frontend Architectural Sequence

The frontend architecture followed an incremental refactoring roadmap:

| Milestone | Intended Scope |
| --- | --- |
| Milestone 2 | Introduce Vue Router and authentication navigation guards |
| Milestone 3 | Extract application shell and top-level page views |
| Milestone 4 | Componentize Library and Import workflows |
| Milestone 4b | Extract card editor overlay |
| Milestone 5 | Extract infrastructure composables |
| Milestone 6 | Extract domain composables |
| Milestone 7 | Consolidate production routing and view lifecycles |
| Milestone 8 | Establish dedicated E2E environment with isolated database |

Current architecture outcome:
- Real routes and guards in place;
- Visual view components extracted;
- Route adapters connect the router with application context;
- `App.vue` coordinates shared workflows;
- Heavy import and study states follow strict lifecycle cleanup policies.

## 3. Post-MVP Evolution

| Branch | Primary Artifact | Key Outcome |
| --- | --- | --- |
| `feature/profile-management` | Profile Management Plan | Complete user profile management (data updates and account deletion) |
| `feature/card-editor-wysiwyg` | [Logbook](../logbook.md) | Rich text editor powered by Tiptap and native microphone audio recording |
| `refactor/app-vue-architecture` | [Decision Log](decision-log.md) | Global feedback state migrated to Pinia (`useFeedbackStore`), isolated in Vitest with memory leak fix (`onScopeDispose`) |

## 4. Maintenance Guidelines

When opening a relevant new branch:
1. Add the branch and outcome to the timeline table.
2. Link the primary specification or architectural plan.
3. If the change alters an active principle, update:
   - [MVP Principles and Standards](../principles-and-standards.md);
   - [Decision Log](decision-log.md).

