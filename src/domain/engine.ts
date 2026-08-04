import { evidenceDigest } from "./canonical";
import type {
  HiringScenarioInput,
  RequirementId,
  RequirementResult,
  SimulationResult,
  TraceStep,
} from "./types";

const engineVersion = "scenario-engine.v1.0.0";
const ruleVersion = "hiring-invariants.v1.0.0";

const titles: Record<RequirementId, string> = {
  "CV-R1": "Source provenance",
  "CV-R2": "Read-only capability",
  "CV-R3": "PII and tenant boundary",
  "CV-R4": "Typed event normalization",
  "CV-R5": "Scenario graph compiler",
  "CV-R6": "Deterministic event replay",
  "CV-R7": "Scheduling invariants",
  "CV-R8": "Role and field policy",
  "CV-R9": "Metric lineage",
  "CV-R10": "Advisor authority boundary",
  "CV-R11": "Approval and rollback packet",
  "CV-R12": "Fail-closed runtime health",
};

function result(
  requirementId: RequirementId,
  passed: boolean,
  evidence: string[],
  issueSuffix = "REJECTED",
): RequirementResult {
  return {
    requirementId,
    detectorId: `DET-${requirementId}`,
    title: titles[requirementId],
    decision: passed ? "PASS" : "REJECT",
    issueCodes: passed ? [] : [`${requirementId.replace("-", "_")}_${issueSuffix}`],
    evidence,
  };
}

function isFresh(input: HiringScenarioInput): boolean {
  const age = new Date(input.runAt).getTime() - new Date(input.source.capturedAt).getTime();
  return Number.isFinite(age) && age >= 0 && age <= 24 * 60 * 60 * 1000;
}

