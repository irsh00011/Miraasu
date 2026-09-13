import { describe, expect, it } from "vitest";
import { calculateInheritance, EXTENDED_HEIR_SECTIONS, fraction, fractionToText, type EstateInput, type HeirInput } from "./inheritance";

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

/** For a heir who receives BOTH a Fixed Share and an Asabah/Radd top-up, the two must stay as separate rows (never merged into one derived fraction). This reads one specific row by method. */
const shareForMethod = (key: string, method: "fixed" | "remainder" | "redistribution", result: ReturnType<typeof calculateInheritance>) =>
  fractionToText(result.allocations.find((item) => item.key === key && item.method === method)?.share ?? { n: 0, d: 1 });

/** Sums every row for a key — used only to confirm the *total* amount a person actually receives is unchanged now that Fixed Share and Asabah/Radd are shown as separate rows. */
const sumSharesFor = (key: string, result: ReturnType<typeof calculateInheritance>) => {
  const matches = result.allocations.filter((item) => item.key === key);
  const total = matches.reduce((acc, item) => ({ n: acc.n * item.share.d + item.share.n * acc.d, d: acc.d * item.share.d }), { n: 0, d: 1 });
  return fractionToText(fraction(total.n, total.d));
};

const totalShare = (result: ReturnType<typeof calculateInheritance>) =>
  result.allocations.reduce((total, item) => total + item.share.n / item.share.d, 0) + result.unallocatedShare.n / result.unallocatedShare.d;

const exactAllocationTotal = (result: ReturnType<typeof calculateInheritance>) => {
  const total = result.allocations.reduce(
    (current, item) => ({ n: current.n * item.share.d + item.share.n * current.d, d: current.d * item.share.d }),
    { n: 0, d: 1 },
  );
  return fractionToText(fraction(total.n, total.d));
};

