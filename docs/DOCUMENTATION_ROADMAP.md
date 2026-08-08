# Complete Documentation Roadmap

## Purpose

This file tracks the documentation required from foundation through full release, expansions, live support, and eventual end-of-life. A checked item means the document exists and covers its intended domain; it does not mean implementation is complete.

## Existing foundation

- [x] README and product vision
- [x] Contributor/agent rules
- [x] Product requirements
- [x] Game design
- [x] Narrative Bible
- [x] Skill tree
- [x] Content system
- [x] Frontend
- [x] Backend
- [x] Database schema
- [x] API specification
- [x] Security
- [x] Testing
- [x] DevOps
- [x] Roadmap
- [x] Architecture decisions
- [x] Master tasks

## Full campaign

- [x] Master five-act story outline
- [ ] Act I detailed scene/quest plan
- [x] Act II campaign
- [x] Act III campaign
- [x] Act IV campaign
- [x] Act V campaign
- [x] Endings and epilogue engine
- [x] New Game Plus
- [ ] Mystery reveal matrix
- [ ] canonical world timeline
- [ ] branching dependency map
- [ ] promises and consequences registry
- [ ] full quest catalog
- [ ] main-path continuity test matrix

## World

- [x] World Bible
- [x] Metaphysics
- [x] Magic system
- [x] Religions and gods
- [x] Faction Bible
- [x] Creature/undead bestiary
- [ ] locations gazetteer
- [ ] cultures and naming guide
- [ ] languages and terminology
- [ ] items and relics catalog
- [ ] history and calendar
- [ ] burial law comparison
- [ ] environmental and seasonal design

## Characters

- [ ] complete Character Bible
- [ ] companion arcs through Acts I–V
- [ ] antagonist Bible
- [ ] NPC knowledge matrix
- [ ] relationship system
- [ ] character voice guide
- [ ] naming and portrait brief
- [ ] romance policy if romance enters scope
- [ ] death/undeath replacement routes
- [ ] companion ending matrix

## Systems

- [x] tactical combat
- [x] necromancy
- [x] undead creation/lifecycle
- [x] army/formations
- [x] territory/governance
- [x] crafting/rituals/relics
- [x] economy/resources
- [ ] inventory/equipment
- [ ] travel/exploration
- [ ] quest/dialogue engine detailed specification
- [ ] death/vessels
- [ ] factions/rumors detailed specification
- [ ] achievements/titles
- [ ] difficulty/accessibility gameplay
- [ ] balance framework
- [ ] strategic encounter resolution
- [ ] tutorial/onboarding
- [ ] save/checkpoint player experience

## UX and presentation

- [ ] UI/UX Bible
- [ ] visual design system
- [ ] screen-by-screen specifications
- [ ] responsive behavior
- [ ] accessibility specification
- [ ] typography and reading experience
- [ ] art direction
- [ ] audio and music direction
- [ ] animation/effects
- [ ] iconography
- [ ] localization UX
- [ ] content-warning UX
- [ ] frontend error/recovery catalog

## Technical and Docker operations

- [ ] detailed system architecture
- [ ] Docker architecture
- [ ] Docker Compose profiles
- [ ] environment variable reference
- [ ] authentication/session design
- [ ] authorization matrix
- [ ] save versioning
- [ ] content migrations
- [ ] event catalog
- [ ] error catalog
- [ ] observability specification
- [ ] performance budgets
- [ ] backup/restore runbook
- [ ] deployment runbook
- [ ] incident response
- [ ] data retention/deletion
- [ ] dependency policy
- [ ] ADR expansion as decisions are made

## Content authoring tools

- [ ] content editor
- [ ] quest graph editor
- [ ] dialogue editor
- [ ] skill-tree editor
- [ ] encounter editor
- [ ] localization pipeline
- [ ] content validation
- [ ] headless simulation
- [ ] narrative continuity reports
- [ ] content release workflow

## Quality

- [ ] test plan by milestone
- [ ] browser/device matrix
- [ ] accessibility manual test plan
- [ ] performance/load plan
- [ ] security verification plan
- [ ] balance playtest plan
- [ ] narrative QA guide
- [ ] save migration fixtures
- [ ] release acceptance matrix
- [ ] bug severity and triage policy

## Commercial release

- [ ] monetization guardrails
- [ ] demo strategy
- [ ] store-page content
- [ ] marketing plan
- [ ] community plan
- [ ] support process
- [ ] privacy/terms requirements
- [ ] content warnings
- [ ] credits and attribution
- [ ] release checklist
- [ ] pricing/edition decision
- [ ] launch communications

## Post-launch and expansions

- [ ] post-launch roadmap
- [ ] patch policy
- [ ] save compatibility policy
- [ ] expansion architecture
- [ ] player feedback process
- [ ] privacy-safe analytics
- [ ] live incident communication
- [ ] mod/content-pack policy
- [ ] localization expansion
- [ ] end-of-life and archival policy

## Documentation rules

- Documents are English and use stable domain terminology.
- Human-authored narrative only; no LLM or generative AI dependency.
- Docker Compose is the supported local backend runtime.
- Every implementation task links the governing documents.
- When code disproves an assumption, update the document and an ADR.
- Do not mark a document complete while it contains unresolved placeholders that affect implementation.
- Story spoilers belong under clearly named story/world paths.
- Content data schemas remain authoritative over illustrative snippets.
