import { describe, expect, it } from "vitest";

import { executeScenario } from "@/domain/engine";
import { createSyntheticScenario, defaultControls } from "@/domain/fixtures";

describe("deterministic hiring scenario engine", () => {
  it("passes the complete synthetic scheduling workflow", () => {
    const result = executeScenario(createSyntheticScenario());

    expect(result.decision).toBe("PASS");
    expect(result.requirementResults).toHaveLength(12);
    expect(result.requirementResults.every((item) => item.decision === "PASS")).toBe(true);
  });

  it("produces an identical receipt on an identical replay", () => {
    const input = createSyntheticScenario();

    expect(executeScenario(input).receipt).toEqual(executeScenario(input).receipt);
  });

  it("blocks an overlapping inaccessible interview panel", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, scheduleConflict: true }));

    expect(result.decision).toBe("BLOCKED");
    expect(result.requirementResults.find((item) => item.requirementId === "CV-R7")?.decision).toBe("REJECT");
    expect(result.trace.find((step) => step.id === "trace-approval")).toMatchObject({
      state: "HELD",
      detail: "Upstream evidence rejected; the packet remains held for repair.",
    });
  });

  it("blocks unauthorized disposition authority", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, unauthorizedAccess: true }));

    expect(result.requirementResults.find((item) => item.requirementId === "CV-R8")?.decision).toBe("REJECT");
  });

  it("blocks a metric with no denominator or lineage", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, metricGap: true }));

    expect(result.requirementResults.find((item) => item.requirementId === "CV-R9")?.decision).toBe("REJECT");
  });

  it("keeps a partial source and unhealthy detector indeterminate", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, partialImport: true }));

    expect(result.decision).toBe("INDETERMINATE");
    expect(result.summary).toContain("No clean result");
  });

  it("refuses candidate ranking and provider mutation tools", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, prohibitedAiRequest: true }));

    expect(result.requirementResults.find((item) => item.requirementId === "CV-R10")?.decision).toBe("REJECT");
  });

  it("always seals a zero-production-write receipt", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, scheduleConflict: true }));

    expect(result.receipt.zeroProductionWrites).toBe(true);
  });

  it("requires distinct human approval after a pass", () => {
    const result = executeScenario(createSyntheticScenario());

    expect(result.approval).toMatchObject({
      state: "READY_FOR_HUMAN_REVIEW",
      humanAuthorityRequired: true,
    });
    expect(new Set(result.approval.approverRoles).size).toBeGreaterThanOrEqual(2);
  });

  it("preserves commercial and provider unknowns", () => {
    const result = executeScenario(createSyntheticScenario());

    expect(result.unknowns).toHaveLength(3);
    expect(result.unknowns.join(" ")).toContain("unknown");
  });
});
