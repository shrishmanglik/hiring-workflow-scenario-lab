export const requirementIds = [
  "CV-R1",
  "CV-R2",
  "CV-R3",
  "CV-R4",
  "CV-R5",
  "CV-R6",
  "CV-R7",
  "CV-R8",
  "CV-R9",
  "CV-R10",
  "CV-R11",
  "CV-R12",
] as const;

export type RequirementId = (typeof requirementIds)[number];
export type DetectorId = `DET-${RequirementId}`;
export type RunDecision = "PASS" | "BLOCKED" | "INDETERMINATE";
export type ControlDecision = "PASS" | "REJECT";

export interface ScenarioControls {
  scheduleConflict: boolean;
  unauthorizedAccess: boolean;
  metricGap: boolean;
  partialImport: boolean;
  prohibitedAiRequest: boolean;
}

export interface SnapshotEvent {
  eventId: string;
  tenantId: string;
  candidateToken: string;
  actorRole: "RECRUITER" | "COORDINATOR" | "INTERVIEWER";
  stage: "APPLICATION" | "SCREEN" | "ONSITE" | "OFFER";
  occurredAt: string;
  timezone: string;
}

export interface HiringScenarioInput {
  runAt: string;
  source: {
    tenantId: string;
    sourceType: "SIGNED_JSON_EXPORT";
    sourceVersion: string;
    schemaVersion: string;
    capturedAt: string;
    captureAuthority: string;
    completeness: "COMPLETE" | "PARTIAL";
    declaredDigest: string;
    scopes: string[];
    fields: string[];
    events: SnapshotEvent[];
  };
  scenario: {
    scenarioId: string;
    ownerRole: string;
    seed: number;
    rules: Array<{
      id: string;
      from: SnapshotEvent["stage"];
      to: SnapshotEvent["stage"];
      durationMinutes: number;
      dependsOn?: string;
    }>;
    schedule: Array<{
      participantToken: string;
      startsAt: string;
      endsAt: string;
      timezone: string;
      accessibleFormat: boolean;
    }>;
    requestedOperation: "VIEW_OPERATIONAL_FIELDS" | "EDIT_DISPOSITION";
    actorRole: "RECRUITER" | "INTERVIEWER";
    metric: {
      metricId: string;
      numeratorEvent: string;
      denominatorEvent?: string;
      sourceEvent?: string;
      calculationVersion: string;
    };
    advisorRequest: {
      intent: "EXPLAIN_TRACE" | "RANK_AND_MOVE";
      evidenceIds: string[];
      requestedTools: string[];
    };
    packet: {
      ownerRole?: string;
      evidenceIds: string[];
      approverRoles: string[];
      rollbackProcedure?: string;
    };
    detectorHealth: Record<DetectorId, "HEALTHY" | "UNHEALTHY">;
  };
}

export interface RequirementResult {
  requirementId: RequirementId;
  detectorId: DetectorId;
  title: string;
  decision: ControlDecision;
  issueCodes: string[];
  evidence: string[];
}

export interface TraceStep {
  id: string;
  title: string;
  state: "COMPLETE" | "BLOCKED" | "HELD";
  detail: string;
}

export interface EvidenceReceipt {
  receiptId: string;
  evidenceDigest: string;
  sourceDigest: string;
  scenarioDigest: string;
  engineVersion: string;
  ruleVersion: string;
  generatedAt: string;
  synthetic: true;
  zeroProductionWrites: true;
}

export interface SimulationResult {
  decision: RunDecision;
  summary: string;
  requirementResults: RequirementResult[];
  trace: TraceStep[];
  receipt: EvidenceReceipt;
  approval: {
    state: "READY_FOR_HUMAN_REVIEW" | "BLOCKED";
    humanAuthorityRequired: true;
    approverRoles: string[];
    rollbackProcedure: string;
  };
  unknowns: string[];
  recovery: {
    retryAllowed: boolean;
    retainedState: string;
    nextAction: string;
  };
}

export interface ControlFixture {
  fixtureId: `${RequirementId}-${"BAD" | "GOOD"}`;
  requirementId: RequirementId;
  detectorId: DetectorId;
  kind: "NEGATIVE" | "POSITIVE";
  payload: Record<string, unknown>;
}

export interface ControlResult {
  fixtureId: ControlFixture["fixtureId"];
  requirementId: RequirementId;
  detectorId: DetectorId;
  decision: ControlDecision;
  issueCodes: string[];
  evidenceDigest: string;
}
