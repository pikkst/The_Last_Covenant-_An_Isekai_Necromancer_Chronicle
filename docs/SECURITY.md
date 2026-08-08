# Security

## Security objectives

Protect accounts, save integrity, hidden narrative state, service availability, secrets, and player privacy. A compromised client must not be able to grant rewards, unlock skills, inspect secrets, or alter another player's save.

## Trust boundaries

Untrusted:

- browser and local storage;
- all request input and headers;
- imported save files;
- authored content before compilation;
- AI prompts and outputs;
- external providers;
- queue payloads crossing version boundaries;
- logs or diagnostic fields originating from users.

Trusted only after validation/authorization:

- API command orchestration;
- compiled signed/checksummed content artifact;
- domain engine;
- PostgreSQL committed state.

## Primary threats and controls

### Account takeover

- modern password hashing;
- breached/common password policy as appropriate;
- generic authentication errors;
- session rotation and revocation;
- secure, HttpOnly, SameSite cookies where used;
- reset token hashing, expiry, one-time use;
- authentication rate limits and audit;
- optional MFA after MVP evaluation.

### Cross-account save access

- owner filtering inside repositories/services;
- authorize every object by account, never guessed ID alone;
- opaque identifiers;
- negative authorization tests;
- no mass-assignment of owner fields.

### Client cheating/state forgery

- canonical calculations on server;
- commands reference stable action IDs;
- revision and availability rechecked transactionally;
- server-generated/derived RNG;
- signed/checksummed export format;
- no client-supplied rewards, stats, or outcomes.

### Replay and double spend

- required idempotency keys;
- request hashes;
- unique constraints;
- optimistic revision checks;
- transactional command/result storage;
- bounded key retention compatible with retries.

### XSS and content injection

- render text or narrowly sanitized markup;
- restrictive CSP;
- no generated raw HTML;
- schema and length validation;
- safe URL and asset allow-lists;
- test player names, imported content, and AI output.

### CSRF

If cookie authentication is used, require SameSite policy plus CSRF token/origin validation for mutations. Document the final approach in an ADR and test it.

### Import/export attacks

- strict file and decompressed size limits;
- streaming parser where appropriate;
- schema/version/checksum validation;
- zip-bomb/path-traversal defense;
- no executable content;
- malware/object-storage policy if attachments are ever added;
- quarantine before canonical import;
- owner-only expiring export links.

### Prompt injection and AI leakage

Controls in `AI_INTEGRATION.md`: no tools, minimal allow-listed facts, strict output schema, provider consent, safe fallback, and no hidden-state exposure.

### Denial of service

- endpoint-specific rate limits;
- body/array/text limits;
- database timeouts;
- bounded graph traversal;
- queue quotas and concurrency;
- export/AI job quotas;
- pagination;
- circuit breakers;
- protection at edge/load balancer.

### Supply chain and secrets

- lockfiles;
- dependency review and automated scanning;
- pinned actions;
- least-privilege CI tokens;
- secret scanning;
- no secrets in repo, images, logs, or client bundles;
- key rotation procedure;
- provenance/SBOM before production.

## Authorization matrix

Roles initially:

- guest session;
- account user;
- operational support (future);
- administrator (future);
- system worker.

Users access only their account, saves, exports, and command statuses. Operational roles require explicit scoped permissions and audit; there is no universal gameplay-edit permission.

## Data classification

- Restricted: password hashes, session/reset tokens, secrets.
- Private: email, account identifiers, IP/security metadata, complete save/export.
- Internal: hidden quest/NPC state, operational diagnostics.
- Public: published game content and documentation.

Logging, retention, backup, and access policies derive from classification.

## Cryptography

Use platform-vetted libraries. Passwords are hashed, not encrypted. Tokens are random and stored hashed where lookup permits. TLS is mandatory in production. Backups and object-storage exports are encrypted. Key ownership and rotation are documented before release.

## Logging and audit

Never log:

- passwords or hashes;
- tokens/cookies/API keys;
- full request bodies;
- full saves/exports;
- raw cloud AI prompts/responses;
- sensitive imported data.

Audit authentication, recovery, session revocation, account deletion, export/import, restore, administrative access, content activation, and backup restore.

## Vulnerability management

- automated dependency, code, container, and secret scanning;
- threat-model review for major features;
- security issue intake;
- severity and remediation targets;
- emergency dependency patch process;
- incident containment, communication, recovery, and retrospective.

## Security release gate

Before production:

- authorization matrix covered by tests;
- CSRF/XSS/session strategy reviewed;
- rate limits exercised;
- import adversarial tests pass;
- backup restore succeeds;
- secrets and dependency scans clean or explicitly accepted;
- no unresolved critical/high issue;
- privacy and retention documentation published.
