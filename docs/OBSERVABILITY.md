# Observability and Local Diagnostics

## Principles

- Every request carries a trace ID echoed in the `x-request-id` response header.
- Structured JSON logs include timestamp, level, message, trace ID, span ID, and redacted metadata.
- Secrets, passwords, tokens, and authorization headers are redacted before logging.
- Errors return a stable public envelope with code, message, and trace ID; internal details stay in logs.
- Metrics are collected in-memory and exposed at `/api/v1/metrics` as JSON.

## Trace and request IDs

The API generates a trace ID for every inbound request unless the client supplies `x-request-id`. The same ID is returned in the response header and attached to all logs and spans produced during that request.

## Error mapping

Domain errors use `AppError` with a stable `ErrorCode`. The API maps these codes to HTTP status:

| Code | HTTP |
| --- | --- |
| `NOT_FOUND` | 404 |
| `VALIDATION_ERROR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `CONFLICT` | 409 |
| `INTERNAL_ERROR` | 500 |

Unknown codes default to 500. 5xx responses expose only a generic message in the body.

## Structured logs

Logs are emitted as JSON with these fields:

```json
{
  "timestamp": "2026-08-09T14:00:00.000Z",
  "level": "INFO",
  "message": "request.start",
  "traceId": "opaque-trace-id",
  "spanId": "opaque-span-id",
  "meta": { "method": "GET", "url": "/api/v1/health" }
}
```

Fields known to contain secrets are replaced with `[REDACTED]`. This includes request headers and meta keys such as `password`, `secret`, `token`, `authorization`, and `cookie`. Long opaque strings are also redacted.

## Metrics

Baseline metrics are gathered in `InMemoryMetrics`. The current implementation collects:

- `http_requests_total` - counter by method, url, status
- `http_request_duration_seconds` - histogram (collected as samples)
- `command_total` - counter by status, command type (available for future command handlers)
- `active_saves` - gauge (available for future save projection)

Fetch current metrics:

```bash
curl http://localhost:3001/api/v1/metrics | jq .
```

## OpenTelemetry

The `@tlc/observability` package exports a `Tracer` interface. If `@opentelemetry/api` is installed, the tracer starts spans and attaches them to the current trace context. Otherwise it falls back to a no-op implementation.

To enable OpenTelemetry in local Docker Compose, mount an OTel collector and configure SDK initialization in the API container. The bootstrap in this milestone establishes the span lifecycle; full SDK resource and exporter wiring can be added in the ops profile without changing application code.

## Health checks

- `GET /api/v1/health/liveness` - process is responsive.
- `GET /api/v1/health/readiness` - dependencies loaded and service ready.
- `GET /api/v1/health` - combined check.

Health endpoints return minimal public detail.

## Local development

Start the API:

```bash
pnpm dev
```

Observe logs in the terminal. Requests automatically include `x-request-id` headers.

Run tests:

```bash
pnpm test
pnpm lint
pnpm typecheck
```

## Privacy

Never log:

- passwords, tokens, raw cookies, secrets, private authored content payloads, or complete save payloads;
- stack traces in API responses;
- internal database records in API responses.
