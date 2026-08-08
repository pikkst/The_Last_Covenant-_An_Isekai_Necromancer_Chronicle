# Frontend Architecture and UX

## Responsibilities

The frontend renders authoritative projections, collects player intent, communicates commands, handles recoverable connectivity states, and provides an accessible dark-fantasy reading experience. It never calculates canonical outcomes.

## Target stack

- Next.js and React with strict TypeScript;
- Tailwind CSS using semantic design tokens;
- TanStack Query for server state;
- Zustand only for bounded ephemeral UI preferences;
- React Hook Form plus shared Zod-compatible contracts;
- Playwright and accessibility tooling;
- component documentation through Storybook or equivalent.

Dependency versions are selected and locked during M001.

## Route map

- `/`: product landing and continue action;
- `/login`, `/register`, `/recover`;
- `/saves`: save-slot management;
- `/new`: character creation;
- `/play/[saveId]`: main narrative shell;
- `/play/[saveId]/character`;
- `/play/[saveId]/skills`;
- `/play/[saveId]/journal`;
- `/play/[saveId]/codex`;
- `/play/[saveId]/map`;
- `/play/[saveId]/inventory`;
- `/play/[saveId]/companions`;
- `/settings`: accessibility, privacy, gameplay, and account controls.

Modal state should not replace navigable routes for major surfaces.

## Main play layout

Desktop:

- left: location/context and primary navigation;
- center: scene prose, canonical events, and choices;
- right: party, key resources, threats, and current objectives;
- bottom: save/connectivity/command status.

Mobile:

- single reading column;
- sticky choice/status area where it does not obscure content;
- secondary panels as routes or accessible drawers;
- no precision-dependent graph-only interactions.

## State ownership

Server state:

- save snapshot/revision;
- current scene and available actions;
- character and inventory;
- quests, facts, map, relationships;
- command status and canonical event log.

Ephemeral client state:

- open panels;
- font and motion preferences before sync;
- dismissed noncritical hints;
- skill-tree viewport;
- unsent text fields.

Never persist canonical state in local storage. A small encrypted/token-safe offline cache may contain the last read-only projection after explicit design approval.

## Command flow

1. User chooses an action.
2. Client creates an idempotency key and sends expected save revision.
3. Disable only conflicting interactions, not the whole application.
4. On success, replace/invalidate projections using returned revision.
5. On timeout, query command status before retry.
6. On revision conflict, fetch authoritative state and explain what changed.
7. Preserve focus and announce result to assistive technology.

Optimistic updates are limited to reversible presentation, never rewards or game rules.

## Component families

- scene reader and prose blocks;
- choice cards with requirement/exclusion states;
- canonical event log;
- resource and status chips;
- dialogue speaker and portrait treatment;
- skill graph and list tree;
- item/equipment panels;
- quest journal and codex entries;
- map graph and location list;
- companion cards;
- confirmations, alerts, toasts, skeletons, and recovery panels.

## Visual direction

Dark parchment, bone/ivory accents, muted blood and spectral colors, with excellent contrast. Atmosphere comes from typography, texture, spacing, sound, and restrained animation—not illegible text or constant effects.

Use semantic tokens for background, surface, text, border, focus, danger, success, grave, soul, church, pact, and faction states. Themes must remain testable.

## Accessibility

Target WCAG 2.2 AA:

- full keyboard operation;
- visible focus;
- logical headings and landmarks;
- skip links;
- screen-reader announcements for new canonical events;
- minimum touch targets;
- text zoom to 200% without loss;
- reduced-motion mode;
- no color-only meaning;
- graph alternatives as structured lists;
- captions/transcripts for meaningful audio;
- adjustable typography and line width;
- no timed decision without pause/extension.

## UX states

Every data surface designs:

- initial loading;
- background refresh;
- empty;
- permission denied;
- not found;
- stale revision;
- offline/read-only;
- recoverable server failure;
- permanent incompatibility;
- successful save;
- command pending/unknown.

## Security

- render prose as text or sanitized approved markup;
- no untrusted HTML;
- protect tokens according to authentication architecture;
- do not expose hidden conditions or secret NPC state;
- use restrictive Content Security Policy;
- validate imported files before upload;
- avoid sensitive diagnostics in browser logs.

## Performance budgets

Initial targets:

- keep route-level bundles intentionally bounded;
- lazy-load large skill/map tooling;
- virtualize long histories;
- paginate or summarize event logs;
- compress assets and avoid autoplay media;
- instrument Core Web Vitals and command latency.

## Testing

- component tests for states and keyboard behavior;
- contract tests against shared DTO schemas;
- Playwright journeys for creation, resume, choice, skill unlock, combat, save recovery, and export/import;
- axe-based automated checks plus manual screen-reader review;
- viewport coverage for small mobile, tablet, and desktop;
- failure injection for timeout, offline, 401, 403, 409, 429, and 5xx.
