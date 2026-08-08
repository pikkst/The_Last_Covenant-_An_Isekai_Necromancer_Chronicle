# Architecture Decision Records

Status values: Proposed, Accepted, Superseded, Rejected.

## ADR-001 — TypeScript monorepo

**Status:** Accepted for planning.

Use a pnpm TypeScript monorepo with separate web, API, worker, contracts, game-engine, content, and support packages.

**Why:** shared schemas and language reduce boundary drift while package rules retain separation.

**Consequence:** dependency-boundary linting and strict project references are required.

## ADR-002 — Modular monolith before microservices

**Status:** Accepted.

Build a modular API and separate worker, not many network services.

**Why:** transaction correctness, iteration speed, and operational simplicity matter more than hypothetical independent scaling.

**Consequence:** modules require explicit ports to permit later extraction.

## ADR-003 — PostgreSQL is canonical; Redis is disposable

**Status:** Accepted.

PostgreSQL stores accounts, saves, projections, events, command results, and outbox records. Redis supports queues, limits, locks where proven, and caches.

**Consequence:** committed progress cannot depend solely on Redis.

## ADR-004 — Server-authoritative deterministic engine

**Status:** Accepted.

Canonical transitions execute in a pure game-engine package using injected time, IDs, and seeded randomness.

**Why:** prevents cheating, enables replay/debugging, and keeps rules independent of presentation.

**Consequence:** client or infrastructure-service output cannot resolve mechanics.

## ADR-005 — Declarative compiled content

**Status:** Accepted.

Quests, dialogue, encounters, and skills use validated data with a constrained condition/effect DSL.

**Why:** safer authoring, static validation, versioning, and tools.

**Consequence:** new behavior operators require reviewed engine implementation; arbitrary content scripts are forbidden.

## ADR-006 — Command idempotency and optimistic revisions

**Status:** Accepted.

Every state-changing game request includes an idempotency key and expected revision.

**Why:** browser retries and multiple tabs must not duplicate consequences.

**Consequence:** command requests/results are durably stored and request-key reuse is validated.

## ADR-007 — Transactional event/outbox records

**Status:** Accepted.

State projections, revision, domain events, and outbox messages commit together.

**Why:** provides audit/replay evidence and prevents lost side effects.

**Consequence:** network calls never occur within a command transaction.

## ADR-008 — No LLM or generative AI dependency

**Status:** Accepted.

All production narrative is human-authored, versioned, validated, and selected through deterministic rules. The game does not use local LLM modules, cloud LLM APIs, or other generative AI services.

**Why:** preserves authored narrative quality, deterministic behavior, privacy, predictable operations, and zero model-service dependency.

**Consequence:** do not add model SDKs, endpoints, prompt pipelines, or generated runtime prose. Narrative scale comes from content tooling, templates, localization, and reusable deterministic systems.

## ADR-009 — Next.js frontend and NestJS API target

**Status:** Proposed pending M001 spike.

These frameworks provide productive TypeScript ecosystems, routing, validation integration, testing, and deployment options.

**Validation needed:** bundle/runtime costs, authentication approach, SSE needs, monorepo ergonomics, and hosting target.

## ADR-010 — Prisma target persistence adapter

**Status:** Proposed pending schema spike.

Prisma offers TypeScript migrations and query tooling.

**Validation needed:** transaction/locking patterns, JSON/revision size, migration operations, and performance for save projections.

## ADR-011 — Cookie-based browser authentication

**Status:** Proposed.

Prefer secure HttpOnly cookie sessions/tokens over browser-accessible bearer-token storage.

**Validation needed:** CSRF approach, deployment origins, session rotation, guest upgrade, and mobile future.

## ADR-012 — Save snapshots plus domain events

**Status:** Proposed.

Use current projections and immutable revisions for reliable reads/recovery, with domain events for explanation and audit rather than full event sourcing as the only persistence model.

**Why:** reduces reconstruction complexity while retaining deterministic evidence.

**Validation needed:** save size, revision retention, replay tooling, and migration behavior.

## ADR process

When a material decision is made:

1. add an ADR with context, options, decision, consequences, and status;
2. link relevant task or implementation;
3. do not silently reverse accepted decisions;
4. mark old records Superseded and reference the replacement;
5. keep decisions concise and evidence-based.


## ADR-013 — Docker-first backend

**Status:** Accepted.

The API and worker run as OCI containers. Docker Compose is the supported local backend environment and coordinates the API, worker, PostgreSQL, Redis, migrations, and optional observability.

**Why:** provides reproducible setup, dependency isolation, production parity, and simpler onboarding.

**Consequence:** backend features must include container health, graceful shutdown, validated runtime configuration, non-root images, and Compose verification. Host-only behavior is not an accepted implementation.
