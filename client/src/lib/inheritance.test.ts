import { describe, expect, it } from "vitest";
import { calculateInheritance, fractionToText, type EstateInput, type HeirInput } from "./inheritance";

const estate = (overrides: Partial<EstateInput> = {}): EstateInput => ({
  grossEstate: 15000,
  funeralCosts: 0,
  debts: 0,
  bequest: 0,
  ...overrides,
});

const heirs = (overrides: Partial<HeirInput> = {}): HeirInput => ({
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
  ...overrides,
});

const shareFor = (key: string, result = calculateInheritance(estate(), heirs())) =>
  fractionToText(result.allocations.find((item) => item.key === key)?.share ?? { n: 0, d: 1 });

describe("ordinary inheritance calculation", () => {
  it("matches the guide’s wife, mother, father, and son example", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, mother: 1, father: 1, sons: 1 }));

    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/6");
    expect(shareFor("sons", result)).toBe("13/24");
  });

  it("uses the spouse-first mother remainder rule with husband, mother, and father", () => {
    const result = calculateInheritance(estate(), heirs({ husband: 1, mother: 1, father: 1 }));

    expect(shareFor("husband", result)).toBe("1/2");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/3");
  });

  it("combines the father’s fixed share and remainder with two daughters and a wife", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, father: 1, daughters: 2 }));

    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("daughters", result)).toBe("2/3");
    expect(shareFor("father", result)).toBe("5/24");
  });

  it("blocks maternal siblings when a child exists", () => {
    const result = calculateInheritance(estate(), heirs({ mother: 1, sons: 1, maternalSisters: 2 }));

    expect(result.exclusions.some((item) => item.label.includes("தாய் வழி"))).toBe(true);
    expect(shareFor("maternalSisters", result)).toBe("0");
  });

  it("requires scholar review rather than silently omitting book-based extended relatives", () => {
    const result = calculateInheritance(estate(), heirs({ sonsSons: 1, paternalUncles: 2, daughtersChildren: 1 }));

    expect(result.requiresScholarReview).toBe(true);
    expect(result.selectedExtendedHeirs.map((item) => item.key)).toEqual(["sonsSons", "paternalUncles", "daughtersChildren"]);
    expect(result.notices.some((item) => item.includes("அறிஞர் உறுதிப்படுத்தல்"))).toBe(true);
  });
});
