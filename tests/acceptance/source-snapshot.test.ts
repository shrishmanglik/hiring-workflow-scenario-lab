import { describe, expect, it } from "vitest";

import { evaluateAcceptanceControl } from "@/domain/acceptance";

describe("CV-R1 source provenance control", () => {
  it("rejects a stale, altered, unhashed snapshot", () => {
    const result = evaluateAcceptanceControl("CV-R1-BAD");

    expect(result.decision).toBe("REJECT");
    expect(result.issueCodes).toContain("CV_R1_REJECTED");
  });
});
