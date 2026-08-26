/** Browser-only storage for saved inheritance calculations. No data is sent to a server. */
import type { EstateInput, HeirInput } from "./inheritance";

export type SavedCalculation = {
  id: string;
  fingerprint: string;
  createdAt: string;
  estate: EstateInput;
  heirs: HeirInput;
  netEstate: number;
  totalHeirs: number;
};

const STORAGE_KEY = "meeras-calculation-history-v1";

export function readCalculationHistory(): SavedCalculation[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCalculationHistory(records: SavedCalculation[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // The calculator remains usable if browser storage is unavailable.
  }
}
