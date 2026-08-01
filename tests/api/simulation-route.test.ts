import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/simulations/route";
import { GET } from "@/app/api/health/route";
import { defaultControls } from "@/domain/fixtures";

function request(body: unknown): Request {
  return new Request("http://localhost/api/simulations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/simulations", () => {
  it("returns a typed passing result for the known-good fixture", async () => {
    const response = await POST(request({ controls: defaultControls }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Scenario-Lab-Mode")).toBe("synthetic-read-only");
    expect(payload.decision).toBe("PASS");
  });

  it("returns 400 for an incomplete control contract", async () => {
    const response = await POST(request({ controls: { scheduleConflict: false } }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_SCENARIO_REQUEST");
  });

  it("returns a retryable 503 when the request body cannot be parsed", async () => {
    const response = await POST(
      new Request("http://localhost/api/simulations", { method: "POST", body: "{" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error.retryable).toBe(true);
  });
});

describe("GET /api/health", () => {
  it("proves the runtime exposes no production mutation capability", async () => {
    const response = GET();
    const payload = await response.json();

    expect(payload).toEqual({
      status: "ok",
      mode: "synthetic-read-only",
      productionMutationCapability: false,
    });
  });
});
