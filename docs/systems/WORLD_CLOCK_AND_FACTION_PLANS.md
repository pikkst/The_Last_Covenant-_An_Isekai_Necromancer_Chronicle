# World Clock and Faction Plans

## Purpose

The world advances when the player acts. Factions and major NPCs pursue goals without requiring real-time waiting or pretending the protagonist is the only active person.

## Time model

Canonical game time advances through:

- travel;
- rest;
- rituals;
- crafting;
- recovery;
- strategic operations;
- explicit waiting;
- authored scene durations;
- major state transitions.

Reading menus, accessibility pauses, logout, and real-world absence do not advance campaign time.

## Time units

- moment/scene;
- watch;
- day;
- week;
- season;
- campaign phase.

Exact timestamps exist for deterministic ordering; presentation may use narrative labels.

## Scheduled events

Each event defines:

- stable ID;
- earliest/latest time;
- conditions;
- cancellation/replacement rules;
- involved actors/factions;
- visibility;
- priority;
- effects;
- player notification;
- missed-event behavior;
- content version.

## Faction plans

A plan contains:

- goal;
- current phase;
- required resources;
- target;
- deadline;
- observable preparations;
- counteractions;
- success/partial/failure effects;
- replacement plan;
- leader/policy dependencies.

Examples:

- Final Dawn quarantines Dunmire;
- Empire surveys a corpse-rail route;
- Hollow claimant secures recognition;
- Shepherds evacuate unstable spirits;
- rival necromancer collects abandoned vessels.

## Player interaction

The player can:

- investigate;
- accelerate;
- delay;
- sabotage;
- redirect;
- join;
- negotiate;
- ignore;
- reveal;
- replace the responsible actor.

Ignoring a plan yields a valid authored result, not missing content.

## Information

Players learn plans through evidence and reports. The UI distinguishes confirmed deadlines from estimates. Hidden timers must have perceivable warning before severe irreversible consequence.

## Catch-up

On resume, the server does not advance by wall-clock absence. It summarizes game-time changes since the last viewed scene.

## Conflict resolution

When multiple events mature:

1. order by canonical time;
2. apply explicit priority only for simultaneous conflicts;
3. re-evaluate conditions after every event;
4. replace invalidated events with authored alternatives;
5. append explainable world events.

## Fairness

- No real-money or real-time pressure.
- Major crises provide sufficient in-world warning.
- Routine maintenance is delegated.
- Delays create tradeoffs, not constant punishment.
- Story difficulty may relax deadlines independently of accessibility.

## Testing

Use an injected clock. Test simultaneous plans, cancellation, missing NPCs, changed leadership, save/load, long travel, Act transitions, migration, and deterministic summaries.
