import { evidenceDigest } from "./canonical";
import { createControlFixture } from "./fixtures";
import type { ControlFixture, ControlResult, DetectorId, RequirementId } from "./types";

type Detector = (payload: Record<string, unknown>) => boolean;

const detectors: Record<RequirementId, Detector> = {
  "CV-R1": (value) => value.digestValid === true && value.fresh === true && value.authorityPresent === true,
  "CV-R2": (value) =>
    Array.isArray(value.scopes) &&
    value.scopes.every((scope) => typeof scope === "string" && scope.endsWith(":read")) &&
    value.requestedWrite === false,
  "CV-R3": (value) => value.sameTenant === true && Array.isArray(value.protectedFields) && value.protectedFields.length === 0,
  "CV-R4": (value) =>
    ["APPLICATION", "SCREEN", "ONSITE", "OFFER"].includes(String(value.stage)) &&
    typeof value.timezone === "string" &&
    value.actorKnown === true,
  "CV-R5": (value) => value.acyclic === true && value.durationPositive === true && value.ownerPresent === true,
  "CV-R6": (value) => value.ordered === true && value.duplicateSafe === true,
  "CV-R7": (value) => value.noOverlap === true && value.timezoneValid === true && value.accessible === true,
  "CV-R8": (value) => value.actorRole === "RECRUITER" && value.operation === "VIEW_OPERATIONAL_FIELDS",
  "CV-R9": (value) => value.denominatorPresent === true && value.lineagePresent === true,
  "CV-R10": (value) => value.cited === true && value.intent === "EXPLAIN_TRACE" && value.mutationTools === false,
  "CV-R11": (value) => value.ownerPresent === true && value.evidenceComplete === true && value.rollbackPresent === true,
  "CV-R12": (value) => value.sourceComplete === true && value.detectorHealthy === true && value.knownPositiveSeen === true,
};

export function evaluateFixture(
  fixture: ControlFixture,
  disabledDetector?: DetectorId,
): ControlResult {
  const detectorPassed = disabledDetector === fixture.detectorId
    ? true
    : detectors[fixture.requirementId](fixture.payload);
  const issueCodes = detectorPassed ? [] : [`${fixture.requirementId.replace("-", "_")}_REJECTED`];
  const decision = detectorPassed ? "PASS" : "REJECT";

  return {
    fixtureId: fixture.fixtureId,
    requirementId: fixture.requirementId,
    detectorId: fixture.detectorId,
    decision,
    issueCodes,
    evidenceDigest: evidenceDigest({
      fixtureId: fixture.fixtureId,
      detectorId: fixture.detectorId,
      decision,
      issueCodes,
      payload: fixture.payload,
    }),
  };
}

export function evaluateAcceptanceControl(
  fixtureId: ControlFixture["fixtureId"],
  disabledDetector?: DetectorId,
): ControlResult {
  return evaluateFixture(createControlFixture(fixtureId), disabledDetector);
}

export function verifyDetectorMutation(detectorId: DetectorId): {
  detectorId: DetectorId;
  mutationDetected: boolean;
  observedDecision: ControlResult["decision"];
} {
  const requirementId = detectorId.replace("DET-", "") as RequirementId;
  const result = evaluateAcceptanceControl(`${requirementId}-BAD`, detectorId);

  return {
    detectorId,
    mutationDetected: result.decision !== "REJECT",
    observedDecision: result.decision,
  };
}
