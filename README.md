# Fullstack Boilerplate

Node.js + Express + Alpine.js monorepo boilerplate with SQLite, Vite, and optional Docker.

## Stack

- **Backend**: Node.js 22, Express 4, sql.js (SQLite — pure WASM, no native compilation)
- **Frontend**: Alpine.js 3, Vite 5
- **Tests**: Vitest + Supertest (API), Playwright (E2E)

## Setup

### Local (no Docker)

Requirements: Node.js 22+

```bash
cp .env.example .env
npm install
npm run migrate
npm run dev
```

- API: http://localhost:3000
- Frontend: http://localhost:5173

### Docker (optional)

#### Installing Docker

**Linux (Ubuntu/Debian)**

```bash
# Remove old versions if any
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key and repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow running Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

> For other distros (Fedora, Arch, etc.) see: https://docs.docker.com/engine/install/

**Windows**

1. Enable WSL2 (required):
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   # Restart your machine after this step
   ```

2. Download and install **Docker Desktop for Windows**:
   https://docs.docker.com/desktop/install/windows-install/

3. During installation, make sure **"Use WSL 2 instead of Hyper-V"** is checked.

4. After installation, open Docker Desktop and wait for it to start.

5. Verify in a terminal (PowerShell or WSL):
   ```bash
   docker --version
   docker compose version
   ```

> Docker Compose is bundled with Docker Desktop — no separate install needed on Windows.

#### Running the project with Docker

```bash
docker compose up
```

- API: http://localhost:3000
- Frontend: http://localhost:5173

> **Note:** Use `docker compose` (v2, plugin) instead of `docker-compose` (v1, standalone).
> Both commands work if you have Docker Compose v1 installed, but v2 is recommended.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API + Vite dev servers |
| `npm run build` | Build frontend to `web/dist/` |
| `npm run migrate` | Run pending DB migrations |
| `npm run test` | Run all tests (API + E2E) |

## Tests

### Run all tests

```bash
npm run test
```

### API tests only (Vitest + Supertest)

```bash
npm run test --prefix api
```

### E2E tests only (Playwright)

```bash
npm run test --prefix web
```

> E2E tests require the dev server to be running (`npm run dev`).

### Running tests inside Docker containers

```bash
# API tests (Vitest + Supertest)
docker compose exec api npm test

# E2E tests (Playwright)
docker compose exec web npm test
```

> If Playwright fails due to missing browsers, install them first:
> ```bash
> docker compose exec web npx playwright install --with-deps chromium
> ```

## API Endpoints

Base URL: `http://localhost:3000`

### Items

| Method | Path | Description | Body |
|--------|------|-------------|------|
| `GET` | `/api/items` | List all items | — |
| `POST` | `/api/items` | Create an item | `{ "name": "string" }` |
| `PUT` | `/api/items/:id` | Update an item | `{ "name": "string" }` |
| `DELETE` | `/api/items/:id` | Delete an item | — |

#### Examples

```bash
# List all items
curl http://localhost:3000/api/items

# Create an item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Buy groceries"}'

# Update an item
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Buy groceries and cook"}'

# Delete an item
curl -X DELETE http://localhost:3000/api/items/1
```

## Project Structure

```
├── api/          Express REST API + SQLite
│   ├── db/       Migrations and database layer
│   └── src/      Routes and middleware
├── web/          Alpine.js + Vite frontend
│   ├── src/      Components
│   └── tests/    Playwright e2e tests
├── docker-compose.yml
└── .env.example
```

## Adding a New Resource

1. Add a migration in `api/db/migrations/` (e.g., `002_add_posts.sql`)
2. Add a route file in `api/src/routes/` and register it in `api/src/index.js`
3. Add a component in `web/src/components/` and register it in `web/src/main.js`
