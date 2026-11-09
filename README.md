# LearningFrame

> **Note:** This is the English documentation. For the Portuguese (Brazil) version, see [README-ptbr.md](README-ptbr.md).

LearningFrame is an academic MVP for study leveraging active recall,
spaced repetition, and interleaved practice.

The product allows visitors to study public decks without an account, preview
Anki `.apkg` files before saving them, and use an optional account to persist
decks, cards, media, reviews, and essential progress.

From a product horizon standpoint, LearningFrame can be understood as a free
learning support application offered by an educational institution. Real
institutional integration remains outside the scope of the MVP and is addressed
in the post-MVP roadmap.

## Version Status

Current status (v0.2.0):

- Functional, validated application with new advanced capabilities;
- Advanced Card Editor (WYSIWYG with TipTap);
- Native audio recording via microphone;
- Complete User Profile management with secure password changes;
- Global state management migrated to **Pinia**;
- Refactored login flow with root redirection;
- Manual QA finalized and test suites maintained.

## Tech Stack

- Java 21, Spring Boot 4.0.x, and Maven
- MySQL 8.4 LTS
- Vue 3, Vite, TypeScript, and Vue Router
- Playwright for end-to-end tests
- Docker Compose for local execution and E2E

## Running with Docker Compose

```powershell
docker compose up --build
```

Then open:

- Frontend: http://localhost:8080
- Backend API: http://localhost:8081
- Local MySQL: localhost:3307

## Local Development

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Validation & Tests

At the repository root:

```powershell
npm test
npm run build
npm run e2e
```

Backend tests via Maven container:

```powershell
docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test
```

Note: The command above uses the current local project path. In another
environment, adjust the absolute path mounted to `/workspace`.

## E2E Testing Environment

The E2E suite uses a dedicated Compose file:

```powershell
npm run e2e
```

This command:

- spins up `db-e2e`, `backend-e2e`, and `frontend-e2e`;
- uses a dedicated MySQL database: `learningframe_e2e`;
- uses dedicated ports, including frontend `18080`, backend `18081`, and MySQL `3317`;
- executes Playwright in Chromium;
- tears down the environment with `docker compose down -v`, removing the E2E database volume.

Important rules:

- E2E tests must never use the development database;
- Test reset/seed requests go through the internal endpoint `POST /api/e2e/reset`;
- The reset endpoint only exists in the `e2e` backend profile and requires `X-E2E-Token`.

Helper commands for debugging:

```powershell
npm run e2e:up
npm run e2e:test
npm run e2e:down
```

## MVP Scope

Included:

- Public library with anonymous study;
- Optional account with sign up / log in;
- Creation, editing, deletion, and selection of personal decks;
- Paginated card management;
- Media upload and rendering in persisted decks;
- Basic `.apkg` import with preview before saving;
- Deck-specific study and interleaved practice;
- LearningFrame's own simplified SRS;
- Essential progress tracking for authenticated users;
- Real routes with authentication guards;
- Initial E2E suite with a dedicated database.

Outside immediate MVP scope:

- Complete replication of Anki;
- Advanced cloze deletions;
- Complex Anki card templates;
- Preserving original Anki scheduling history or settings;
- `.colpkg` collections;
- Bookmarks/favorites, marketplace, or multi-user collaboration;
- Advanced statistics dashboard;
- External cloud storage for media.

## Technical Limits and Decisions

- `.apkg` files are used for basic interoperability, but LearningFrame initiates
  its own review schedule.
- Anonymous APKG preview is temporary. Upon navigating away from the import route,
  the file, preview, media index, and object URLs must be cleaned up, except during
  the explicit sign-in-to-save flow.
- Persisted media is stored as BLOBs in MySQL. While acceptable for an academic
  MVP, this is not the recommended architecture for high scale.
- Session tokens are stored in `localStorage`, acceptable for local MVP
  demonstration, but would require hardening for sensitive production use.
- Private media may pass tokens in query strings for `<img>`/`audio` rendering, a
  pragmatic MVP decision to be revisited in production.

## Project Documentation

Application Guides:

- [Principles and Standards](docs/principles-and-standards.md)
- [User Guide](docs/user-guide.md)
- [Anki/APKG Integration Guide](docs/anki-apkg-guide.md)
- [Local Execution Guide](docs/local-execution-guide.md)
- [Post-MVP Professionalization Roadmap](docs/post-mvp-professionalization-roadmap.md)
- [Logbook](docs/logbook.md)

Historical Context and Assisted Development:

- [AI Context README](docs/ai_context/README.md)
- [Timeline](docs/ai_context/timeline.md)
- [Decision Log](docs/ai_context/decision-log.md)
- [Historical Architecture and Decisions](docs/ai_context/architecture-and-decisions/)

