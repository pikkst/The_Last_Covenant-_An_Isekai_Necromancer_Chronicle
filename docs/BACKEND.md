# Backend Architecture

## Principles

- Server authoritative.
- Deterministic domain engine.
- Transactional commands.
- Append-only domain events plus current projections.
- Versioned content and saves.
- Framework-independent rules.
- External systems behind project-owned ports.

## Target services

### API

NestJS HTTP application responsible for authentication, authorization, validation, command orchestration, queries, rate limits, and transport mapping.

### Worker

BullMQ consumers for email, retention, exports, content processing, analytics aggregation, and optional AI prose. Jobs are idempotent and observable.

### Web

Next.js application described in `FRONTEND.md`.

PostgreSQL is canonical persistence. Redis holds queues, rate-limit counters, locks where justified, and disposable caches. Redis loss must not lose committed game state.

## Package boundaries

### game-engine

Pure TypeScript:

- character and skills;
- inventory and equipment;
- world/travel;
- quests/dialogue;
- relationships/rumors;
- corpses/spirits/undead;
- encounters/combat;
- death/vessels;
- conditions/effects;
- command results and domain events.

Inputs include state, command, content projection, clock value, and seeded RNG. Outputs include new state/events or typed failure.

### contracts

Versioned request/response DTOs and public error shapes. No ORM models.

### content-schema

Authoring schemas, semantic validation, compiler, and artifact readers.

### infrastructure adapters

Prisma repositories, Redis, queues, object storage, email, telemetry, and AI providers live outside the domain.

## Command lifecycle

1. Authenticate account.
2. Validate transport schema and request limits.
3. Authorize ownership of save.
4. Start transaction and lock/read expected revision.
5. Find prior result by account/save/idempotency key.
6. Load compatible content artifact.
7. Build deterministic context: fixed clock, command-derived RNG seed, IDs.
8. Execute pure domain command.
9. Persist new revision/projections and append events.
10. Append outbox records in the same transaction.
11. Commit.
12. Return canonical result with new revision.
13. Worker delivers noncanonical side effects.

Failures before commit make no canonical change.

## Deterministic randomness

Derive a command seed from protected server entropy plus save ID, current revision, command ID, and rules version. Record the seed or sufficient replay evidence in the command/event audit. Never use `Math.random()` in domain code.

Prevent clients from selecting favorable seeds. Deterministic replay tests verify identical state and events.

## Save model

Use current projections for efficient reads plus immutable revisions/checkpoints. Do not serialize an unrestricted runtime object graph.

A revision stores:

- monotonic revision number;
- schema/rules/content versions;
- normalized state or reconstructable delta;
- checksum;
- triggering command ID;
- created timestamp.

Retention preserves named checkpoints and a rolling autosave window.

## Event and outbox model

Domain events explain canonical changes. Integration outbox records request side effects such as email or analytics. Both are appended transactionally.

Events require stable type, schema version, aggregate identifiers, command ID, occurred time, safe payload, and sequence.

## Concurrency and idempotency

All mutations require:

- idempotency key;
- expected save revision;
- unique constraint on command identity;
- one durable stored result;
- 409 conflict with current revision when expectation is stale.

A timeout followed by retry must return the original committed result.

## Queries

Read endpoints return purpose-built projections. Hidden narrative state never appears in broad save responses. Queries support ETags/revision metadata where useful. Avoid exposing internal event payloads directly.

## Background jobs

Each job defines:

- stable name and payload schema version;
- deduplication key;
- retry/backoff policy;
- timeout;
- poison/dead-letter handling;
- ownership and retention;
- metrics;
- idempotent handler.

No job independently invents canonical rewards or advances a quest. Canonical scheduled events re-enter through an authorized system command.

## Content deployment

The API loads an immutable compiled artifact identified by version/checksum. Deploy compatibility rules before content requiring them. Running sessions may pin a version until a safe boundary.

## Failure handling

Typed failures include validation, unauthenticated, forbidden, not found, conflict, unavailable action, resource exhausted, incompatible save/content, rate limited, and internal.

Responses provide safe codes and trace IDs. Logs carry internal detail after redaction.

## Scalability

Initial architecture favors a modular monolith. Scale stateless API instances horizontally and workers by queue. PostgreSQL transaction correctness precedes premature service decomposition.

Potential future extraction requires measured pressure and a documented decision record.

## Administrative capability

A future internal admin surface may inspect health, content versions, failed jobs, anonymized command failures, and restore workflows. It must not allow arbitrary save mutation. Break-glass actions are audited and narrowly authorized.

## Observability

Measure:

- command rate/latency/failure by safe command type;
- conflict and idempotent replay rate;
- database query/transaction time;
- queue depth, retries, age, and dead letters;
- save sizes and revision counts;
- content validation failures;
- AI fallback/timeout/budget without prompt bodies;
- authentication abuse signals.

## Data retention

Define retention for sessions, audit events, command results, logs, exports, deleted accounts, and AI caches. Account deletion uses a documented workflow with legal/security exceptions and completion evidence.
