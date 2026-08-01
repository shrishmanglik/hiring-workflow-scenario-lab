# Data and RLS contract

The local product uses in-memory synthetic fixtures. `supabase/migrations/001_scenario_lab.sql` is a proposed persistence boundary, not an applied migration.

## Tables

- `source_snapshots`: provenance, schema, digest, completeness, and capture time.
- `recruiting_scenarios`: versioned scenario contract, owner, source identity, and lifecycle.
- `simulation_runs`: idempotent source/scenario/engine/seed identity, detector manifest, terminal state, and trace.
- `evidence_receipts`: immutable evidence identity, zero-write assertion, and human approval state.

## RLS

RLS is enabled on every table. Policies compare the authenticated JWT `tenant_id` claim with the row tenant. Scenario insert additionally binds `sub` to the owner. Run and receipt inserts require dedicated scoped roles. Update/delete is revoked for immutable runs and receipts.

The security suite parses the SQL, derives the actual table list, and requires an RLS enable statement and at least one policy for every discovered table. It does not hard-code a table count.

## Unknowns before provider use

- exact Supabase auth-claim shape;
- production roles and grants;
- policy behaviour against anon, authenticated, service, cross-tenant, and revoked sessions;
- data residency, retention, deletion, backup, and incident obligations;
- live schema parity.

These require an independently reviewed migration and provider-side negative/positive role-matrix proof.
