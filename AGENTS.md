# AGENTS.md

## Purpose

This file is authoritative for every human or automated contributor working in this repository. Read it before changing code, content, schemas, infrastructure, or documentation.

## Product invariant

The Last Covenant is a deterministic narrative RPG. The server owns canonical game state. Generated prose, client state, and external AI providers must never decide rules, rewards, legality, quest outcomes, or save-game truth.

## Required workflow

1. Read `README.md`, the relevant files under `docs/`, and the current task in `TASKS.md`.
2. Inspect existing code and tests before proposing a new pattern.
3. Work on exactly one bounded master task or explicitly related group.
4. Record material architecture decisions in `docs/DECISIONS.md`.
5. Implement the smallest complete vertical behavior, including failure cases.
6. Run formatting, lint, typecheck, unit tests, integration tests, and relevant end-to-end tests.
7. Update documentation and task evidence.
8. Never mark a task complete without reproducible verification.

## Architecture boundaries

Expected monorepo ownership:

- `apps/web`: rendering, interaction, accessibility, browser-only concerns.
- `apps/api`: authentication, authorization, HTTP transport, orchestration.
- `apps/worker`: durable background jobs.
- `packages/contracts`: transport DTOs and public schemas.
- `packages/game-engine`: pure deterministic domain rules.
- `packages/content-schema`: schemas and static content validation.
- `packages/content`: versioned game definitions.
- `packages/observability`: logs, traces, and metrics.
- `packages/test-support`: builders, fakes, fixed clocks, and seeded RNG.

Forbidden coupling:

- game engine importing Next.js, NestJS, Prisma, Redis, queues, or AI SDKs;
- frontend importing persistence models;
- content executing arbitrary JavaScript;
- API responses exposing internal database records;
- provider SDK types crossing adapter boundaries;
- domain logic using wall-clock time or unseeded randomness directly.

## Domain rules

- Use explicit commands and results.
- All randomness must use an injected, seeded random source.
- All time must use an injected clock.
- Currency and exact resource values use integers or Decimal-compatible types, never floating-point assumptions.
- State transitions must validate preconditions and produce auditable events.
- A failed command must not partially mutate state.
- State-changing API commands require an idempotency key.
- Save revisions use optimistic concurrency.
- Content references use stable IDs, never display names.
- Removed content must have migration or compatibility handling.
- Quest conditions and effects must use a constrained declarative DSL.

## TypeScript rules

- Enable strict TypeScript.
- Avoid `any`; use `unknown` and validate.
- Prefer discriminated unions and exhaustive switches.
- Validate external input at every trust boundary.
- Keep functions focused and name domain concepts explicitly.
- Comments must explain intent or constraints, not restate code.
- Code comments, identifiers, commit messages, and technical documentation are English.
- User-facing game content may later be localized through translation keys.

## API and security rules

- Authenticate server-side.
- Authorize every save-slot operation by owner.
- Use generic authentication errors.
- Never log passwords, tokens, raw cookies, secrets, full AI prompts containing personal data, or complete save payloads.
- Apply CSRF protection where cookie authentication is used.
- Apply rate limits to authentication, commands, export/import, and AI endpoints.
- Parse and limit request bodies.
- Never trust client-calculated stats, rewards, inventory, skill availability, or dice results.

## Content rules

Each content change must pass schema and semantic validation for:

- globally unique stable IDs;
- valid references;
- reachable quest nodes;
- valid condition/effect operators;
- localized text keys;
- no impossible skill prerequisites;
- no accidental circular unlocks;
- bounded rewards and costs;
- explicit content version;
- consent and safety metadata where required.

Narrative guidelines:

- preserve ambiguity and consequence;
- avoid a single universally correct morality path;
- distinguish character knowledge from player knowledge;
- treat named undead as people with histories and agency;
- avoid gratuitous sexual violence and real-world hate propaganda;
- use content warnings for intense themes;
- do not copy protected settings or characters.

## AI integration rules

AI is optional, replaceable, and disabled by default.

Allowed uses:

- stylistic variants of already-resolved events;
- summaries of canonical logs;
- NPC phrasing constrained by known facts;
- development-time content suggestions that receive human review.

Prohibited uses:

- changing canonical state;
- inventing items, skills, facts, rewards, or quest results;
- deciding combat outcomes;
- bypassing content ratings;
- direct database or tool access;
- silently sending player content to a cloud provider.

All AI output is untrusted, schema-validated, length-limited, filtered, and backed by a deterministic fallback.

## Database and migration rules

- Use forward-only migrations.
- Never edit an already-released migration.
- Add indexes for ownership, revision lookup, active quest queries, job deduplication, and retention operations.
- Wrap command state change, event append, and outbox append in one transaction.
- Avoid destructive schema changes without a staged migration and rollback plan.
- Test migrations against representative save data.

## Testing requirements

Every domain feature requires:

- happy-path unit tests;
- invalid transition tests;
- boundary tests;
- deterministic replay tests when randomness is involved;
- authorization tests for APIs;
- idempotency tests for commands;
- transaction/rollback tests where persistence changes;
- accessibility checks for new interaction surfaces.

Bug fixes must include a regression test.

Do not use real network services in unit tests. Use deterministic fakes for clock, IDs, RNG, email, queues, AI providers, and external storage.

## Git discipline

- Do not commit secrets, generated caches, build output, or local databases.
- Keep commits scoped and descriptive.
- Do not rewrite unrelated user changes.
- Prefer additive documentation and migrations.
- Do not claim checks passed unless they were run.
- Do not weaken tests or types merely to make CI green.

## Definition of ready

A task is ready when its behavior, dependencies, security implications, data changes, UX states, and acceptance criteria are understood.

## Definition of done

A task is done when implementation, tests, migrations, observability, accessibility, documentation, and verification evidence are complete and no unresolved high-severity issue remains.
