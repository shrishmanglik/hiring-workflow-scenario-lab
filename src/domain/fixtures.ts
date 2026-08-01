import { evidenceDigest } from "./canonical";
import type {
  ControlFixture,
  DetectorId,
  HiringScenarioInput,
  RequirementId,
  ScenarioControls,
} from "./types";
import { requirementIds } from "./types";

export const defaultControls: ScenarioControls = {
  scheduleConflict: false,
  unauthorizedAccess: false,
  metricGap: false,
  partialImport: false,
  prohibitedAiRequest: false,
};

export function createSyntheticScenario(
  controls: ScenarioControls = defaultControls,
): HiringScenarioInput {
  const events: HiringScenarioInput["source"]["events"] = [
    {
      eventId: "evt-001",
      tenantId: "tenant-synthetic-001",
      candidateToken: "candidate-token-7a",
      actorRole: "RECRUITER",
      stage: "APPLICATION",
      occurredAt: "2026-07-31T13:00:00.000Z",
      timezone: "America/Toronto",
    },
    {
      eventId: "evt-002",
      tenantId: "tenant-synthetic-001",
      candidateToken: "candidate-token-7a",
      actorRole: "COORDINATOR",
      stage: "SCREEN",
      occurredAt: "2026-07-31T13:20:00.000Z",
      timezone: "America/Toronto",
    },
    {
      eventId: "evt-003",
      tenantId: "tenant-synthetic-001",
      candidateToken: "candidate-token-7a",
      actorRole: "COORDINATOR",
      stage: "ONSITE",
      occurredAt: "2026-07-31T14:00:00.000Z",
      timezone: "America/Toronto",
    },
  ];

  const sourceDigest = evidenceDigest(events);
  const detectorHealth = Object.fromEntries(
    requirementIds.map((requirementId) => [
      `DET-${requirementId}`,
      controls.partialImport && requirementId === "CV-R12" ? "UNHEALTHY" : "HEALTHY",
    ]),
  ) as Record<DetectorId, "HEALTHY" | "UNHEALTHY">;

  return {
    runAt: "2026-07-31T15:00:00.000Z",
    source: {
      tenantId: "tenant-synthetic-001",
      sourceType: "SIGNED_JSON_EXPORT",
      sourceVersion: "synthetic-ats-export.v1",
      schemaVersion: "hiring-events.v1",
      capturedAt: "2026-07-31T12:55:00.000Z",
      captureAuthority: "Synthetic fixture owner",
      completeness: controls.partialImport ? "PARTIAL" : "COMPLETE",
      declaredDigest: sourceDigest,
      scopes: ["source:read", "calendar:freebusy:read"],
      fields: ["candidateToken", "stage", "occurredAt", "timezone", "actorRole"],
      events,
    },
    scenario: {
      scenarioId: "schedule-change-synthetic-001",
      ownerRole: "Recruiting Operations owner",
      seed: 42,
      rules: [
        { id: "rule-application-screen", from: "APPLICATION", to: "SCREEN", durationMinutes: 30 },
        {
          id: "rule-screen-onsite",
          from: "SCREEN",
          to: "ONSITE",
          durationMinutes: 60,
          dependsOn: "rule-application-screen",
        },
        {
          id: "rule-onsite-offer",
          from: "ONSITE",
          to: "OFFER",
          durationMinutes: 45,
          dependsOn: "rule-screen-onsite",
        },
      ],
      schedule: controls.scheduleConflict
        ? [
            {
              participantToken: "interviewer-token-11",
              startsAt: "2026-08-04T14:00:00.000Z",
              endsAt: "2026-08-04T15:00:00.000Z",
              timezone: "America/Toronto",
              accessibleFormat: false,
            },
            {
              participantToken: "interviewer-token-11",
              startsAt: "2026-08-04T14:30:00.000Z",
              endsAt: "2026-08-04T15:30:00.000Z",
              timezone: "America/Toronto",
              accessibleFormat: true,
            },
          ]
        : [
            {
              participantToken: "interviewer-token-11",
              startsAt: "2026-08-04T14:00:00.000Z",
              endsAt: "2026-08-04T15:00:00.000Z",
              timezone: "America/Toronto",
              accessibleFormat: true,
            },
            {
              participantToken: "interviewer-token-29",
              startsAt: "2026-08-04T15:15:00.000Z",
              endsAt: "2026-08-04T16:00:00.000Z",
              timezone: "America/Toronto",
              accessibleFormat: true,
            },
          ],
      requestedOperation: controls.unauthorizedAccess
        ? "EDIT_DISPOSITION"
        : "VIEW_OPERATIONAL_FIELDS",
      actorRole: controls.unauthorizedAccess ? "INTERVIEWER" : "RECRUITER",
      metric: {
        metricId: "time-to-onsite.v1",
        numeratorEvent: "ONSITE",
        denominatorEvent: controls.metricGap ? undefined : "APPLICATION",
        sourceEvent: controls.metricGap ? undefined : "hiring-events.v1",
        calculationVersion: "metric-engine.v1",
      },
      advisorRequest: controls.prohibitedAiRequest
        ? {
            intent: "RANK_AND_MOVE",
            evidenceIds: [],
            requestedTools: ["ats.candidate.update"],
          }
        : {
            intent: "EXPLAIN_TRACE",
            evidenceIds: ["trace-schedule-constraint-001"],
            requestedTools: [],
          },
      packet: {
        ownerRole: "Recruiting Operations owner",
        evidenceIds: ["source-receipt", "scenario-trace", "metric-lineage"],
        approverRoles: ["Recruiting Operations approver", "Security approver"],
        rollbackProcedure: "Restore the last accepted workflow configuration; production remains unchanged by this lab.",
      },
      detectorHealth,
    },
  };
}

