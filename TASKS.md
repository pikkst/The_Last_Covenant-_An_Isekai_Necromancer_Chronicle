# Master Implementation Backlog

Status legend: `[ ]` planned, `[~]` in progress, `[x]` completed, `[!]` blocked.

Tasks are ordered by dependency. Do not start a later production milestone by bypassing unfinished foundations.

## Phase 0 — Product and engineering foundation

### [x] M001 — Repository and monorepo foundation

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

### [x] M002 — Shared contracts and deterministic primitives

**Outcome:** Project-owned schemas and deterministic fakes exist before game rules.

- define identifiers, UTC time, version, pagination, result, and error types;
- implement injectable clock, ID generator, and seeded RNG contracts;
- create stable serialization and hashing utilities;
- add deterministic test builders and replay fixtures;
- prevent framework/SDK types from leaking into domain packages.

### [x] M003 — Observability and error foundation

**Outcome:** All services use structured, correlated, privacy-safe diagnostics.

- request/trace IDs;
- typed application errors and HTTP mapping;
- structured redacted logs;
- OpenTelemetry bootstrap;
- baseline metrics, readiness, and liveness;
- local observability instructions.

## Phase 1 — Identity, saves, and content

### [x] M004 — Authentication and account security

- register, login, logout, refresh/session rotation, password reset;
- secure password hashing and generic failures;
- cookie/session security, CSRF decision, and rate limiting;
- optional guest mode with upgrade path;
- audit security-sensitive events;
- complete authorization and abuse tests.

### [x] M005 — Save-slot lifecycle

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


# Full-Game Expansion Backlog

The following tasks continue after the initial release-candidate foundation. Their detailed decomposition must preserve completed MVP behavior and save compatibility.

## Phase 8 — Full narrative and world production

### [ ] M033 — Canonical timeline, mysteries, and continuity registry

- define world chronology and campaign clocks;
- map every major mystery, clue, interpretation, and reveal window;
- register promises, debts, witnesses, lies, and delayed consequences;
- create automated continuity and spoiler checks.

### [ ] M034 — Complete character and companion Bible

- define all eight core companion arcs through Acts I–V;
- add antagonists, faction leaders, replacement routes, voices, knowledge, boundaries, and endings;
- validate independent decisions rather than loyalty-only outcomes.

### [ ] M035 — World gazetteer and culture packages

- document every full-release region, settlement, culture, law, naming pattern, calendar, funeral practice, and travel connection;
- add location content schemas and discovery layers.

### [ ] M036 — Full bestiary, items, and relic catalog

- create region-specific living and undead entities;
- define major relic histories, transformations, owners, and mechanics;
- add codex discovery and encounter fixtures.

## Phase 9 — Advanced systems

### [ ] M037 — Remaining necromancy disciplines

Implement Fleshweaving, Bone Sorcery, and Pale Covenant with complete graphs, cross-discipline interactions, transformations, teachers, narrative consequences, and balance simulations.

### [ ] M038 — Advanced undead lifecycle and society

- citizenship, reproduction/creation, work, contracts, memory inheritance, final death, crime, and dispute resolution;
- named-undead long-term growth and independent goals.

### [ ] M039 — Army and formation engine

- units, captains, doctrine, commands, logistics, casualties, autonomy, and strategic resolution;
- integrate decisive tactical scenes and simulation tooling.

### [ ] M040 — Territory and governance engine

- territory needs, laws, delegates, legitimacy, crises, diplomacy, succession, and rebellion;
- keep strategy text-first and explainable.

### [ ] M041 — Advanced crafting, ritual, and relic systems

- stations, substitutions, interruptions, signatures, provenance, automation, and unique relic transformations.

### [ ] M042 — Full economy and logistics

- regional markets, territory production/needs, favors/debts, burial rights, war supply, balance reports, and no-grind completion paths.

## Phase 10 — Act II

### [ ] M043 — Act II content foundation

Implement Hollow Reaches locations, political systems, claimant content, undead citizenship, and required assets.

### [ ] M044 — Act II main and companion quests

Author, validate, test, and integrate the complete Kingdom Without Breath campaign.

### [ ] M045 — Act II release gate

Complete continuity, balance, accessibility, security, migration, performance, and multi-route regression. Preserve every supported Act I outcome.