describe("ordinary inheritance calculation", () => {
  it("exposes a transparent exact-fraction trace with LCM, percentage, remainder, and amount", () => {
    const result = calculateInheritance(estate({ grossEstate: 120000 }), heirs({ wives: 1, daughters: 1, paternalUncles: 1 }));
    expect(result.trace.lcm).toBe(8);
    expect(result.trace.rows.map((row) => [row.key, fractionToText(row.fraction), row.integerShares])).toEqual([
      ["wives", "1/8", 1],
      ["daughters", "1/2", 4],
      ["paternalUncles", "3/8", 1],
    ]);
    expect(result.trace.rows.find((row) => row.key === "paternalUncles")?.percentage).toBeCloseTo(37.5, 10);
    expect(result.trace.rows.find((row) => row.key === "paternalUncles")?.amount).toBe(45000);
    expect(fractionToText(result.trace.remainder)).toBe("3/8");
    expect(fractionToText(result.trace.allocated)).toBe("1");
  });
  it("matches the primary-reference spouse fixed shares", () => {
    expect(shareFor("husband", calculateInheritance(estate(), heirs({ husband: 1 })))).toBe("1/2");
    expect(shareFor("husband", calculateInheritance(estate(), heirs({ husband: 1, daughters: 1 })))).toBe("1/4");
    expect(shareFor("wives", calculateInheritance(estate(), heirs({ wives: 1 })))).toBe("1/4");
    expect(shareFor("wives", calculateInheritance(estate(), heirs({ wives: 1, daughters: 1 })))).toBe("1/8");
  });

  it("keeps sisters as fixed shares or asabah with another according to the supported case", () => {
    expect(shareFor("fullSisters", calculateInheritance(estate(), heirs({ husband: 1, fullSisters: 1 })))).toBe("1/2");
    expect(shareFor("paternalSisters", calculateInheritance(estate(), heirs({ husband: 1, paternalSisters: 1 })))).toBe("1/2");
    expect(shareFor("fullSisters", calculateInheritance(estate(), heirs({ daughters: 1, fullSisters: 1 })))).toBe("1/2");
  });

  it("does not block the paternal uncle merely because a daughter exists", () => {
    const result = calculateInheritance(estate({ grossEstate: 120000 }), heirs({ daughters: 1, paternalUncles: 1 }));
    expect(shareFor("daughters", result)).toBe("1/2");
    expect(shareFor("paternalUncles", result)).toBe("1/2");
  });

  it("blocks maternal siblings when a descendant is present", () => {
    const result = calculateInheritance(estate(), heirs({ maternalBrothers: 1, daughters: 1 }));
    expect(shareFor("maternalBrothers", result)).toBe("0");
    expect(result.exclusions.some((item) => item.label.includes("தாய் வழி"))).toBe(true);
  });

  it("exposes natural Tamil aliases for paternal-uncle search", () => {
    const uncleSection = EXTENDED_HEIR_SECTIONS.find((section) => section.titleEn === "Father’s brother line");
    const uncleSearchText = uncleSection?.items.map((item) => item.searchTerms ?? "").join(" ") ?? "";

    expect(uncleSearchText).toContain("தந்தையின் சகோதரர்");
    expect(uncleSearchText).toContain("பெரியப்பா");
    expect(uncleSearchText).toContain("சித்தப்பா");
  });

  it("reconciles a comprehensive automatic family case: two wives, mother, father, two sons, and one daughter", () => {
    const result = calculateInheritance(
      estate({ grossEstate: 120000 }),
      heirs({ wives: 2, mother: 1, father: 1, sons: 2, daughters: 1 }),
    );
    const valueFor = (key: string) => {
      const share = result.allocations.find((item) => item.key === key)?.share ?? { n: 0, d: 1 };
      return result.netEstate * share.n / share.d;
    };

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/6");
    expect(shareFor("sons", result)).toBe("13/30");
    expect(shareFor("daughters", result)).toBe("13/120");
    expect(valueFor("wives")).toBe(15000);
    expect(valueFor("mother")).toBe(20000);
    expect(valueFor("father")).toBe(20000);
    expect(valueFor("sons")).toBe(52000);
    expect(valueFor("daughters")).toBe(13000);
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("keeps the father’s remainder precedence and flags selected third- and fourth-degree residuaries for review", () => {
    const result = calculateInheritance(
      estate({ grossEstate: 24000 }),
      heirs({ wives: 1, mother: 1, father: 1, daughters: 1, paternalBrothers: 1, paternalUncles: 1 }),
    );

    expect(result.requiresScholarReview).toBe(true);
    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("daughters", result)).toBe("1/2");
    // Father receives a book-exact Fixed Share (1/6) AND, separately, an Asabah/remainder top-up — the two are never merged into one derived fraction.
    expect(shareForMethod("father", "fixed", result)).toBe("1/6");
    expect(shareForMethod("father", "remainder", result)).toBe("1/24");
    expect(sumSharesFor("father", result)).toBe("5/24");
    expect(result.allocations.some((item) => item.key === "paternalBrothers")).toBe(false);
    expect(result.allocations.some((item) => item.key === "paternalUncles")).toBe(false);
    expect(result.selectedReviewOnlyHeirs.map((item) => item.key)).toEqual(["paternalBrothers", "paternalUncles"]);
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("keeps the same core calculation visible but requires review when a consanguine paternal uncle is added", () => {
    const result = calculateInheritance(
      estate({ grossEstate: 120000 }),
      heirs({ wives: 2, mother: 1, father: 1, sons: 2, daughters: 1, consanguinePaternalUncles: 1 }),
    );

    expect(result.requiresScholarReview).toBe(true);
    expect(result.selectedReviewOnlyHeirs.map((item) => item.key)).toContain("consanguinePaternalUncles");
    expect(result.allocations.some((item) => item.key === "consanguinePaternalUncles")).toBe(false);
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("matches the guide’s wife, mother, father, and son example", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, mother: 1, father: 1, sons: 1 }));

    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/6");
    expect(shareFor("sons", result)).toBe("13/24");
  });

  it("splits the remainder 2:1 between one son and one daughter", () => {
    const result = calculateInheritance(estate(), heirs({ sons: 1, daughters: 1 }));

    expect(shareFor("sons", result)).toBe("2/3");
    expect(shareFor("daughters", result)).toBe("1/3");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("automatically splits the estate 2:1 between a paternal brother and paternal sister when no closer listed heir is present", () => {
    const result = calculateInheritance(estate(), heirs({ paternalBrothers: 1, paternalSisters: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("paternalBrothers", result)).toBe("2/3");
    expect(shareFor("paternalSisters", result)).toBe("1/3");
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("keeps a paternal-sibling pair reviewable when a full sister creates an unlisted precedence combination", () => {
    const result = calculateInheritance(estate(), heirs({ fullSisters: 1, paternalBrothers: 1, paternalSisters: 1 }));

    expect(result.requiresScholarReview).toBe(true);
    expect(result.selectedReviewOnlyHeirs.map((item) => item.key)).toContain("paternalBrothers");
  });

  it("gives a solo paternal brother the remainder after all closer residuary classes are absent", () => {
    const result = calculateInheritance(estate(), heirs({ paternalBrothers: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("paternalBrothers", result)).toBe("1");
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("gives a full brother’s son the remainder when the full-brother class is absent", () => {
    const result = calculateInheritance(estate(), heirs({ fullBrothersSons: 2 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("fullBrothersSons", result)).toBe("1");
    expect(result.allocations.find((item) => item.key === "fullBrothersSons")?.count).toBe(2);
  });

  it("gives a paternal brother’s son the remainder after the paternal-brother class is absent", () => {
    const result = calculateInheritance(estate(), heirs({ paternalBrothersSons: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("paternalBrothersSons", result)).toBe("1");
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("gives a consanguine paternal uncle the remainder after all earlier classes are absent", () => {
    const result = calculateInheritance(estate(), heirs({ consanguinePaternalUncles: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("consanguinePaternalUncles", result)).toBe("1");
    expect(exactAllocationTotal(result)).toBe("1");
  });

  it("follows the fourth-degree uncle class only after earlier residuary classes are absent", () => {
    const result = calculateInheritance(estate(), heirs({ paternalUncles: 1 }));
    const blocked = calculateInheritance(estate(), heirs({ fullBrothers: 1, paternalUncles: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("paternalUncles", result)).toBe("1");
    expect(blocked.requiresScholarReview).toBe(true);
    expect(blocked.selectedReviewOnlyHeirs.map((item) => item.key)).toContain("paternalUncles");
    expect(shareFor("fullBrothers", blocked)).toBe("1");
  });

  it("keeps later paternal-uncle descendants out of an automatic result when their nearest class is ambiguous", () => {
    const result = calculateInheritance(estate(), heirs({ paternalUnclesSons: 1, consanguinePaternalUnclesSons: 1 }));

    expect(result.requiresScholarReview).toBe(true);
    expect(result.allocations.some((item) => item.key === "paternalUnclesSons")).toBe(false);
    expect(result.allocations.some((item) => item.key === "consanguinePaternalUnclesSons")).toBe(false);
  });

  it("keeps the three-daughter Qur’anic fixed share visible before any applicable redistribution", () => {
    const result = calculateInheritance(estate(), heirs({ father: 1, daughters: 3 }));

    expect(shareFor("daughters", result)).toBe("2/3");
    // The father's book-stated Fixed Share (1/6) stays visible as its own row; his Asabah top-up is a separate row, never blended into "1/3".
    expect(shareForMethod("father", "fixed", result)).toBe("1/6");
    expect(shareForMethod("father", "remainder", result)).toBe("1/6");
    expect(sumSharesFor("father", result)).toBe("1/3");
    expect(result.allocations.find((item) => item.key === "daughters")?.count).toBe(3);
  });

  it("divides the remainder equally among three same-rank full brothers", () => {
    const result = calculateInheritance(estate(), heirs({ fullBrothers: 3 }));

    expect(shareFor("fullBrothers", result)).toBe("1");
    expect(result.allocations.find((item) => item.key === "fullBrothers")?.count).toBe(3);
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("uses the spouse-first mother remainder rule with husband, mother, and father", () => {
    const result = calculateInheritance(estate(), heirs({ husband: 1, mother: 1, father: 1 }));

    expect(shareFor("husband", result)).toBe("1/2");
    expect(shareFor("mother", result)).toBe("1/6");
    expect(shareFor("father", result)).toBe("1/3");
  });

  it("keeps the father’s fixed share and remainder as two distinct rows with two daughters and a wife", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, father: 1, daughters: 2 }));

    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("daughters", result)).toBe("2/3");
    expect(shareForMethod("father", "fixed", result)).toBe("1/6");
    expect(shareForMethod("father", "remainder", result)).toBe("1/24");
    expect(sumSharesFor("father", result)).toBe("5/24");
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
    expect(shareForMethod("father", "fixed", result)).toBe("1/6");
    expect(shareForMethod("father", "remainder", result)).toBe("1/6");
    expect(sumSharesFor("father", result)).toBe("1/3");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("blocks a son’s daughter when two daughters are present", () => {
    const result = calculateInheritance(estate(), heirs({ father: 1, daughters: 2, sonsDaughters: 1 }));

    expect(result.exclusions.some((item) => item.label === "மகனின் மகள்")).toBe(true);
    expect(shareFor("sonsDaughters", result)).toBe("0");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("applies source-defined Radd proportionally while excluding the wife", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, fullSisters: 1, paternalSisters: 1 }));

    expect(result.requiresScholarReview).toBe(false);
    expect(shareFor("wives", result)).toBe("1/4");
    // Each sister's book-stated Fixed Share stays its own row; the Radd top-up is a separate row.
    expect(shareForMethod("fullSisters", "fixed", result)).toBe("1/2");
    expect(shareForMethod("fullSisters", "redistribution", result)).toBe("1/16");
    expect(sumSharesFor("fullSisters", result)).toBe("9/16");
    expect(shareForMethod("paternalSisters", "fixed", result)).toBe("1/6");
    expect(shareForMethod("paternalSisters", "redistribution", result)).toBe("1/48");
    expect(sumSharesFor("paternalSisters", result)).toBe("3/16");
    expect(exactAllocationTotal(result)).toBe("1");
    expect(totalShare(result)).toBeCloseTo(1, 12);
    expect(fractionToText(result.unallocatedShare)).toBe("0");
  });

  it("returns an unsupported remainder to the daughter but not the wife", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, daughters: 1 }));
    expect(shareFor("wives", result)).toBe("1/8");
    // The daughter's Qur'anic Fixed Share (1/2) and her Radd top-up stay as two distinct rows.
    expect(shareForMethod("daughters", "fixed", result)).toBe("1/2");
    expect(shareForMethod("daughters", "redistribution", result)).toBe("3/8");
    expect(sumSharesFor("daughters", result)).toBe("7/8");
    expect(fractionToText(result.unallocatedShare)).toBe("0");
  });

  it("never lets Radd override an applicable paternal uncle Asabah", () => {
    const result = calculateInheritance(estate(), heirs({ wives: 1, daughters: 1, paternalUncles: 1 }));
    expect(shareFor("wives", result)).toBe("1/8");
    expect(shareFor("daughters", result)).toBe("1/2");
    expect(shareFor("paternalUncles", result)).toBe("3/8");
    expect(result.allocations.some((item) => item.method === "redistribution")).toBe(false);
  });

  it("gives a full sister the remainder with a daughter when no male blocker exists", () => {
    const result = calculateInheritance(estate(), heirs({ daughters: 1, fullSisters: 1 }));

    expect(shareFor("daughters", result)).toBe("1/2");
    expect(shareFor("fullSisters", result)).toBe("1/2");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("gives a paternal sister the remainder with a daughter when no closer sibling blocks her", () => {
    const result = calculateInheritance(estate(), heirs({ daughters: 1, paternalSisters: 1 }));

    expect(shareFor("daughters", result)).toBe("1/2");
    expect(shareFor("paternalSisters", result)).toBe("1/2");
    expect(totalShare(result)).toBeCloseTo(1, 12);
  });

  it("includes an eligible grandmother and blocks her when the mother is present", () => {
    const eligible = calculateInheritance(estate(), heirs({ sons: 1, maternalGrandmothers: 1 }));
    const blocked = calculateInheritance(estate(), heirs({ mother: 1, maternalGrandmothers: 1 }));

    expect(eligible.requiresScholarReview).toBe(false);
    expect(shareFor("maternalGrandmothers", eligible)).toBe("1/6");
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
    const result = calculateInheritance(estate(), heirs({ paternalUncles: 1, consanguinePaternalUncles: 1, mothersSiblings: 2, furtherSonsLineDescendants: 1 }));

    expect(result.requiresScholarReview).toBe(true);
    expect(result.selectedReviewOnlyHeirs.map((item) => item.key)).toEqual(["furtherSonsLineDescendants", "paternalUncles", "consanguinePaternalUncles", "mothersSiblings"]);
  });
});
