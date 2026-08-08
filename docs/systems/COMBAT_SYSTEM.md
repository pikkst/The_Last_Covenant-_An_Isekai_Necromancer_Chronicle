# Tactical Combat System

## Goals

Combat is readable, consequential, deterministic, and supports violence, control, negotiation, rescue, retreat, and ritual objectives. It is never only health-bar attrition.

## Encounter state

- round and phase;
- zones and connections;
- participants and teams;
- perception/knowledge;
- initiative/tempo;
- resources;
- body and spirit conditions;
- statuses;
- environmental objects;
- objectives;
- retreat/surrender routes;
- corpses and released spirits;
- deterministic RNG state.

## Round flow

1. refresh and ongoing effects;
2. reveal perceivable intentions;
3. player issues protagonist, companion, and command-level orders;
4. participants act according to tempo and reactions;
5. environment/ritual progress resolves;
6. morale, control, victory, retreat, and surrender evaluate;
7. canonical events are appended.

## Actions

- move;
- attack;
- defend;
- assist;
- command;
- use skill/item;
- begin/continue ritual;
- interact with environment;
- negotiate/intimidate;
- rescue;
- bind/release;
- retreat/surrender.

## Damage layers

- vitality/body;
- armor/structure;
- focus;
- will;
- spirit stability;
- control connection;
- memory integrity.

Death is one possible result. Capture, injury, dismemberment, lost memory, broken oath, panic, and separation can matter more.

## Zones

Abstract zones describe tactical relation: engaged, near, far, elevated, covered, sealed, hazardous. Movement and range rules remain explicit.

## Intent

Enemy intent is revealed according to player perception. Telegraphing enables tactics; hidden abilities require discoverable evidence rather than arbitrary surprise.

## Morale

Individuals and groups respond to casualties, leadership, objectives, terror, reputation, and impossible orders. Intelligent enemies may surrender or negotiate.

## Reactions

Bounded reactions include guard, intercept, counterspell, protect spirit, opportunity strike, command override, and emergency vessel transfer.

## Objectives

Examples:

- survive;
- defeat/capture target;
- protect person;
- complete/interfere with ritual;
- escape;
- hold zones;
- retrieve remains;
- persuade faction;
- prevent soul destruction.

## Undead combat

Undead have body and identity states. Destroying a vessel may not end a spirit. Control links can be cut, delegated, overloaded, or voluntarily refused.

## Large battles

Resolve through formations and fronts, then zoom into authored decisive encounters. Do not simulate thousands of individual units in the request path.

## Difficulty

Difficulty modifies enemy effectiveness, resource pressure, and information clarity through explicit profiles. Accessibility assists remain independent.

## Determinism

Combat consumes seeded RNG through named operations. Every result is replayable from versioned content, initial state, commands, and seed.

## Balance targets

- multiple viable action families;
- no permanent stun loops;
- meaningful retreat;
- bounded encounter duration;
- bosses change rules/objectives;
- failure creates recoverable narrative where appropriate.

## Required tooling

- encounter preview;
- turn trace;
- state diff;
- seeded batch simulation;
- action-usage report;
- win/loss and resource distribution;
- stuck-state detector.
