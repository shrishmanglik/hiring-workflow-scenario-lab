import { describe, expect, it } from "vitest";

import { executeScenario } from "@/domain/engine";
import { createSyntheticScenario, defaultControls } from "@/domain/fixtures";

describe("error, retry, and rollback paths", () => {
  it("never converts a partial import into success", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, partialImport: true }));

    expect(result.decision).toBe("INDETERMINATE");
  });

  it("keeps retry available after a blocked run", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, scheduleConflict: true }));

    expect(result.recovery.retryAllowed).toBe(true);
  });

  it("retains the last accepted state", () => {
    const result = executeScenario(createSyntheticScenario({ ...defaultControls, metricGap: true }));

    expect(result.recovery.retainedState).toContain("last accepted");
  });

  it("provides a customer-owned rollback procedure", () => {
    const result = executeScenario(createSyntheticScenario());

    expect(result.approval.rollbackProcedure).toContain("production remains unchanged");
  });

  it("re-running the accepted fixture after a failure restores the same digest", () => {
    const before = executeScenario(createSyntheticScenario()).receipt.evidenceDigest;
    executeScenario(createSyntheticScenario({ ...defaultControls, scheduleConflict: true }));
    const after = executeScenario(createSyntheticScenario()).receipt.evidenceDigest;

    expect(after).toBe(before);
  });
});
