/**
 * Special Inheritance Methods — calculation module for Miraasu.
 *
 * SOURCE OF TRUTH: ~/workspace/miraasu/reports/meerath-book-study.md, the deep
 * study of "இஸ்லாமிய வாரிசுரிமைச் சட்டம்: நவீன கணக்கீடு" by Maulvi Dr. S.A.
 * Usman Ali Hasani (Crescent University, Nov 2024; 335 pp, 285 worked cases).
 * Every formula, page reference and worked-example number below comes ONLY from
 * that report and the book it cites. Nothing is invented from general fiqh.
 *
 * Where the book is silent or gives no worked example, the function still
 * computes by the stated rule AND returns `needsScholarConfirmation: true`
 * with a reason string, so the UI can show it.
 *
 * DESIGN
 * - Exact fractions throughout (own gcd/lcm/add/subtract/multiply/divide
 *   helpers below, built on the engine's exported `fraction` normaliser).
 * - Money: exact fractions internally; amounts to 2 decimals with
 *   LARGEST-REMAINDER adjustment (`distributeAmounts`) so every row sums
 *   exactly to the estate.
 * - The general method is NEVER reimplemented here: every two-scenario,
 *   sequential, portion or exclusion computation CALLS `calculateInheritance`
 *   from ./inheritance — through the `calculateWithBookCorrection` wrapper,
 *   which corrects exactly ONE documented engine gap attested by book case
 *   269 (a paternal brother takes the residue as Asabah where full sisters
 *   take fixed shares; the engine would Radd it to the sisters instead).
 *   See the wrapper's own doc comment; nothing else is changed.
 * - Every result carries step-by-step breakdown rows (label, exact fraction
 *   string, amount), a final-answer summary and scholar-confirmation flags.
 *
 * This module is calculation only. It does not push, deploy, or touch the
 * protected engine files.
 */

import {
  aggregateAllocationsForDisplay,
  calculateInheritance,
  fraction,
  fractionToNumber,
  fractionToText,
  type Allocation,
  type CalculationResult,
  type EstateInput,
  type Fraction,
  type HeirInput,
} from "./inheritance";

// ---------------------------------------------------------------------------
// Exact-fraction helpers (own implementation; `fraction` normalises/reduces)
// ---------------------------------------------------------------------------

export const gcd = (a: number, b: number): number => {
  const x = Math.abs(a);
  const y = Math.abs(b);
  return y === 0 ? x : gcd(y, x % y);
};

export const lcm = (a: number, b: number): number => Math.abs(a * b) / (gcd(a, b) || 1);

export const addFractions = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.n * b.d + b.n * a.d, a.d * b.d);

export const subtractFractions = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.n * b.d - b.n * a.d, a.d * b.d);

export const multiplyFractions = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.n * b.n, a.d * b.d);

export const divideFractions = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.n * b.d, a.d * b.n);

export const compareFractions = (a: Fraction, b: Fraction): number => a.n * b.d - b.n * a.d;

export const isPositiveFraction = (value: Fraction): boolean => value.n > 0;

export const isZeroFraction = (value: Fraction): boolean => value.n === 0;

export const minFraction = (a: Fraction, b: Fraction): Fraction => (compareFractions(a, b) <= 0 ? a : b);

export const maxFraction = (a: Fraction, b: Fraction): Fraction => (compareFractions(a, b) >= 0 ? a : b);

export const sumFractions = (items: Fraction[]): Fraction =>
  items.reduce((total, item) => addFractions(total, item), fraction(0));

// ---------------------------------------------------------------------------
// Display helpers for the v2 per-topic calculators (pure; no behaviour change)
// ---------------------------------------------------------------------------

/**
 * LCM of the denominators of the rows' exact shares — the common base the
 * book's tables work on. Returns 1 when no row has a denominator above 1
 * (whole-estate / zero shares only).
 */
export function lcmOfRows(rows: SpecialRow[]): number {
  const dens = rows.filter((row) => row.share.d > 1).map((row) => row.share.d);
  if (dens.length === 0) return 1;
  return dens.reduce((total, d) => lcm(total, d), 1);
}

/** A share expressed as a percentage of the estate (0–100). */
export function percentOfShare(share: Fraction): number {
  return share.d === 0 ? 0 : (share.n / share.d) * 100;
}

/** A result row's share expressed as a percentage of the estate. */
export function rowPercent(row: SpecialRow): number {
  return percentOfShare(row.share);
}

// ---------------------------------------------------------------------------
// Money — largest-remainder rounding so rows sum EXACTLY to the estate
// ---------------------------------------------------------------------------

/**
 * Convert exact fractional shares of `estate` into 2-decimal amounts whose
 * sum is exactly `estate` (to the cent). Each share is floored to the cent;
 * the leftover cents go one each to the largest fractional remainders
 * (ties keep input order). Shares need not sum to 1: any undistributed
 * remainder is left out — callers include an explicit held/unallocated
 * entry when the rows must sum to the whole estate.
 */
export function distributeAmounts(estate: number, shares: Fraction[]): number[] {
  const totalCents = Math.round(estate * 100);
  if (totalCents <= 0 || shares.length === 0) return shares.map(() => 0);
  const floors: number[] = [];
  const remainders: { rem: number; d: number; index: number }[] = [];
  let used = 0;
  shares.forEach((share, index) => {
    const num = share.n * totalCents;
    const fl = Math.floor(num / share.d);
    floors.push(fl);
    used += fl;
    remainders.push({ rem: num - fl * share.d, d: share.d, index });
  });
  // Rounding cents only: the floor of the summed fractional remainders.
  // (When the shares sum to less than 1, the rest of totalCents − used is
  // genuinely undistributed — it must never be handed out one cent per
  // entry, or a partial distribution like a re-divided refused share
  // would be inflated to the whole estate.)
  const fracSum = remainders.reduce(
    (total, entry) => addFractions(total, fraction(entry.rem, entry.d)),
    fraction(0),
  );
  const centsToGive = Math.floor(fracSum.n / fracSum.d);
  const order = [...remainders].sort((a, b) => {
    const left = a.rem * b.d;
    const right = b.rem * a.d;
    if (left !== right) return right - left; // larger remainder first
    return a.index - b.index; // ties keep input order
  });
  const cents = [...floors];
  // At most one extra cent per entry (standard largest remainder).
  for (let k = 0; k < Math.min(centsToGive, order.length); k++) {
    const pick = order[k];
    if (pick) cents[pick.index] += 1;
  }
  return cents.map((c) => c / 100);
}

// ---------------------------------------------------------------------------
// Shared result / row types
// ---------------------------------------------------------------------------

export type SpecialRow = {
  key: string;
  label: string;
  count: number;
  /** Exact share of the estate as a reduced fraction string, e.g. "2/3". */
  fraction: string;
  share: Fraction;
  /** Amount in the estate's currency, 2 decimals, largest-remainder rounded. */
  amount: number;
  note?: string;
};

export type SpecialRowInput = {
  key: string;
  label: string;
  count?: number;
  share: Fraction;
  note?: string;
};

/** Common base every special-method result carries. */
export type SpecialResultBase = {
  /** The estate the whole computation is about. */
  estate: number;
  /** Book reference, e.g. "Book §4.1, p. 279; cases 260–266". */
  bookRef: string;
  /** One-line final answer, for the UI summary. */
  summary: string;
  /** Working notes shown alongside the result. */
  notes: string[];
  /** True when the book is silent, ambiguous, or gives no worked example. */
  needsScholarConfirmation: boolean;
  /** One reason string per open scholar question. */
  scholarReasons: string[];
};

/** One complete division (a set of rows that sums to an estate). */
export type DivisionOutcome = {
  rows: SpecialRow[];
  /** Amount actually distributed by these rows (excludes any held row). */
  totalDistributed: number;
  notes: string[];
  needsScholarConfirmation: boolean;
};

// ---------------------------------------------------------------------------
// Small engine conveniences (the page and the tests share these)
// ---------------------------------------------------------------------------

/** An HeirInput with every required key present and zero — fill in counts. */
export const emptyHeirs = (): HeirInput => ({
  husband: 0,
  wives: 0,
  father: 0,
  mother: 0,
  paternalGrandfather: 0,
  sons: 0,
  daughters: 0,
  fullBrothers: 0,
  fullSisters: 0,
  maternalBrothers: 0,
  maternalSisters: 0,
});

/** An EstateInput for a plain distributable amount (no funeral/debts/bequest). */
export const simpleEstate = (grossEstate: number): EstateInput => ({
  grossEstate,
  funeralCosts: 0,
  debts: 0,
  bequest: 0,
});

/**
 * Build display rows from exact shares, with largest-remainder amounts.
 * Amounts are rounded PER PERSON (a group's share is split into one slot
 * per person first), because that is how the book's own printed amounts
 * work out — e.g. case 269 death 2: mother 64.17, each sister 128.33,
 * paternal brother 64.17. Group-level rounding would give the sisters
 * 256.67 and the brother 64.16 instead. Row amounts still sum exactly to
 * the estate whenever the entry shares sum to 1.
 */
export function buildRows(entries: SpecialRowInput[], estate: number): SpecialRow[] {
  const slots: { entryIndex: number; share: Fraction }[] = [];
  entries.forEach((entry, entryIndex) => {
    const count = Math.max(1, entry.count ?? 1);
    const perPerson = divideFractions(entry.share, fraction(count));
    for (let i = 0; i < count; i++) slots.push({ entryIndex, share: perPerson });
  });
  const slotAmounts = distributeAmounts(estate, slots.map((slot) => slot.share));
  const amounts = entries.map(() => 0);
  slots.forEach((slot, i) => {
    amounts[slot.entryIndex] += slotAmounts[i] ?? 0;
  });
  return entries.map((entry, index) => ({
    key: entry.key,
    label: entry.label,
    count: entry.count ?? 1,
    fraction: fractionToText(entry.share),
    share: entry.share,
    amount: Math.round((amounts[index] ?? 0) * 100) / 100,
    note: entry.note,
  }));
}

/**
 * Convert an engine result into per-key row inputs (fixed share, Asabah and
 * Radd components for one person are combined into that person's total
 * share). Any remainder the general method leaves unallocated is kept as an
 * explicit "Held / unallocated" entry so the rows reconcile to the estate.
 */
