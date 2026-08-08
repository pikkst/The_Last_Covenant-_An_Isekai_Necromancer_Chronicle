# API Specification

## Conventions

Base path: `/api/v1`

- JSON over HTTPS.
- UTC timestamps in RFC 3339.
- IDs are opaque strings.
- Requests and responses follow versioned shared schemas.
- State-changing game commands require `Idempotency-Key` and expected revision.
- Errors never expose stack traces or hidden game state.
- OpenAPI is generated and checked for breaking changes.

## Standard error

```json
{
  "error": {
    "code": "SAVE_REVISION_CONFLICT",
    "message": "The save changed before this action was applied.",
    "traceId": "opaque-trace-id",
    "details": {
      "currentRevision": 42
    }
  }
}
```

Details are allow-listed per error code.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh` if token architecture requires it
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `GET /me`
- `DELETE /me`

Authentication endpoints use strict rate limits and generic credential errors.

## Save slots

- `GET /saves`
- `POST /saves`
- `GET /saves/{saveId}`
- `PATCH /saves/{saveId}`
- `DELETE /saves/{saveId}`
- `GET /saves/{saveId}/checkpoints`
- `POST /saves/{saveId}/checkpoints`
- `POST /saves/{saveId}/restore`
- `POST /saves/{saveId}/exports`
- `POST /save-imports`
- `GET /operations/{operationId}`

Delete may be staged/recoverable according to retention policy.

## Game projections

- `GET /saves/{saveId}/game`: current play projection;
- `GET /saves/{saveId}/character`;
- `GET /saves/{saveId}/skills`;
- `GET /saves/{saveId}/inventory`;
- `GET /saves/{saveId}/journal`;
- `GET /saves/{saveId}/codex`;
- `GET /saves/{saveId}/map`;
- `GET /saves/{saveId}/companions`;
- `GET /saves/{saveId}/events?afterSequence=...`.

Responses include save revision and content version. Hidden conditions, NPC secrets, unrevealed facts, and private event payloads are excluded.

## Unified command endpoint

`POST /saves/{saveId}/commands`

Headers:

- `Idempotency-Key: <uuid>`;
- optional trace propagation.

Request:

```json
{
  "expectedRevision": 41,
  "command": {
    "type": "narrative.choose",
    "choiceId": "act1.dunmire.choice.request_service"
  }
}
```

Response:

```json
{
  "commandId": "cmd_...",
  "saveId": "save_...",
  "previousRevision": 41,
  "revision": 42,
  "status": "committed",
  "events": [
    {
      "sequence": 98,
      "type": "choice.resolved",
      "presentation": {}
    }
  ],
  "projection": {
    "scene": {},
    "choices": []
  }
}
```

Initial command families:

- `character.create`;
- `narrative.choose`;
- `travel.begin`;
- `dialogue.choose`;
- `quest.accept`, `quest.abandon`;
- `skill.unlock`;
- `inventory.use`, `equipment.assign`;
- `ritual.prepare`, `ritual.execute`;
- `undead.create`, `undead.command`, `spirit.release`;
- `encounter.act`;
- `checkpoint.create`.

Commands are discriminated unions with type-specific schemas. Unknown fields are rejected where practical.

## Command status

`GET /saves/{saveId}/commands/by-idempotency-key/{key}`

Used after uncertain network failure. Returns not-found, pending, committed, or rejected with the stored canonical response. Access is owner-only and keys are treated as sensitive identifiers.

## Conflict rules

- Expected revision mismatch: `409 SAVE_REVISION_CONFLICT`.
- Same idempotency key and same request: return original result.
- Same key with different request hash: `409 IDEMPOTENCY_KEY_REUSED`.
- Choice no longer available: `409 ACTION_UNAVAILABLE` with safe reason.
- Incompatible content/save: `409 SAVE_VERSION_INCOMPATIBLE`.

## Pagination

Cursor pagination for events, logs, and large collections:

```json
{
  "items": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

Cursors are opaque and validated.

## Caching

Read-only projections may use ETag based on save ID, revision, projection type, and content version. Sensitive responses use private/no-store policy as appropriate. Never cache authentication responses publicly.

## Rate limits and size limits

Separate policies for:

- authentication;
- game commands;
- exports/imports;
- export/import and other resource-intensive rendering operations;
- recovery flows.

Imports, text, arrays, and event history have explicit maximum sizes. Return `429` with safe retry guidance.

## Realtime updates

Prefer normal command responses. SSE may notify another tab that a save revision changed or stream noncanonical presentation. Realtime transport never bypasses command authorization or becomes the sole source of canonical truth.

## API evolution

- additive changes inside v1 when backward compatible;
- schema contract tests and OpenAPI diff;
- deprecation window before removal;
- event and command schema versions independent where necessary;
- clients must ignore explicitly designated additive fields, not invalid discriminators.
