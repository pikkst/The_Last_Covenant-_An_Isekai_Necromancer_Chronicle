# The Last Covenant: An Isekai Necromancer Chronicle

A narrative-first, text-based browser RPG about identity, death, power, and responsibility.

The player awakens in another world inside the executed body of a feared necromancer. The Church calls them an omen of the apocalypse. The dead call them a promised sovereign. Every corpse had a name, every spirit remembers something, and every use of necromancy changes the character, their companions, and the world.

## Product vision

Create a highly replayable single-player RPG with:

- a deep, mutually exclusive skill tree;
- meaningful character builds instead of a single optimal route;
- branching quests and persistent world consequences;
- named undead companions with memories, needs, and agency;
- tactical text-based combat;
- multiple moral philosophies of necromancy;
- deterministic game rules with optional AI-assisted prose;
- a content pipeline that supports years of expansion.

## Core design pillars

1. **Every dead person was someone.** Undead are characters and resources, never anonymous ammunition by default.
2. **Power changes the story.** Skills unlock choices, close other routes, alter relationships, and visibly transform the protagonist.
3. **Choices create state, not just endings.** Settlements, factions, rumors, companions, and future quests remember what happened.
4. **No universally correct morality.** Mercy, consent, survival, freedom, and duty regularly conflict.
5. **Text is the feature.** Strong prose, readable information hierarchy, atmosphere, accessibility, and fast decisions are central.
6. **Rules remain deterministic.** AI may enrich presentation but never owns canonical state or resolves mechanics.

## Planned technology

- Frontend: Next.js, React, TypeScript, Tailwind CSS, TanStack Query, Zustand
- Backend: NestJS, TypeScript, REST/OpenAPI, WebSocket/SSE where justified
- Data: PostgreSQL with Prisma, Redis for short-lived state and queues
- Jobs: BullMQ
- Validation: Zod at content and client boundaries
- Testing: Vitest/Jest, Playwright, contract tests, deterministic simulation tests
- Runtime: Docker Compose for local development; container-based production
- Observability: structured logs, OpenTelemetry, Prometheus-compatible metrics
- Optional narrative AI: provider-neutral adapter with local-LLM and cloud implementations

The exact dependency versions will be chosen during implementation and locked through the package manager.

## Repository map

| Document | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Mandatory rules for coding agents and contributors |
| [TASKS.md](TASKS.md) | Master implementation backlog and acceptance criteria |
| [docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) | Product goals, users, scope, and success criteria |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | Core loops, progression, combat, economy, death, and balance |
| [docs/NARRATIVE_BIBLE.md](docs/NARRATIVE_BIBLE.md) | World, story structure, factions, companions, tone, and endings |
| [docs/SKILL_TREE.md](docs/SKILL_TREE.md) | Character progression and necromancy disciplines |
| [docs/CONTENT_SYSTEM.md](docs/CONTENT_SYSTEM.md) | Data-driven quests, dialogue, encounters, and validation |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Browser UX, routes, state, accessibility, and frontend architecture |
| [docs/BACKEND.md](docs/BACKEND.md) | Service boundaries, game engine, jobs, saves, and APIs |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Persistence model and data ownership |
| [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | HTTP contracts, commands, errors, and idempotency |
| [docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md) | Safe optional LLM architecture and local-model support |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model and security requirements |
| [docs/TESTING.md](docs/TESTING.md) | Test pyramid and deterministic verification |
| [docs/DEVOPS.md](docs/DEVOPS.md) | Environments, containers, CI/CD, backups, and observability |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Milestones from foundation to release |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Initial architecture decision records |

## Target MVP

The first releasable vertical slice should provide:

- account creation and secure save slots;
- character creation with three origins;
- three skill disciplines and at least 30 meaningful nodes;
- one settlement, one wilderness region, and one dungeon;
- three factions and four recruitable companions;
- a complete Act I with several mutually exclusive outcomes;
- tactical encounters, inventory, rituals, corpses, spirits, and undead creation;
- autosave, manual save, export, import, and recovery;
- keyboard-first responsive UI;
- deterministic content and simulation tooling;
- optional AI prose disabled by default.

## Architecture principles

- The backend is authoritative for canonical game state.
- Every state-changing command is validated, authorized, idempotent, and transactional.
- Content definitions are versioned separately from player state.
- Save games store content-version compatibility data.
- Randomness is seeded and reproducible.
- Quest logic uses explicit conditions and effects, never arbitrary code embedded in content.
- UI rendering is separate from rules evaluation.
- AI output is untrusted presentation data.
- Accessibility and low-bandwidth play are release requirements.

## Local development target

The future workspace is expected to use a TypeScript monorepo:

```text
apps/
  web/
  api/
  worker/
packages/
  contracts/
  game-engine/
  content-schema/
  content/
  observability/
  test-support/
infra/
docs/
```

Expected commands after the foundation milestone:

```bash
corepack enable
pnpm install
docker compose up -d postgres redis
pnpm db:migrate
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
```

These commands are architectural targets; implementation tasks in `TASKS.md` create them.

## Definition of done

A feature is complete only when:

- acceptance criteria are demonstrably satisfied;
- deterministic domain tests cover success and failure paths;
- API and content schemas are updated;
- authorization and input validation are tested;
- accessibility and responsive states are considered;
- observability is added for important operations;
- documentation is updated;
- lint, typecheck, unit, integration, and relevant end-to-end tests pass.

## Licensing and content ownership

No license is granted until a `LICENSE` file is intentionally added. All original setting, characters, prose, mechanics documentation, and code remain under the repository owner's copyright. Do not add third-party assets, text, music, models, or datasets without compatible licensing and attribution records.
