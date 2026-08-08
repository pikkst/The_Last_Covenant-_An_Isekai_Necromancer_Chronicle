# Product Requirements

## Product statement

The Last Covenant is a single-player, text-first browser RPG for players who enjoy dark fantasy, character builds, moral dilemmas, and replayable branching stories. The protagonist is transported into the body of an executed necromancer in a world where the cycle of death is failing.

## Player promise

Players can build a distinct philosophy and practice of necromancy, form relationships with living and dead characters, and leave persistent marks on a world that remembers methods as well as outcomes.

## Audience

Primary:

- players of narrative RPGs, interactive fiction, CRPGs, and build-crafting games;
- dark-fantasy and isekai readers;
- players who value choices, lore, companion arcs, and replayability.

Accessibility audience:

- keyboard-only players;
- screen-reader and low-vision users;
- mobile and low-bandwidth users;
- players who benefit from adjustable text, motion, and pacing.

## User needs

A player must be able to:

- start quickly and understand the premise;
- create a character whose origin matters;
- make informed choices without seeing hidden spoilers;
- understand why a choice is available or blocked;
- experiment with meaningfully different builds;
- trust that the game saved correctly;
- review discoveries, relationships, quests, and consequences;
- recover from connection loss and conflicting sessions;
- opt out of external AI processing.

## Design goals

- Strong atmosphere without sacrificing usability.
- Consequences expressed during play, not only in an ending montage.
- At least three viable philosophical approaches in the MVP.
- No mandatory grinding.
- No pay-to-win or energy timers.
- AI is never required for core play.
- A complete Act I must feel satisfying even before later acts exist.

## MVP scope

Content:

- 3 origins: Surgeon, Historian, Systems Engineer;
- 3 disciplines: Grave Dominion, Soulcraft, Shepherd of the Dead;
- at least 30 skill nodes;
- 1 settlement, 1 wilderness region, 1 dungeon;
- 3 factions;
- 4 companions;
- 20–30 authored quests and encounters;
- 3 major Act I outcomes and several variant epilogues.

Systems:

- accounts and secure save slots;
- character creation and progression;
- world, quest, dialogue, relationship, inventory, corpse/spirit, undead, combat, death, and journal systems;
- deterministic autosave and revision recovery;
- data-driven validated content;
- responsive accessible UI;
- observability and administrative operational tools.

## Explicit non-goals for MVP

- real-time multiplayer;
- open player chat;
- player-generated executable scripts;
- unlimited generative story content;
- native mobile apps;
- full kingdom or army simulation;
- blockchain/NFT ownership;
- monetized loot boxes;
- six complete skill disciplines;
- fully voiced dialogue.

## Core journeys

### New player

Landing page -> accessibility preferences -> account or guest start -> premise -> character creation -> opening execution aftermath -> first spirit conversation -> first consequential resurrection -> first safe autosave.

### Returning player

Authenticate -> view save slots and last known context -> resume -> reconcile content/save version -> show short recap -> continue at a stable decision boundary.

### Build planner

Open character -> inspect current resources -> explore accessible nodes -> compare impacts and exclusions -> confirm irreversible unlock -> see derived-stat and narrative changes.

### Crisis recovery

Command times out -> client checks command status using idempotency key -> server returns committed result or safe retry -> client refreshes authoritative snapshot -> no duplicate rewards or choices.

## Functional requirements

- FR-001: The system supports authenticated ownership of multiple save slots.
- FR-002: The player can resume from the latest valid revision.
- FR-003: State changes occur only through server-authoritative commands.
- FR-004: Every command provides a canonical event/result projection.
- FR-005: The game evaluates choices from explicit conditions.
- FR-006: The player can inspect unavailable-choice explanations unless marked narratively hidden.
- FR-007: Skill unlocks enforce prerequisites, exclusions, costs, and irreversible warnings.
- FR-008: Quests support branching, failure, time, and mutual exclusion.
- FR-009: Named undead preserve identity and history across encounters.
- FR-010: Combat can be reproduced from starting state, commands, and RNG seed.
- FR-011: The player can export and import a validated save.
- FR-012: Optional AI can be disabled without changing available mechanics or outcomes.
- FR-013: The application presents explicit save, stale, offline, error, and conflict states.
- FR-014: The codex reveals only discovered knowledge.
- FR-015: The player can delete account data according to the published policy.

## Non-functional requirements

- NFR-001: WCAG 2.2 AA target.
- NFR-002: Common command response p95 below 500 ms excluding optional AI presentation.
- NFR-003: Initial usable page under 3 seconds on defined mid-tier mobile and constrained network profile.
- NFR-004: No loss of committed save data during a single service restart.
- NFR-005: RPO <= 24 hours and initial RTO <= 4 hours, improved before commercial launch.
- NFR-006: All services emit correlated structured diagnostics.
- NFR-007: Security-sensitive actions are audited.
- NFR-008: Content compilation is deterministic.
- NFR-009: Canonical play works with all external AI providers unavailable.
- NFR-010: Privacy-sensitive data is minimized and retained only as documented.

## Business model guardrails

Potential commercial model:

- free prologue or limited save slots;
- one-time Act purchase or transparent premium edition;
- optional supporter cosmetics/themes;
- later paid story expansions.

Never sell power, random rewards, accelerated timers, or choices that undermine narrative integrity.

## Success measures

Pre-release:

- tutorial completion rate;
- choice distribution without a dominant false choice;
- save recovery success;
- build diversity;
- accessibility audit results;
- crash/error-free sessions.

Post-release:

- Act I completion;
- voluntary replay rate;
- companion and build diversity;
- return rate after first session;
- qualitative narrative satisfaction;
- low frequency of lost-save and unclear-consequence reports.

Telemetry must be minimal, consent-aware, and never capture full private prose or secrets.

## Release acceptance

The MVP is releasable when Act I is narratively complete, the global definition of done in `TASKS.md` is met, backups have been restored in rehearsal, critical accessibility paths pass, and no unresolved critical/high security issue remains.
