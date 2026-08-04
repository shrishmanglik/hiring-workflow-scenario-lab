# ADR-0001: Deterministic read-only first vertical

Status: accepted for this implementation candidate

## Context

The venture blueprint describes a broad cross-system product. A recruiter-inspectable build needs a complete user decision without pretending that provider connections, customers, or commercial proof exist.

## Options

1. Build a dashboard over static outputs. Fast, but it would not prove the workflow or controls.
2. Build a live ATS integration. It would require credentials, provider authority, customer data, and privacy review that are unavailable and out of scope.
3. Build a signed-export, synthetic, deterministic scheduling-change vertical with the same typed boundaries a provider adapter would use.

## Decision

Use option 3. The runnable path starts with a server-created synthetic snapshot, executes all twelve blueprint controls, and ends with a human review packet. Persistence is represented by a proposed RLS schema but is not required for the local run. Runtime AI is excluded because the core decision is deterministic.

## Reversibility

Provider adapters can later implement the same source contract without changing detector semantics. Persistence can replace in-memory fixtures behind the service boundary. Either change remains separately reviewable and can be rolled back without changing the evidence format.

## Rejected alternatives

- Static dashboard: rejected as prototype theatre.
- Live provider integration: rejected because it violates the present authority and evidence boundary.
- Runtime model-generated decision: rejected because scheduling, permissions, metrics, and approval completeness are rule problems, not interpretive work.
