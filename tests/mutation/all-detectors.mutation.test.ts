import { describe, expect, it } from "vitest";

import { verifyDetectorMutation } from "@/domain/acceptance";
import { requirementIds } from "@/domain/types";

describe.each(requirementIds)("DET-%s mutation canary", (requirementId) => {
  it("detects that the bad fixture falsely passes when its detector is disabled", () => {
    const result = verifyDetectorMutation(`DET-${requirementId}`);

    expect(result.mutationDetected).toBe(true);
    expect(result.observedDecision).toBe("PASS");
  });
});