## Phase 11 — Act III

### [ ] M046 — Act III strategic foundation

Implement Ashen Empire regions, army/territory integration, command-network conflict, and civilian economy consequences.

### [ ] M047 — Act III campaign content

Author the Ashen Engine campaign, companion fractures, war routes, replacement content, and all persistent outcomes.

### [ ] M048 — Act III release gate

Validate strategic balance, casualties, territory failure/continuation, save growth, migrations, accessibility, and representative campaign replays.

## Phase 12 — Act IV

### [ ] M049 — Metaphysical endgame engine

Implement Gate realms, identity configuration, divine institutions, world fracture, covenant knowledge, and high-tier skill interactions.

### [ ] M050 — Act IV campaign content

Author The Hunger of Heaven with Church outcomes, Vael/Second Voice resolution, companion culminations, and public-truth consequences.

### [ ] M051 — Act IV release gate

Validate lore continuity, identity-state combinations, supported prior governments, performance, accessibility, and migration compatibility.

## Phase 13 — Act V and endings

### [ ] M052 — Covenant construction engine

- clause eligibility, compatibility, enforcement, amendment, cost, faction claims, and crisis resolution;
- explain safe failures without leaking unsupported endings.

### [ ] M053 — Final campaign and confrontation variants

Author the final assembly, strategic conflict, opposition variants, companion decisions, Last Choice, and recovery checkpoints.

### [ ] M054 — Epilogue composition engine

Implement authored epilogue modules, precedence, contradiction validation, Chronicle explanations, and long-term variants.

### [ ] M055 — New Game Plus and Chronicle

Implement account-level unlocks, campaign Echoes, origin variants, challenge settings, provenance, export/import, and compatibility.

### [ ] M056 — Complete campaign balance and continuity

Run headless campaigns across representative builds, factions, companions, deaths, territories, and covenant families. Eliminate unreachable endings and false choices.

## Phase 14 — Full release production

### [ ] M057 — Complete UX, art, audio, and localization pipeline

Finalize screen specifications, design system, accessibility, audio/music, art direction, localization tooling, and content-warning variants.

### [ ] M058 — Content authoring and QA tool suite

Deliver quest/dialogue/skill/encounter editors, graph validation, continuity reports, scenario runner, content diff, and release packaging.

### [ ] M059 — Full-game production readiness

Complete Docker production deployment, migrations, backups, restore, incident response, load/security/accessibility audits, support tools, store/legal materials, and release rehearsal.

### [ ] M060 — Version 1.0 release

Ship the complete five-act campaign only after all global completion gates, supported save migrations, representative ending replays, operational checks, and release sign-off pass.

## Phase 15 — Post-launch and expansion lifecycle

### [ ] M061 — Patch and save-compatibility program

Define and operate versioning, hotfixes, migrations, rollback/roll-forward, deprecation, and player communication.

### [ ] M062 — Privacy-safe player feedback and balancing

Collect explicit, minimal telemetry and structured feedback; publish balance-change principles and protect narrative privacy.

### [ ] M063 — Expansion content architecture

Support new regions, campaigns, disciplines, companions, relics, and ending interactions through versioned content packages without executable user scripts.

### [ ] M064 — First expansion production

Select scope only after 1.0 evidence. Require its own product requirements, narrative plan, system impact, migrations, test matrix, and release gate.

### [ ] M065 — Long-term archival and end-of-life readiness

Document offline/export options, final server behavior, source/content preservation, player data deletion, and communication well before any service closure.


## Phase 16 — Signature identity and living-world systems

### [ ] M066 — Identity and memory engine

- implement Earthborn, Vael, and Becoming identity state;
- add memory provenance, confidence, copying, alteration, loss, restoration, and sacrifice;
- integrate vessels, skills, relationships, Codex, endings, and New Game Plus;
- prevent hidden provenance from leaking to clients;
- add deterministic identity-combination and migration tests.

### [ ] M067 — Promise and covenant ledger

- implement persistent obligations, wording, intent, witnesses, scope, deadlines, amendments, conflicts, fulfillment, breach, and enforcement;
- integrate companions, factions, undead autonomy, rituals, governance, legends, and final covenant eligibility;
- expose safe known-conflict explanations.

### [ ] M068 — Knowledge, truth, and rumor provenance