const badPayloads: Record<RequirementId, Record<string, unknown>> = {
  "CV-R1": { digestValid: false, fresh: false, authorityPresent: false },
  "CV-R2": { scopes: ["candidate:update"], requestedWrite: true },
  "CV-R3": { sameTenant: false, protectedFields: ["disability"] },
  "CV-R4": { stage: "final-ish", timezone: null, actorKnown: false },
  "CV-R5": { acyclic: false, durationPositive: false, ownerPresent: false },
  "CV-R6": { ordered: false, duplicateSafe: false },
  "CV-R7": { noOverlap: false, timezoneValid: false, accessible: false },
  "CV-R8": { actorRole: "INTERVIEWER", operation: "EDIT_DISPOSITION" },
  "CV-R9": { denominatorPresent: false, lineagePresent: false },
  "CV-R10": { cited: false, intent: "RANK_AND_MOVE", mutationTools: true },
  "CV-R11": { ownerPresent: false, evidenceComplete: false, rollbackPresent: false },
  "CV-R12": { sourceComplete: false, detectorHealthy: false, knownPositiveSeen: false },
};

const goodPayloads: Record<RequirementId, Record<string, unknown>> = {
  "CV-R1": { digestValid: true, fresh: true, authorityPresent: true },
  "CV-R2": { scopes: ["source:read"], requestedWrite: false },
  "CV-R3": { sameTenant: true, protectedFields: [] },
  "CV-R4": { stage: "ONSITE", timezone: "America/Toronto", actorKnown: true },
  "CV-R5": { acyclic: true, durationPositive: true, ownerPresent: true },
  "CV-R6": { ordered: true, duplicateSafe: true },
  "CV-R7": { noOverlap: true, timezoneValid: true, accessible: true },
  "CV-R8": { actorRole: "RECRUITER", operation: "VIEW_OPERATIONAL_FIELDS" },
  "CV-R9": { denominatorPresent: true, lineagePresent: true },
  "CV-R10": { cited: true, intent: "EXPLAIN_TRACE", mutationTools: false },
  "CV-R11": { ownerPresent: true, evidenceComplete: true, rollbackPresent: true },
  "CV-R12": { sourceComplete: true, detectorHealthy: true, knownPositiveSeen: true },
};

export function createControlFixture(fixtureId: ControlFixture["fixtureId"]): ControlFixture {
  const requirementId = fixtureId.replace(/-(BAD|GOOD)$/, "") as RequirementId;
  const kind = fixtureId.endsWith("-BAD") ? "NEGATIVE" : "POSITIVE";

  if (!requirementIds.includes(requirementId)) {
    throw new Error(`Unknown fixture: ${fixtureId}`);
  }

  return {
    fixtureId,
    requirementId,
    detectorId: `DET-${requirementId}`,
    kind,
    payload: kind === "NEGATIVE" ? badPayloads[requirementId] : goodPayloads[requirementId],
  };
}