export function entriesFromEngine(result: CalculationResult): SpecialRowInput[] {
  const entries: SpecialRowInput[] = aggregateAllocationsForDisplay(result.allocations).map((item) => ({
    key: item.key,
    label: item.label,
    count: item.count,
    share: item.share,
    note: item.reason,
  }));
  if (isPositiveFraction(result.unallocatedShare)) {
    entries.push({
      key: "__held__",
      label: "Held / unallocated",
      count: 1,
      share: result.unallocatedShare,
      note: "The general method names no automatic recipient for this remainder.",
    });
  }
  return entries;
}

/** Display rows for an engine result against `estate`. */
export function rowsFromEngine(result: CalculationResult, estate: number): SpecialRow[] {
  return buildRows(entriesFromEngine(result), estate);
}

function divisionFromEngine(result: CalculationResult, estate: number, notes: string[] = []): DivisionOutcome {
  const rows = rowsFromEngine(result, estate);
  return {
    rows,
    totalDistributed: rows
      .filter((row) => row.key !== "__held__")
      .reduce((total, row) => total + row.amount, 0),
    notes: [...notes, ...result.notices],
    needsScholarConfirmation: result.requiresScholarReview,
  };
}

// ---------------------------------------------------------------------------
// Per-person two-scenario machinery (unborn child, missing person, khuntha)
// ---------------------------------------------------------------------------

type PersonShare = { id: string; key: string; label: string; share: Fraction };

/**
 * Split an engine result's per-key totals into one entry per person
 * (a group's share divided equally among its count). `rename` designates
 * one person — the last person of a key, i.e. the one just added for the
 * scenario — under a shared id so the same individual can be matched
 * across the two scenarios (the unborn child, the missing person, the
 * khuntha).
 */
function perPersonShares(
  result: CalculationResult,
  rename?: { key: string; index: number; newId: string },
): PersonShare[] {
  const out: PersonShare[] = [];
  for (const item of aggregateAllocationsForDisplay(result.allocations)) {
    const count = Math.max(1, item.count);
    const perPerson = divideFractions(item.share, fraction(count));
    for (let i = 0; i < count; i++) {
      const id =
        rename && rename.key === item.key && rename.index === i ? rename.newId : `${item.key}#${i}`;
      out.push({ id, key: item.key, label: item.label, share: perPerson });
    }
  }
  return out;
}

export type TwoScenarioOutcome = {
  scenarioA: SpecialRow[];
  scenarioB: SpecialRow[];
  /** What each person is paid now (the lesser, per person). */
  payNow: SpecialRow[];
  heldShare: Fraction;
  heldAmount: number;
  payNowTotal: number;
};

/**
 * The book's shared "compute twice, pay the lesser, hold the difference"
 * method (unborn child p. 284, missing person p. 308, khuntha/Shafi'i
 * p. 323). Each *person* is paid the lesser of their two scenario amounts;
 * the uncertain person is identified by `specialId` in both scenarios.
 * When `paySpecialLesser` is false (unborn child / missing person — the
 * person cannot be paid at all yet) the uncertain person is paid 0 now and
 * their whole eventual share stays held. When true (khuntha under
 * al-Shafi'i) the uncertain person is paid their own lesser like everyone.
 */
function twoScenarioHoldback(args: {
  estate: number;
  resultA: CalculationResult;
  resultB: CalculationResult;
  specialA: { key: string; index: number } | null;
  specialB: { key: string; index: number } | null;
  specialId: string;
  specialLabel: string;
  paySpecialLesser: boolean;
}): TwoScenarioOutcome {
  const { estate, resultA, resultB } = args;
  const personsA = perPersonShares(
    resultA,
    args.specialA ? { ...args.specialA, newId: args.specialId } : undefined,
  );
  const personsB = perPersonShares(
    resultB,
    args.specialB ? { ...args.specialB, newId: args.specialId } : undefined,
  );
  const shareA = new Map(personsA.map((person) => [person.id, person.share]));
  const shareB = new Map(personsB.map((person) => [person.id, person.share]));
  const meta = new Map(personsA.concat(personsB).map((person) => [person.id, person]));
  const payByKey = new Map<string, { label: string; count: number; share: Fraction }>();
  const addPay = (id: string, share: Fraction) => {
    const person = meta.get(id);
    if (!person) return;
    const key = id === args.specialId ? args.specialId : person.key;
    const label = id === args.specialId ? args.specialLabel : person.label;
    const current = payByKey.get(key);
    if (current) {
      current.count += 1;
      current.share = addFractions(current.share, share);
    } else {
      payByKey.set(key, { label, count: 1, share });
    }
  };
  let heldShare = fraction(1);
  for (const id of Array.from(new Set([...Array.from(shareA.keys()), ...Array.from(shareB.keys())]))) {
    const a = shareA.get(id) ?? fraction(0);
    const b = shareB.get(id) ?? fraction(0);
    const pay = id === args.specialId ? (args.paySpecialLesser ? minFraction(a, b) : fraction(0)) : minFraction(a, b);
    if (isPositiveFraction(pay)) addPay(id, pay);
    heldShare = subtractFractions(heldShare, pay);
  }
  const payEntries: SpecialRowInput[] = Array.from(payByKey.entries()).map(([key, value]) => ({
    key,
    label: value.label,
    count: value.count,
    share: value.share,
  }));
  const heldEntry: SpecialRowInput = {
    key: "__held__",
    label: "Held until the position is known",
    count: 1,
    share: heldShare,
    note: "Pay each heir the lesser of the two scenarios; hold the difference.",
  };
  const rows = buildRows([...payEntries, heldEntry], estate);
  const payNow = rows.filter((row) => row.key !== "__held__");
  const heldRow = rows.find((row) => row.key === "__held__");
  return {
    scenarioA: rowsFromEngine(resultA, estate),
    scenarioB: rowsFromEngine(resultB, estate),
    payNow,
    heldShare,
    heldAmount: heldRow?.amount ?? 0,
    payNowTotal: payNow.reduce((total, row) => total + row.amount, 0),
  };
}

// ---------------------------------------------------------------------------
// One documented engine gap, corrected by the book (NOT a reimplementation)
// ---------------------------------------------------------------------------

/**
 * Wrapper around the protected engine, used for EVERY engine call in this
 * module. It corrects exactly one documented, systematic engine gap —
 * attested by two worked book cases — and nothing else:
 *
 * GAP: when full sisters take only their FIXED shares (2/3 or 1/2), the
 * engine never gives the residue to a LATER Asabah class: every later
 * class's eligibility (`fullBrotherSonsEligible`,
 * `paternalBrotherSoloEligible`, `paternalUncleEligible`, …) requires
 * `fullSiblingCount === 0`, so the residue is returned to the fixed-share
 * heirs by Radd instead. But Radd never applies while an Asabah heir
 * exists, and the book's Asabah classes (pp. 39, 239) put the brother /
 * paternal-brother / paternal-uncle lines after the sisters' fixed
 * shares. The book proves it twice:
 *  - case 269, death 2 (Asma's estate 385): mother 1/6 = 64.17, two full
 *    sisters 2/3 = 256.66, paternal half-brother Aaqil residue 1/6 =
 *    64.17 — the engine instead gives mother 1/5 and the sisters 4/5
 *    by Radd.
 *  - case 284 (estate 400,000): full sister 1/2 = 200,000, paternal
 *    half-sister 1/6 = 66,666.67, paternal uncle residue 1/3 =
 *    133,333.33 — the engine instead Radds the residue to the sisters
 *    (full sister 3/4, paternal sister 1/4) and gives the uncle 0.
 *
 * CORRECTION (fires only when ALL of these hold): the engine returned
 * the residue by Radd (redistribution rows, no remainder row — which
 * already proves no earlier Asabah class took it), and a later Asabah
 * class is present. The whole Radd pool is then reassigned to the
 * NEAREST present later class in the book's class order — a paternal
 * brother together with a paternal sister split it 2:1 by the book's
 * universal male:female rule. Every fixed share stays exactly as the
 * engine computed it. The correction is recorded in the result's
 * notices, and the engine's own scholar-review flag is preserved.
 *
 * NOT corrected (the engine's flagged result stands): distant-relative
 * keys, further son-line descendants, and any combination the book does
 * not cover.
 */
function calculateWithBookCorrection(estate: EstateInput, heirs: HeirInput): CalculationResult {
  const result = calculateInheritance(estate, heirs);
  const hasRedistribution = result.allocations.some((item) => item.method === "redistribution");
  const hasRemainder = result.allocations.some((item) => item.method === "remainder");
  if (!hasRedistribution || hasRemainder) return result;

  const raddTotal = sumFractions(
    result.allocations.filter((item) => item.method === "redistribution").map((item) => item.share),
  );
  const remainderRow = (
    key: string,
    label: string,
    count: number,
    share: Fraction,
    reason: string,
  ): Allocation => ({ key, label, count, share, reason, method: "remainder" });
  const reason =
    "Book cases 269/284: the full sisters keep their fixed shares and the nearest later Asabah class takes the residue (Radd does not apply while an Asabah heir exists).";

  const fullBrothersSons = heirs.fullBrothersSons ?? 0;
  const paternalBrothers = heirs.paternalBrothers ?? 0;
  const paternalSisters = heirs.paternalSisters ?? 0;
  const paternalBrothersSons = heirs.paternalBrothersSons ?? 0;
  const paternalUncles = heirs.paternalUncles ?? 0;
  const paternalUnclesSons = heirs.paternalUnclesSons ?? 0;
  const consanguinePaternalUncles = heirs.consanguinePaternalUncles ?? 0;
  const consanguinePaternalUnclesSons = heirs.consanguinePaternalUnclesSons ?? 0;

  // Nearest present later Asabah class, in the book's class order.
  let residueRows: Allocation[] = [];
  let correctionNote = "";
  if (fullBrothersSons > 0) {
    residueRows = [remainderRow("fullBrothersSons", "உடன்பிறந்த சகோதரரின் மகன்", fullBrothersSons, raddTotal, reason)];
    correctionNote = "Book cases 269/284 applied: a full brother's son takes the residue as Asabah instead of the residue returning by Radd.";
  } else if (paternalBrothers > 0 && paternalSisters > 0) {
    const units = paternalBrothers * 2 + paternalSisters;
    residueRows = [
      remainderRow("paternalBrothers", "தந்தை வழி சகோதரர்", paternalBrothers, multiplyFractions(raddTotal, fraction(paternalBrothers * 2, units)), reason),
      remainderRow("paternalSisters", "தந்தை வழி சகோதரி", paternalSisters, multiplyFractions(raddTotal, fraction(paternalSisters, units)), reason),
    ];
    correctionNote = "Book cases 269/284 applied: a paternal brother and sister share the residue 2:1 as Asabah instead of the residue returning by Radd.";
  } else if (paternalBrothers > 0) {
    residueRows = [remainderRow("paternalBrothers", "தந்தை வழி சகோதரர்", paternalBrothers, raddTotal, reason)];
    correctionNote = "Book case 269 applied: a paternal brother present with full sisters taking fixed shares takes the residue as Asabah instead of the residue returning by Radd.";
  } else if (paternalBrothersSons > 0) {
    residueRows = [remainderRow("paternalBrothersSons", "தந்தை வழி சகோதரரின் மகன்", paternalBrothersSons, raddTotal, reason)];
    correctionNote = "Book cases 269/284 applied: a paternal brother's son takes the residue as Asabah instead of the residue returning by Radd.";
  } else if (paternalUncles > 0) {
    residueRows = [remainderRow("paternalUncles", "தந்தையின் முழு சகோதரர் (அம்)", paternalUncles, raddTotal, reason)];
    correctionNote = "Book case 284 applied: a paternal uncle takes the residue as Asabah instead of the residue returning by Radd.";
  } else if (paternalUnclesSons > 0) {
    residueRows = [remainderRow("paternalUnclesSons", "அம் மகன்", paternalUnclesSons, raddTotal, reason)];
    correctionNote = "Book cases 269/284 applied: a paternal uncle's son takes the residue as Asabah instead of the residue returning by Radd.";
  } else if (consanguinePaternalUncles > 0) {
    residueRows = [remainderRow("consanguinePaternalUncles", "தந்தையின் தந்தை வழி சகோதரர் (அம் لأب)", consanguinePaternalUncles, raddTotal, reason)];
    correctionNote = "Book cases 269/284 applied: a consanguine paternal uncle takes the residue as Asabah instead of the residue returning by Radd.";
  } else if (consanguinePaternalUnclesSons > 0) {
    residueRows = [remainderRow("consanguinePaternalUnclesSons", "அம் لأب மகன்", consanguinePaternalUnclesSons, raddTotal, reason)];
    correctionNote = "Book cases 269/284 applied: a consanguine paternal uncle's son takes the residue as Asabah instead of the residue returning by Radd.";
  } else {
    return result;
  }

  return {
    ...result,
    allocations: [...result.allocations.filter((item) => item.method === "fixed"), ...residueRows],
    notices: [...result.notices, correctionNote],
  };
}

