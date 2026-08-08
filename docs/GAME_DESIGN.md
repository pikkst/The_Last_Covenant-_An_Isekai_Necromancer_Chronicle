# Game Design Document

## High concept

A text-first dark-fantasy RPG where the player becomes a necromancer in another world and must decide what the dead are: tools, citizens, patients, witnesses, soldiers, or something beyond life.

## Core loop

1. Explore a location and gather incomplete information.
2. Speak, investigate, bargain, or fight.
3. Make a decision under ethical and resource pressure.
4. Acquire knowledge, bodies, spirits, allies, enemies, and obligations.
5. improve the protagonist, companions, and undead.
6. Observe delayed world consequences.
7. Prepare for a larger threat and repeat.

## Character model

Primary attributes:

- **Body:** endurance, physical action, vessel stability.
- **Mind:** analysis, memory work, ritual complexity.
- **Will:** resistance, bindings, concentration, death survival.
- **Presence:** persuasion, command, intimidation, empathy.
- **Death Affinity:** perception and manipulation of necromantic forces.

Narrative axes are not conventional good/evil meters:

- Humanity;
- Corruption;
- Church Awareness;
- Dead Recognition;
- method-specific ethical history;
- faction and companion relationship dimensions.

Values may unlock content but should not reduce morality to one score.

## Build layers

A build combines:

- origin;
- vessel traits;
- soul scars/gifts;
- attributes;
- disciplines and skill nodes;
- titles earned from actions;
- equipment and relics;
- pacts and debts;
- companion/undead synergies.

The system should support viable specialist and hybrid builds while preserving opportunity cost.

## Resources

Candidate resources:

- Vitality;
- Focus;
- Will;
- Essence;
- Control capacity;
- ritual materials;
- favors/debts;
- time;
- body condition and spirit stability.

Resource pressure must create choices, not repetitive farming. Important resources require multiple acquisition routes.

## Skill progression

Skill points alone are insufficient. Nodes may also require:

- a discovered teacher or text;
- a world-state condition;
- demonstrated behavior;
- a title;
- a specific body/spirit experience;
- accepting a cost, scar, pact, or exclusion.

The UI must separate known requirements from intentionally hidden discoveries.

## Exploration

Locations form a directed graph with travel time, risk, faction control, discovered routes, and changing availability. Scenes within a location provide actions rather than free coordinate movement.

Travel can trigger authored or seeded events. Repeated events must track exhaustion/cooldown and respond to world state.

## Dialogue and checks

Choices may be:

- always available;
- gated by known facts, stats, skills, items, relationships, titles, or time;
- visible but disabled with an explanation;
- hidden to protect discovery;
- risky checks with disclosed or partially disclosed factors.

Checks use seeded rules. Failure should frequently change the situation rather than merely repeat the same prompt.

## Quest design

Quests are explicit state machines. Each meaningful quest should include:

- personal or thematic stake;
- at least two solution methods;
- at least one consequence beyond immediate reward;
- relevant reactions from witnesses or factions;
- failure or refusal behavior;
- journal text based on player knowledge;
- cleanup for mutually exclusive content.

Avoid errands that exist only to inflate duration.

## Necromancy composition

An undead entity is derived from:

`Body + Animating Identity + Binding + Role + Equipment + Memory`

Animating identity can be:

- original spirit;
- different spirit;
- consensual covenant;
- coerced binding;
- residual echo;
- artificial composite;
- empty necromantic impulse.

Composition changes abilities, agency, stability, upkeep, relationships, and ethical consequences.

## Combat model

Combat is turn/round based and expressed as tactical prose supported by compact structured information.

Key concepts:

- zones and range;
- initiative/tempo;
- visible or inferred intentions;
- cover and environmental objects;
- body and spirit damage;
- statuses and exposed opportunities;
- actions, reactions, rituals, and commands;
- morale, surrender, negotiation, retreat;
- corpses and spirits created during battle.

A turn consists of observation, command selection, server resolution, canonical event log, and presentation.

Enemy decisions use deterministic behavior policies. Prose may vary, outcomes may not.

## Damage and defeat

Avoid damage-only attrition. Consequences can include:

- wounds;
- broken equipment;
- lost control;
- exposed memories;
- spirit instability;
- changed positioning;
- surrender;
- capture;
- permanent soul harm.

Defeat should create story where possible, but some explicitly telegraphed conditions can cause permanent loss.

## Death and continuity

Protagonist death options depend on preparation:

- awaken in a prepared vessel;
- possess a compatible nearby body;
- continue temporarily as a spirit;
- sacrifice an allied bond;
- lose memories or skills;
- leave behind a dangerous former vessel.

Death must be costly and narratively acknowledged without routinely deleting many hours of progress.

## Companions

Companion state includes trust, fear, respect, dependence, ideology, personal goal, secrets, knowledge, injuries, and relationship commitments.

Companions can object, refuse, leave, betray, reconcile, die, become undead, or gain independent political influence. High trust does not erase ideological boundaries.

## Factions and rumors

Faction response depends on:

- known outcomes;
- witnessed methods;
- credibility of witnesses;
- regional communication;
- propaganda;
- debts and prior relationships.

This allows the player to be secretly merciful, publicly monstrous, or the reverse.

## Economy

There is no generic infinite vendor economy. Relevant economies include:

- ordinary coin and supplies;
- ritual components;
- corpses and burial rights;
- forbidden knowledge;
- favors and political debt;
- essence and soul fragments;
- time-sensitive opportunities.

Bodies and spirits must never be treated as ethically neutral inventory in narrative systems, even when mechanically represented.

## Difficulty

Difficulty options should adjust numerical pressure and information assistance without removing story:

- Story;
- Standard;
- Severe;
- Custom.

Custom options may change resource scarcity, enemy lethality, check transparency, death penalties, and hint strength. Accessibility assists are independent of difficulty.

## Saving

Autosave at stable command boundaries. Never save halfway through an unresolved transaction. Preserve recent immutable revisions and allow checkpoint naming before major decisions. Warn about irreversible content choices without revealing spoilers.

## Replayability

Replay value comes from:

- origins and mutually exclusive disciplines;
- companion ideology;
- faction alliances;
- methods remembered by the world;
- hidden knowledge carried by the player but not the character;
- alternate vessels and death outcomes;
- New Game Plus only after core campaign completion.

## Balance principles

- No mandatory node.
- No origin invalidates a discipline.
- Every major obstacle supports multiple approaches.
- Costs must remain meaningful at their point in the campaign.
- Dominant strategies are detected through simulation and playtesting.
- Narrative power and combat power both consume budget.
- Irreversible choices require clear, contextual confirmation.
