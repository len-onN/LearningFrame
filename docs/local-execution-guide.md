# MVP Local Execution Guide

This guide explains how to run LearningFrame using Docker Compose as well as
in direct backend/frontend development mode.

## 1. Prerequisites

Key requirements:
- Docker and Docker Compose;
- Node.js compatible with the frontend;
- npm;
- Java 21;
- Maven, when running the backend outside a container.

For the simplest workflow, Docker Compose is sufficient.

In a clean environment, install local frontend dependencies before running tests
or the Vite development server:

```powershell
cd frontend
npm install
cd ..
```

## 2. Main Execution with Docker Compose

At the repository root:

```powershell
docker compose up --build
```

Services:
- Frontend: `http://localhost:8080`;
- Backend: `http://localhost:8081`;
- MySQL: `localhost:3307`;
- Database: `learningframe`.

Quick health checks:

```powershell
Invoke-WebRequest http://127.0.0.1:8080/
Invoke-WebRequest http://127.0.0.1:8081/api/decks/public
```

To run in the background:

```powershell
docker compose up -d --build
```

To stop:

```powershell
docker compose down
```

To stop and remove local database volumes:

```powershell
docker compose down -v
```

Use `down -v` with care, as it removes the persistent `mysql-data` volume.

## 3. Key Environment Variables

Compose uses development defaults, but supports `.env` configuration.

Base example:

```txt
DB_NAME=learningframe
DB_USER=learningframe
DB_PASSWORD=learningframe
MYSQL_ROOT_PASSWORD=learningframe_root
JWT_SECRET=change-this-dev-secret-at-least-32-chars
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

Relevant backend environment variables:
- `DB_HOST`;
- `DB_PORT`;
- `DB_NAME`;
- `DB_USER`;
- `DB_PASSWORD`;
- `JWT_SECRET`;
- `JWT_TTL_SECONDS`;
- `CORS_ALLOWED_ORIGINS`;
- `MAX_APKG_UPLOAD_SIZE`;
- `MAX_APKG_BYTES`.

## 4. Direct Local Execution

This mode is ideal for active local development.

### 4.1 Running Only the Database with Docker

At the root:

```powershell
docker compose up -d db
```

The database becomes available on the host at:

```txt
localhost:3307
```

### 4.2 Running the Backend with Maven

In a separate terminal:

```powershell
$env:DB_HOST='localhost'
$env:DB_PORT='3307'
$env:DB_NAME='learningframe'
$env:DB_USER='learningframe'
$env:DB_PASSWORD='learningframe'
$env:JWT_SECRET='change-this-dev-secret-at-least-32-chars'
$env:CORS_ALLOWED_ORIGINS='http://localhost:5173,http://127.0.0.1:5173'
cd backend
mvn spring-boot:run
```

Backend API:

```txt
http://localhost:8081
```

### 4.3 Running the Frontend with Vite

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite Frontend:

```txt
http://localhost:5173
```

The frontend uses `VITE_API_BASE_URL` when provided. Without this variable,
the default fallback points to:

```txt
http://127.0.0.1:8081
```

To specify it explicitly:

```powershell
$env:VITE_API_BASE_URL='http://127.0.0.1:8081'
npm run dev
```

## 5. Frontend Development Compose Override

A development override exists to rebuild the frontend `dist` in watch mode
inside a container:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This mode:
- Spins up the core environment;
- Mounts `./frontend/dist` directly into Nginx;
- Executes a `frontend-builder` service running `npm run build -- --watch`;
- Allows testing the containerized frontend at `http://localhost:8080`.

## 6. Testing and Validation

At the repository root:

```powershell
npm test
npm run build
npm run e2e
```

Meaning:
- `npm test`: Runs Vitest unit and component tests in the frontend;
- `npm run build`: Executes the production frontend build;
- `npm run e2e`: Starts the dedicated E2E environment, runs Playwright, and tears everything down.

Backend tests via Maven container:

```powershell
docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test
```

In other environments, adjust the absolute path before `:/workspace`.

If Playwright does not yet have local browser binaries installed, run inside `frontend`:

```powershell
npx playwright install chromium
```

## 7. Dedicated E2E Environment

E2E testing uses:
- Compose project: `learningframe-e2e`;
- Database: `learningframe_e2e`;
- MySQL service: `db-e2e`;
- Frontend: `http://localhost:18080`;
- Backend: `http://localhost:18081`;
- MySQL host port: `localhost:3317`;
- Internal reset endpoint: `POST /api/e2e/reset`;
- Reset authentication token: `X-E2E-Token`.

Main command:

```powershell
npm run e2e
```

This command:
1. Tears down any previous E2E environment with `down -v`;
2. Starts `db-e2e`, `backend-e2e`, and `frontend-e2e`;
3. Waits for backend and frontend health checks;
4. Runs Playwright tests on Chromium;
5. Cleans up the environment using `down -v --remove-orphans`.

Auxiliary commands:

```powershell
npm run e2e:up
npm run e2e:test
npm run e2e:down
```

Critical rule: E2E tests must never run against the development database.

## 8. Quick Troubleshooting

### Port Conflicts

Ports used in the main environment:
- `8080`;
- `8081`;
- `3307`.

Ports used in E2E:
- `18080`;
- `18081`;
- `3317`.

If a port is already bound, stop the conflicting process or update the port mappings in Compose.

### Database Has Stale Data

To reset the local development database:

```powershell
docker compose down -v
docker compose up -d --build
```

This completely removes the local MySQL persistent volume.

### Frontend Does Not Reflect Local Changes

The Nginx frontend container serves the static `dist` built into the image. To iterate rapidly:
- Use `npm run dev` directly in `frontend`; or
- Use the development Compose setup with `docker-compose.dev.yml`.

### Direct Backend Cannot Connect to Database

If the database was started via the main Docker Compose, remember that the host port is
`3307`, not `3306`.

Ensure you configure:

```powershell
$env:DB_PORT='3307'
```

### E2E Left Containers Running

Run:

```powershell
npm run e2e:down
```

or:

```powershell
docker compose -p learningframe-e2e -f docker-compose.e2e.yml down -v --remove-orphans
```