// ===========================================================================
// 1. Dhawul Arham — distant relatives (book §4.1, p. 279; cases 260–266)
// ===========================================================================

export type DhawulArhamBranch = 1 | 2 | 3 | 4;

export const DHAWUL_ARHAM_BRANCHES: Record<DhawulArhamBranch, { title: string; members: string }> = {
  1: {
    title: "Branch 1 — children of daughters",
    members: "Daughter's children and their descendants; son's daughter's children and their descendants.",
  },
  2: {
    title: "Branch 2 — non-share, non-Asabah ancestors",
    members: "The maternal grandfather and paternal ancestors who take neither a fixed share nor Asabah (jadd fāsid / jadda fāsida).",
  },
  3: {
    title: "Branch 3 — children of siblings",
    members: "Brother's daughter and her descendants; sisters' children and their descendants; maternal brother's children.",
  },
  4: {
    title: "Branch 4 — parents' siblings",
    members: "Father's maternal brother and his descendants; mother's brothers and sisters and their descendants.",
  },
};

export type DhawulArhamClaimant = {
  label: string;
  branch: DhawulArhamBranch;
  /** Nearness in degree within the branch: smaller = nearer (1 = nearest generation). */
  degree: number;
  sex: "male" | "female";
  count: number;
};

export type DhawulArhamInput = {
  estate: number;
  /** Fixed-share / Asabah heirs of the deceased (engine HeirInput). */
  fixedHeirs: HeirInput;
  claimants: DhawulArhamClaimant[];
};

export type DhawulArhamResult = SpecialResultBase & {
  fixedRows: SpecialRow[];
  distantRows: SpecialRow[];
  /** Full distribution: fixed-share rows + distant-relative rows (+ held row). */
  rows: SpecialRow[];
  winningBranch: DhawulArhamBranch | null;
  winningDegree: number | null;
  /** Share of the estate left after the fixed-share heirs. */
  residueShare: Fraction;
  blockedClaimants: { label: string; reason: string }[];
};

/**
 * Dhawul Arham by the book's "popular method in practice" (p. 279):
 * fixed-share heirs take their shares first and do NOT share the residue
 * (case 266: the wife takes 1/4 and "cannot inherit again"); the residue
 * goes to the distant relatives. An earlier branch blocks a later branch;
 * within a branch the nearer degree takes everything; at equal degree
 * males and females split 2:1. The book never uses tanzil ("put in the
 * place of a nearer heir") — this is branch-and-degree only.
 * If an Asabah heir exists, the distant relatives inherit nothing.
 */
export function calculateDhawulArham(input: DhawulArhamInput): DhawulArhamResult {
  const { estate, fixedHeirs, claimants } = input;
  const notes: string[] = [];
  const scholarReasons: string[] = [];
  const engineResult = calculateWithBookCorrection(simpleEstate(estate), fixedHeirs);
  const hasAsabah = engineResult.allocations.some((item) => item.method === "remainder");
  const fixedEntries: SpecialRowInput[] = engineResult.allocations
    .filter((item) => item.method === "fixed")
    .map((item) => ({ key: item.key, label: item.label, count: item.count, share: item.share, note: item.reason }));
  const fixedTotal = sumFractions(fixedEntries.map((entry) => entry.share));
  const residueShare = isPositiveFraction(subtractFractions(fraction(1), fixedTotal))
    ? subtractFractions(fraction(1), fixedTotal)
    : fraction(0);

  let winningBranch: DhawulArhamBranch | null = null;
  let winningDegree: number | null = null;
  let distantEntries: SpecialRowInput[] = [];
  let blockedClaimants: { label: string; reason: string }[] = [];
  let rows: SpecialRow[];

  if (hasAsabah) {
    notes.push(
      "An Asabah (residuary) heir exists, so the distant relatives inherit nothing — they inherit only when no fixed-share heir and no Asabah exists.",
    );
    rows = rowsFromEngine(engineResult, estate);
  } else if (claimants.length === 0) {
    notes.push("No distant relative was entered, so the residue after the fixed-share heirs is held.");
    rows = buildRows(
      [
        ...fixedEntries,
        {
          key: "__held__",
          label: "Held / unallocated residue",
          count: 1,
          share: residueShare,
          note: "No distant relative entered to take the residue.",
        },
      ],
      estate,
    );
  } else {
    winningBranch = Math.min(...claimants.map((claimant) => claimant.branch)) as DhawulArhamBranch;
    const inBranch = claimants.filter((claimant) => claimant.branch === winningBranch);
    winningDegree = Math.min(...inBranch.map((claimant) => claimant.degree));
    const winners = inBranch.filter((claimant) => claimant.degree === winningDegree);
    const activeBranch: DhawulArhamBranch = winningBranch;
    const activeDegree: number = winningDegree;
    blockedClaimants = claimants
      .filter((claimant) => claimant.branch !== winningBranch || claimant.degree !== winningDegree)
      .map((claimant) => ({
        label: claimant.label,
        reason:
          claimant.branch !== winningBranch
            ? `Blocked by branch ${winningBranch}: an earlier branch blocks a later branch.`
            : `Blocked by a nearer degree (degree ${winningDegree}) in the same branch.`,
      }));
    const totalParts = winners.reduce(
      (total, winner) => total + (winner.sex === "male" ? 2 : 1) * winner.count,
      0,
    );
    distantEntries = winners.map((winner) => ({
      key: `dhawul-${winner.branch}-${winner.degree}-${winner.label}`,
      label: winner.label,
      count: winner.count,
      share: multiplyFractions(residueShare, fraction((winner.sex === "male" ? 2 : 1) * winner.count, totalParts)),
      note: `${DHAWUL_ARHAM_BRANCHES[activeBranch].title}; degree ${activeDegree}; ${winner.sex === "male" ? "2 parts" : "1 part"} per person (male:female 2:1).`,
    }));
    if (winningBranch === 2 || winningBranch === 4) {
      scholarReasons.push(
        `No worked example in the book uses branch ${winningBranch} of the distant relatives; this computation follows the branch-and-degree rule only — scholar confirmation is needed.`,
      );
    }
    rows = buildRows([...fixedEntries, ...distantEntries], estate);
  }

  const fixedRows = rows.filter((row) => fixedEntries.some((entry) => entry.key === row.key));
  const distantRows = rows.filter((row) => distantEntries.some((entry) => entry.key === row.key));
  const summary =
    winningBranch === null
      ? hasAsabah
        ? "An Asabah heir takes the residue; the distant relatives inherit nothing."
        : "No distant relative takes the residue."
      : `Residue ${fractionToText(residueShare)} goes to branch ${winningBranch} (degree ${winningDegree}) at 2:1 male:female.`;
  return {
    estate,
    bookRef: "Book §4.1, p. 279; cases 260–266",
    summary,
    notes,
    needsScholarConfirmation: scholarReasons.length > 0,
    scholarReasons,
    fixedRows,
    distantRows,
    rows,
    winningBranch,
    winningDegree,
    residueShare,
    blockedClaimants,
  };
}

// ===========================================================================
// 2. Grandfather + siblings — Hanafi vs Shafi'i (book §4.2; cases 113/114,
//    138/139; rules 5.4.7, 5.5.11, pp. 156, 177)
// ===========================================================================

export type GrandfatherSchool = "hanafi" | "shafii";

export type GrandfatherSiblingsResult = SpecialResultBase & {
  /** The school used for the headline result — the book's default is Hanafi. */
  school: GrandfatherSchool;
  hanafi: DivisionOutcome;
  shafii: DivisionOutcome;
};

/**
 * Grandfather alive together with full or paternal sisters (and, by
 * extension, brothers). Imam Abu Hanifa: the grandfather blocks the
 * sisters entirely (0) and takes the residue himself — the engine's
 * default. Imam al-Shafi'i: the sisters keep their fixed shares and the
 * grandfather takes the residue. Both schools' results are returned so
 * the UI can show the alternative side by side.
 *
 * The Shafi'i side is computed by running the engine WITHOUT the
 * grandfather (so the sisters receive their book fixed shares, with no
 * Radd top-up — the residue belongs to the grandfather, not to Radd) and
 * giving the grandfather the remaining share; when the fixed shares
 * already exceed the estate, 'Awl applies and the grandfather takes 0.
 * The book is silent on a grandfather together with male brothers.
 */
