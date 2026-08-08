# Knowledge and Truth System

## Purpose

Characters act on incomplete, biased, and sometimes manipulated information. The game must preserve mystery while clearly distinguishing what the protagonist knows from canonical truth.

## Knowledge layers

- canonical world fact;
- observed event;
- character memory;
- testimony;
- document/record;
- rumor;
- inference;
- doctrine;
- deliberate lie;
- player-only Chronicle unlock.

The client never receives hidden canonical truth merely to display uncertainty.

## Player-facing confidence

Entries may be:

- Confirmed;
- Witnessed;
- Corroborated;
- Inferred;
- Rumored;
- Contradicted;
- Suspected fabrication;
- Unresolved.

Confidence describes evidence available to the character, not an omniscient percentage.

## Knowledge record

- proposition ID;
- subject;
- claim;
- source;
- acquisition time/location;
- confidence;
- corroborating/conflicting sources;
- source credibility;
- known alterations;
- characters/factions aware;
- secrecy;
- expiration or state dependency;
- codex presentation key.

## Information actions

- ask;
- investigate;
- observe;
- compare;
- test;
- reveal;
- conceal;
- falsify;
- steal;
- publish;
- discredit;
- forget;
- restore memory.

## NPC knowledge

Each important NPC has accessible knowledge, beliefs, secrets, lies, and inference capability. Dialogue conditions query NPC knowledge rather than global save facts.

## Rumor propagation

Rumors have source, witnesses, credibility, region, transmission route, distortion rules, faction amplification, contradiction, and decay. Propagation occurs through deterministic scheduled world events.

## Codex

The Codex presents the current best-supported understanding and preserves earlier interpretations in a history view where useful. It avoids turning newly learned context into a silent rewrite.

## Checks and choices

The game does not require the human player to remember information already available to the character. Choices may cite relevant known facts. Incorrect beliefs can unlock sincere but mistaken actions.

## Falsification

The player can create propaganda or false evidence, but success depends on credibility, records, witnesses, institutions, and later investigation.

## Spoiler security

- Query-specific projections;
- no hidden condition labels;
- no global NPC-state payload;
- server-authoritative availability;
- tests for undiscovered fact leakage;
- safe error messages.

## Testing

Test source conflicts, knowledge transfer, lies, rumor distortion, codex updates, NPC boundaries, deleted witnesses, content migrations, and unauthorized hidden-state access.
