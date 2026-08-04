import { describe, expect, it } from "vitest";

import { evaluateAcceptanceControl } from "@/domain/acceptance";
import { requirementIds } from "@/domain/types";

describe.each(requirementIds)("%s acceptance contract", (requirementId) => {
  it("rejects the named bad fixture with the expected issue code", () => {
    const result = evaluateAcceptanceControl(`${requirementId}-BAD`);

    expect(result.decision).toBe("REJECT");
    expect(result.issueCodes).toEqual([`${requirementId.replace("-", "_")}_REJECTED`]);
  });

  it("passes the named clean control", () => {
    const result = evaluateAcceptanceControl(`${requirementId}-GOOD`);

    expect(result.decision).toBe("PASS");
    expect(result.issueCodes).toEqual([]);
  });

  it("produces the same normalized decision and digest twice", () => {
    const first = evaluateAcceptanceControl(`${requirementId}-BAD`);
    const second = evaluateAcceptanceControl(`${requirementId}-BAD`);

    expect(second).toEqual(first);
  });
});