export function calculateGrandfatherWithSiblings(input: {
  estate: number;
  heirs: HeirInput;
  school?: GrandfatherSchool;
}): GrandfatherSiblingsResult {
  const { estate, heirs } = input;
  const school = input.school ?? "hanafi";
  const notes: string[] = [];
  const scholarReasons: string[] = [];
  const hasMaleBrothers = heirs.fullBrothers > 0 || (heirs.paternalBrothers ?? 0) > 0;
  const hasSisters = heirs.fullSisters > 0 || (heirs.paternalSisters ?? 0) > 0;
  const hasMaleSonLineDescendant =
    heirs.sons > 0 || (heirs.sonsSons ?? 0) > 0 || (heirs.furtherSonsLineDescendants ?? 0) > 0;
  if (hasMaleBrothers) {
    scholarReasons.push(
      "The book gives no case of a grandfather together with male (full or paternal) brothers — the book is silent there.",
    );
  }
  if (heirs.father > 0) {
    notes.push("The father is alive, so the grandfather is blocked entirely in both schools.");
  }

  const hanafiEngine = calculateWithBookCorrection(simpleEstate(estate), heirs);
  const hanafi = divisionFromEngine(hanafiEngine, estate, [
    "Hanafi (Imam Abu Hanifa): the grandfather blocks the sisters entirely and takes the residue himself.",
  ]);

  let shafii: DivisionOutcome;
  if (heirs.father > 0 || hasMaleSonLineDescendant || !hasSisters) {
    // No school difference can arise here: with a father the grandfather is
    // blocked; with a male son-line descendant the sisters are blocked by
    // the descendant in both schools and the grandfather keeps 1/6 + residue;
    // with no sisters there is nothing for the schools to differ over.
    shafii = divisionFromEngine(hanafiEngine, estate, [
      "Shafi'i: identical here — the grandfather's share is unaffected by the school difference in this combination.",
    ]);
  } else {
    const withoutGrandfather = calculateWithBookCorrection(simpleEstate(estate), {
      ...heirs,
      paternalGrandfather: 0,
    });
    const sisterAsAsabah =
      withoutGrandfather.allocations.some(
        (item) =>
          item.method === "remainder" && (item.key === "fullSisters" || item.key === "paternalSisters"),
      );
    if (sisterAsAsabah) {
      scholarReasons.push(
        "A sister here takes the residue as Asabah (with a daughter) rather than a fixed share; the book does not cover a grandfather together with a sister-as-Asabah, so the Shafi'i side gives the sisters their fixed shares only and the grandfather the residue.",
      );
    }
    if (withoutGrandfather.fixedSharesAdjusted) {
      // 'Awl: the fixed shares already exceed the estate; the grandfather takes 0.
      const rows = rowsFromEngine(withoutGrandfather, estate);
      const grandfatherRow: SpecialRow = {
        key: "paternalGrandfather",
        label: "தந்தையின் தந்தை",
        count: 1,
        fraction: "0",
        share: fraction(0),
        amount: 0,
        note: "Fixed shares exceed the estate ('Awl), so the grandfather as Asabah takes nothing.",
      };
      shafii = {
        rows: [...rows.filter((row) => row.key !== "__held__"), grandfatherRow],
        totalDistributed: estate,
        notes: [
          "Shafi'i (Imam al-Shafi'i): the sisters keep their fixed shares; the fixed shares exceed the estate ('Awl), so the grandfather takes nothing.",
        ],
        needsScholarConfirmation: false,
      };
    } else {
      // Fixed shares only — never the Radd top-up: that residue is the grandfather's.
      const blockedByGrandfather = new Set(["maternalBrothers", "maternalSisters", "maternalGrandmothers"]);
      const fixedEntries: SpecialRowInput[] = withoutGrandfather.allocations
        .filter((item) => item.method === "fixed" && !blockedByGrandfather.has(item.key))
        .map((item) => ({ key: item.key, label: item.label, count: item.count, share: item.share, note: item.reason }));
      const fixedTotal = sumFractions(fixedEntries.map((entry) => entry.share));
      const grandfatherShare = subtractFractions(fraction(1), fixedTotal);
      const entries: SpecialRowInput[] = [
        ...fixedEntries,
        {
          key: "paternalGrandfather",
          label: "தந்தையின் தந்தை",
          count: 1,
          share: grandfatherShare,
          note: "Shafi'i: the grandfather takes the residue after the sisters' fixed shares.",
        },
      ];
      shafii = {
        rows: buildRows(entries, estate),
        totalDistributed: estate,
        notes: [
          "Shafi'i (Imam al-Shafi'i): the sisters keep their fixed shares and the grandfather takes the residue.",
        ],
        needsScholarConfirmation: false,
      };
    }
  }

  const summary =
    school === "hanafi"
      ? `Hanafi default: grandfather takes the residue; sisters ${hasSisters ? "take 0 (blocked)" : "absent"}.`
      : "Shafi'i: sisters keep their fixed shares; grandfather takes the residue.";
  return {
    estate,
    bookRef: "Book §4.2, rules 5.4.7, 5.5.11; cases 113/114, 138/139",
    summary,
    notes,
    needsScholarConfirmation: scholarReasons.length > 0,
    scholarReasons,
    school,
    hanafi,
    shafii,
  };
}

// ===========================================================================
// 3. Debtor's estate (book §4.3, p. 305; cases 272–273)
// ===========================================================================

export type DebtorInput = {
  grossEstate: number;
  funeralCosts?: number;
  debts: { name: string; amount: number }[];
  heirs: HeirInput;
};

export type DebtorResult = SpecialResultBase & {
  /** 1 = estate equals debt; 2 = debt exceeds estate (pro-rata); 3 = estate exceeds debt. */
  state: 1 | 2 | 3;
  totalDebt: number;
  distributable: number;
  creditorRows: SpecialRow[];
  heirRows: SpecialRow[];
  rows: SpecialRow[];
  remainderForHeirs: number;
};

/**
 * Three states (p. 305). (1) Estate equals debt: heirs get nothing at all.
 * (2) Debt exceeds estate: divide the estate among the creditors pro rata
 * — estate × each debt ÷ total debt; creditors must NOT be paid one by one
 * in full until the money runs out. (3) Estate exceeds debt: pay the debts
 * in full, then divide the remainder among the heirs normally (via the
 * engine). Heirs topping up an unpaid shortfall is commendable, not
 * obligatory.
 */
export function calculateDebtorEstate(input: DebtorInput): DebtorResult {
  const funeralCosts = Math.max(0, input.funeralCosts ?? 0);
  const distributable = Math.max(0, input.grossEstate - funeralCosts);
  const totalDebt = input.debts.reduce((total, debt) => total + Math.max(0, debt.amount), 0);
  const totalDebtCents = Math.round(totalDebt * 100);
  const notes: string[] = [];
  let state: 1 | 2 | 3;
  let creditorRows: SpecialRow[];
  let heirRows: SpecialRow[] = [];
  let remainderForHeirs = 0;

  if (distributable <= 0) {
    state = 2;
    notes.push("Funeral costs consume the whole estate; nothing is left for creditors or heirs.");
    creditorRows = buildRows(
      input.debts.map((debt) => ({
        key: `creditor-${debt.name}`,
        label: debt.name,
        count: 1,
        share: fraction(0),
        note: "Nothing left to pay.",
      })),
      0,
    );
  } else if (totalDebt === distributable) {
    state = 1;
    notes.push("The estate equals the debt: the creditors are paid in full and the heirs get nothing at all.");
    creditorRows = buildRows(
      input.debts.map((debt) => ({
        key: `creditor-${debt.name}`,
        label: debt.name,
        count: 1,
        share: totalDebtCents > 0 ? fraction(Math.round(debt.amount * 100), totalDebtCents) : fraction(0),
        note: "Paid in full.",
      })),
      distributable,
    );
  } else if (totalDebt > distributable) {
    state = 2;
    notes.push(
      "The debt exceeds the estate: the estate is divided among the creditors pro rata (estate × each debt ÷ total debt). The heirs get nothing.",
    );
    creditorRows = buildRows(
      input.debts.map((debt) => ({
        key: `creditor-${debt.name}`,
        label: debt.name,
        count: 1,
        share: totalDebtCents > 0 ? fraction(Math.round(debt.amount * 100), totalDebtCents) : fraction(0),
        note: `Pro-rata: ${fractionToText(totalDebtCents > 0 ? fraction(Math.round(debt.amount * 100), totalDebtCents) : fraction(0))} of the estate.`,
      })),
      distributable,
    );
  } else {
    state = 3;
    remainderForHeirs = distributable - totalDebt;
    notes.push("The estate exceeds the debt: the debts are paid in full, then the remainder is divided among the heirs normally.");
    creditorRows = buildRows(
      input.debts.map((debt) => ({
        key: `creditor-${debt.name}`,
        label: debt.name,
        count: 1,
        share: totalDebtCents > 0 ? fraction(Math.round(debt.amount * 100), totalDebtCents) : fraction(0),
        note: "Paid in full.",
      })),
      totalDebt,
    );
    const heirResult = calculateWithBookCorrection(simpleEstate(remainderForHeirs), input.heirs);
    heirRows = rowsFromEngine(heirResult, remainderForHeirs);
  }

  const rows = [...creditorRows, ...heirRows];
  return {
    estate: input.grossEstate,
    bookRef: "Book §4.3, p. 305; cases 272–273",
    summary:
      state === 1
        ? "Estate equals debt — creditors paid in full, heirs get nothing."
        : state === 2
          ? "Debt exceeds estate — creditors share the estate pro rata, heirs get nothing."
          : `Debts paid in full; remainder ${remainderForHeirs} divided among the heirs normally.`,
    notes,
    needsScholarConfirmation: false,
    scholarReasons: [],
    state,
    totalDebt,
    distributable,
    creditorRows,
    heirRows,
    rows,
    remainderForHeirs,
  };
}

// ===========================================================================
// 4. Disqualified heirs (book §4.4, p. 38)
// ===========================================================================

export type DisqualificationReason = "murderer" | "different-religion";

export type DisqualifiedHeirInput = {
  key: keyof HeirInput;
  label: string;
  reason: DisqualificationReason;
};

export type DisqualifiedHeirsResult = SpecialResultBase & {
  rows: SpecialRow[];
  excluded: { key: string; label: string; reason: DisqualificationReason; rule: string }[];
  /** The slave category, stated in the book as not applicable now — info only. */
  slaveNote: string;
};

