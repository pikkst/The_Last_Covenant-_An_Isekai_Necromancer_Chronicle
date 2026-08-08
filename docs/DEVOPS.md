# Development, Deployment, and Operations

## Environments

- local;
- CI test;
- preview/staging;
- production.

Each uses validated configuration. Staging mirrors production topology where practical but uses isolated data and credentials.

## Local target

Docker Compose is the required backend runtime for local development. It runs the API, worker, PostgreSQL, and Redis, with optional observability profiles. Host execution may be documented only as an advanced debugging aid; the supported path is containerized.

Expected environment groups:

- application/public URLs;
- database;
- Redis/queues;
- authentication/session;
- email;
- object storage/export;
- observability;
- retention and limits.

Provide `.env.example` containing placeholders and documentation, never secrets.

## Containers

- multi-stage minimal images;
- non-root runtime;
- pinned base image versions;
- health checks;
- read-only filesystem where practical;
- explicit writable temp paths;
- no build secrets in layers;
- vulnerability scan and SBOM;
- graceful shutdown.

## CI/CD

Main stages:

- quality and tests;
- content compilation;
- application builds;
- container build/scan;
- migration validation;
- deploy to staging;
- smoke and E2E;
- gated production release;
- post-deploy health verification.

Use least-privilege, short-lived credentials and protected environments. Pin third-party actions.

## Deployment strategy

Start with a modular monolith deployment:

- web container;
- API container;
- worker container;
- managed or protected PostgreSQL;
- Redis;
- object storage for temporary exports/content artifacts;
- reverse proxy/edge TLS.

Use rolling or blue/green deployment only after compatibility requirements are met. Database migrations follow expand/migrate/contract.

## Health

- liveness: process is responsive;
- readiness: required dependencies and compatible content loaded;
- startup: migrations/config/content initialization;
- worker health: queue connectivity and heartbeat.

Health endpoints disclose minimal public detail.

## Observability

Structured JSON logs with trace/request/command IDs and redaction.

Traces cover:

- inbound HTTP;
- command transaction;
- database calls;
- queue publish/consume;
- authored narrative rendering and content lookup;
- export/import.

Metrics:

- traffic, latency, error codes;
- command type/status/conflicts/replays;
- DB pool/query/transaction;
- queue depth/age/retry/dead-letter;
- process CPU/memory/event loop;
- save size and revision growth;
- content version/validation;
- content-rendering failures, latency, and template coverage;
- backup age/restore verification.

Initial alerts focus on player impact: error rate, latency, readiness, exhausted DB pool, old queue jobs, backup failure, disk/storage risk, and high authentication abuse.

## Backups and disaster recovery

- automated encrypted PostgreSQL backups;
- point-in-time recovery where provider supports it;
- separate backup account/location;
- content and migration artifacts retained;
- backup access audited;
- scheduled restore rehearsals;
- documented RPO/RTO;
- Redis treated as reconstructable;
- player save export as additional portability, not backup substitute.

A backup is not valid until restored and verified.

## Migrations

Pre-deploy:

- validate from empty database and representative previous version;
- estimate lock/space risk;
- back up;
- define roll-forward/rollback application plan.

Never couple an irreversible destructive migration to the first deployment of code that needs it.

## Secrets

Use platform secret management. Separate per environment. Rotate on incident and schedule. Do not expose secrets to preview environments unnecessarily. CI logs and crash reports must redact them.

## Scaling

Scale measured bottlenecks:

- stateless API instances;
- workers by queue and concurrency;
- database indexes/pool and query tuning;
- Redis capacity;
- CDN for public static assets.

Do not split services until telemetry demonstrates an ownership or scaling need.

## Maintenance

Runbooks required for:

- elevated errors/latency;
- database unavailable;
- queue backlog/dead letters;
- content artifact failure;
- bad migration;
- compromised secret;
- compiled content artifact unavailable or incompatible;
- lost/corrupt save report;
- backup restore;
- account deletion failure.

## Release checklist

- all gates green;
- changelog and compatible versions recorded;
- content checksum verified;
- migration rehearsed;
- backup current;
- rollback/roll-forward plan;
- dashboards/alerts ready;
- support notes and known issues;
- post-deploy smoke;
- no critical/high security finding.


## Required Docker Compose topology

The default Compose project must include:

- `api` built from a production-like multi-stage Dockerfile;
- `worker` using the same validated application build where practical;
- `postgres` with health check and named volume;
- `redis` with health check and explicit persistence policy;
- `migrate` as a one-shot profile or deployment step;
- optional `seed`, `otel-collector`, `prometheus`, and `grafana` profiles.

The API and worker must run as non-root users, use dependency health conditions, support graceful termination, and avoid mounting source code in the production profile. Secrets are injected at runtime and never baked into images.
