"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  FileCheck2,
  FlaskConical,
  History,
  LockKeyhole,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type { RequirementResult, ScenarioControls } from "@/domain/types";
import { useScenarioStore } from "@/store/scenario-store";

import { Badge, Button, Card, Mono } from "./ui";

const controlsSchema = z.object({
  scheduleConflict: z.boolean(),
  unauthorizedAccess: z.boolean(),
  metricGap: z.boolean(),
  partialImport: z.boolean(),
  prohibitedAiRequest: z.boolean(),
});

const controlOptions: Array<{
  key: keyof ScenarioControls;
  title: string;
  detail: string;
  detector: string;
}> = [
  {
    key: "scheduleConflict",
    title: "Overlapping panel",
    detail: "Double-book one interviewer and remove one accessible format.",
    detector: "CV-R7",
  },
  {
    key: "unauthorizedAccess",
    title: "Authority breach",
    detail: "Let an interviewer attempt a candidate disposition change.",
    detector: "CV-R8",
  },
  {
    key: "metricGap",
    title: "Missing denominator",
    detail: "Remove lineage from the time-to-onsite definition.",
    detector: "CV-R9",
  },
  {
    key: "partialImport",
    title: "Broken detector feed",
    detail: "Stop the source import early and mark one detector unhealthy.",
    detector: "CV-R12",
  },
  {
    key: "prohibitedAiRequest",
    title: "Prohibited advisor task",
    detail: "Ask the advisor to rank and move a candidate without evidence.",
    detector: "CV-R10",
  },
];

const initialControls: ScenarioControls = {
  scheduleConflict: false,
  unauthorizedAccess: false,
  metricGap: false,
  partialImport: false,
  prohibitedAiRequest: false,
};

function ResultIcon({ result }: { result: RequirementResult }) {
  return result.decision === "PASS" ? (
    <CheckCircle2 aria-hidden="true" size={18} />
  ) : (
    <XCircle aria-hidden="true" size={18} />
  );
}