const DISQUALIFICATION_RULES: Record<DisqualificationReason, string> = {
  murderer: "An heir who kills the estate-owner cannot inherit from that estate (book p. 38).",
  "different-religion":
    "Difference of religion blocks inheritance: Muslims cannot inherit from non-Muslims and vice versa (book p. 38).",
};

/**
 * Eligibility step: run the engine WITHOUT the disqualified heirs and
 * return the distribution plus the rule applied per excluded heir. The
 * slave category is noted as not applicable now and never changes the
 * calculation.
 */
export function calculateDisqualifiedHeirs(input: {
  estate: number;
  heirs: HeirInput;
  disqualified: DisqualifiedHeirInput[];
}): DisqualifiedHeirsResult {
  const eligibleHeirs: HeirInput = { ...input.heirs };
  for (const item of input.disqualified) {
    (eligibleHeirs as Record<string, number | undefined>)[item.key] = 0;
  }
  const engineResult = calculateWithBookCorrection(simpleEstate(input.estate), eligibleHeirs);
  const excluded = input.disqualified.map((item) => ({
    key: String(item.key),
    label: item.label,
    reason: item.reason,
    rule: DISQUALIFICATION_RULES[item.reason],
  }));
  const slaveNote =
    "Slave (அடிமையானவர்): listed in the book (p. 38) as the third disqualifier, stated as not applicable now — 'no need to know about it'. It is shown here for information only and never changes a calculation.";
  return {
    estate: input.estate,
    bookRef: "Book §4.4, p. 38",
    summary:
      excluded.length === 0
        ? "No heir disqualified; the ordinary division applies."
        : `${excluded.length} heir(s) excluded (${excluded.map((item) => item.label).join(", ")}); the estate is divided among the remaining heirs.`,
    notes: [...engineResult.notices, slaveNote],
    needsScholarConfirmation: false,
    scholarReasons: [],
    rows: rowsFromEngine(engineResult, input.estate),
    excluded,
    slaveNote,
  };
}

// ===========================================================================
// 5. Sahih / fasid grandparent classification (book §4.5, book lines 805–834
//    in the study's numbering; the 8 categories are listed at book pp. ~56–60)
// ===========================================================================

export type GrandparentChainLink = "father" | "mother";

export type GrandparentClassification = {
  chain: GrandparentChainLink[];
  /** e.g. "father's mother's father". */
  description: string;
  classification: "sahih" | "fasid";
  /** Which of the book's 8 categories (1–8) this chain falls under. */
  bookCategory: number;
  /** Whether the chain is literally one of the book's listed examples. */
  matchedBookExample: boolean;
  consequence: "fixed-share" | "distant-relative";
  /** Dhawul Arham branch placement when the consequence is distant-relative. */
  dhawulArhamBranch: DhawulArhamBranch | null;
  consequenceNote: string;
  needsScholarConfirmation: boolean;
  notes: string[];
};

const BOOK_CHAIN_EXAMPLES = new Set([
  "father,father",
  "father,father,father",
  "father,mother,father",
  "mother,father",
  "mother,mother,father",
  "mother,father,mother,father",
  "father,mother",
  "father,father,mother",
  "father,mother,father,mother",
  "mother,mother",
  "mother,mother,mother",
  "mother,father,mother,mother",
]);

function describeChain(chain: GrandparentChainLink[]): string {
  return chain
    .map((link, index) =>
      index === chain.length - 1 ? link : `${link}'s`,
    )
    .join(" ");
}

/**
 * Classify a grandparent chain (links from the deceased outward; the last
 * link is the grandparent themself: 'father' = grandfather, 'mother' =
 * grandmother). The book's 8 categories:
 *  1. father's-side sahih grandfather — pure male line (father's father,
 *     father's father's father): fixed-share heir.
 *  2. father's-side fasid grandfather — father's mother's father (a mother
 *     intervenes): distant relative.
 *  3. mother's-side sahih grandfather — mother's father, mother's mother's
 *     father: called sahih, yet still belongs to the distant kindred.
 *  4. mother's-side fasid grandfather — mother's father's mother's father
 *     (a father intervenes): distant relative.
 *  5. father's-side sahiha grandmother — father's mother, father's father's
 *     mother: fixed-share heir.
 *  6. father's-side fasida grandmother — father's mother's father's mother
 *     (a father intervenes): distant relative.
 *  7. mother's-side sahiha grandmother — mother's mother, mother's mother's
 *     mother: fixed-share heir.
 *  8. mother's-side fasida grandmother — mother's father's mother's mother
 *     (a father intervenes): distant relative.
 * A grandmother is fasida when a fāsid grandfather intervenes in her
 * chain — i.e. a 'father' link preceded by a 'mother' link above her.
 * The book's wording for category 3 is terse and partly circular (called
 * sahih, treated as distant), so category 3 is always flagged.
 */
export function classifyGrandparent(chain: GrandparentChainLink[]): GrandparentClassification {
  if (chain.length < 2) {
    throw new Error("A grandparent chain needs at least two links (e.g. ['father', 'father'] for father's father).");
  }
  const endpoint = chain[chain.length - 1];
  const isGrandfather = endpoint === "father";
  const description = describeChain(chain);
  const matchedBookExample = BOOK_CHAIN_EXAMPLES.has(chain.join(","));
  const notes: string[] = [];
  let classification: "sahih" | "fasid";
  let bookCategory: number;
  let consequence: "fixed-share" | "distant-relative";
  let needsScholarConfirmation = false;

  if (isGrandfather) {
    const allMaleLine = chain.every((link) => link === "father");
    const fathersBeforeEndpoint = chain.slice(0, -1).filter((link) => link === "father").length;
    if (allMaleLine) {
      classification = "sahih";
      bookCategory = 1;
      consequence = "fixed-share";
    } else if (fathersBeforeEndpoint === 0) {
      classification = "sahih";
      bookCategory = 3;
      consequence = "distant-relative";
      needsScholarConfirmation = true;
      notes.push(
        "The book calls this grandfather sahih, yet states he belongs to the distant kindred and inherits only when no fixed-share heir and no Asabah exists — the book's own wording here is terse and partly circular.",
      );
    } else {
      classification = "fasid";
      bookCategory = chain[0] === "father" ? 2 : 4;
      consequence = "distant-relative";
    }
  } else {
    const above = chain.slice(0, -1);
    let interveningFasid = false;
    let seenMother = false;
    for (const link of above) {
      if (link === "mother") seenMother = true;
      else if (link === "father" && seenMother) interveningFasid = true;
    }
    if (interveningFasid) {
      classification = "fasid";
      bookCategory = chain[0] === "father" ? 6 : 8;
      consequence = "distant-relative";
    } else {
      classification = "sahih";
      bookCategory = chain[0] === "father" ? 5 : 7;
      consequence = "fixed-share";
    }
  }

  if (!matchedBookExample) {
    needsScholarConfirmation = true;
    notes.push(
      `This exact chain is not literally listed among the book's 8 example chains; it is classified by the book's stated rule (category ${bookCategory}) — scholar confirmation is needed.`,
    );
  }

  const consequenceNote =
    consequence === "fixed-share"
      ? isGrandfather
        ? "Fixed-share heir: 1/6 (plus the residue when there is no closer Asabah heir), when the father is absent."
        : "Fixed-share heir: shares 1/6 with the other eligible grandmothers, when the mother is absent."
      : "Dhawul Arham (distant relative), branch 2 — inherits only when no fixed-share heir and no Asabah exists.";
  return {
    chain,
    description,
    classification,
    bookCategory,
    matchedBookExample,
    consequence,
    dhawulArhamBranch: consequence === "distant-relative" ? 2 : null,
    consequenceNote,
    needsScholarConfirmation,
    notes,
  };
}

// ===========================================================================
// 6. Unborn child (book §4.6, p. 284; cases 267–268)
// ===========================================================================

export type UnbornChildResult = SpecialResultBase & {
  asSon: DivisionOutcome;
  asDaughter: DivisionOutcome;
  payNow: SpecialRow[];
  heldShare: Fraction;
  heldAmount: number;
  payNowTotal: number;
};

/**
 * If the wife is pregnant when the husband dies, best course is not to
 * divide until the child is born. If the heirs insist: compute twice —
 * once treating the unborn child as male, once as female; pay each heir
 * the smaller of the two amounts; hold the rest until birth; after birth,
 * distribute the held amount according to the child's actual sex.
 * The book is silent on twins/multiple births, a stillborn child, and any
 * time limit.
 */
export function calculateUnbornChild(input: { estate: number; heirs: HeirInput }): UnbornChildResult {
  const { estate, heirs } = input;
  const asSonEngine = calculateWithBookCorrection(simpleEstate(estate), { ...heirs, sons: heirs.sons + 1 });
  const asDaughterEngine = calculateWithBookCorrection(simpleEstate(estate), { ...heirs, daughters: heirs.daughters + 1 });
  const outcome = twoScenarioHoldback({
    estate,
    resultA: asSonEngine,
    resultB: asDaughterEngine,
    specialA: { key: "sons", index: heirs.sons },
    specialB: { key: "daughters", index: heirs.daughters },
    specialId: "unborn",
    specialLabel: "Unborn child (held)",
    paySpecialLesser: false,
  });
  const scholarReasons = [
    "The book is silent on twins/multiple births, on a stillborn child, and on any time limit for the hold-back.",
  ];
  return {
    estate,
    bookRef: "Book §4.6, p. 284; cases 267–268",
    summary: `Pay now ${outcome.payNowTotal}; hold ${outcome.heldAmount} until the child is born.`,
    notes: [
      "Best course is not to divide until the child is born; this is the division-if-the-heirs-insist.",
      "Each heir is paid the lesser of the as-son and as-daughter amounts; the rest is held until birth.",
    ],
    needsScholarConfirmation: true,
    scholarReasons,
    asSon: divisionFromEngine(asSonEngine, estate, ["Unborn child treated as a son."]),
    asDaughter: divisionFromEngine(asDaughterEngine, estate, ["Unborn child treated as a daughter."]),
    payNow: outcome.payNow,
    heldShare: outcome.heldShare,
    heldAmount: outcome.heldAmount,
    payNowTotal: outcome.payNowTotal,
  };
}

// ===========================================================================
// 7. Missing person / prisoner (book §4.7, p. 308; cases 274–277)
// ===========================================================================

export type MissingPersonInput = {
  estate: number;
  heirs: HeirInput;
  /** Which heir key the missing/prisoner person belongs to (e.g. "sons"). */
  missingKey: keyof HeirInput;
  /** How many persons of that key are missing (default 1). */
  missingCount?: number;
  kind?: "missing" | "prisoner";
};

