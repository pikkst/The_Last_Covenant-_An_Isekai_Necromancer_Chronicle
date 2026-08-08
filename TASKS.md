# Master Implementation Backlog

Status legend: `[ ]` planned, `[~]` in progress, `[x]` completed, `[!]` blocked.

Tasks are ordered by dependency. Do not start a later production milestone by bypassing unfinished foundations.

## Phase 0 — Product and engineering foundation

### [ ] M001 — Repository and monorepo foundation

**Outcome:** A reproducible TypeScript monorepo boots locally and in CI.

**Required work:**

- configure pnpm workspaces and shared TypeScript settings;
- create `apps/web`, `apps/api`, `apps/worker`, and package boundaries from README;
- add ESLint, Prettier, EditorConfig, commit conventions, and dependency policies;
- create Docker Compose services for PostgreSQL and Redis;
- add environment validation and safe `.env.example`;
- add health checks and a first CI workflow;
- document local startup and common failures.

**Acceptance:** clean install, lint, typecheck, test, and builds succeed from a fresh clone.

### [ ] M002 — Shared contracts and deterministic primitives

**Outcome:** Project-owned schemas and deterministic fakes exist before game rules.

- define identifiers, UTC time, version, pagination, result, and error types;
- implement injectable clock, ID generator, and seeded RNG contracts;
- create stable serialization and hashing utilities;
- add deterministic test builders and replay fixtures;
- prevent framework/SDK types from leaking into domain packages.

### [ ] M003 — Observability and error foundation

**Outcome:** All services use structured, correlated, privacy-safe diagnostics.

- request/trace IDs;
- typed application errors and HTTP mapping;
- structured redacted logs;
- OpenTelemetry bootstrap;
- baseline metrics, readiness, and liveness;
- local observability instructions.

## Phase 1 — Identity, saves, and content

### [ ] M004 — Authentication and account security

- register, login, logout, refresh/session rotation, password reset;
- secure password hashing and generic failures;
- cookie/session security, CSRF decision, and rate limiting;
- optional guest mode with upgrade path;
- audit security-sensitive events;
- complete authorization and abuse tests.

### [ ] M005 — Save-slot lifecycle

- create, list, rename, archive, and delete save slots;
- autosave and explicit checkpoints;
- immutable revisions and optimistic concurrency;
- export/import with integrity validation;
- content-version metadata and recovery;
- owner authorization and quotas.

### [ ] M006 — Content schema and compiler

- schemas for origins, stats, skills, items, actors, factions, locations, encounters, quests, dialogue, conditions, and effects;
- semantic cross-reference validation;
- content manifest, version, checksum, and build artifact;
- human-readable validation errors;
- fixture content and CI validation;
- compatibility/migration contract.

### [ ] M007 — Declarative condition and effect engine

- constrained operators for flags, resources, relationships, inventory, skills, time, and world state;
- effects as validated atomic operations;
- dry-run support;
- transactional application;
- explainable failure reasons;
- property and adversarial tests.

## Phase 2 — Character and progression

### [ ] M008 — Character creation

- identity and pronoun/name support;
- three MVP origins;
- vessel and soul traits;
- attribute allocation with validated limits;
- preview of consequences without revealing hidden story facts;
- accessible, resumable creation flow.

### [ ] M009 — Character statistics and resources

- Body, Mind, Will, Presence, and Death Affinity;
- derived resources and status effects;
- injury, corruption, humanity, hunger/essence, and recovery;
- deterministic recalculation and caps;
- explainable modifier stack.

### [ ] M010 — Skill graph engine

- prerequisites, exclusions, ranks, costs, tags, and transformations;
- server-side unlock validation;
- respec policy and irreversible nodes;
- graph validation and build snapshots;
- UI-ready graph projection;
- at least 30 MVP nodes across three disciplines.

### [ ] M011 — Inventory, equipment, and relics

- typed inventory and stack rules;
- equipment slots and modifier sources;
- unique relic state and attunement;
- encumbrance or capacity policy;
- safe transactional gain, consume, equip, and transfer commands.

## Phase 3 — Narrative simulation

### [ ] M012 — World state, locations, and travel

- location graph and discovery;
- travel cost, risk, time, and interruption;
- settlement/world variables;
- seeded dynamic events;
- availability rules and travel log.

### [ ] M013 — Quest state machine

- offer, accept, advance, branch, fail, abandon, and complete;
- explicit node entry conditions and atomic effects;
- timed and mutually exclusive paths;
- quest journal projection;
- unreachable-state and replay tests.

### [ ] M014 — Dialogue engine

- speaker knowledge and relationship gates;
- conditional choices and consequences;
- checks with transparent modifiers where appropriate;
- interruption and resume;
- history summary without leaking hidden conditions;
- localization-ready text keys.

### [ ] M015 — Factions, reputation, and rumor

- reputation dimensions rather than one scalar;
- faction hostility, trust, fear, debt, and awareness;
- rumor propagation by region and witness;
- thresholds that unlock and close content;
- decay and contradiction policy.

