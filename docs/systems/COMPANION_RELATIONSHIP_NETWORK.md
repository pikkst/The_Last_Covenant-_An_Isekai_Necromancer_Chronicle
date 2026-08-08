# Companion Relationship Network

## Purpose

Companions form relationships with each other, factions, undead, and institutions. They are not separate approval meters orbiting the protagonist.

## Relationship dimensions

For each meaningful pair:

- trust;
- fear;
- respect;
- affection;
- dependence;
- ideological agreement;
- debt;
- intimacy;
- resentment;
- shared secrets;
- witnessed betrayals;
- current boundaries.

Only narratively relevant edges are instantiated.

## Relationship events

Edges change through:

- shared scenes;
- battle protection or abandonment;
- ideological decisions;
- promises;
- private conversations;
- territory roles;
- death/undeath;
- secrets and lies;
- independent plans;
- player mediation;
- time.

## Group dynamics

The party can develop:

- alliances;
- mentorship;
- friendship;
- rivalry;
- romance where scoped;
- protective bonds;
- ideological blocs;
- secret agreements;
- mutual distrust;
- plans to restrain or remove the protagonist.

## Independent action

Companions may:

- comfort or confront each other;
- share information;
- hide information from the player;
- prevent departure;
- encourage rebellion;
- make a joint request;
- refuse to serve together;
- nominate leadership;
- continue another companion's quest;
- choose sides during a crisis.

## Example network

Seraphine and Morrow may progress from hostility to legal/philosophical respect, or toward mutual attempts at destruction. Lys may trust Aldren with her autonomy more than the player. Aldren may ask Seraphine to ensure his final release.

## Departure and replacement

A companion leaving does not erase their network. Friends may follow, intervene, correspond, or oppose them. If a companion dies, relationships shape mourning, inheritance, resurrection claims, and replacement content.

## Player knowledge

Not all edges are visible. The player sees behavior, disclosed feelings, and sufficiently inferred dynamics. The UI avoids exact hidden affection numbers.

## Group scenes

Trigger from relationship patterns, location, time, recent events, and speaker knowledge. Use authored scene variants and priority rules to prevent impossible combinations.

## Performance

Do not compute a complete graph for every NPC. Persist important edges and derive aggregate party tension through bounded queries.

## Testing

Test group splits, death, departure, secrets, relationship contradictions, scene priority, Act transitions, save migration, and independent final choices.
