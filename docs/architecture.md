# Architecture

## Decision surface

The first complete vertical answers one bounded question: whether a proposed interview-scheduling change can advance to distinct human review. It does not execute the change.

## Modules

| Module | Responsibility | Failure state |
|---|---|---|
| `src/domain/fixtures.ts` | Synthetic signed-export and named acceptance fixtures | Fixture identity is explicit and repeatable |
| `src/domain/acceptance.ts` | Isolated bad/good/mutation acceptance controls | Bad input rejects; a disabled detector makes the critical suite fail |
| `src/domain/engine.ts` | Full source-to-packet deterministic workflow | `BLOCKED` for a known violation; `INDETERMINATE` for unhealthy evidence |
| `src/domain/canonical.ts` | Sorted canonical JSON and SHA-256 evidence digest | No receipt is emitted without stable input serialization |
| `src/app/api/simulations/route.ts` | Zod-validated service boundary | Typed `400` for invalid input; retryable `503` for pre-receipt failure |
| `src/components/scenario-lab.tsx` | Responsive workflow, trace, evidence, retry, and restore UI | Error remains visible with retained-state guidance |
| `supabase/migrations/001_scenario_lab.sql` | Proposed tenant-scoped persistence | Not applied; provider state remains UNKNOWN |

## Core contracts

`HiringScenarioInput` binds a source snapshot, scenario graph, event corpus, schedule, actor operation, metric definition, advisor request, packet, and detector health manifest. `SimulationResult` returns:

- `PASS`, `BLOCKED`, or `INDETERMINATE`;
- twelve `RequirementResult` records;
- a six-step trace;
- stable source, scenario, and evidence digests;
- a zero-write receipt;
- human authority and rollback fields;
- unresolved commercial/provider unknowns;
- retained-state and retry guidance.

## Dependency and authority direction

1. UI sends only a typed set of synthetic failure controls.
2. The API creates the governed fixture server-side.
3. The engine runs deterministic validators.
4. The evidence encoder seals the result.
5. The UI renders the returned trace and receipt.
6. A human reviewer, outside this authoring session, decides whether to accept it.

The architecture contains no production provider adapter and no employment-decision tool. An optional future AI explainer can read cited evidence only; it cannot alter inputs, results, approval, or external state.

## Performance and persistence claim ceiling

This build proves correctness on a small synthetic corpus. It does not prove the blueprint's latency, capacity, availability, cost, retention, RPO, or RTO hypotheses. The Supabase SQL proves only that a proposed schema and tenant policies exist in source. Live RLS remains UNKNOWN until applied and provider-verified.
