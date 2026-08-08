# Database Schema

## Scope

PostgreSQL is the canonical store. Prisma is the expected ORM/migration layer, but the domain owns its models. Names below are conceptual and may be refined through an ADR before implementation.

## Identity

### Account

- id;
- email_normalized (unique);
- password_hash;
- status;
- locale;
- created_at, updated_at, deleted_at;
- security_version.

### Session

- id;
- account_id;
- token_hash;
- family_id;
- created_at, expires_at, revoked_at;
- last_seen_at;
- client metadata minimized and retention-limited.

### SecurityAuditEvent

- id;
- account_id nullable;
- category/action;
- outcome;
- trace_id;
- safe metadata JSON;
- created_at.

Indexes support active sessions, token lookup, and audit retention.

## Saves

### SaveSlot

- id;
- account_id;
- display_name;
- status;
- current_revision;
- current_checkpoint_id nullable;
- rules_version;
- content_version;
- schema_version;
- created_at, updated_at, archived_at.

Unique owner-scoped slot constraints and index on `account_id, updated_at`.

### SaveRevision

- id;
- save_slot_id;
- revision;
- command_id;
- state payload or storage pointer;
- checksum;
- rules/content/schema versions;
- created_at.

Unique `save_slot_id, revision` and `command_id`. Revisions are immutable.

### SaveCheckpoint

- id;
- save_slot_id;
- revision;
- kind (autosave/manual/system);
- label;
- pinned;
- created_at.

### ProcessedCommand

- id;
- account_id;
- save_slot_id;
- idempotency_key;
- expected_revision;
- command_type;
- request_hash;
- result_status;
- response payload/reference;
- created_at, expires_at.

Unique `account_id, save_slot_id, idempotency_key`. A reused key with a different request hash is rejected.

## Canonical game projections

The exact split is validated through implementation. Candidate tables:

- CharacterState;
- CharacterSkill;
- InventoryItem;
- EquipmentAssignment;
- WorldFlag;
- KnownFact;
- KnownRumor;
- LocationState;
- QuestState;
- DialogueState;
- FactionRelationship;
- CompanionState;
- PromiseDebt;
- WitnessRecord;
- CorpseState;
- SpiritState;
- UndeadState;
- EncounterState;
- ScheduledGameEvent.

Every row includes `save_slot_id`; mutable projections include revision metadata. Stable content IDs are text identifiers validated against the pinned artifact.

Sensitive/hidden values must have query-specific repositories to prevent accidental projection to clients.

## Events

### DomainEvent

- id;
- save_slot_id;
- sequence;
- command_id;
- event_type;
- event_version;
- occurred_at;
- actor_id nullable;
- public_payload JSON;
- private_payload JSON or protected reference;
- rules/content versions.

Unique sequence per save and index by command/type/time. Event schemas are versioned.

### OutboxMessage

- id;
- aggregate type/id;
- message type/version;
- payload;
- deduplication_key;
- created_at;
- available_at;
- attempts;
- processed_at;
- last_error_code.

State mutation, domain events, and outbox inserts share a transaction.

## Content registry

### ContentArtifact

- version;
- checksum;
- engine compatibility range;
- object/storage location;
- status;
- created_at;
- activated_at;
- retired_at.

Content source remains in Git; compiled artifacts are immutable.

### SaveMigrationRecord

- save_slot_id;
- from/to schema, rules, and content versions;
- migration_id;
- before/after checksums;
- outcome;
- created_at.

## AI presentation

### NarrativeRenderCache

- cache_key;
- provider/model profile;
- template version;
- grounded input hash;
- validated output;
- safety classification;
- created_at, expires_at.

Do not store secrets or unnecessary raw prompts. Cache is noncanonical and safely disposable.

## Operations

- Job execution/dead-letter metadata if not fully owned by BullMQ;
- export records with expiry and owner;
- account deletion workflow;
- backup/restore audit;
- feature configuration with change audit.

## Transactions

A state-changing command transaction:

1. verifies ownership;
2. locks save slot/current revision;
3. checks idempotency;
4. evaluates domain command;
5. writes projections/revision;
6. appends domain events;
7. appends outbox;
8. stores command result;
9. advances current revision.

No network call occurs inside the transaction.

## JSON policy

JSONB is appropriate for versioned event payloads and some immutable revision state. Frequently queried canonical ownership, status, relationships, and ordering fields belong in typed columns.

All JSON payloads have application schemas and size limits.

## Deletion and retention

Account deletion:

- revoke sessions immediately;
- prevent new commands;
- cancel/expire exports;
- delete or irreversibly anonymize account-linked data according to policy;
- retain narrowly required security evidence without gameplay payload;
- record completion.

Revision pruning preserves pinned checkpoints, newest recovery window, and migration requirements. Never prune before verified backup.

## Migration policy

- forward-only, timestamped migrations;
- never edit deployed migrations;
- expand/migrate/contract for destructive changes;
- indexes created with production-safe strategy;
- representative save fixtures tested;
- backup and rollback/roll-forward plan documented;
- application supports required transition window.
