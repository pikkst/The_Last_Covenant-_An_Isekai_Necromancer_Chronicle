# Product Roadmap

This roadmap expresses dependency and outcomes, not calendar promises. Master task IDs refer to `TASKS.md`.

## Milestone 0 — Foundation

Tasks: M001–M003.

Deliverable:

- reproducible monorepo;
- web/API/worker skeletons;
- deterministic primitives;
- shared contracts;
- local PostgreSQL/Redis;
- CI and baseline observability.

Exit: fresh clone passes all documented commands.

## Milestone 1 — Secure playable shell

Tasks: M004–M007.

Deliverable:

- accounts;
- save slots and revisions;
- validated content artifact;
- condition/effect engine;
- command idempotency and conflict handling.

Exit: a player can authenticate, create a save, resolve a fixture choice, refresh, and recover identical state.

## Milestone 2 — Character build vertical

Tasks: M008–M011 and M022 foundation.

Deliverable:

- character creation;
- attributes/resources;
- first three skill disciplines;
- inventory/equipment;
- accessible application shell.

Exit: multiple valid character builds can be created, saved, resumed, and explained by the UI.

## Milestone 3 — Narrative world

Tasks: M012–M016 and core M023/M025 surfaces.

Deliverable:

- travel;
- quests;
- dialogue;
- factions/rumors;
- companions;
- journal, codex, and map.

Exit: a noncombat Dunmire quest supports multiple routes with persistent companion/faction consequences.

## Milestone 4 — Necromancer fantasy

Tasks: M017–M021 and M024.

Deliverable:

- corpses and spirits;
- consent/binding;
- custom named undead;
- command hierarchy;
- tactical encounters;
- death and vessels;
- full character/skill UX.

Exit: the player creates a distinct undead companion, uses it in a reproducible encounter, and experiences consequences after death or release.

## Milestone 5 — Act I alpha

Tasks: M026–M027.

Deliverable:

- complete authored Act I;
- three factions and four companions;
- 20–30 quests/encounters;
- multiple outcomes;
- simulation and balance reports.

Exit: internal players complete Act I using multiple builds without blocked progress or save corruption.

## Milestone 6 — Optional narrative AI

Task: M028.

Deliverable:

- deterministic template renderer;
- local model adapter;
- optional cloud adapter;
- consent, safety, budgets, cache, and fallback;
- evaluation suite.

Exit: AI improves eligible prose while canonical replay hashes remain identical with AI disabled.

## Milestone 7 — Beta and production readiness

Tasks: M029–M031.

Deliverable:

- security hardening;
- backup/restore;
- performance/accessibility gates;
- operational dashboards and runbooks;
- external beta feedback loop.

Exit: threat model, restore rehearsal, WCAG audit, and load targets pass with no unresolved high-severity defect.

## Milestone 8 — Release candidate

Task: M032.

Deliverable:

- production deployment;
- legal/privacy/content-warning materials;
- support workflow;
- migration and rollback rehearsal;
- complete regression.

Exit: documented release sign-off.

## Post-release

Candidate sequence:

1. stabilize from real usage;
2. add remaining necromancy disciplines;
3. release Act II;
4. expand undead formations and territory systems;
5. localization;
6. offline/PWA investigation;
7. safe content-authoring/mod tools;
8. Acts III–V and New Game Plus.

Every expansion must preserve save compatibility or provide an explicit migration/export path.
