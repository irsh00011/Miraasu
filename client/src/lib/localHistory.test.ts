import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readCalculationHistory, writeCalculationHistory, type SavedCalculation } from "./localHistory";

const records = new Map<string, string>();

const sample: SavedCalculation = {
  id: "history-1",
  fingerprint: "estate-and-heirs",
  createdAt: "2026-08-26T00:00:00.000Z",
  estate: { grossEstate: 10000, funeralCosts: 0, debts: 0, bequest: 0 },
  heirs: { husband: 0, wives: 1, father: 0, mother: 1, paternalGrandfather: 0, sons: 1, daughters: 0, fullBrothers: 0, fullSisters: 0, maternalBrothers: 0, maternalSisters: 0 },
  netEstate: 10000,
  totalHeirs: 3,
};

beforeEach(() => {
  records.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => records.get(key) ?? null,
      setItem: (key: string, value: string) => records.set(key, value),
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("local calculation history", () => {
  it("writes and reads saved calculations from browser storage", () => {
    writeCalculationHistory([sample]);
    expect(readCalculationHistory()).toEqual([sample]);
  });

  it("uses an empty history when browser storage is empty", () => {
    expect(readCalculationHistory()).toEqual([]);
  });
});
