# Testing Strategy

## Objectives

Tests protect deterministic rules, save integrity, narrative reachability, authorization, accessibility, and operational recovery. A green suite must provide meaningful evidence, not only line coverage.

## Test layers

### Static verification

- formatting;
- strict TypeScript;
- lint and dependency-boundary rules;
- content schemas and semantic compiler;
- OpenAPI/schema compatibility;
- migration checks;
- secret/dependency/container scanning.

### Domain unit tests

Pure, fast tests for commands, conditions, effects, stats, skills, quests, relationships, necromancy, combat, and death.

Use fixed clock, deterministic IDs, and seeded RNG. Assert state and domain events.

### Property/invariant tests

Examples:

- resources never exceed defined bounds;
- unavailable skills cannot unlock;
- command failure does not mutate input;
- same state + command + seed produces identical output;
- body/spirit references remain consistent;
- quest state is always a valid node;
- item counts cannot become negative;
- event sequences strictly increase.

### Content tests

- unique IDs and valid references;
- reachability and exit detection;
- dialogue speaker-knowledge checks;
- skill graph viability;
- quest mutual exclusion and cleanup;
- localization key/placeholder coverage;
- authored golden scenarios;
- reward/economy bounds;
- content-warning coverage.

### Persistence integration tests

Run against real PostgreSQL/Redis containers where relevant:

- transactions and rollback;
- idempotent retry;
- revision conflicts;
- row ownership;
- event/outbox atomicity;
- job deduplication;
- migration up from representative fixtures;
- pruning/retention rules.

### API tests

- schema and error mapping;
- authentication/session lifecycle;
- authorization matrix;
- rate limits and size limits;
- idempotency;
- hidden-state non-disclosure;
- ETag/revision behavior;
- import/export adversarial cases.

### Frontend tests

- component states;
- keyboard/focus behavior;
- choice explanations;
- stale/offline/retry flows;
- responsive layout;
- automated accessibility;
- safe text rendering.

### End-to-end tests

Critical journeys:

- registration/login/logout/recovery;
- guest start and account upgrade if implemented;
- character creation;
- Act I opening choice and autosave;
- unlock skill;
- create named undead;
- complete an encounter;
- resume and recap;
- conflicting tab recovery;
- export/import/restore;
- account deletion.

### Performance and resilience

- common command latency;
- save size/revision growth;
- load and concurrency conflicts;
- queue backlog/recovery;
- dependency timeout, retry, and circuit-breaker behavior where applicable;
- database restart and restore;
- low-bandwidth frontend.

## Golden campaign replays

Maintain serialized fixtures with initial state, content version, command sequence, seeds, expected event hashes, and final-state checksum. Golden updates require review explaining intentional rule/content change.

## Failure injection

Deterministic fakes support:

- clock advancement;
- ID sequences;
- RNG sequences;
- duplicate command delivery;
- database serialization conflicts;
- queue retries;
- object-storage failure;
- authored-template failure, missing localization, malformed content, and dependency outage.

## Test data

Factories create minimal explicit state. Avoid giant shared fixtures that obscure causality. Never use production personal data. Narrative fixtures use original repository-owned content.

## Coverage policy

Use coverage as a signal, with higher expectations for domain engine, content compiler, contracts, and security boundaries. Do not chase 100% by asserting implementation trivia.

Every bug fix includes a regression test that fails before the fix.

## CI gates

Pull request or main change gates eventually include:

1. install reproducibly;
2. formatting/lint;
3. typecheck;
4. unit/property tests;
5. content compile and semantic tests;
6. integration/API tests;
7. frontend component/accessibility tests;
8. builds;
9. selected Playwright smoke;
10. security checks.

Nightly/release pipelines run full E2E, performance, migration, backup/restore, full content simulation, and broader security scans.

## Flake policy

A flaky test is a defect. Do not blindly rerun until green. Quarantine only with owner, issue, evidence, and expiry. Domain tests must never rely on actual time, random values, or external networks.

## Manual testing

Required before release:

- narrative/editorial continuity;
- screen-reader journeys;
- keyboard-only complete slice;
- mobile devices and browser matrix;
- content-warning preferences;
- long-session readability;
- backup restore and operational runbooks;
- multiple builds and moral routes.
