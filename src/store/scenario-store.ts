import { create } from "zustand";

import type { SimulationResult } from "@/domain/types";

type RunState = "IDLE" | "RUNNING" | "SUCCEEDED" | "FAILED";

interface ScenarioStore {
  runState: RunState;
  result: SimulationResult | null;
  error: string | null;
  beginRun: () => void;
  completeRun: (result: SimulationResult) => void;
  failRun: (error: string) => void;
  reset: () => void;
}

export const useScenarioStore = create<ScenarioStore>((set) => ({
  runState: "IDLE",
  result: null,
  error: null,
  beginRun: () => set({ runState: "RUNNING", error: null }),
  completeRun: (result) => set({ runState: "SUCCEEDED", result, error: null }),
  failRun: (error) => set({ runState: "FAILED", error }),
  reset: () => set({ runState: "IDLE", result: null, error: null }),
}));