export function ScenarioLab() {
  const { runState, result, error, beginRun, completeRun, failRun, reset } = useScenarioStore();
  const {
    register,
    handleSubmit,
    reset: resetForm,
    control,
  } = useForm<ScenarioControls>({
    resolver: zodResolver(controlsSchema),
    defaultValues: initialControls,
  });
  const controlValues = useWatch({ control });
  const selectedFaults = Object.values(controlValues).filter(Boolean).length;

  const runScenario = handleSubmit(async (controls) => {
    beginRun();
    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ controls }),
      });
      const payload = (await response.json()) as
        | import("@/domain/types").SimulationResult
        | { error: { message: string } };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error.message : "The scenario run failed.");
      }
      completeRun(payload);
    } catch (caught) {
      failRun(caught instanceof Error ? caught.message : "The scenario run failed.");
    }
  });

  const restoreAccepted = () => {
    resetForm(initialControls);
    reset();
  };

  const failedControls = result?.requirementResults.filter((item) => item.decision === "REJECT") ?? [];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Hiring Workflow Scenario Lab home">
          <span className="brand-mark" aria-hidden="true">
            <FlaskConical size={19} />
          </span>
          <span>
            <strong>Scenario Lab</strong>
            <small>Hiring workflow assurance</small>
          </span>
        </a>
        <nav aria-label="Product sections">
          <a href="#scenario">Scenario</a>
          <a href="#trace">Trace</a>
          <a href="#evidence">Evidence</a>
        </nav>
        <div className="topbar-badges">
          <Badge tone="accent">Synthetic fixture</Badge>
          <Badge tone="success">Read-only</Badge>
        </div>
      </header>

      <section className="hero" id="overview">
        <div className="eyebrow"><ShieldCheck size={16} /> Production remains untouched</div>
        <h1>Break the hiring workflow <em>before</em> the workflow breaks.</h1>
        <p>
          Compile one recruiting change against scheduling, authority, metric, and recovery rules.
          Every decision ships with a trace—not a confidence score.
        </p>
        <div className="hero-summary" aria-label="Product boundary summary">
          <div><span>Source</span><strong>Signed synthetic export</strong></div>
          <ArrowRight aria-hidden="true" />
          <div><span>Engine</span><strong>12 deterministic controls</strong></div>
          <ArrowRight aria-hidden="true" />
          <div><span>Authority</span><strong>Human approval required</strong></div>
        </div>
      </section>

      <div className="workspace-grid">
        <Card className="scenario-panel" id="scenario" aria-labelledby="scenario-title">
          <div className="section-heading">
            <div>
              <span className="section-index">01</span>
              <h2 id="scenario-title">Configure the failure surface</h2>
            </div>
            <Badge tone={selectedFaults > 0 ? "warning" : "success"}>
              {selectedFaults > 0 ? `${selectedFaults} seeded` : "Known-good"}
            </Badge>
          </div>
          <p className="section-copy">
            The baseline fixture uses tokenized identities, read-only scopes, a complete metric,
            and two distinct human approver roles.
          </p>

          <form onSubmit={runScenario}>
            <fieldset disabled={runState === "RUNNING"}>
              <legend>Inject a known defect</legend>
              <div className="control-list">
                {controlOptions.map((option) => (
                  <label className="control-row" key={option.key}>
                    <input type="checkbox" {...register(option.key)} />
                    <span className="control-checkbox" aria-hidden="true"><Check size={14} /></span>
                    <span className="control-content">
                      <span className="control-title">
                        {option.title}
                        <Mono>{option.detector}</Mono>
                      </span>
                      <small>{option.detail}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-actions">
              <Button type="submit" disabled={runState === "RUNNING"}>
                {runState === "RUNNING" ? <RefreshCw className="spin" size={17} /> : <Play size={17} />}
                {runState === "RUNNING" ? "Running controls…" : "Run deterministic proof"}
              </Button>
              <Button type="button" variant="ghost" onClick={restoreAccepted}>
                <RotateCcw size={16} /> Restore accepted
              </Button>
            </div>
          </form>

          <div className="authority-note">
            <LockKeyhole size={17} aria-hidden="true" />
            <div>
              <strong>Structural boundary</strong>
              <p>No ATS, calendar, identity, or candidate mutation capability exists in this build.</p>
            </div>
          </div>
        </Card>

        <Card className="trace-panel" id="trace" aria-labelledby="trace-title">
          <div className="section-heading">
            <div>
              <span className="section-index">02</span>
              <h2 id="trace-title">Execution trace</h2>
            </div>
            {result ? (
              <Badge tone={result.decision === "PASS" ? "success" : result.decision === "BLOCKED" ? "danger" : "warning"}>
                {result.decision}
              </Badge>
            ) : (
              <Badge>Not run</Badge>
            )}
          </div>

          {error ? (
            <div className="error-box" role="alert">
              <TriangleAlert size={20} />
              <div><strong>Run unavailable</strong><p>{error}</p></div>
              <Button type="button" variant="secondary" onClick={() => void runScenario()}>Retry</Button>
            </div>
          ) : result ? (
            <>
              <div className={`result-banner result-${result.decision.toLowerCase()}`} role="status" aria-live="polite">
                {result.decision === "PASS" ? <ShieldCheck size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>
                    {result.decision === "INDETERMINATE"
                      ? "EVIDENCE INDETERMINATE"
                      : result.approval.state.replaceAll("_", " ")}
                  </strong>
                  <p>{result.summary}</p>
                </div>
              </div>
              <ol className="trace-list">
                {result.trace.map((step, index) => (
                  <li className={`trace-step trace-${step.state.toLowerCase()}`} key={step.id}>
                    <span className="trace-marker" aria-hidden="true">
                      {step.state === "COMPLETE" ? <Check size={15} /> : <CircleDot size={15} />}
                    </span>
                    <div>
                      <span className="trace-order">0{index + 1}</span>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="empty-state">
              <History size={30} aria-hidden="true" />
              <strong>No trace yet</strong>
              <p>Run the known-good fixture or seed a failure to see where approval stops.</p>
            </div>
          )}
        </Card>

        <Card className="evidence-panel" id="evidence" aria-labelledby="evidence-title">
          <div className="section-heading">
            <div>
              <span className="section-index">03</span>
              <h2 id="evidence-title">Evidence receipt</h2>
            </div>
            <FileCheck2 size={20} aria-hidden="true" />
          </div>

          {result ? (
            <>
              <dl className="receipt-grid">
                <div><dt>Receipt</dt><dd>{result.receipt.receiptId}</dd></div>
                <div><dt>Engine</dt><dd>{result.receipt.engineVersion}</dd></div>
                <div><dt>Source digest</dt><dd title={result.receipt.sourceDigest}>{result.receipt.sourceDigest.slice(0, 16)}…</dd></div>
                <div><dt>Evidence digest</dt><dd title={result.receipt.evidenceDigest}>{result.receipt.evidenceDigest.slice(0, 16)}…</dd></div>
                <div><dt>Source writes</dt><dd className="success-text">0</dd></div>
                <div><dt>Fixture class</dt><dd>SYNTHETIC</dd></div>
              </dl>

              <div className="control-results" aria-label="Deterministic control results">
                {result.requirementResults.map((item) => (
                  <div className={`control-result control-result-${item.decision.toLowerCase()}`} key={item.requirementId}>
                    <ResultIcon result={item} />
                    <span><strong>{item.requirementId}</strong><small>{item.title}</small></span>
                    <Badge tone={item.decision === "PASS" ? "success" : "danger"}>{item.decision}</Badge>
                  </div>
                ))}
              </div>

              <div className="human-gate">
                <Sparkles size={18} aria-hidden="true" />
                <div>
                  <strong>AI may explain. Humans decide.</strong>
                  <p>{result.recovery.nextAction}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="receipt-placeholder">
              <div /><div /><div /><div />
              <p>A receipt appears only after the deterministic engine returns a terminal state.</p>
            </div>
          )}
        </Card>
      </div>

      {result && (
        <section className="proof-footer" aria-label="Run closeout">
          <div>
            <span>Run closeout</span>
            <strong>
              {failedControls.length === 0
                ? "Packet ready for distinct human review"
                : `${failedControls.length} control${failedControls.length === 1 ? "" : "s"} require${failedControls.length === 1 ? "s" : ""} repair`}
            </strong>
          </div>
          <div className="proof-footer-boundary">
            <ShieldCheck size={18} />
            Synthetic evidence · no employer affiliation · no production writes
          </div>
        </section>
      )}
    </main>
  );
}
