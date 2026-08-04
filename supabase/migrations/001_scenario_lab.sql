-- Proposed persistence contract. The local demo runs in memory and does not apply this migration.
-- Live schema, policies, auth claims, and provider configuration remain UNKNOWN until provider-verified.

create table public.source_snapshots (
  tenant_id uuid not null,
  snapshot_id uuid primary key,
  source_type text not null,
  source_digest text not null,
  schema_version text not null,
  captured_at timestamptz not null,
  completeness_state text not null check (completeness_state in ('RECEIVING', 'QUARANTINED', 'ACCEPTED', 'PARTIAL', 'REJECTED', 'EXPIRED')),
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, source_digest)
);

create table public.recruiting_scenarios (
  tenant_id uuid not null,
  scenario_id uuid primary key,
  source_snapshot_id uuid not null references public.source_snapshots(snapshot_id),
  scenario_digest text not null,
  workflow_version text not null,
  seed integer not null,
  owner_user_id uuid not null,
  lifecycle_state text not null check (lifecycle_state in ('DRAFT', 'COMPILED', 'REVIEW_READY', 'ACCEPTED', 'SUPERSEDED', 'REVOKED')),
  scenario_contract jsonb not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, scenario_digest)
);

create table public.simulation_runs (
  tenant_id uuid not null,
  run_id uuid primary key,
  scenario_id uuid not null references public.recruiting_scenarios(scenario_id),
  source_digest text not null,
  scenario_digest text not null,
  engine_version text not null,
  seed integer not null,
  terminal_state text not null check (terminal_state in ('QUEUED', 'RUNNING', 'BLOCKED', 'PASSED', 'FAILED', 'CANCELLED', 'INDETERMINATE')),
  detector_manifest jsonb not null,
  trace jsonb not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, source_digest, scenario_digest, engine_version, seed)
);

create table public.evidence_receipts (
  tenant_id uuid not null,
  receipt_id uuid primary key,
  run_id uuid not null references public.simulation_runs(run_id),
  evidence_digest text not null,
  source_digest text not null,
  scenario_digest text not null,
  zero_production_writes boolean not null check (zero_production_writes),
  human_approval_state text not null check (human_approval_state in ('BLOCKED', 'READY_FOR_HUMAN_REVIEW', 'APPROVED', 'REVOKED', 'EXPIRED')),
  receipt jsonb not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, evidence_digest)
);

alter table public.source_snapshots enable row level security;
alter table public.recruiting_scenarios enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.evidence_receipts enable row level security;

create policy source_snapshots_tenant_select on public.source_snapshots
  for select using ((auth.jwt() ->> 'tenant_id') = tenant_id::text);
create policy source_snapshots_tenant_insert on public.source_snapshots
  for insert with check ((auth.jwt() ->> 'tenant_id') = tenant_id::text);

create policy recruiting_scenarios_tenant_select on public.recruiting_scenarios
  for select using ((auth.jwt() ->> 'tenant_id') = tenant_id::text);
create policy recruiting_scenarios_tenant_insert on public.recruiting_scenarios
  for insert with check (
    (auth.jwt() ->> 'tenant_id') = tenant_id::text
    and (auth.jwt() ->> 'sub') = owner_user_id::text
  );

create policy simulation_runs_tenant_select on public.simulation_runs
  for select using ((auth.jwt() ->> 'tenant_id') = tenant_id::text);
create policy simulation_runs_service_insert on public.simulation_runs
  for insert with check (
    (auth.jwt() ->> 'tenant_id') = tenant_id::text
    and (auth.jwt() ->> 'role') = 'scenario_runner'
  );

create policy evidence_receipts_tenant_select on public.evidence_receipts
  for select using ((auth.jwt() ->> 'tenant_id') = tenant_id::text);
create policy evidence_receipts_service_insert on public.evidence_receipts
  for insert with check (
    (auth.jwt() ->> 'tenant_id') = tenant_id::text
    and (auth.jwt() ->> 'role') = 'evidence_writer'
  );

revoke update, delete on public.evidence_receipts from authenticated;
revoke update, delete on public.simulation_runs from authenticated;
