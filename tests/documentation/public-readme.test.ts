import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");

describe("public recruiter-facing evidence boundary", () => {
  it("covers the required product, architecture, security, commercial, setup, test, and roadmap sections", () => {
    for (const heading of [
      "The problem",
      "What is implemented",
      "Architecture",
      "Deterministic, AI, and human split",
      "Security and privacy",
      "Commercial hypothesis and evidence boundary",
      "Local setup",
      "Verification",
      "Roadmap",
    ]) {
      expect(readme).toContain(`## ${heading}`);
    }
  });

  it("states the employer affiliation boundary", () => {
    expect(readme).toContain("not affiliated with, endorsed by, or built for Ashby");
    expect(readme).toContain("All runnable records are synthetic");
  });

  it("does not use the retired outward-facing abbreviation", () => {
    expect(readme).not.toMatch(/\bMDS\b/);
  });

  it("links to an actual rendered desktop screenshot", () => {
    expect(existsSync(join(process.cwd(), "docs", "screenshots", "scenario-lab-desktop.png"))).toBe(true);
  });

  it("separates implemented, proposed, unknown, and not-authorized capability states", () => {
    expect(readme).toContain("Implemented versus proposed");
    expect(readme).toContain("Unknown / not performed");
    expect(readme).toContain("Not authorized / not performed");
  });

  it("contains no hand-written webkit prefix in Tailwind source CSS", () => {
    const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

    expect(css).not.toContain("-webkit-");
  });
});
