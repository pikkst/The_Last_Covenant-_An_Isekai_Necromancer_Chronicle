# Summon Equipment and Inventory

## Purpose

Players can equip, specialize, repair, gift, reclaim, and inherit gear for summons. Equipment changes tactics, identity, appearance, maintenance, and relationships.

## Equipment slots

Slot availability depends on vessel and modifications.

Standard humanoid candidate slots:

- head;
- chest;
- shoulders or mantle;
- arms;
- hands;
- legs;
- feet;
- main hand;
- off hand;
- ranged;
- two ring slots;
- amulet;
- belt;
- cloak;
- relic;
- spirit anchor;
- command focus.

Nonhumanoid or incorporeal summons use body-specific slots such as carapace, core, binding seal, spectral mantle, limb modules, or mounted harness.

## Item categories

- weapons;
- shields/foci;
- armor;
- rings;
- amulets;
- cloaks;
- relics;
- anchors;
- command equipment;
- repair kits;
- consumables;
- memory-bearing items;
- vessel modifications;
- formation banners.

## Compatibility

Equip validation checks:

- body shape and slot;
- physical state;
- identity/Name;
- skill;
- role;
- material conflicts;
- attunement;
- covenant restrictions;
- faction law;
- item claims;
- corruption;
- current form.

A ring cannot be equipped by a summon without an appropriate body unless adapted, mounted, or spiritually attuned.

## Item properties

- stable ID;
- item definition;
- unique instance ID;
- condition/durability;
- modifiers;
- granted actions;
- requirements;
- attunement;
- owner/claims;
- provenance;
- memory;
- curse/obligation;
- visible appearance;
- repair materials;
- bind-on conditions;
- destruction behavior.

## Modifier rules

Use typed sources and explicit stacking:

- base vessel;
- skill;
- equipment;
- set;
- title;
- formation;
- temporary effect;
- environment.

The UI explains final values and inactive modifiers. Avoid uncontrolled multiplicative stacking.

## Armor

Armor can protect:

- structure;
- joints;
- vital anchors;
- spirit stability;
- command links;
- identity inscriptions.

Heavy armor may reduce mobility, stealth, ritual precision, vessel repair, or spirit flow.

## Rings and amulets

Jewelry is suited for:

- anchors;
- memory storage;
- covenant clauses;
- elemental resistance;
- command range;
- autonomy protection;
- vessel compatibility;
- emergency recall.

Powerful jewelry may contain prior owners or competing claims.

## Weapons

Weapons define attack options, range, damage layers, stance, reactions, and maintenance. A remembered weapon may restore skills to its former owner.

## Relics and attunement

Relics develop relationships with bearers. Attunement can require recognition, deed, memory, Name, oath, or compatible death state.

## Giving items

The player may offer rather than forcibly assign an item to an autonomous summon. Acceptance depends on:

- need;
- trust;
- role;
- identity;
- item provenance;
- covenant;
- competing claims;
- personal preference.

A gift becomes relationship history. Reclaiming it may be theft or breach.

## Personal inventory

Named summons can carry bounded items according to vessel/role. Behavior policies define when they may use consumables or swap equipment.

Army-scale generic units use validated loadout templates instead of individual micromanagement.

## Crafting and upgrading

Items may be:

- repaired;
- reforged;
- engraved;
- resized;
- spiritually attuned;
- combined with a memory;
- fitted to a new vessel;
- upgraded along mutually exclusive paths;
- dismantled with provenance consequences.

## Loot and recovery

After conflict, item outcome depends on location, witness, retreat, body recovery, durability, binding, and claims. Equipment is never silently duplicated by vessel transfer, fusion, checkpoint restore, or resurrection.

## Loadouts

Players can save loadout plans. Application remains a server-authoritative command that revalidates inventory, ownership, compatibility, and current revision.

## UX

Provide:

- summon paper-doll or vessel diagram;
- accessible slot list;
- comparison;
- exact modifier explanation;
- appearance preview;
- attunement/claim warnings;
- upgrade paths;
- gift versus command distinction;
- loadout templates for units.

## Testing

Test all vessel shapes, dual wielding, ring/anchor rules, attunement, gifts, refusal, inheritance, durability, unique items, fusion, death recovery, templates, concurrency, and duplication protection.
