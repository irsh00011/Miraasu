import { describe, expect, it } from "vitest";
import { calculateInheritance, fractionToText, type EstateInput, type HeirInput } from "../inheritance";

const estate = (overrides: Partial<EstateInput> = {}): EstateInput => ({
  grossEstate: 900000,
  funeralCosts: 0,
  debts: 0,
  bequest: 0,
  ...overrides,
});

const heirs = (overrides: Partial<HeirInput> = {}): HeirInput => ({
  husband: 0, wives: 0, father: 0, mother: 0, paternalGrandfather: 0,
  sons: 0, daughters: 0, fullBrothers: 0, fullSisters: 0,
  maternalBrothers: 0, maternalSisters: 0,
  ...overrides,
});

describe("LCM / common-method audit", () => {
  it("ʿAwl: root swaps to fixedUnitsSum, original units re-expressed (not re-derived)", () => {
    // husband 1/2; mother has 2 siblings present (>=2) so she gets 1/6, not 1/3;
    // 2 full sisters => 2/3. Sum = 1/2+1/6+2/3 = 4/3 > 1 => ʿAwl.
    const r = calculateInheritance(estate(), heirs({ husband: 1, mother: 1, fullSisters: 2 }));
    expect(r.fixedSharesAdjusted).toBe(true);
    // baseLcm = lcm(2,6,3) = 6; original units: husband=3, mother=1, sisters=4; sum=8
    expect(r.trace.baseLcm).toBe(6);
    expect(r.trace.lcm).toBe(8); // root increased to fixedUnitsSum, not an independently-reduced LCM
    const byKey = Object.fromEntries(r.trace.rows.map((row) => [row.key, row.integerShares]));
    expect(byKey.husband).toBe(3);
    expect(byKey.mother).toBe(1);
    expect(byKey.fullSisters).toBe(4);
    expect(byKey.husband + byKey.mother + byKey.fullSisters).toBe(8);
    // Awl-corrected fractions themselves must still be exact
    expect(fractionToText(r.allocations.find((a) => a.key === "husband")!.share)).toBe("3/8");
    expect(fractionToText(r.allocations.find((a) => a.key === "mother")!.share)).toBe("1/8");
    expect(fractionToText(r.allocations.find((a) => a.key === "fullSisters")!.share)).toBe("1/2");
  });

  it("Taʿṣīb keeps the original fixed-share LCM and distributes the total remainder separately", () => {
    // wife 1/8 (children present). baseLcm=8, fixedUnitsSum=1, remainingUnits=7.
    // 1 son + 2 daughters share the remainder 1:1 (son collectively 2/4, daughters
    // collectively 2/4 of the units formula) => ratio 1/2 each => totalParts=2.
    // The original LCM remains 8. The total remainder is 7/8, then the
    // remainder money is split after the LCM calculation: son = 2 parts and
    // daughters = 2 collective parts.
    const r = calculateInheritance(estate(), heirs({ wives: 1, sons: 1, daughters: 2 }));
    expect(r.trace.baseLcm).toBe(8);
    expect(r.trace.lcm).toBe(8);
    const byKey = Object.fromEntries(r.trace.rows.map((row) => [row.key, row.integerShares]));
    expect(byKey.wives).toBe(1);
    expect(byKey.sons).toBe(2);
    expect(byKey.daughters).toBe(2);
    expect(r.trace.steps.find((step) => step.id === "remaining-units")?.data.remainingUnits).toBe(7);
    expect(r.trace.steps.find((step) => step.id === "final-lcm")?.data.finalLcm).toBe(8);
  });

  it("No expansion needed: remainder already divides evenly", () => {
    // mother 1/6, 2 daughters 2/3 (baseLcm=6, fixedUnitsSum=1+4=5, remainingUnits=1)
    // full brothers=1 only (sole, no sisters) as asabah with daughters present -> gets full remainder, totalParts=1
    const r = calculateInheritance(estate(), heirs({ mother: 1, daughters: 2, fullBrothers: 1 }));
    expect(r.trace.baseLcm).toBe(6);
    expect(r.trace.lcm).toBe(6); // no expansion needed
    const byKey = Object.fromEntries(r.trace.rows.map((row) => [row.key, row.integerShares]));
    expect(byKey.mother).toBe(1);
    expect(byKey.daughters).toBe(4);
    expect(byKey.fullBrothers).toBe(1);
    expect(byKey.mother + byKey.daughters + byKey.fullBrothers).toBe(6);
  });

  it("integrity check always balances across many random-ish combinations", () => {
    const cases: Partial<HeirInput>[] = [
      { wives: 1, daughters: 1, paternalUncles: 1 },
      { husband: 1, mother: 1, fullSisters: 2 },
      { wives: 1, sons: 1, daughters: 2 },
      { mother: 1, daughters: 2, fullBrothers: 1 },
      { father: 1, mother: 1, daughters: 3 },
      { wives: 2, father: 1, sons: 2, daughters: 3 },
      { husband: 1, fullBrothers: 3, fullSisters: 5 },
      { mother: 1, maternalBrothers: 2, maternalSisters: 3 },
    ];
    for (const c of cases) {
      const r = calculateInheritance(estate(), heirs(c));
      expect(r.trace.integrityCheck.unitsBalanced).toBe(true);
      expect(r.trace.integrityCheck.moneyBalanced).toBe(true);
    }
  });
});
