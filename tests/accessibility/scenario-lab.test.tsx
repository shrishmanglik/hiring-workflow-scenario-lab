// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScenarioLab } from "@/components/scenario-lab";

afterEach(cleanup);

describe("Scenario Lab accessibility contract", () => {
  it("has one clear primary heading", () => {
    render(<ScenarioLab />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("labels every injected-failure control", () => {
    render(<ScenarioLab />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(screen.getByRole("checkbox", { name: /overlapping panel/i })).toBeInTheDocument();
  });

  it("exposes the primary journey as a named button", () => {
    render(<ScenarioLab />);

    expect(screen.getByRole("button", { name: /run deterministic proof/i })).toBeEnabled();
  });

  it("states the structural no-write boundary in visible text", () => {
    render(<ScenarioLab />);

    expect(screen.getByText(/no ATS, calendar, identity, or candidate mutation capability exists/i)).toBeVisible();
  });

  it("provides navigation landmarks and an accessible brand link", () => {
    render(<ScenarioLab />);

    expect(screen.getByRole("navigation", { name: /product sections/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hiring Workflow Scenario Lab home/i })).toBeInTheDocument();
  });
});