export type MissingPersonResult = SpecialResultBase & {
  kind: "missing" | "prisoner";
  ifAlive: DivisionOutcome;
  ifDead: DivisionOutcome;
  payNow: SpecialRow[];
  heldShare: Fraction;
  heldAmount: number;
  payNowTotal: number;
  /** The waiting period as the book states it (70 years). */
  waitingPeriodYears: 70;
};

/**
 * Best course is to postpone division until it is clear whether the
 * person is alive or dead. If the other heirs insist: compute twice —
 * once as if alive, once as if dead (exactly like the unborn-child
 * computation); pay each heir the smaller amount; hold the difference
 * until the person returns or the waiting period ends. The book states
 * a 70-year wait as the unanimous opinion of the imams, but gives no
 * start date for counting the 70 years and no rule for what happens to
 * the held share when the period ends. The prisoner has no separate rule
 * in the book despite the chapter heading naming him, and the book is
 * silent on a prisoner known to be alive in jail.
 */
export function calculateMissingPerson(input: MissingPersonInput): MissingPersonResult {
  const { estate, heirs } = input;
  const kind = input.kind ?? "missing";
  const missingCount = input.missingCount ?? 1;
  const present = heirs[input.missingKey] ?? 0;
  if (missingCount < 1 || missingCount > present) {
    throw new Error(`Missing count (${missingCount}) must be between 1 and the entered count (${present}) for ${String(input.missingKey)}.`);
  }
  const deadHeirs: HeirInput = { ...heirs };
  (deadHeirs as Record<string, number | undefined>)[input.missingKey] = present - missingCount;
  const aliveEngine = calculateWithBookCorrection(simpleEstate(estate), heirs);
  const deadEngine = calculateWithBookCorrection(simpleEstate(estate), deadHeirs);
  const missingIndex = present - 1; // the missing person is the last of the key
  const outcome = twoScenarioHoldback({
    estate,
    resultA: aliveEngine,
    resultB: deadEngine,
    specialA: { key: String(input.missingKey), index: missingIndex },
    specialB: null,
    specialId: "missing",
    specialLabel: kind === "prisoner" ? "Prisoner (held)" : "Missing person (held)",
    paySpecialLesser: false,
  });
  const scholarReasons = [
    "The book states a 70-year wait as the unanimous opinion of the imams, but gives no start date for counting the 70 years and no rule for what happens to the held share when the period ends.",
  ];
  if (kind === "prisoner") {
    scholarReasons.push(
      "The book gives the prisoner no separate rule despite the chapter heading naming him, and is silent on a prisoner known to be alive in jail.",
    );
  }
  return {
    estate,
    bookRef: "Book §4.7, p. 308; cases 274–277",
    summary: `Pay now ${outcome.payNowTotal}; hold ${outcome.heldAmount} until the person returns or the waiting period ends.`,
    notes: [
      "Best course is to postpone division until it is clear whether the person is alive or dead.",
      "Waiting period as the book states it: 70 years (stated as the unanimous opinion of the imams).",
    ],
    needsScholarConfirmation: true,
    scholarReasons,
    kind,
    ifAlive: divisionFromEngine(aliveEngine, estate, ["Computed as if the person is alive."]),
    ifDead: divisionFromEngine(deadEngine, estate, ["Computed as if the person is dead."]),
    payNow: outcome.payNow,
    heldShare: outcome.heldShare,
    heldAmount: outcome.heldAmount,
    payNowTotal: outcome.payNowTotal,
    waitingPeriodYears: 70,
  };
}

// ===========================================================================
// 8. Khuntha — intersex heir (book §4.8, p. 323; cases 280–281)
// ===========================================================================

export type KhunthaRole = "child" | "paternalSibling";

export type KhunthaResult = SpecialResultBase & {
  asMale: DivisionOutcome;
  asFemale: DivisionOutcome;
  /** Shafi'i: pay every heir the lesser, hold the difference. */
  shafii: { payNow: SpecialRow[]; heldShare: Fraction; heldAmount: number; payNowTotal: number };
  /** Abu Hanifa: pay the khuntha the lesser, distribute the rest, hold nothing. */
  abuHanifa: { rows: SpecialRow[]; khunthaAmount: number; khunthaShare: Fraction };
  /** The book's "prevailing" view: reserve the larger for the khuntha, others get the lesser. */
  prevailing: { rows: SpecialRow[]; heldShare: Fraction; heldAmount: number };
};

/**
 * A person born with both male and female organs together, or with
 * neither, is called khuntha. Wait until puberty: if male traits
 * predominate decide male; if female traits predominate, decide female.
 * If division cannot wait, all three views are returned side by side,
 * labelled — never averaged (the book never averages; it always takes
 * the lesser and/or holds the difference).
 */
export function calculateKhuntha(input: { estate: number; heirs: HeirInput; role: KhunthaRole }): KhunthaResult {
  const { estate, heirs, role } = input;
  const maleKey = role === "child" ? "sons" : "paternalBrothers";
  const femaleKey = role === "child" ? "daughters" : "paternalSisters";
  const malePresent = (heirs as Record<string, number | undefined>)[maleKey] ?? 0;
  const femalePresent = (heirs as Record<string, number | undefined>)[femaleKey] ?? 0;
  const asMaleEngine = calculateWithBookCorrection(simpleEstate(estate), {
    ...heirs,
    [maleKey]: malePresent + 1,
  } as HeirInput);
  const asFemaleEngine = calculateWithBookCorrection(simpleEstate(estate), {
    ...heirs,
    [femaleKey]: femalePresent + 1,
  } as HeirInput);

  // Per-person shares, with the khuntha matched across both scenarios.
  const personsMale = perPersonShares(asMaleEngine, { key: maleKey, index: malePresent, newId: "khuntha" });
  const personsFemale = perPersonShares(asFemaleEngine, { key: femaleKey, index: femalePresent, newId: "khuntha" });
  const maleMap = new Map(personsMale.map((person) => [person.id, person]));
  const femaleMap = new Map(personsFemale.map((person) => [person.id, person]));
  const khunthaMaleShare = maleMap.get("khuntha")?.share ?? fraction(0);
  const khunthaFemaleShare = femaleMap.get("khuntha")?.share ?? fraction(0);
  const khunthaLesser = minFraction(khunthaMaleShare, khunthaFemaleShare);
  const khunthaLarger = maxFraction(khunthaMaleShare, khunthaFemaleShare);

  // Shafi'i: every heir (including the khuntha) is paid the lesser; hold the difference.
  const shafiiOutcome = twoScenarioHoldback({
    estate,
    resultA: asMaleEngine,
    resultB: asFemaleEngine,
    specialA: { key: maleKey, index: malePresent },
    specialB: { key: femaleKey, index: femalePresent },
    specialId: "khuntha",
    specialLabel: "Khuntha heir",
    paySpecialLesser: true,
  });

  // Abu Hanifa: the khuntha gets the lesser; the rest is distributed among
  // the other heirs by the general method (engine on the reduced estate).
  const reducedEstate = estate * fractionToNumber(subtractFractions(fraction(1), khunthaLesser));
  const othersHeirs = { ...heirs };
  const restEngine = calculateWithBookCorrection(simpleEstate(reducedEstate), othersHeirs);
  const restEntries = entriesFromEngine(restEngine);
  const scaleToOriginal = subtractFractions(fraction(1), khunthaLesser);
  const abuHanifaEntries: SpecialRowInput[] = [
    {
      key: "khuntha",
      label: "Khuntha heir",
      count: 1,
      share: khunthaLesser,
      note: "Abu Hanifa: the khuntha is paid the lesser of the two scenario amounts.",
    },
    ...restEntries.map((entry) => ({
      ...entry,
      share: multiplyFractions(entry.share, scaleToOriginal),
      note: "Abu Hanifa: share of the remaining estate after the khuntha's lesser is set aside.",
    })),
  ];
  const abuHanifaRows = buildRows(abuHanifaEntries, estate);

  // Prevailing view: reserve the larger for the khuntha, others get the lesser.
  const prevailingPay = new Map<string, { label: string; count: number; share: Fraction }>();
  let prevailingHeld = fraction(1);
  for (const id of Array.from(new Set([...Array.from(maleMap.keys()), ...Array.from(femaleMap.keys())]))) {
    const a = maleMap.get(id)?.share ?? fraction(0);
    const b = femaleMap.get(id)?.share ?? fraction(0);
    const pay = id === "khuntha" ? khunthaLarger : minFraction(a, b);
    prevailingHeld = subtractFractions(prevailingHeld, pay);
    if (!isPositiveFraction(pay)) continue;
    const person = maleMap.get(id) ?? femaleMap.get(id);
    const key = id === "khuntha" ? "khuntha" : (person?.key ?? id);
    const label = id === "khuntha" ? "Khuntha heir" : (person?.label ?? id);
    const current = prevailingPay.get(key);
    if (current) {
      current.count += 1;
      current.share = addFractions(current.share, pay);
    } else {
      prevailingPay.set(key, { label, count: 1, share: pay });
    }
  }
  const prevailingEntries: SpecialRowInput[] = [
    ...Array.from(prevailingPay.entries()).map(([key, value]) => ({ key, label: value.label, count: value.count, share: value.share })),
    { key: "__held__", label: "Held until the sex is known", count: 1, share: prevailingHeld },
  ];
  const prevailingRows = buildRows(prevailingEntries, estate);
  const prevailingHeldRow = prevailingRows.find((row) => row.key === "__held__");

  return {
    estate,
    bookRef: "Book §4.8, p. 323; cases 280–281",
    summary:
      "Three views, side by side: Shafi'i (pay lesser, hold the difference), Abu Hanifa (khuntha takes the lesser, rest distributed, nothing held), prevailing (reserve the larger for the khuntha). No averaging.",
    notes: [
      "Wait until puberty if division can wait: if male traits predominate decide male; if female traits predominate, decide female. The book does not specify which traits/signs count.",
      "The book never averages the male and female shares; it always takes the lesser and/or holds the difference.",
    ],
    needsScholarConfirmation: false,
    scholarReasons: [],
    asMale: divisionFromEngine(asMaleEngine, estate, ["Khuntha treated as male."]),
    asFemale: divisionFromEngine(asFemaleEngine, estate, ["Khuntha treated as female."]),
    shafii: {
      payNow: shafiiOutcome.payNow,
      heldShare: shafiiOutcome.heldShare,
      heldAmount: shafiiOutcome.heldAmount,
      payNowTotal: shafiiOutcome.payNowTotal,
    },
    abuHanifa: {
      rows: abuHanifaRows,
      khunthaAmount: estate * fractionToNumber(khunthaLesser),
      khunthaShare: khunthaLesser,
    },
    prevailing: {
      rows: prevailingRows.filter((row) => row.key !== "__held__"),
      heldShare: prevailingHeld,
      heldAmount: prevailingHeldRow?.amount ?? 0,
    },
  };
}