- separate canonical facts from character knowledge;
- implement sources, confidence, contradictions, lies, investigations, NPC knowledge, and Codex history;
- add deterministic rumor propagation and spoiler-leak security tests.

### [ ] M069 — Dynamic legends and public identity

- derive regional/faction interpretations from witnessed outcomes and methods;
- implement spread, propaganda, contradiction, adoption/rejection, identity transfer, and gameplay consequences;
- add epilogue integration.

### [ ] M070 — Emergent archetype engine

- recognize behavior patterns without a selectable morality class;
- implement evidence, stages, conflicts, acceptance/rejection, skill/teacher/rival hooks, and ending effects;
- prove no archetype is mandatory for campaign completion.

### [ ] M071 — World clock and autonomous faction plans

- implement game-time advancement, scheduled events, faction goals, observable preparation, cancellation, replacement, and deterministic conflict ordering;
- ensure logout and real-world absence never advance the campaign;
- add fair deadline warnings and resume summaries.

### [ ] M072 — Player Sanctuary

- implement Sanctuary forms, facilities, inhabitants, policies, petitions, delegation, attacks, evacuation, relocation, and transformation into territory governance;
- preserve named-character continuity and avoid repetitive maintenance.

### [ ] M073 — Rival necromancer framework

- implement authored rival models, knowledge boundaries, plans, adaptation flags, counterplay, former-vessel eligibility, escalation, and multiple resolutions;
- ensure rivals never learn hidden player state.

### [ ] M074 — Companion relationship network

- implement bounded companion-to-companion relationship edges, group scenes, secret agreements, ideological blocs, independent actions, departures, inheritance, and endgame decisions;
- avoid a full unbounded NPC graph.

### [ ] M075 — Playable after-death state

- implement disembodied perception, stability, anchors, rescue, vessel compatibility, memory costs, pacts, final passage, successor outcomes, and recovery checkpoints;
- protect against duplication and checkpoint exploits;
- test every supported death configuration.


## Phase 17 — Summon progression, equipment, and fusion

### [ ] M076 — Persistent summon progression model

- implement named summon growth, mastery, attributes, roles, titles, memories, injuries, autonomy, and progression history;
- preserve progression across vessel replacement and supported transformations;
- add deterministic gain and migration tests.

### [ ] M077 — Summon skill graph engine

- implement universal, vessel, identity, role, equipment, relationship, evolution, fusion, and unique-story skill sources;
- validate prerequisites, exclusions, body compatibility, autonomy, and irreversible choices;
- provide graph and accessible list projections.

### [ ] M078 — Summon equipment and loadouts

- implement body-specific slots, weapons, armor, rings, amulets, cloaks, relics, anchors, command foci, durability, attunement, provenance, gifts, inheritance, and loadout templates;
- integrate crafting and combat;
- prevent duplication through death, fusion, vessel transfer, concurrency, export/import, and checkpoint restoration.

### [ ] M079 — Summon behavior customization

- implement bounded target priorities, preferred range, protection target, retreat threshold, lethal policy, spirit restrictions, ability conditions, and emergency autonomy;
- keep policies declarative and prevent executable player scripts.

### [ ] M080 — Fusion and evolution engine

- implement reinforcement, grafting, vessel evolution, memory synthesis, cooperative fusion, dominant fusion, composite birth, coercive assimilation, and formation fusion;
- validate consent, identity, components, equipment, promises, compatibility, inheritance, costs, instability, and reversibility;
- make every result deterministic and transactional.

### [ ] M081 — Summon management experience

- build summon roster, detailed summon sheet, skill tree/list, equipment interface, behavior editor, evolution tree, fusion laboratory, visual preview, warnings, and accessible keyboard/mobile flows;
- distinguish gifts from forced assignment for autonomous summons.

### [ ] M082 — Army template integration

- allow validated equipment, behavior, and progression templates for generic units;
- preserve full individual builds for captains and named summons;
- avoid army-scale item and skill micromanagement.

### [ ] M083 — Summon balance and exploit gate

- simulate early named-summon viability, specialist builds, fusion paths, equipment sets, autonomy, maintenance, and army scaling;
- test unique-item duplication, recursive fusion, stat overflow, invalid reversal, identity cloning, and rollback failures.
