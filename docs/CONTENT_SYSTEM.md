# Content System

## Purpose

Story content is authored as versioned data and compiled into a deterministic artifact. Authors can create complex narrative branches without writing executable server code.

## Pipeline

1. Authors edit YAML/JSON and localized text resources.
2. Schema validation checks structure.
3. Semantic validation resolves references and graph rules.
4. Content compiler normalizes and sorts definitions.
5. Compiler generates a manifest, checksum, indexes, and report.
6. Tests run authored scenario fixtures and reachability checks.
7. The immutable artifact is deployed alongside compatible engine versions.

## Content domains

- origins and traits;
- attributes and skill nodes;
- items, relics, bodies, spirits, and undead templates;
- actors and companions;
- factions and relationship dimensions;
- locations, routes, and dynamic events;
- encounters and enemy behavior policies;
- quests and dialogue graphs;
- codex entries, rumors, and discoveries;
- conditions, checks, and effects;
- achievements/titles;
- localization and content warnings.

## Stable IDs

Use lowercase namespaced IDs, for example:

`act1.dunmire.quest.speaking_dead`

IDs are permanent API references. Display names can change. Replacing an ID requires an explicit content migration.

## Quest definition example

```yaml
id: act1.dunmire.quest.speaking_dead
version: 1
startNode: offered
nodes:
  offered:
    type: decision
    textKey: quest.speaking_dead.offered
    choices:
      - id: investigate
        textKey: choice.investigate
        when:
          all:
            - op: location_is
              value: act1.dunmire.cemetery
        effects:
          - op: set_quest_node
            value: investigating
  investigating:
    type: objective
    completion:
      all:
        - op: fact_known
          value: act1.fact.funeral_voices_source
```

This is illustrative; the final schema is defined by `packages/content-schema`.

## Condition DSL

Conditions are pure and side-effect free. Supported families:

- boolean composition: all, any, not;
- comparison of bounded numeric state;
- flag/fact/rumor knowledge;
- quest and dialogue state;
- inventory/equipment;
- skills, titles, traits, origin;
- relationship and faction thresholds;
- current location and world time;
- corpse/spirit properties;
- witness and method history.

Conditions return a boolean plus optional safe explanation metadata. Hidden conditions never leak through API explanations.

## Effect DSL

Effects are declarative atomic intentions:

- set/clear flag;
- learn fact or rumor;
- adjust bounded resource or relationship;
- give/remove item;
- create/update corpse, spirit, or actor;
- move entity;
- advance/fail/complete quest;
- schedule/cancel timed event;
- append promise/debt/witness record;
- unlock discovery;
- start encounter/dialogue;
- emit presentation cue.

Effects are validated, dry-runnable, and applied transactionally. Arbitrary code and provider calls are forbidden.

## Dialogue

Dialogue nodes define speaker, line keys, conditions, choices, effects, and next nodes. They may reference only facts the speaker can know. A linter identifies likely knowledge leaks, missing exits, unreachable nodes, and loops without an explicit repeat policy.

## Checks

A check specifies:

- stable rule ID;
- relevant stat/skill tags;
- difficulty;
- modifiers and visibility;
- seeded random consumption;
- success, partial, and failure outcomes.

Content cannot supply formulas as code. The engine owns supported check policies.

## Encounters

Encounters define initial participants, zones, environment, objectives, possible exits, reinforcement triggers, and deterministic enemy policies. Narrative text maps canonical event types to authored templates.

## Localization

Game content uses keys rather than embedded display strings in mechanical files. Default authoring language is English. Localization resources support variables with typed placeholders. Compiler verifies key presence and placeholder consistency.

## Content warnings

Scenes and text variants may carry tags such as body horror, grief, coercion, religious abuse, animal death, and identity loss. Player presentation preferences can select less vivid authored variants; they never change mechanics.

## Version compatibility

Every save records:

- engine rules version;
- content artifact version and checksum;
- save schema version;
- applied migrations.

Deployment retains compatible content artifacts needed for recent saves. Unsupported saves receive a clear migration or export path, never silent corruption.

## Authoring tools

Planned tools:

- schema-aware editor support;
- reference autocomplete;
- graph visualization;
- dialogue preview;
- state inspector;
- seeded scenario runner;
- unreachable-content report;
- localization coverage report;
- balance/reward report;
- content diff with migration warnings.

## Review checklist

A content change must confirm:

- references and localization pass;
- graph is reachable and has exits;
- facts match speaker knowledge;
- method and witness consequences exist;
- rewards and costs are bounded;
- companion/faction reactions are considered;
- content-warning tags are present;
- at least one scenario fixture covers the critical route;
- no copyrighted external text was copied.