// ===========================================================================
// 9. Munasakha — multi-generation sequential division (book §4.9, p. 292;
//    cases 269–270)
// ===========================================================================

export type MunasakhaDeathInput = {
  deceasedName: string;
  heirs: HeirInput;
  /**
   * Person names per heir key, in order (e.g. { wives: ["Salma", "Jameela"] }).
   * The count must match the heir count for that key. When omitted, the
   * engine's label is used (one person) or "Label 1..n" for a group.
   */
  names?: Partial<Record<string, string[]>>;
};

export type MunasakhaDeathOutcome = {
  deceasedName: string;
  /** This death's estate, as a money amount. */
  estate: number;
  /** This death's estate as an exact share of the original estate. */
  estateShare: Fraction;
  rows: SpecialRow[];
};

export type MunasakhaResult = SpecialResultBase & {
  deaths: MunasakhaDeathOutcome[];
  /** Final totals per surviving person, as exact shares of the original estate. */
  finalTotals: SpecialRow[];
  /** True when the final totals reconcile exactly to the original estate. */
  totalsBalance: boolean;
};

function namesForDeath(
  death: { names?: Partial<Record<string, string[]>> },
  entry: { key: string; label: string; count: number },
): string[] {
  const given = death.names?.[entry.key];
  if (given) {
    if (given.length !== entry.count) {
      throw new Error(
        `Name count mismatch for ${entry.label}: ${given.length} name(s) given but the heir count is ${entry.count}.`,
      );
    }
    return given;
  }
  if (entry.count <= 1) return [entry.label];
  return Array.from({ length: entry.count }, (_, index) => `${entry.label} ${index + 1}`);
}

/**
 * When an estate has not been divided for several generations and heirs
 * keep dying before distribution: divide the first deceased's estate
 * among their heirs in the normal way; each heir who then dies before
 * distribution leaves the share they received as their own estate, which
 * is divided among that person's own heirs; add up what each surviving
 * person receives across all the deaths — the grand total must equal the
 * original estate. The book works death by death with money amounts (no
 * single-LCM "combined base" shortcut). Up to 3 deaths.
 */
export function calculateMunasakha(input: { estate: number; deaths: MunasakhaDeathInput[] }): MunasakhaResult {
  if (input.deaths.length === 0) {
    throw new Error("Munasakha needs at least one death.");
  }
  if (input.deaths.length > 3) {
    throw new Error("Munasakha supports up to 3 deaths in this version.");
  }
  const accumulated = new Map<string, Fraction>();
  let heldTotal = fraction(0);
  const deathOutcomes: MunasakhaDeathOutcome[] = [];
  const munasakhaNotes: string[] = [
    "Each death is divided in the normal way; a deceased heir's received share becomes their own estate for the next death.",
  ];
  const munasakhaScholarReasons: string[] = [];

  input.deaths.forEach((death, index) => {
    const estateShare =
      index === 0 ? fraction(1) : (accumulated.get(death.deceasedName) ?? fraction(0));
    if (index > 0 && isZeroFraction(estateShare)) {
      throw new Error(
        `${death.deceasedName} received nothing in the earlier deaths, so there is no estate of theirs to divide.`,
      );
    }
    const estateAmount = input.estate * fractionToNumber(estateShare);
    if (index > 0) {
      // The deceased's received share becomes this death's estate and is
      // redistributed below — they hold nothing in the final totals.
      accumulated.delete(death.deceasedName);
    }
    const result = calculateWithBookCorrection(simpleEstate(estateAmount), death.heirs);
    if (result.requiresScholarReview) {
      munasakhaScholarReasons.push(
        `Death ${index + 1} (${death.deceasedName}): the engine flags this heir combination for scholar review.`,
      );
    }
    if (result.notices.some((notice) => notice.includes("Book case 269 applied"))) {
      munasakhaScholarReasons.push(
        `Death ${index + 1} (${death.deceasedName}): the book's case-269 rule was applied — a paternal brother takes the residue as Asabah where the engine would have returned it by Radd.`,
      );
    }
    munasakhaNotes.push(...result.notices);
    const entries = entriesFromEngine(result);
    for (const entry of entries) {
      if (entry.key === "__held__") {
        heldTotal = addFractions(heldTotal, multiplyFractions(entry.share, estateShare));
        continue;
      }
      const names = namesForDeath(death, { key: entry.key, label: entry.label, count: entry.count ?? 1 });
      const perPerson = divideFractions(entry.share, fraction(names.length));
      for (const name of names) {
        const add = multiplyFractions(perPerson, estateShare);
        const current = accumulated.get(name) ?? fraction(0);
        accumulated.set(name, addFractions(current, add));
      }
    }
    deathOutcomes.push({
      deceasedName: death.deceasedName,
      estate: estateAmount,
      estateShare,
      rows: buildRows(entries, estateAmount),
    });
  });

  const finalEntries: SpecialRowInput[] = Array.from(accumulated.entries()).map(([name, share]) => ({
    key: name,
    label: name,
    count: 1,
    share,
  }));
  if (isPositiveFraction(heldTotal)) {
    finalEntries.push({
      key: "__held__",
      label: "Held / unallocated",
      count: 1,
      share: heldTotal,
      note: "A death's division left a remainder the general method does not allocate.",
    });
  }
  const finalTotals = buildRows(finalEntries, input.estate);
  const totalsBalance = isZeroFraction(
    subtractFractions(fraction(1), sumFractions(finalEntries.map((entry) => entry.share))),
  );
  return {
    estate: input.estate,
    bookRef: "Book §4.9, p. 292; cases 269–270",
    summary: `Sequential division over ${input.deaths.length} death(s); final totals ${totalsBalance ? "reconcile exactly" : "DO NOT reconcile"} to the original estate.`,
    notes: munasakhaNotes,
    needsScholarConfirmation: munasakhaScholarReasons.length > 0,
    scholarReasons: munasakhaScholarReasons,
    deaths: deathOutcomes,
    finalTotals,
    totalsBalance,
  };
}

// ===========================================================================
// 10. Simultaneous death (book §4.10, p. 318; cases 278–279)
// ===========================================================================

export type SimultaneousDeathDivisionInput = {
  deceasedName: string;
  estate: number;
  heirs: HeirInput;
  names?: Partial<Record<string, string[]>>;
};

export type SimultaneousDeathResult = SpecialResultBase & {
  orderKnown: boolean;
  /** Known order: the Munasakha flow, deaths in sequence. */
  munasakha?: MunasakhaResult;
  /** Unknown order: each estate divided separately. */
  divisions?: { deceasedName: string; estate: number; rows: SpecialRow[] }[];
  /** Unknown order: combined totals per person across all estates. */
  combinedTotals?: SpecialRow[];
};

/**
 * (1) If the order of death is known, compute by Munasakha — each death
 * in sequence, the first deceased's share passing to the second becoming
 * part of the second's estate. (2) If the order cannot be known, each
 * person's estate is divided separately in the ordinary way among that
 * person's own heirs; the co-deceased do not inherit from each other.
 */
export function calculateSimultaneousDeath(input: {
  orderKnown: boolean;
  deaths: SimultaneousDeathDivisionInput[];
}): SimultaneousDeathResult {
  const bookRef = "Book §4.10, p. 318; cases 278–279";
  if (input.orderKnown) {
    if (input.deaths.length === 0) {
      throw new Error("Simultaneous death needs at least one death.");
    }
    // The first death's estate is its own; each later death's estate is the
    // share its deceased received in the earlier deaths (Munasakha rule).
    const munasakha = calculateMunasakha({
      estate: input.deaths[0].estate,
      deaths: input.deaths.map((death) => ({ deceasedName: death.deceasedName, heirs: death.heirs, names: death.names })),
    });
    return {
      estate: input.deaths[0].estate,
      bookRef,
      summary: "Order of death known — divided by Munasakha, death by death in sequence.",
      notes: ["The first deceased's share passes to the second, becoming part of the second's estate."],
      needsScholarConfirmation: false,
      scholarReasons: [],
      orderKnown: true,
      munasakha,
    };
  }

  const divisions: { deceasedName: string; estate: number; rows: SpecialRow[] }[] = [];
  const combined = new Map<string, Fraction>();
  let combinedTotalCents = 0;
  let heldCents = fraction(0);
  for (const division of input.deaths) {
    const result = calculateWithBookCorrection(simpleEstate(division.estate), division.heirs);
    divisions.push({ deceasedName: division.deceasedName, estate: division.estate, rows: rowsFromEngine(result, division.estate) });
    const estateCents = Math.round(division.estate * 100);
    combinedTotalCents += estateCents;
    for (const entry of entriesFromEngine(result)) {
      if (entry.key === "__held__") {
        heldCents = addFractions(heldCents, multiplyFractions(entry.share, fraction(estateCents)));
        continue;
      }
      const names = namesForDeath(division, { key: entry.key, label: entry.label, count: entry.count ?? 1 });
      const perPerson = divideFractions(entry.share, fraction(names.length));
      for (const name of names) {
        const personCents = multiplyFractions(perPerson, fraction(estateCents));
        const current = combined.get(name) ?? fraction(0);
        combined.set(name, addFractions(current, personCents));
      }
    }
  }
  const combinedEntries: SpecialRowInput[] = Array.from(combined.entries()).map(([name, cents]) => ({
    key: name,
    label: name,
    count: 1,
    share: divideFractions(cents, fraction(combinedTotalCents)),
    note: "Share of all estates combined.",
  }));
  if (isPositiveFraction(heldCents)) {
    combinedEntries.push({
      key: "__held__",
      label: "Held / unallocated",
      count: 1,
      share: divideFractions(heldCents, fraction(combinedTotalCents)),
    });
  }
  const combinedTotals = buildRows(combinedEntries, combinedTotalCents / 100);
  return {
    estate: combinedTotalCents / 100,
    bookRef,
    summary: "Order of death unknown — each estate divided separately; the co-deceased do not inherit from each other.",
    notes: ["Each person's estate is divided among that person's own heirs only."],
    needsScholarConfirmation: false,
    scholarReasons: [],
    orderKnown: false,
    divisions,
    combinedTotals,
  };
}

