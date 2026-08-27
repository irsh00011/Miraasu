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

const totalShare = (result: ReturnType<typeof calculateInheritance>) =>
  result.allocations.reduce((total, item) => total + item.share.n / item.share.d, 0) + result.unallocatedShare.n / result.unallocatedShare.d;

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
    expect(result.notices.length).toBeGreaterThan(0);
  });

  it("treats a son’s son as a descendant for the wife, mother, and father rules", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, mother: 1, father: 1, sonsSons: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/6");
    expect(shareFor("sonsSons", result)).toBe("13/24");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("gives one daughter and a son’s daughter their source-table shares before the father receives the remainder", () => {
    const result = calculateInheritance(estate(), heirs({ father: 1, daughters: 1, sonsDaughters: 1 }));

    expect(shareFor("daughters", result)).toBe("1/2");
    expect(shareFor("sonsDaughters", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/3");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("blocks a son’s daughter when two daughters are present", () => {
    const result = calculateInheritance(estate(), heirs({ father: 1, daughters: 2, sonsDaughters: 1 }));

    expect(result.exclusions.some((item) => item.label === "மகனின் மகள்")).toBe(true);
    expect(shareFor("sonsDaughters", result)).toBe("0");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("recognises a paternal sister with one full sister and applies remainder redistribution correctly", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, fullSisters: 1, paternalSisters: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("wives", result)).toBe("1/4");
    expect(shareFor("fullSisters", result)).toBe("9/16");
    expect(shareFor("paternalSisters", result)).toBe("3/16");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("includes an eligible grandmother and blocks her when the mother is present", () => {
    const eligible = calculateInheritance(estate(), heirs({ husband: 1, maternalGrandmothers: 1 }));
    const blocked = calculateInheritance(estate(), heirs({ mother: 1, maternalGrandmothers: 1 }));

    expect(eligible.requiresScholarReview).toBe(false);
    expect(shareFor("maternalGrandmothers", eligible)).toBe("1/2");
    expect(blocked.exclusions.some((item) => item.label === "தாய் வழி பாட்டி")).toBe(true);
  });

  it("blocks maternal siblings when a descendant through a son is present", () => {
    const result = calculateInheritance(estate(), heirs({ mother: 1, sonsSons: 1, maternalBrothers: 1 }));

    expect(result.exclusions.some((item) => item.label.includes("தாய் வழி சகோதரர்"))).toBe(true);
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("sonsSons", result)).toBe("5/6");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("gives the paternal grandfather a fixed sixth when the father is absent and a son-line descendant exists", () => {
    const result = calculateInheritance(estate(), heirs({ paternalGrandfather: 1, sonsSons: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("paternalGrandfather", result)).toBe("1/6");
    expect(shareFor("sonsSons", result)).toBe("5/6");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("blocks a paternal sister when a son-line male descendant is present", () => {
    const result = calculateInheritance(estate(), heirs({ sonsSons: 1, paternalSisters: 1 }));

    expect(result.exclusions.some((item) => item.label === "தந்தை வழி சகோதரி")).toBe(true);
    expect(shareFor("paternalSisters", result)).toBe("0");
    expect(shareFor("sonsSons", result)).toBe("1");
  });

  it("records every non-automated selection in the explicit review list", () => {
    const result = calculateInheritance(estate(), heirs({ paternalUncles: 1, mothersSiblings: 2, furtherSonsLineDescendants: 1 }));

    expect(result.requiresScholarReview).toBe(true);
    expect(result.selectedReviewOnlyHeirs.map((item) => item.key)).toEqual(["furtherSonsLineDescendants", "paternalUncles", "mothersSiblings"]);
  });
});
