# Post-MVP Professionalization Roadmap

Date: 2026-06-08
Originating branch: `codex/post-mvp-context-roadmap`

This document consolidates the product context and development tracks following
the academic MVP of LearningFrame. It bridges the validated MVP and a prospective
production-ready release suitable for broader adoption.

## 1. Product Context

LearningFrame is conceived as a free learning support application offered by an
educational institution for students.

The current MVP demonstrates the core student experience:
- Initial access without an account;
- Study of public decks;
- Optional account to persist decks, reviews, media, and progress;
- Active recall;
- Spaced repetition;
- Interleaved practice;
- Baseline interoperability with Anki via `.apkg`.

This institutional context strengthens the academic framing by positioning the
product as an educational support instrument rather than just a personal flashcard app.

## 2. Institutional Scope Decisions

The MVP does not integrate directly with live university management systems.

Within the MVP scope, the institution serves as the sponsor, context, or provider
of the tool. Real integration with institutional systems belongs to future phases,
as it requires institutional SSO, cohorts, courses, subjects, roles, content
governance, and strict privacy controls.

Current decision:
- Maintain the MVP as a self-contained, functional local demonstration;
- Treat deep institutional integration as a roadmap priority;
- Do not reopen the MVP to add SSO, student rosters, courses, or background sync;
- Document that the Public Library represents institutional curated content in
  the demonstration scenario.

## 3. Interleaved Practice

Interleaved practice is one of the three pedagogical foundations of LearningFrame.
Consequently, it warrants more rigorous scrutiny than standard product polish.

### 3.1 Current State

On the backend, the study endpoint already accepts `deckIds`:

```txt
GET /api/study/due?mode=MIXED_DUE&deckIds=1&deckIds=2
```

When `deckIds` is omitted, the backend fetches due cards across all decks
accessible to the authenticated user:
- Public decks;
- The user's personal decks.

Initial ordering evaluates:
- Due cards before new cards;
- `dueAt`;
- Deck update timestamps;
- Card creation timestamps.

Subsequently, the backend applies a round-robin mix across decks: picking one
card from the first deck, one from the second, and so on until the limit is reached.

On the authenticated frontend, interleaved practice currently invokes:

```txt
GET /api/study/due?mode=MIXED_DUE
```

In other words:
- The user does not select which decks to interleave;
- `deckIds` support exists in the backend, but is not yet exposed in the client UI;
- There is no explicit study slice selection.

In anonymous study, the frontend applies a simple local heuristic:
- Loads public decks;
- Considers up to four loaded public decks;
- Shuffles eligible cards locally.

### 3.2 Known Limitations

The current logic does not analyze variability in tags, topics, academic subjects,
or semantic similarity between cards.

It delivers a baseline deck-level interleaved practice, sufficient to demonstrate
the concept in the MVP, but distinct from a deeply nuanced pedagogical engine.

### 3.3 Classification

Deck selection for interleaved practice:
- Classification: Strong candidate for MVP or MVP+ polish;
- Rationale: Interleaved practice is central to the pedagogical narrative;
- Risk: Without deck selection, the user lacks control over their study slice;
- Recommendation: Implement in a focused branch if reinforcing the academic
  defense is desired.

Tag-level interleaving or advanced pedagogical heuristics:
- Classification: Post-MVP;
- Rationale: Requires diversity metrics, heuristic modeling, schema adjustments,
  and extensive testing;
- Recommendation: Document as a future evolution, not an urgent MVP patch.

### 3.4 Proposed Scope for Deck Selection

Suggested branch:

```txt
codex/mvp-interleaved-deck-selection
```

Initial scope:
- Allow selecting specific decks before starting interleaved practice;
- Reuse existing backend support for `deckIds`;
- Update `frontend/src/services/api.ts` to submit multiple `deckIds`;
- Choose a clean, simple UI surface, ideally in the Library or at the entry of the Study view;
- Preserve the existing round-robin interleaving logic;
- Defer tag-based interleaving.

Acceptance criteria:
- Authenticated users can choose two or more accessible decks and start an
  interleaved session restricted to that selection;
- If no decks are selected, global behavior remains available or becomes an explicit option;
- Clear messaging is displayed when no due cards exist in the chosen selection;
- E2E coverage for starting interleaved practice with selected decks;
- Backend tests covering `MIXED_DUE` with `deckIds`;
- Documentation updated to explain round-robin deck interleaving boundaries.

Product considerations prior to implementation:
- Should selection include only `My Decks`, only public decks, or both?
- Can anonymously studied public decks be selected for anonymous interleaving?
- Should selection reside in the Library, Study view, or a dedicated configuration modal?
- Should the `/study/interleaved` route preserve `deckIds` in query parameters for
  clean refresh and browser history?

## 4. Institutional Integration

Integration with educational enterprise systems should be handled as an
independent product initiative.

Evolution path:

1. Manually curated institutional content
   - Public decks represent official or faculty-recommended materials;
   - No direct technical integration with external databases.

2. Institutional roles
   - Student;
   - Instructor / content creator;
   - Institution administrator;
   - Governance workflows for approving official decks.

3. Academic taxonomy
   - Degree programs;
   - Departments and courses;
   - Student cohorts / classes;
   - Academic terms and semesters;
   - Grouping decks by curricular requirements.

