# Development

## Prerequisites

- Node.js >= 20.10.0
- pnpm >= 9.12.0
- Docker and Docker Compose

## Local startup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy environment files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/worker/.env.example apps/worker/.env
   cp .env.example .env
   ```

3. Start dependencies:
   ```bash
   docker compose up -d
   ```

4. Run migrations (after M004):
   ```bash
   pnpm db:migrate
   ```

5. Start all apps:
   ```bash
   pnpm dev
   ```

6. Run checks:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

## Common failures

- Port conflicts: ensure 3000, 3001, 5432, 6379 are free.
- Node version mismatch: run `node -v` and `pnpm -v`.
- Stale lockfile: delete `pnpm-lock.yaml` and run `pnpm install`.
- Docker not running: start Docker Desktop before `docker compose up`.
