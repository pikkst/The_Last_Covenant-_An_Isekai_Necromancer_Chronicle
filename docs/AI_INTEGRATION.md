# AI Integration

## Principle

AI enriches presentation; it does not run the game.

The complete canonical experience must function with AI disabled, unavailable, slow, unsafe, or unaffordable. Mechanics, facts, choices, rewards, relationships, combat, and quest outcomes are resolved before any model call.

## Allowed production uses

- rewrite a resolved event into a bounded tonal variant;
- phrase NPC dialogue from an approved intent and fact set;
- summarize already player-visible event history;
- generate optional recap prose;
- select among approved presentation templates when deterministic fallback exists.

Development-only uses, requiring human review:

- brainstorming;
- draft dialogue variants;
- consistency suggestions;
- schema-conforming content drafts;
- test-case suggestions.

## Prohibited uses

- canonical state mutation;
- combat or check resolution;
- inventing items, skills, characters, facts, rewards, or available choices;
- choosing what an NPC secretly knows;
- arbitrary tool/database access;
- executing model-produced code;
- bypassing ratings/content preferences;
- making cloud processing mandatory;
- training on player data without explicit, lawful consent.

## Provider-neutral port

Example conceptual contract:

```ts
interface NarrativeProvider {
  render(request: NarrativeRenderRequest): Promise<NarrativeRenderResult>;
}
```

Project-owned request fields include:

- request and trace IDs;
- locale;
- approved style profile;
- scene type;
- canonical resolved events;
- allow-listed known facts;
- speaker identity and knowledge;
- content-warning preferences;
- maximum output size;
- schema version.

Provider SDK types remain inside adapters.

## Implementations

- deterministic template renderer (required);
- local OpenAI-compatible LLM adapter;
- optional llama.cpp/Ollama/vLLM-compatible adapter selected during implementation;
- optional cloud provider adapter;
- deterministic fake with failure injection.

Local-first does not mean trusting local output. All providers pass the same validation and grounding pipeline.

## Pipeline

1. Domain engine commits canonical result.
2. Presentation service constructs a minimal allow-listed grounding packet.
3. Privacy/consent policy selects eligible provider.
4. Cache is checked using grounded input hash and render profile.
5. Provider executes under time, token, and concurrency limits.
6. Output is parsed against a strict schema.
7. Safety, length, markup, fact-reference, and speaker-knowledge checks run.
8. Valid output is cached and returned.
9. Any failure returns deterministic authored text immediately or after a small presentation timeout.

The command transaction never waits on a model.

## Output contract

Prefer structured output:

```json
{
  "paragraphs": ["..."],
  "speakerLine": null,
  "referencedFactIds": ["act1.fact.example"],
  "toneTags": ["somber"],
  "contentTags": ["grief"]
}
```

No raw HTML. Referenced facts must be a subset of supplied IDs. Length and paragraph counts are bounded.

## Prompt injection defense

Treat every content string and player-provided name as untrusted data, not instructions. The model has no tools. Delimit structured fields, minimize context, validate outputs, and never accept claims merely because the model marks them canonical.

NPC knowledge is generated from an allow-list, not the entire save.

## Privacy and consent

- AI is off by default until product policy is finalized.
- The settings page identifies provider type and whether data leaves the server/device.
- Cloud use requires explicit informed opt-in where applicable.
- Minimize account and gameplay identifiers.
- Do not transmit email, tokens, IP data, or unnecessary full history.
- Publish retention and training policies.
- Provide deterministic deletion of caches linked to a user where stored.
- Never log raw prompts/responses by default.

## Reliability

Adapters implement:

- timeout and cancellation;
- concurrency and rate limits;
- bounded retry only for safe transient failures;
- circuit breaker;
- token/budget cap;
- provider health metrics;
- deterministic fallback;
- cache versioning;
- safe error codes.

## Local model profile

A configurable profile may include endpoint, model identifier, context limit, output limit, supported structured-output mode, timeout, concurrency, and health endpoint. Secrets are environment-managed and never exposed to browsers.

Do not assume a model's advertised context is safe to fill. Use small grounded requests.

## Testing

Prove:

- identical canonical state/events with AI enabled and disabled;
- unknown facts are rejected or trigger fallback;
- malformed JSON, extra fields, unsafe markup, excess length, timeout, refusal, and provider outage fall back safely;
- prompt injection in player names or content cannot alter schema or tools;
- local and cloud adapters satisfy the same contract;
- logs and metrics exclude sensitive content;
- budget and circuit breaker behavior is deterministic under fakes.

## Evaluation

Maintain a reviewed evaluation set for:

- factual grounding;
- speaker voice;
- knowledge boundaries;
- continuity;
- content-warning compliance;
- instruction-injection resistance;
- fallback quality;
- latency and cost.

Human narrative review remains required before AI-generated text becomes authored static content.