### [ ] M016 — Companion system

- trust, fear, respect, dependence, ideology, and personal goals;
- recruitment, departure, betrayal, death, undeath, and return;
- companion quests and objections;
- private versus public knowledge;
- four complete MVP companions.

## Phase 4 — Necromancy and combat

### [ ] M017 — Corpse, spirit, and consent model

- corpse provenance, condition, identity, ownership claim, and decay;
- spirit identity, memory fragments, consent, stability, and destination;
- body/soul separation;
- ethical action tags used by narrative systems;
- audit trail for binding, release, transfer, and destruction.

### [ ] M018 — Undead creation and customization

- formula: body + soul/echo + binding + role + equipment + memory;
- deterministic trait inheritance;
- voluntary, coercive, and echo animation;
- failure and instability;
- named undead persistence;
- command limits and maintenance costs.

### [ ] M019 — Undead agency and command hierarchy

- orders, autonomy, loyalty, objections, and disobedience;
- captains, formations, delegated control;
- shared senses and information limits;
- conflicts between old identity and binding;
- scalable projections for army-level play.

### [ ] M020 — Tactical encounter engine

- participants, zones, range, cover, intent, initiative, resources, and statuses;
- actions, reactions, rituals, retreat, surrender, negotiation, and environment;
- seeded outcome resolution and battle log;
- enemy behavior as deterministic policies;
- snapshot/replay and anti-cheat validation.

### [ ] M021 — Death, vessels, and continuity

- protagonist death and prepared vessels;
- memory loss/scars and recoverable remains;
- possession constraints;
- permanent destruction rules;
- soft-fail recovery without trivializing consequence;
- ending-safe handling.

## Phase 5 — Browser experience

### [ ] M022 — Application shell and design system

- responsive dark-fantasy visual language;
- semantic tokens and reusable components;
- keyboard-first navigation;
- reduced motion, contrast, zoom, and screen-reader support;
- loading, empty, offline, stale, error, and recovery states.

### [ ] M023 — Main narrative reader

- readable scene typography;
- action choices with availability explanations;
- event history and compact summaries;
- streaming presentation without streaming authority;
- autosave state and conflict recovery;
- mobile and desktop layouts.

### [ ] M024 — Character sheet and skill tree

- explainable stats and modifiers;
- zoomable/pannable accessible skill graph plus list alternative;
- build comparison and unlock preview;
- irreversible-choice confirmation;
- no hidden client-side validation assumptions.

### [ ] M025 — Journal, codex, map, inventory, and companions

- spoiler-safe discovered knowledge;
- quest journal and consequence history;
- accessible location map with list view;
- inventory/equipment interactions;
- companion relationship information limited to player knowledge.

## Phase 6 — Complete vertical slice

### [ ] M026 — Act I content package

- opening, character creation integration, first resurrection;
- one settlement, wilderness, and dungeon;
- three factions, four companions, and core antagonist;
- 20–30 quests/encounters;
- multiple Act I outcomes;
- editorial, continuity, and content-warning review.

### [ ] M027 — Balance and simulation tooling

- headless seeded playthrough runner;
- build viability metrics;
- economy/resource reports;
- encounter difficulty distributions;
- unreachable content and dead-end detection;
- golden campaign replays.

### [ ] M028 — Dockerized backend runtime

- containerize the API and worker with multi-stage, non-root images;
- run API, worker, PostgreSQL, and Redis through Docker Compose;
- add health checks, dependency readiness, and graceful shutdown;
- use named volumes for development persistence;
- validate environment variables at startup;
- add migration and seed containers/jobs;
- prove a fresh clone can build and start the complete backend with one documented Docker Compose command.

## Phase 7 — Production readiness

### [ ] M029 — Security and abuse hardening

- threat-model review;
- dependency and secret scanning;
- authorization matrix tests;
- command replay, import bomb, content injection, XSS, CSRF, and rate-limit tests;
- retention and account deletion;
- incident runbook.

### [ ] M030 — Backup, restore, and disaster recovery

- encrypted automated database backups;
- restore rehearsal;
- Redis/queue recovery policy;
- content artifact retention;
- RPO/RTO targets and runbook;
- save export escape hatch.

### [ ] M031 — Performance and accessibility gates

- budgets for page load, command latency, and payload size;
- load tests for saves and commands;
- query/index review;
- WCAG 2.2 AA audit;
- low-bandwidth and small-screen testing;
- observability dashboards and alerts.

### [ ] M032 — Release candidate

- migration and rollback rehearsal;
- production deployment;
- legal pages, privacy notice, content warnings, and credits;
- analytics consent and minimal telemetry;
- support and bug-report flow;
- full Act I regression and release sign-off.

## Post-MVP candidates

- remaining three necromancy disciplines;
- army and territory management;
- Acts II–V and New Game Plus;
- additional languages;
- mod/content authoring tools;
- offline/PWA mode;
- community-created campaigns with sandboxed validation.

## Global completion gate

No master task is complete unless tests, security, accessibility, observability, migrations, documentation, and task-specific acceptance evidence are included.