// ===========================================================================
// 11. Renunciation / refusal of a share (book §4.11, p. 301; case 271)
// ===========================================================================

export type RenunciationResult = SpecialResultBase & {
  /** First division, WITH the refusing heir included. */
  firstDivision: SpecialRow[];
  refusedShare: Fraction;
  refusedAmount: number;
  /** Increments each remaining heir gains from the re-divided refused share. */
  redistribution: SpecialRow[];
  finalRows: SpecialRow[];
  /** The wrong method (dropping the refuser first), shown for comparison. */
  wrongMethod: SpecialRow[];
};

/**
 * If an heir refuses their share: (1) do the first division WITH the
 * refusing heir included — removing them first gives a wrong answer;
 * (2) take the refusing heir's share and divide THAT amount among the
 * remaining heirs by the general method (the book's own second table for
 * case 271 re-runs the general method on the refused 525: father 1/6 +
 * residue, daughter 1/2 — 262.50 each). The book says nothing about the
 * refused share going to the state or to charity.
 */
export function calculateRenunciation(input: {
  estate: number;
  heirs: HeirInput;
  refuserKey: keyof HeirInput;
}): RenunciationResult {
  const { estate, heirs, refuserKey } = input;
  const firstEngine = calculateWithBookCorrection(simpleEstate(estate), heirs);
  const firstAggregated = aggregateAllocationsForDisplay(firstEngine.allocations);
  const refusedShare = firstAggregated.find((item) => item.key === String(refuserKey))?.share ?? fraction(0);
  if (isZeroFraction(refusedShare)) {
    throw new Error(`The refusing heir (${String(refuserKey)}) receives no share in the first division.`);
  }
  const refusedAmount = estate * fractionToNumber(refusedShare);
  const firstDivision = rowsFromEngine(firstEngine, estate);

  // Step 2: divide the refused amount among the remaining heirs by the
  // general method, then express each increment as a share of the estate.
  const remainingHeirs: HeirInput = { ...heirs };
  (remainingHeirs as Record<string, number | undefined>)[refuserKey] = 0;
  const restEngine = calculateWithBookCorrection(simpleEstate(refusedAmount), remainingHeirs);
  const increments = new Map<string, Fraction>();
  for (const item of aggregateAllocationsForDisplay(restEngine.allocations)) {
    const increment = multiplyFractions(item.share, refusedShare);
    const current = increments.get(item.key) ?? fraction(0);
    increments.set(item.key, addFractions(current, increment));
  }
  const redistributionEntries: SpecialRowInput[] = Array.from(increments.entries()).map(([key, share]) => {
    const label = firstAggregated.find((item) => item.key === key)?.label ?? key;
    return { key, label, count: 1, share, note: "Increment from the re-divided refused share." };
  });
  const redistribution = buildRows(redistributionEntries, estate);

  const finalEntries: SpecialRowInput[] = firstAggregated
    .filter((item) => item.key !== String(refuserKey))
    .map((item) => ({
      key: item.key,
      label: item.label,
      count: item.count,
      share: addFractions(item.share, increments.get(item.key) ?? fraction(0)),
    }));
  const refuserLabel = firstAggregated.find((item) => item.key === String(refuserKey))?.label ?? String(refuserKey);
  finalEntries.push({
    key: String(refuserKey),
    label: refuserLabel,
    count: 1,
    share: fraction(0),
    note: "Refused their share.",
  });
  const finalRows = buildRows(finalEntries, estate);

  // The wrong method: drop the refuser first and divide the whole estate.
  const wrongEngine = calculateWithBookCorrection(simpleEstate(estate), remainingHeirs);
  const wrongMethod = rowsFromEngine(wrongEngine, estate);

  return {
    estate,
    bookRef: "Book §4.11, p. 301; case 271",
    summary: `First division includes the refuser (${fractionToText(refusedShare)} = ${refusedAmount}); that share is re-divided among the rest — final total still ${estate}.`,
    notes: [
      "Removing the refuser first gives a wrong answer (the book: 'இது தவறானது' — this is wrong); the first division must include them.",
      "The book says nothing about the refused share going to the state (Bayt al-Mal) or to charity.",
    ],
    needsScholarConfirmation: false,
    scholarReasons: [],
    firstDivision,
    refusedShare,
    refusedAmount,
    redistribution,
    finalRows,
    wrongMethod,
  };
}

// ===========================================================================
// 12. Apostate (book §4.12, p. 330; cases 282–285)
// ===========================================================================

export type ApostateEstateResult = SpecialResultBase & {
  total: number;
  whileMuslim: number;
  afterLeaving: number;
  /** Abu Hanifa: divide only while-Muslim property; the rest to Bayt al-Mal. */
  abuHanifa: { rows: SpecialRow[]; baytAlMal: number };
  /** al-Shafi'i: both before- and after-leaving go to Bayt al-Mal. */
  shafii: { rows: SpecialRow[]; baytAlMal: number };
  /** Abu Yusuf and Muhammad: both are divided among the heirs. */
  abuYusufMuhammad: { rows: SpecialRow[]; baytAlMal: number };
};

export type ApostateHeirResult = SpecialResultBase & {
  rows: SpecialRow[];
  excluded: { key: string; label: string; rule: string }[];
};

/**
 * The apostate's own estate, three opinions by when the property was
 * earned. Abu Hanifa: property earned while Muslim (if its value can be
 * known) is divided among the Muslim heirs; property earned after leaving
 * goes to Bayt al-Mal. Al-Shafi'i: both go to Bayt al-Mal; heirs get
 * nothing. Abu Yusuf and Muhammad: both are divided among the heirs.
 * The book does not say what happens if the "while Muslim" value cannot
 * be known. Bayt al-Mal appears nowhere else in the book.
 */
export function calculateApostateEstate(input: {
  whileMuslim: number;
  afterLeaving: number;
  heirs: HeirInput;
}): ApostateEstateResult {
  const { whileMuslim, afterLeaving, heirs } = input;
  const total = whileMuslim + afterLeaving;
  if (total <= 0) {
    throw new Error("The apostate's estate must be greater than zero.");
  }
  const totalCents = Math.round(total * 100);
  const whileCents = Math.round(whileMuslim * 100);
  const afterCents = Math.round(afterLeaving * 100);

  // Abu Hanifa: engine on the while-Muslim portion; the rest to Bayt al-Mal.
  const hanafiEngine = calculateWithBookCorrection(simpleEstate(whileMuslim), heirs);
  const scaleToTotal = divideFractions(fraction(whileCents), fraction(totalCents));
  const hanafiEntries: SpecialRowInput[] = aggregateAllocationsForDisplay(hanafiEngine.allocations)
    .filter((item) => isPositiveFraction(item.share))
    .map((item) => ({
      key: item.key,
      label: item.label,
      count: item.count,
      share: multiplyFractions(item.share, scaleToTotal),
      note: "Abu Hanifa: share of the property earned while Muslim.",
    }));
  if (isPositiveFraction(hanafiEngine.unallocatedShare)) {
    hanafiEntries.push({
      key: "__held__",
      label: "Held / unallocated (while-Muslim portion)",
      count: 1,
      share: multiplyFractions(hanafiEngine.unallocatedShare, scaleToTotal),
    });
  }
  if (afterLeaving > 0) {
    hanafiEntries.push({
      key: "bayt-al-mal",
      label: "Bayt al-Mal (public treasury)",
      count: 1,
      share: divideFractions(fraction(afterCents), fraction(totalCents)),
      note: "Abu Hanifa: property earned after leaving Islam goes to Bayt al-Mal.",
    });
  }
  const abuHanifaRows = buildRows(hanafiEntries, total);

  const shafiiRows = buildRows(
    [
      {
        key: "bayt-al-mal",
        label: "Bayt al-Mal (public treasury)",
        count: 1,
        share: fraction(1),
        note: "Al-Shafi'i: both the while-Muslim and after-leaving property go to Bayt al-Mal; the heirs get nothing.",
      },
    ],
    total,
  );

  const allEngine = calculateWithBookCorrection(simpleEstate(total), heirs);
  const abuYusufMuhammadRows = rowsFromEngine(allEngine, total);

  return {
    estate: total,
    bookRef: "Book §4.12, p. 330; cases 282–283",
    summary:
      "Three opinions, side by side: Abu Hanifa divides only the while-Muslim property; al-Shafi'i sends all to Bayt al-Mal; Abu Yusuf and Muhammad divide all among the heirs.",
    notes: [
      "Bayt al-Mal appears nowhere else in the book — only in this chapter.",
    ],
    needsScholarConfirmation: true,
    scholarReasons: [
      "Abu Hanifa's division depends on knowing the value earned while Muslim ('if its value can be known'); the book gives no fallback if that value cannot be known.",
    ],
    total,
    whileMuslim,
    afterLeaving,
    abuHanifa: { rows: abuHanifaRows, baytAlMal: afterLeaving },
    shafii: { rows: shafiiRows, baytAlMal: total },
    abuYusufMuhammad: { rows: abuYusufMuhammadRows, baytAlMal: 0 },
  };
}

/**
 * An heir who left Islam gets nothing — "வாரிசாக மாட்டாள் / வாரிசாக
 * மாட்டான்" (book p. 330; cases 284–285). The estate is divided among
 * the remaining heirs by the general method.
 */
export function calculateApostateHeir(input: {
  estate: number;
  heirs: HeirInput;
  apostateKeys: (keyof HeirInput)[];
}): ApostateHeirResult {
  const remainingHeirs: HeirInput = { ...input.heirs };
  for (const key of input.apostateKeys) {
    (remainingHeirs as Record<string, number | undefined>)[key] = 0;
  }
  const engineResult = calculateWithBookCorrection(simpleEstate(input.estate), remainingHeirs);
  const excluded = input.apostateKeys.map((key) => ({
    key: String(key),
    label: String(key),
    rule: "Left Islam — does not inherit (book p. 330).",
  }));
  return {
    estate: input.estate,
    bookRef: "Book §4.12, p. 330; cases 284–285",
    summary:
      excluded.length === 0
        ? "No heir left Islam; the ordinary division applies."
        : `${excluded.map((item) => item.key).join(", ")} left Islam and inherit(s) nothing; the estate is divided among the remaining heirs.`,
    notes: [...engineResult.notices],
    needsScholarConfirmation: false,
    scholarReasons: [],
    rows: rowsFromEngine(engineResult, input.estate),
    excluded,
  };
}
