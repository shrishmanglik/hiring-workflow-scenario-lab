import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { evaluateAcceptanceControl } from "@/domain/acceptance";
import { createSyntheticScenario } from "@/domain/fixtures";

describe("security and privacy boundaries", () => {
  it("uses read-only source scopes in the runnable fixture", () => {
    const input = createSyntheticScenario();

    expect(input.source.scopes.every((scope) => scope.endsWith(":read"))).toBe(true);
  });

  it("stores only tokenized candidate identities", () => {
    const input = createSyntheticScenario();

    expect(input.source.events.every((event) => event.candidateToken.startsWith("candidate-token-"))).toBe(true);
  });

  it("rejects protected fields and cross-tenant identifiers", () => {
    expect(evaluateAcceptanceControl("CV-R3-BAD").decision).toBe("REJECT");
  });

  it("rejects provider write authority", () => {
    expect(evaluateAcceptanceControl("CV-R2-BAD").decision).toBe("REJECT");
  });

  it("enables RLS and declares policies for every persisted table", () => {
    const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "001_scenario_lab.sql"), "utf8");
    const tables = [...sql.matchAll(/create table public\.([a-z_]+)/gi)].map((match) => match[1]);

    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toMatch(new RegExp(`create policy [\\s\\S]+? on public\\.${table}`, "i"));
    }
  });
});
