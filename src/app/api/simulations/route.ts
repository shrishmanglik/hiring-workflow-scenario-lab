import { NextResponse } from "next/server";
import { z } from "zod";

import { executeScenario } from "@/domain/engine";
import { createSyntheticScenario } from "@/domain/fixtures";

const requestSchema = z.object({
  controls: z.object({
    scheduleConflict: z.boolean(),
    unauthorizedAccess: z.boolean(),
    metricGap: z.boolean(),
    partialImport: z.boolean(),
    prohibitedAiRequest: z.boolean(),
  }),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_SCENARIO_REQUEST",
            message: "The scenario request does not match the typed control contract.",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(executeScenario(createSyntheticScenario(parsed.data.controls)), {
      headers: {
        "Cache-Control": "no-store",
        "X-Scenario-Lab-Mode": "synthetic-read-only",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "SIMULATION_UNAVAILABLE",
          message: "The run failed before a receipt could be sealed. Production remains unchanged.",
          retryable: true,
        },
      },
      { status: 503 },
    );
  }
}
