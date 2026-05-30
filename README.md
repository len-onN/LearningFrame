# LearningFrame

LearningFrame is an academic MVP for active recall, spaced repetition, and interleaved practice. It lets visitors study public decks without logging in, import Anki `.apkg` decks locally, and use a lightweight authenticated mode to persist decks, reviews, and progress.

## Stack

- Java 21, Spring Boot 4.0.x, Maven
- MySQL 8.4 LTS
- Vue 3, Vite, TypeScript
- Docker Compose

## Run

```powershell
docker compose up --build
```

Then open:

- Frontend: http://localhost:8080
- Backend API: http://localhost:8081

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

## MVP Boundaries

- `.apkg` import reads basic packaged decks and starts a new LearningFrame review schedule.
- Complex Anki templates, cloze behavior, original scheduling history, and `.colpkg` imports are out of scope.
- Anonymous users can study public decks and import decks in browser memory/local storage.
- Logged-in users can persist decks, reviews, publication state, and essential progress statistics.