4. Institutional authentication
   - Enterprise SSO (SAML, OAuth2/OIDC);
   - Student ID binding;
   - Stricter session and governance policies.

5. Data synchronization
   - Roster synchronization (students, classes, courses);
   - Assigning curricular content to classes;
   - Incremental sync jobs;
   - Comprehensive audit logging.

6. Generic integration interface
   - Standard API contracts for higher ed integration;
   - Pluggable LMS adapters (Canvas, Moodle, Blackboard);
   - Configurable mapping for courses and student enrollments;
   - Multi-tenant tenant isolation.

7. Institutional reporting
   - Aggregated study engagement metrics;
   - Cohort performance trends without invading individual privacy;
   - Strict adherence to data privacy regulations (GDPR/LGPD/FERPA).

## 5. Technical Debt for Production Readiness

The items below do not block the academic MVP, but should be addressed prior to
wide-scale or sensitive deployment.

### 5.1 Security and Privacy

- Replace or harden token storage in `localStorage`;
- Revisit query-string tokens for private media rendering;
- Formalize session expiration, refresh token rotations, and revocation policies;
- Review CORS configuration for production environments;
- Document personal data retention and privacy policies;
- Conduct formal compliance reviews (LGPD/GDPR/FERPA).

### 5.2 Observability and Operations

- Add structured JSON logging on the backend;
- Sanitize error responses to avoid leaking implementation details to clients;
- Implement distributed request tracing / correlation IDs;
- Configure production health and readiness probes;
- Establish monitoring dashboards and alerts.

### 5.3 Quality Assurance and CI

- Add automated frontend linting (ESLint);
- Add Java formatting/linting (Spotless or Checkstyle);
- Create unified quality check scripts;
- Block `console.*`, `debugger`, `System.out`, and `printStackTrace` in core code;
- Run frontend, backend, and E2E suites on every pull request via CI;
- Expand multi-browser coverage (Firefox, WebKit) for end-user releases.

### 5.4 Frontend Architecture

- Gradually diminish the central coordination burden on `App.vue`;
- Extract domain workflows into small, focused composables;
- Maintain prop/event contracts on visual views;
- Organize global CSS into modular architecture (tokens, resets, layouts, components).

### 5.5 Media and Import Pipeline

- Migrate media storage from database BLOBs to cloud object storage (S3, GCS, MinIO);
- Retain relational metadata in MySQL;
- Introduce asynchronous job queues (e.g. RabbitMQ, Redis, Celery) for heavy APKG processing;
- Provide real-time import progress via SSE or WebSockets;
- Configure environment-specific upload size thresholds.

### 5.6 Pedagogical Engine

- Document the existing simplified SRS heuristic;
- Prevent unintentional modifications to the scheduling algorithm without regression tests;
- Advance interleaved practice to consider richer pedagogical dimensions when formal models are established;
- Incorporate tags, subject areas, and historical error rates in later stages.

## 6. Recommended Roadmap Phases

### Phase 0 - Deliberate MVP Completion

Objective:
- Preserve the MVP as a complete, defensible academic delivery;
- Document institutional context and explicit boundaries;
- Evaluate whether deck selection for interleaved practice belongs in an MVP+ polish branch.

### Phase 1 - Technical Hardening

Objective:
- Establish a resilient foundation for continuous engineering.

Focus areas:
- Quality gates and CI automation;
- Structured logging and observability;
- Authentication hardening and secure cookie sessions;
- Operational runbooks;
- Frontend decoupling.

### Phase 2 - Initial Institutional Product

Objective:
- Make the institutional presence explicit without requiring complex third-party system links.

Focus areas:
- Official and faculty-curated decks;
- Teacher/author profiles;
- Organization by academic course;
- Deck review and approval workflows;
- Basic aggregated learning analytics.

### Phase 3 - Live Institutional Integration

Objective:
- Connect LearningFrame to real institutional IT systems.

Focus areas:
- Institutional SSO;
- Roster and course synchronization;
- LMS integration hooks;
- Multi-tenancy and data isolation;
- Audit trails and compliance reporting.

### Phase 4 - Expanded Learning Platform

Objective:
- Transition from institutional utility to an enterprise learning platform.

Focus areas:
- Institutional resource catalog;
- Rich card authoring;
- Semantic search;
- AI-assisted study recommendations;
- Advanced cognitive and learning analytics.

## 7. Production Release Criteria

Before broader organizational release, the application must feature:
- Hardened authentication and secure session tokens;
- Formal privacy policy and data retention rules;
- Production logging, metrics, and health checks;
- Automated CI pipeline with test verification;
- Repeatable containerized deployment configurations;
- Scalable object storage for media files;
- Verified and automated database migrations;
- End-to-end regression test coverage;
- Administrator runbooks;
- Support and maintenance SLAs;
- Accessibility compliance audit;
- Institutional content curation and publishing policies.

## 8. Principles for Future Evolution

Every proposed enhancement must answer:
1. What concrete problem does it solve?
2. Does it belong to MVP, MVP+, or post-MVP professionalization?
3. What risks does it mitigate or introduce?
4. What tests validate the implementation?
5. What documentation requires updating?

This standard prevents feature creep and preserves the core project narrative:
a free, institutional, defensible tool designed to support structured learning.

