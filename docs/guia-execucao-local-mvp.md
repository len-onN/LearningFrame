# Guia de Execução Local do MVP

Este guia mostra como executar o LearningFrame com Docker Compose e também com
backend/frontend em modo direto de desenvolvimento.

## 1. Requisitos

Requisitos principais:
- Docker e Docker Compose;
- Node.js compatível com o frontend;
- npm;
- Java 21;
- Maven, quando rodar o backend fora do container.

Para o fluxo mais simples, Docker Compose e suficiente.

Em ambiente novo, instale as dependências locais do frontend antes de rodar
testes ou o servidor Vite:

```powershell
cd frontend
npm install
cd ..
```

## 2. Execução principal com Docker Compose

Na raiz do repositório:

```powershell
docker compose up --build
```

Servicos:
- frontend: `http://localhost:8080`;
- backend: `http://localhost:8081`;
- MySQL: `localhost:3307`;
- banco: `learningframe`.

Checagens rapidas:

```powershell
Invoke-WebRequest http://127.0.0.1:8080/
Invoke-WebRequest http://127.0.0.1:8081/api/decks/public
```

Para rodar em segundo plano:

```powershell
docker compose up -d --build
```

Para derrubar:

```powershell
docker compose down
```

Para derrubar removendo dados locais do banco:

```powershell
docker compose down -v
```

Use `down -v` com cuidado, pois remove o volume `mysql-data`.

## 3. Variáveis de ambiente principais

O Compose usa defaults de desenvolvimento, mas aceita `.env`.

Exemplo base:

```txt
DB_NAME=learningframe
DB_USER=learningframe
DB_PASSWORD=learningframe
MYSQL_ROOT_PASSWORD=learningframe_root
JWT_SECRET=change-this-dev-secret-at-least-32-chars
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

Variáveis relevantes do backend:
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

## 4. Execução local direta

Este modo e útil para desenvolvimento.

### 4.1 Subir apenas o banco com Docker

Na raiz:

```powershell
docker compose up -d db
```

O banco fica disponível no host em:

```txt
localhost:3307
```

### 4.2 Rodar o backend com Maven

Em outro terminal:

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

Backend:

```txt
http://localhost:8081
```

### 4.3 Rodar o frontend com Vite

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend Vite:

```txt
http://localhost:5173
```

O frontend usa `VITE_API_BASE_URL` quando configurado. Sem essa variável, o
fallback atual aponta para:

```txt
http://127.0.0.1:8081
```

Se quiser definir explicitamente:

```powershell
$env:VITE_API_BASE_URL='http://127.0.0.1:8081'
npm run dev
```

## 5. Compose de desenvolvimento do frontend

Existe um override para reconstruir o `dist` do frontend em modo watch dentro
de container:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Esse modo:
- sobe o ambiente principal;
- monta `./frontend/dist` no Nginx;
- executa um `frontend-builder` com `npm run build -- --watch`;
- permite validar o frontend containerizado em `http://localhost:8080`.

## 6. Testes e validações

Na raiz:

```powershell
npm test
npm run build
npm run e2e
```

Significado:
- `npm test`: roda Vitest no frontend;
- `npm run build`: roda build do frontend;
- `npm run e2e`: sobe o ambiente E2E dedicado, roda Playwright e derruba tudo.

Testes backend via container Maven:

```powershell
docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test
```

Em outro ambiente, ajuste o caminho absoluto antes de `:/workspace`.

Se o Playwright ainda não tiver o navegador local instalado, rode dentro de
`frontend`:

```powershell
npx playwright install chromium
```

## 7. Ambiente E2E dedicado

O E2E usa:
- Compose project: `learningframe-e2e`;
- banco: `learningframe_e2e`;
- servico MySQL: `db-e2e`;
- frontend: `http://localhost:18080`;
- backend: `http://localhost:18081`;
- MySQL host: `localhost:3317`;
- reset interno: `POST /api/e2e/reset`;
- token de reset: `X-E2E-Token`.

Comando principal:

```powershell
npm run e2e
```

Esse comando:
1. derruba ambiente E2E anterior com `down -v`;
2. sobe `db-e2e`, `backend-e2e` e `frontend-e2e`;
3. espera backend e frontend responderem;
4. executa Playwright em Chromium;
5. derruba o ambiente com `down -v --remove-orphans`.

Comandos auxiliares:

```powershell
npm run e2e:up
npm run e2e:test
npm run e2e:down
```

Regra critica: testes E2E não devem usar o banco dev.

## 8. Troubleshooting rápido

### Porta ocupada

Portas usadas no ambiente principal:
- `8080`;
- `8081`;
- `3307`.

Portas usadas no E2E:
- `18080`;
- `18081`;
- `3317`.

Se uma porta estiver ocupada, pare o processo conflitante ou ajuste o Compose.

### Banco com dados antigos

Para resetar o banco local de desenvolvimento:

```powershell
docker compose down -v
docker compose up -d --build
```

Isso remove o volume local do MySQL.

### Frontend não reflete mudança local

O frontend servido por Nginx usa o `dist` construído na imagem. Para iterar em
desenvolvimento:
- use `npm run dev` no frontend; ou
- use o Compose dev com `docker-compose.dev.yml`.

### Backend direto não conecta no banco

Se o banco foi iniciado pelo Compose principal, lembre que a porta no host e
`3307`, não `3306`.

Configure:

```powershell
$env:DB_PORT='3307'
```

### E2E deixou containers ativos

Execute:

```powershell
npm run e2e:down
```

ou:

```powershell
docker compose -p learningframe-e2e -f docker-compose.e2e.yml down -v --remove-orphans
```
