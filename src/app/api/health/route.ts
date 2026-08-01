import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({
    status: "ok",
    mode: "synthetic-read-only",
    productionMutationCapability: false,
  });
}
