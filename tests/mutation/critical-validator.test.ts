import { expect, it } from "vitest";

import { evaluateAcceptanceControl } from "@/domain/acceptance";
import type { DetectorId } from "@/domain/types";

it("critical scheduling validator rejects the seeded overlap", () => {
  const disabledDetector = process.env.DISABLE_DETECTOR as DetectorId | undefined;
  const result = evaluateAcceptanceControl("CV-R7-BAD", disabledDetector);

  expect(result.decision).toBe("REJECT");
  expect(result.issueCodes).toContain("CV_R7_REJECTED");
});
