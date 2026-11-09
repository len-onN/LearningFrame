# MVP Principles and Standards

This document records the current normative state of LearningFrame for future
branches. It summarizes decisions that must be preserved as the product evolves
beyond the MVP.

When in doubt between an earlier plan and this document, follow this document
and consult the [decision log](ai_context/decision-log.md) to understand the
background of the decision.

## 1. Product Vision

LearningFrame is an academic MVP for study leveraging:
- active recall;
- spaced repetition;
- interleaved practice.

The objective is to demonstrate a functional, explainable, and defensible
application, not to build a full-scale learning management platform.

As product context, LearningFrame can be framed as a free learning support
application offered by an educational institution. Real integration with
institutional systems is outside the MVP scope and is tracked in the
[Post-MVP Professionalization Roadmap](post-mvp-professionalization-roadmap.md).

## 2. Current Scope

Included:
- anonymous study of public decks;
- optional user accounts;
- authenticated persistence of decks, cards, media, reviews, and progress;
- deck and card management;
- basic APKG import;
- deck-based study;
- interleaved practice;
- essential progress tracking;
- dedicated E2E environment;
- approved final manual QA;
- profile management (updating personal information and account deletion).

Outside MVP:
- full Anki clone;
- `.colpkg` support;
- advanced cloze deletions;
- complex card templates;
- original Anki review history and scheduler;
- marketplace;
- bookmarks/favorites;
- advanced filters;
- full-text search;
- advanced analytics dashboard;
- password recovery;
- external cloud media storage;
- text-to-speech.

## 3. Product Principles

- Trying out the product must be possible without an account.
- Persisting knowledge and progress requires an account.
- The Library must contain ready-to-study decks, not temporary drafts.
- APKG import must be explicit and honest about its boundaries.
- Study sessions must prioritize focus, clarity, and low cognitive friction.
- Future features must respect the academic narrative of the MVP.

## 4. UX Principles

- Favor simple, operational user interfaces.
- Avoid promotional or marketing screens inside the core app.
- Keep the Library as the main entry point.
- Keep `My Decks` as the user management hub.
- Keep study as a guided session rather than an analytical dashboard.
- Use concise messages placed close to actions.
- Avoid advanced controls until a clear need arises.

## 5. Frontend Standards

Stack:
- Vue 3;
- Vite;
- TypeScript;
- Vue Router.

Current patterns:
- primary pages live in `frontend/src/pages`;
- route adapters live in `frontend/src/routes`;
- visual components should be controlled via props/events;
- `App.vue` acts as the coordinator of shared workflow states;
- global state management is centralized where needed (e.g. Pinia for feedback);
- favor local composables whenever they reduce actual complexity;
- ensure heavy states are torn down and cleaned up when leaving routes;
- ensure card HTML passes through existing sanitization routines.

When evolving:
- do not convert visual views into owners of transversal state without an
  explicit architectural decision;
- avoid introducing stores purely for aesthetic reasons;
- do not reopen broad refactoring near release deadlines without a detailed plan
  and validation.

## 6. Backend Standards

Stack:
- Java 21;
- Spring Boot 4.0.x;
- Maven;
- MySQL 8.4 LTS;
- Flyway;
- JPA.

Current patterns:
- clean, straightforward REST API;
- ownership validated on private operations;
- explicit DTOs for core API contracts;
- pagination for potentially large collections;
- media stored as BLOBs in MySQL for the MVP;
- E2E reset endpoint present only under the `e2e` profile;
- simplified, self-contained scheduler/SRS algorithm.

When evolving:
- new backend capabilities must respond to verified requirements;
- do not alter the scheduler/SRS algorithm without tests and documented decisions;
- keep upload limits and input sanitization under active review;
- media migration to external object storage is slated for post-MVP.

## 7. APKG and Anki

Current rules:
- `.apkg` serves as a baseline interoperability format;
- preview is anonymous and temporary;
- saving an APKG requires authentication;
- the `sign in to save` flow deliberately preserves the active preview;
- navigating away from import cleans up the file, preview, media index, and object URLs;
- upon saving, LearningFrame initiates its own internal review schedule.

Outside current support:
- `.colpkg` archives;
- advanced cloze deletions;
- complex templates;
- original Anki scheduling;
- review history;
- custom add-ons.

## 8. Study and SRS

Current rules:
- evaluation ratings are `AGAIN`, `HARD`, `GOOD`, `EASY`;
- authenticated study persists reviews on the backend;
- anonymous study relies on local browser state;
- interleaved practice exists as a simple flow per deck;
- study sessions display progress, immediate feedback, and a completion summary;
- font controls and media adjustments are local to the study interface.

When evolving:
- do not modify the review algorithm as a side effect of UI changes;
- treat multi-deck selection for interleaved practice as a prime candidate for
  an MVP+ revision;
- treat tag/topic variability as post-MVP with dedicated architectural decisions
  and test coverage;
- session configurators, study goals, pause/resume, and dashboards remain post-MVP;
- preserve basic accessibility of study controls.

## 9. E2E and Validation

Critical rule:
- E2E tests must never use the development database.

E2E Environment:
- Compose project: `learningframe-e2e`;
- Database: `learningframe_e2e`;
- Service: `db-e2e`;
- MySQL host port: `3317`;
- Frontend port: `18080`;
- Backend port: `18081`;
- Teardown: `docker compose down -v`.

Expected validations:
- documentation changes: `git diff --check` and manual review;
- frontend: `npm test` and `npm run build`;
- integrated flows: `npm run e2e`;
- backend: Maven container tests whenever backend files change.

## 10. Documentation

Current canonical documentation:
- [MVP User Guide](user-guide.md);
- [Anki/APKG Integration Guide](anki-apkg-guide.md);
- [Local Execution Guide](local-execution-guide.md);
- [Post-MVP Professionalization Roadmap](post-mvp-professionalization-roadmap.md);
- [Logbook](logbook.md).

Historical and AI Context:
- [AI Context README](ai_context/README.md);
- [Timeline](ai_context/timeline.md);
- [Decision Log](ai_context/decision-log.md);
- [Historical Architecture and Decisions](ai_context/architecture-and-decisions/).

When opening a new initiative:
1. If the change alters an existing principle, update this document.
2. If the change alters a significant decision, update the
   [decision log](ai_context/decision-log.md).
3. If the initiative requires structured planning, record it under the
   appropriate context directory.

