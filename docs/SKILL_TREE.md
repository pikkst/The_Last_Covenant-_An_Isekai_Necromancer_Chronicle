# Skill Tree and Character Progression

## Goals

The progression system must produce recognizable builds, narrative consequences, and real opportunity cost. A skill is not merely a percentage increase: major nodes should unlock actions, information, relationships, crafting patterns, command structures, or transformations.

## Graph model

Each skill node contains:

- stable ID and content version;
- discipline and tier;
- display text keys;
- ranks and per-rank effects;
- skill-point and resource costs;
- visible prerequisites;
- discovery prerequisites;
- mutually exclusive nodes;
- behavior/history requirements;
- irreversible flag;
- corruption/humanity/world effects;
- tags used by dialogue, combat, quests, deterministic rules, and authored presentation;
- deterministic effect list.

The server evaluates unlocks. The client receives an explainable projection that omits intentionally hidden requirements.

## Acquisition

Players earn progression through:

- major story decisions;
- study and experimentation;
- teachers, relics, and recovered memories;
- relationships with living or dead mentors;
- titles earned by repeated behavior;
- accepting pacts, scars, obligations, or transformations.

Grinding generic enemies must not be the best progression route.

## Six full-game disciplines

### Grave Dominion

Command, formations, autonomous undead, and large-scale control.

Tier I:

- **Raise Servant:** animate one simple body.
- **Grave Sense:** detect nearby remains and basic condition.
- **Command Thread:** issue a persistent simple order.

Tier II:

- **Bone Cohort:** reduce control cost for similar undead.
- **Shared Senses:** perceive through a bound servant with risk.
- **Grave Captain:** delegate commands to one named undead.

Tier III:

- **Autonomous Orders:** define bounded policies and priorities.
- **March Without Rest:** reduce travel and upkeep constraints.
- **Formation Memory:** retain drilled tactics after disruption.

Tier IV:

- **Legion Mind:** coordinate multiple captains.
- **Banner of the Unforgotten:** empower undead whose names are preserved.
- **Kingdom Beneath the Soil:** establish a persistent territorial network.

Key tension: efficiency versus agency. Coercive branches are cheaper; consensual structures create stronger independent characters.

### Soulcraft

Perceive, preserve, repair, divide, transfer, and forge identity.

Tier I:

- **Hear the Departed**
- **Memory Glimpse**
- **Soul Anchor**

Tier II:

- **Spirit Surgery**
- **Name Binding**
- **Borrowed Memory**

Tier III:

- **Split Soul**
- **Restore the Stolen**
- **Vessel Transfer**

Tier IV:

- **Soul Forge**
- **Distributed Self**
- **Architect of Eternity**

Key tension: preserving a person versus editing them into what is useful.

### Shepherd of the Dead

Consent, reconciliation, sanctuary, release, and non-coercive return.

Tier I:

- **Gentle Passing**
- **Calm the Restless**
- **Last Request**

Tier II:

- **Voluntary Covenant**
- **Sanctuary of Names**
- **Burden of Grief**

Tier III:

- **Return the Stolen**
- **Second Life**
- **Guide Beyond the Gate**

Tier IV:

- **Keeper of the Last Door**
- **Refuge Outside Heaven**
- **The Final Choice**

Key tension: respecting a choice can permit destructive or painful outcomes.

### Fleshweaving

Bodies, organs, adaptation, chimeras, living armor, and custom vessels.

Tier I: Stitch Flesh, Preserve Tissue, Anatomist's Touch.
Tier II: Replace Organ, Corpse Adaptation, Graft Trait.
Tier III: Chimera Design, Living Armor, Perfected Frame.
Tier IV: Perfect Vessel, Self-Designed Body, The Unborn Species.

Key tension: healing and liberation versus objectification and manufactured life.

### Bone Sorcery

Direct combat magic, structures, weapons, prisons, and terrain.

Tier I: Bone Spear, Marrow Shield, Ivory Edge.
Tier II: Rib-Cage Prison, Ossified Ground, Bone Relay.
Tier III: Ivory Fortress, Colossus Frame, Rain of Teeth.
Tier IV: Walking Citadel, White Dominion, Throne of Bones.

Key tension: immediate reliable power consumes remains and can erase burial identity.

### Pale Covenant

Contracts with deathly powers, names, debt, loopholes, and patronage.

Tier I: Minor Pact, Read the Clause, Token of Debt.
Tier II: Name Collateral, Borrowed Power, Contract Loophole.
Tier III: Divine Debt, Rewrite Covenant, Call the Guarantor.
Tier IV: Become the Patron, Covenant of a Thousand Names, Refuse the Gods.

Key tension: power is negotiated rather than owned, and every shortcut establishes a creditor.

## MVP disciplines

MVP implements Grave Dominion, Soulcraft, and Shepherd of the Dead. Each requires at least ten nodes with:

- one introductory action node;
- two branch points;
- one mutually exclusive choice;
- one behavior-gated node;
- one teacher/discovery-gated node;
- one capstone;
- cross-discipline synergies;
- combat and narrative applications.

## Cross-discipline examples

- Grave Dominion + Shepherd: voluntary captains whose autonomy reduces control burden.
- Soulcraft + Shepherd: repair a damaged spirit before release.
- Grave Dominion + Soulcraft: distribute command through memory shards.
- Soulcraft + Fleshweaving: compatible vessel design.
- Bone Sorcery + Grave Dominion: fortress formations.
- Pale Covenant + any discipline: accelerate access while creating enforceable debt.

## Exclusions and transformations

Some decisions permanently transform a node:

- Raise Servant -> Enslave Dead, Request Service, or Echo Animation.
- Soul Anchor -> Preserve Identity or Seal Obedience.
- Grave Captain -> Elected Captain or Bound Overseer.

Transformations are recorded in character history and may change how future teachers and companions respond.

## Respec

Ordinary passive ranks may be refundable at a meaningful in-world cost. Story, pact, identity, body transformation, and behavior-earned nodes are not freely refundable. A respec never erases historical actions or faction knowledge.

## Presentation requirements

The UI provides:

- graph and accessible hierarchical list views;
- zoom, pan, search, filtering, and keyboard traversal;
- current/available/locked/excluded states;
- known prerequisite and cost explanations;
- preview of stat and action changes;
- explicit irreversible confirmation;
- build snapshot/export without hidden state.

## Validation

Content compiler rejects:

- missing references;
- cycles that make nodes impossible;
- mutually exclusive prerequisites;
- negative or unbounded costs;
- capstones without reachable paths;
- duplicate stable IDs;
- effects not supported by the domain engine.

Automated simulation must prove multiple viable MVP builds through Act I.