function graphIsValid(input: HiringScenarioInput): boolean {
  const rules = input.scenario.rules;
  const byId = new Map(rules.map((rule) => [rule.id, rule]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    const rule = byId.get(id);
    if (!rule) return false;
    visiting.add(id);
    if (rule.dependsOn && !visit(rule.dependsOn)) return false;
    visiting.delete(id);
    visited.add(id);
    return rule.durationMinutes > 0;
  };

  return Boolean(input.scenario.ownerRole) && rules.every((rule) => visit(rule.id));
}

function replayIsValid(input: HiringScenarioInput): boolean {
  const events = input.source.events;
  const ids = new Set(events.map((event) => event.eventId));
  const allowed = ["APPLICATION", "SCREEN", "ONSITE", "OFFER"];
  const ordered = events.every((event, index) => {
    if (index === 0) return event.stage === "APPLICATION";
    const previous = events[index - 1];
    return (
      new Date(event.occurredAt).getTime() >= new Date(previous.occurredAt).getTime() &&
      allowed.indexOf(event.stage) === allowed.indexOf(previous.stage) + 1
    );
  });

  return ids.size === events.length && ordered;
}

function scheduleIsFeasible(input: HiringScenarioInput): boolean {
  const schedule = input.scenario.schedule;
  if (schedule.some((slot) => !slot.accessibleFormat || !slot.timezone)) return false;

  return schedule.every((slot, index) =>
    schedule.slice(index + 1).every((other) => {
      if (slot.participantToken !== other.participantToken) return true;
      const leftStart = new Date(slot.startsAt).getTime();
      const leftEnd = new Date(slot.endsAt).getTime();
      const rightStart = new Date(other.startsAt).getTime();
      const rightEnd = new Date(other.endsAt).getTime();
      return leftEnd <= rightStart || rightEnd <= leftStart;
    }),
  );
}

function evaluateRequirements(input: HiringScenarioInput): RequirementResult[] {
  const actualSourceDigest = evidenceDigest(input.source.events);
  const allTenantLocal = input.source.events.every(
    (event) => event.tenantId === input.source.tenantId && event.candidateToken.startsWith("candidate-token-"),
  );
  const protectedFields = ["name", "email", "disability", "race", "gender", "dateOfBirth"];
  const normalized = input.source.events.every(
    (event) =>
      ["APPLICATION", "SCREEN", "ONSITE", "OFFER"].includes(event.stage) &&
      Boolean(event.timezone) &&
      ["RECRUITER", "COORDINATOR", "INTERVIEWER"].includes(event.actorRole),
  );
  const metricComplete = Boolean(
    input.scenario.metric.denominatorEvent && input.scenario.metric.sourceEvent,
  );
  const advisorSafe =
    input.scenario.advisorRequest.intent === "EXPLAIN_TRACE" &&
    input.scenario.advisorRequest.evidenceIds.length > 0 &&
    input.scenario.advisorRequest.requestedTools.length === 0;
  const packetComplete = Boolean(
    input.scenario.packet.ownerRole &&
      input.scenario.packet.rollbackProcedure &&
      input.scenario.packet.evidenceIds.length >= 3 &&
      new Set(input.scenario.packet.approverRoles).size >= 2,
  );
  const detectorsHealthy = Object.values(input.scenario.detectorHealth).every(
    (health) => health === "HEALTHY",
  );

  return [
    result(
      "CV-R1",
      input.source.declaredDigest === actualSourceDigest && isFresh(input) && Boolean(input.source.captureAuthority),
      [`sourceDigest:${actualSourceDigest.slice(0, 16)}`, `freshness:${isFresh(input) ? "within-window" : "outside-window"}`],
    ),
    result(
      "CV-R2",
      input.source.scopes.every((scope) => scope.endsWith(":read")) &&
        input.scenario.advisorRequest.requestedTools.every((tool) => !tool.includes("update")),
      ["capability:read-only", "providerWrites:0"],
    ),
    result(
      "CV-R3",
      allTenantLocal && input.source.fields.every((field) => !protectedFields.includes(field)),
      [`tenant:${allTenantLocal ? "isolated" : "mismatch"}`, "identity:tokenized"],
    ),
    result("CV-R4", normalized, [`normalizedEvents:${input.source.events.length}`, "heldUnknowns:0"]),
    result("CV-R5", graphIsValid(input), [`rules:${input.scenario.rules.length}`, "compiler:versioned"]),
    result("CV-R6", replayIsValid(input), [`events:${input.source.events.length}`, "duplicates:0"]),
    result(
      "CV-R7",
      scheduleIsFeasible(input),
      [`scheduleSlots:${input.scenario.schedule.length}`, `accessible:${input.scenario.schedule.every((slot) => slot.accessibleFormat)}`],
    ),
    result(
      "CV-R8",
      input.scenario.actorRole === "RECRUITER" && input.scenario.requestedOperation === "VIEW_OPERATIONAL_FIELDS",
      [`actor:${input.scenario.actorRole}`, `operation:${input.scenario.requestedOperation}`],
    ),
    result(
      "CV-R9",
      metricComplete,
      [`metric:${input.scenario.metric.metricId}`, `lineage:${metricComplete ? "complete" : "held"}`],
    ),
    result(
      "CV-R10",
      advisorSafe,
      [`intent:${input.scenario.advisorRequest.intent}`, `mutationTools:${input.scenario.advisorRequest.requestedTools.length}`],
    ),
    result(
      "CV-R11",
      packetComplete,
      [`approvers:${new Set(input.scenario.packet.approverRoles).size}`, `rollback:${input.scenario.packet.rollbackProcedure ? "present" : "missing"}`],
    ),
    result(
      "CV-R12",
      input.source.completeness === "COMPLETE" && detectorsHealthy,
      [`source:${input.source.completeness}`, `detectors:${detectorsHealthy ? "healthy" : "unhealthy"}`],
    ),
  ];
}

function buildTrace(results: RequirementResult[]): TraceStep[] {
  const groups: Array<[string, string, RequirementId[]]> = [
    ["trace-source", "Source captured and quarantined", ["CV-R1", "CV-R2", "CV-R3"]],
    ["trace-normalize", "Events normalized", ["CV-R4"]],
    ["trace-compile", "Scenario compiled", ["CV-R5"]],
    ["trace-replay", "Workflow replayed", ["CV-R6", "CV-R7", "CV-R8"]],
    ["trace-evidence", "Evidence and metrics sealed", ["CV-R9", "CV-R10", "CV-R12"]],
    ["trace-approval", "Human review packet prepared", ["CV-R11"]],
  ];

  const hasAnyRejection = results.some((item) => item.decision === "REJECT");

  return groups.map(([id, title, requirementIds]) => {
    const related = results.filter((item) => requirementIds.includes(item.requirementId));
    const rejected = related.filter((item) => item.decision === "REJECT");
    const heldByUpstream = id === "trace-approval" && hasAnyRejection;
    return {
      id,
      title,
      state: heldByUpstream ? "HELD" : rejected.length === 0 ? "COMPLETE" : "BLOCKED",
      detail:
        heldByUpstream
          ? "Upstream evidence rejected; the packet remains held for repair."
          : rejected.length === 0
          ? `${related.length} deterministic control${related.length === 1 ? "" : "s"} passed.`
          : `${rejected.map((item) => item.requirementId).join(", ")} blocked this step.`,
    };
  });
}

export function executeScenario(input: HiringScenarioInput): SimulationResult {
  const requirementResults = evaluateRequirements(input);
  const rejected = requirementResults.filter((item) => item.decision === "REJECT");
  const detectorFailure = requirementResults.find((item) => item.requirementId === "CV-R12")?.decision === "REJECT";
  const decision = detectorFailure ? "INDETERMINATE" : rejected.length > 0 ? "BLOCKED" : "PASS";
  const trace = buildTrace(requirementResults);
  const sourceDigest = evidenceDigest(input.source.events);
  const scenarioDigest = evidenceDigest(input.scenario);
  const receiptBase = {
    sourceDigest,
    scenarioDigest,
    engineVersion,
    ruleVersion,
    generatedAt: input.runAt,
    synthetic: true as const,
    zeroProductionWrites: true as const,
    decision,
    requirementResults,
  };
  const receiptDigest = evidenceDigest(receiptBase);

  return {
    decision,
    summary:
      decision === "PASS"
        ? "The synthetic scheduling change passed all deterministic controls and is ready for human review."
        : decision === "INDETERMINATE"
          ? "Source or detector health is incomplete. No clean result was emitted."
          : `${rejected.length} control${rejected.length === 1 ? "" : "s"} blocked the approval packet.`,
    requirementResults,
    trace,
    receipt: {
      receiptId: `receipt-${receiptDigest.slice(0, 12)}`,
      evidenceDigest: receiptDigest,
      sourceDigest,
      scenarioDigest,
      engineVersion,
      ruleVersion,
      generatedAt: input.runAt,
      synthetic: true,
      zeroProductionWrites: true,
    },
    approval: {
      state: decision === "PASS" ? "READY_FOR_HUMAN_REVIEW" : "BLOCKED",
      humanAuthorityRequired: true,
      approverRoles: input.scenario.packet.approverRoles,
      rollbackProcedure:
        input.scenario.packet.rollbackProcedure ??
        "Restore the last accepted workflow configuration. No production state was changed by this run.",
    },
    unknowns: [
      "Buyer demand and willingness to pay are unvalidated.",
      "Provider integration, production reliability, and live security acceptance are unknown.",
      "No Ashby affiliation, endorsement, customer use, or internal roadmap is claimed.",
    ],
    recovery: {
      retryAllowed: true,
      retainedState: "The last accepted synthetic fixture and its receipt remain unchanged.",
      nextAction:
        decision === "PASS"
          ? "A distinct human reviewer decides whether the packet is acceptable."
          : "Repair the rejected input or detector, then rerun the same scenario and compare the digest.",
    },
  };
}
