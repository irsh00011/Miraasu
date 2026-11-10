import { describe, expect, it } from "vitest";
import {
  addFractions,
  calculateApostateEstate,
  calculateApostateHeir,
  calculateDebtorEstate,
  calculateDhawulArham,
  calculateDisqualifiedHeirs,
  calculateGrandfatherWithSiblings,
  calculateKhuntha,
  calculateMissingPerson,
  calculateMunasakha,
  calculateRenunciation,
  calculateSimultaneousDeath,
  calculateUnbornChild,
  classifyGrandparent,
  distributeAmounts,
  emptyHeirs,
  lcmOfRows,
  percentOfShare,
  rowPercent,
  type SpecialRow,
} from "./specialMethods";
import { fraction, type HeirInput } from "./inheritance";

const H = (overrides: Partial<HeirInput> = {}): HeirInput => ({ ...emptyHeirs(), ...overrides });

const rowFor = (rows: SpecialRow[], key: string) => rows.find((row) => row.key === key);
const amountFor = (rows: SpecialRow[], key: string) => rowFor(rows, key)?.amount;
const fractionFor = (rows: SpecialRow[], key: string) => rowFor(rows, key)?.fraction;
const totalAmounts = (rows: SpecialRow[]) => rows.reduce((total, row) => total + row.amount, 0);

/** Amount of one person inside a group row (group amount ÷ count). */
const perPersonAmount = (rows: SpecialRow[], key: string) => {
  const row = rowFor(rows, key);
  return row ? row.amount / row.count : undefined;
};

describe("fraction and money helpers", () => {
  it("adds and divides exact fractions", () => {
    expect(addFractions(fraction(1, 6), fraction(1, 3))).toEqual({ n: 1, d: 2 });
  });

  it("largest-remainder amounts sum exactly to the estate", () => {
    const amounts = distributeAmounts(10000, [fraction(1, 3), fraction(1, 3), fraction(1, 3)]);
    expect(amounts).toEqual([3333.34, 3333.33, 3333.33]);
    expect(amounts.reduce((total, amount) => total + amount, 0)).toBe(10000);
  });
});

describe("1. Dhawul Arham — distant relatives (cases 260, 265, 266)", () => {
  it("case 260: the nearer degree takes everything (estate 1,000)", () => {
    const result = calculateDhawulArham({
      estate: 1000,
      fixedHeirs: H(),
      claimants: [
        { label: "Daughter's daughter's daughter", branch: 1, degree: 2, sex: "female", count: 1 },
        { label: "Daughter's daughter", branch: 1, degree: 1, sex: "female", count: 1 },
      ],
    });
    expect(result.winningBranch).toBe(1);
    expect(result.winningDegree).toBe(1);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's daughter")).toBe(1000);
    expect(fractionFor(result.rows, "dhawul-1-1-Daughter's daughter")).toBe("1");
    expect(result.blockedClaimants.map((item) => item.label)).toEqual(["Daughter's daughter's daughter"]);
    expect(result.needsScholarConfirmation).toBe(false);
    expect(totalAmounts(result.rows)).toBe(1000);
  });

  it("case 265: equal degree splits 2:1 male:female (estate 3,000)", () => {
    const result = calculateDhawulArham({
      estate: 3000,
      fixedHeirs: H(),
      claimants: [
        { label: "Daughter's son", branch: 1, degree: 1, sex: "male", count: 1 },
        { label: "Daughter's daughter", branch: 1, degree: 1, sex: "female", count: 1 },
      ],
    });
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's son")).toBe(2000);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's daughter")).toBe(1000);
    expect(fractionFor(result.rows, "dhawul-1-1-Daughter's son")).toBe("2/3");
    expect(fractionFor(result.rows, "dhawul-1-1-Daughter's daughter")).toBe("1/3");
    expect(totalAmounts(result.rows)).toBe(3000);
  });

  it("case 266: fixed-share wife takes 1/4 and does NOT share the residue (estate 1,000)", () => {
    const result = calculateDhawulArham({
      estate: 1000,
      fixedHeirs: H({ wives: 1 }),
      claimants: [
        { label: "Daughter's son", branch: 1, degree: 1, sex: "male", count: 1 },
        { label: "Daughter's daughter", branch: 1, degree: 1, sex: "female", count: 1 },
      ],
    });
    expect(fractionFor(result.rows, "wives")).toBe("1/4");
    expect(amountFor(result.rows, "wives")).toBe(250);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's son")).toBe(500);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's daughter")).toBe(250);
    expect(totalAmounts(result.rows)).toBe(1000);
  });

  it("an earlier branch blocks a later branch", () => {
    const result = calculateDhawulArham({
      estate: 900,
      fixedHeirs: H(),
      claimants: [
        { label: "Daughter's son", branch: 1, degree: 1, sex: "male", count: 1 },
        { label: "Full sister's son", branch: 3, degree: 1, sex: "male", count: 1 },
      ],
    });
    expect(result.winningBranch).toBe(1);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's son")).toBe(900);
    expect(result.blockedClaimants.map((item) => item.label)).toEqual(["Full sister's son"]);
  });

  it("an Asabah heir takes the residue, so distant relatives inherit nothing", () => {
    const result = calculateDhawulArham({
      estate: 1000,
      fixedHeirs: H({ sons: 1 }),
      claimants: [{ label: "Daughter's son", branch: 1, degree: 1, sex: "male", count: 1 }],
    });
    expect(amountFor(result.rows, "sons")).toBe(1000);
    expect(result.distantRows).toEqual([]);
  });

  // RULE-BASED (not a book example): the book gives no worked example for
  // branches 2 and 4 — these tests assert the branch/degree/2:1 rule only.
  it("RULE-BASED branch 2: maternal grandfather alone takes the whole estate, flagged for scholar confirmation", () => {
    const result = calculateDhawulArham({
      estate: 1200,
      fixedHeirs: H(),
      claimants: [{ label: "Mother's father", branch: 2, degree: 1, sex: "male", count: 1 }],
    });
    expect(result.winningBranch).toBe(2);
    expect(amountFor(result.rows, "dhawul-2-1-Mother's father")).toBe(1200);
    expect(result.needsScholarConfirmation).toBe(true);
    expect(result.scholarReasons[0]).toMatch(/branch 2/);
  });

  it("RULE-BASED branch 4: mother's siblings at equal degree split 2:1, flagged for scholar confirmation", () => {
    const result = calculateDhawulArham({
      estate: 900,
      fixedHeirs: H(),
      claimants: [
        { label: "Mother's brother", branch: 4, degree: 1, sex: "male", count: 1 },
        { label: "Mother's sister", branch: 4, degree: 1, sex: "female", count: 1 },
      ],
    });
    expect(result.winningBranch).toBe(4);
    expect(amountFor(result.rows, "dhawul-4-1-Mother's brother")).toBe(600);
    expect(amountFor(result.rows, "dhawul-4-1-Mother's sister")).toBe(300);
    expect(result.needsScholarConfirmation).toBe(true);
  });
});

describe("2. Grandfather + siblings — Hanafi vs Shafi'i (cases 113/114, 138/139)", () => {
  it("case 113 Hanafi: 2 sisters 0, wife 1/4 = 325, grandfather residue 975 (estate 1,300)", () => {
    const result = calculateGrandfatherWithSiblings({ estate: 1300, heirs: H({ wives: 1, fullSisters: 2, paternalGrandfather: 1 }) });
    expect(result.school).toBe("hanafi");
    expect(fractionFor(result.hanafi.rows, "wives")).toBe("1/4");
    expect(amountFor(result.hanafi.rows, "wives")).toBe(325);
    expect(amountFor(result.hanafi.rows, "fullSisters") ?? 0).toBe(0);
    expect(fractionFor(result.hanafi.rows, "paternalGrandfather")).toBe("3/4");
    expect(amountFor(result.hanafi.rows, "paternalGrandfather")).toBe(975);
    expect(totalAmounts(result.hanafi.rows)).toBe(1300);
  });

  it("case 114 Shafi'i: sisters 2/3 = 866.67, wife 325, grandfather residue 108.33 (estate 1,300)", () => {
    // ERRATA: case 114 misprints the grandfather's Shafi'i residue as 975
    // (copy-paste from case 113); the correct residue is 1,300 − 325 − 866.67
    // = 108.33. The case header says one sister but applies 2/3, the 2+
    // sisters rule — the fixture follows case 113's two sisters.
    const result = calculateGrandfatherWithSiblings({ estate: 1300, heirs: H({ wives: 1, fullSisters: 2, paternalGrandfather: 1 }) });
    expect(fractionFor(result.shafii.rows, "fullSisters")).toBe("2/3");
    expect(amountFor(result.shafii.rows, "fullSisters")).toBe(866.67);
    expect(amountFor(result.shafii.rows, "wives")).toBe(325);
    expect(fractionFor(result.shafii.rows, "paternalGrandfather")).toBe("1/12");
    expect(amountFor(result.shafii.rows, "paternalGrandfather")).toBe(108.33);
    expect(totalAmounts(result.shafii.rows)).toBe(1300);
    expect(result.hanafi.rows).not.toEqual(result.shafii.rows);
  });

  it("case 138 Hanafi: 1 paternal sister 0, wife 1/4 = 250, grandfather residue 750 (estate 1,000)", () => {
    const result = calculateGrandfatherWithSiblings({ estate: 1000, heirs: H({ wives: 1, paternalSisters: 1, paternalGrandfather: 1 }) });
    expect(amountFor(result.hanafi.rows, "wives")).toBe(250);
    expect(amountFor(result.hanafi.rows, "paternalSisters") ?? 0).toBe(0);
    expect(amountFor(result.hanafi.rows, "paternalGrandfather")).toBe(750);
    expect(totalAmounts(result.hanafi.rows)).toBe(1000);
  });

  it("case 139: Hanafi husband 2,500 / grandfather 2,500; Shafi'i corrected reading (estate 5,000)", () => {
    // ERRATA: case 139's Shafi'i table switches the spouse from husband
    // (1/2) to wife (1/4) for the same deceased, printing sisters 3,333.33,
    // "wife" 1,250, grandfather 416.67. The corrected reading keeps the
    // husband: husband 1/2 + 3 paternal sisters 2/3 = 7/6, so 'Awl applies
    // — husband 3/7 = 2,142.86, sisters 4/7 = 2,857.14, grandfather 0.
    const result = calculateGrandfatherWithSiblings({ estate: 5000, heirs: H({ husband: 1, paternalSisters: 3, paternalGrandfather: 1 }) });
    expect(amountFor(result.hanafi.rows, "husband")).toBe(2500);
    expect(amountFor(result.hanafi.rows, "paternalSisters") ?? 0).toBe(0);
    expect(amountFor(result.hanafi.rows, "paternalGrandfather")).toBe(2500);
    expect(fractionFor(result.shafii.rows, "husband")).toBe("3/7");
    expect(amountFor(result.shafii.rows, "husband")).toBe(2142.86);
    expect(fractionFor(result.shafii.rows, "paternalSisters")).toBe("4/7");
    expect(amountFor(result.shafii.rows, "paternalSisters")).toBe(2857.14);
    expect(amountFor(result.shafii.rows, "paternalGrandfather")).toBe(0);
    expect(totalAmounts(result.shafii.rows)).toBe(5000);
  });

  it("flags the book's silence on grandfather with male brothers", () => {
    const result = calculateGrandfatherWithSiblings({ estate: 1200, heirs: H({ wives: 1, fullBrothers: 1, paternalGrandfather: 1 }) });
    expect(result.needsScholarConfirmation).toBe(true);
    expect(result.scholarReasons[0]).toMatch(/book is silent there/);
  });

  it("returns both schools and labels the Hanafi default", () => {
    const result = calculateGrandfatherWithSiblings({ estate: 1200, heirs: H({ wives: 1, fullSisters: 1, paternalGrandfather: 1 }) });
    expect(result.hanafi.rows.length).toBeGreaterThan(0);
    expect(result.shafii.rows.length).toBeGreaterThan(0);
    expect(result.school).toBe("hanafi");
    expect(result.summary).toMatch(/Hanafi/);
  });
});

describe("3. Debtor's estate (cases 272–273)", () => {
  it("case 272 state 2: debt exceeds estate — pro-rata (estate 10,000, debts 15,000)", () => {
    const result = calculateDebtorEstate({
      grossEstate: 10000,
      debts: [
        { name: "Khalid", amount: 7000 },
        { name: "Abu Bakr", amount: 5000 },
        { name: "Ahmad", amount: 3000 },
      ],
      heirs: H({ mother: 1, father: 1, sons: 1, wives: 1 }),
    });
    expect(result.state).toBe(2);
    expect(amountFor(result.creditorRows, "creditor-Khalid")).toBe(4666.67);
    expect(amountFor(result.creditorRows, "creditor-Abu Bakr")).toBe(3333.33);
    expect(amountFor(result.creditorRows, "creditor-Ahmad")).toBe(2000);
    expect(result.heirRows).toEqual([]);
    expect(totalAmounts(result.creditorRows)).toBe(10000);
  });

  it("case 273 state 3: debts paid in full, remainder 5,000 divided normally", () => {
    // NOTE: the book rounds the son to 2,361.12 and the daughter to
    // 1,180.56, which sums to 5,000.01. The son's exact share is
    // 2,361.11…; largest-remainder gives the spare cent to the daughter
    // (remainder 5/9 > the son's 1/9), so the rows sum exactly to 5,000.
    const result = calculateDebtorEstate({
      grossEstate: 15000,
      debts: [{ name: "Creditors", amount: 10000 }],
      heirs: H({ wives: 1, paternalGrandfather: 1, sons: 1, daughters: 1 }),
    });
    expect(result.state).toBe(3);
    expect(result.remainderForHeirs).toBe(5000);
    expect(amountFor(result.heirRows, "wives")).toBe(625);
    expect(fractionFor(result.heirRows, "wives")).toBe("1/8");
    expect(amountFor(result.heirRows, "paternalGrandfather")).toBe(833.33);
    expect(fractionFor(result.heirRows, "paternalGrandfather")).toBe("1/6");
    expect(amountFor(result.heirRows, "sons")).toBe(2361.11);
    expect(amountFor(result.heirRows, "daughters")).toBe(1180.56);
    expect(totalAmounts(result.heirRows)).toBe(5000);
  });

  it("state 1: estate equals debt — creditors paid in full, heirs get nothing", () => {
    const result = calculateDebtorEstate({
      grossEstate: 8000,
      debts: [{ name: "Khalid", amount: 5000 }, { name: "Ahmad", amount: 3000 }],
      heirs: H({ sons: 1 }),
    });
    expect(result.state).toBe(1);
    expect(amountFor(result.creditorRows, "creditor-Khalid")).toBe(5000);
    expect(amountFor(result.creditorRows, "creditor-Ahmad")).toBe(3000);
    expect(result.heirRows).toEqual([]);
  });
});

describe("4. Disqualified heirs (book p. 38)", () => {
  it("a murderer is excluded and the rest re-divide by the engine", () => {
    const result = calculateDisqualifiedHeirs({
      estate: 12000,
      heirs: H({ wives: 1, mother: 1, sons: 1 }),
      disqualified: [{ key: "sons", label: "Son", reason: "murderer" }],
    });
    expect(amountFor(result.rows, "sons") ?? 0).toBe(0);
    expect(fractionFor(result.rows, "wives")).toBe("1/4");
    expect(amountFor(result.rows, "wives")).toBe(3000);
    expect(fractionFor(result.rows, "mother")).toBe("3/4");
    expect(amountFor(result.rows, "mother")).toBe(9000);
    expect(result.excluded[0].rule).toMatch(/kills the estate-owner/);
    expect(totalAmounts(result.rows)).toBe(12000);
  });

  it("difference of religion excludes the heir (case 284 pattern)", () => {
    const result = calculateDisqualifiedHeirs({
      estate: 400000,
      heirs: H({ wives: 1, fullSisters: 1, paternalSisters: 1, paternalUncles: 1 }),
      disqualified: [{ key: "wives", label: "Wife", reason: "different-religion" }],
    });
    expect(amountFor(result.rows, "wives") ?? 0).toBe(0);
    expect(amountFor(result.rows, "fullSisters")).toBe(200000);
    expect(amountFor(result.rows, "paternalSisters")).toBe(66666.67);
    expect(amountFor(result.rows, "paternalUncles")).toBe(133333.33);
    expect(result.excluded[0].rule).toMatch(/Difference of religion/);
    expect(totalAmounts(result.rows)).toBe(400000);
  });

  it("the slave category is an info flag only and never changes the calculation", () => {
    const result = calculateDisqualifiedHeirs({ estate: 1000, heirs: H({ sons: 1 }), disqualified: [] });
    expect(result.slaveNote).toMatch(/not applicable now/);
    expect(amountFor(result.rows, "sons")).toBe(1000);
  });
});

describe("5. Sahih / fasid grandparent classification (book §4.5, 8 categories)", () => {
  it("category 1: father's father in a pure male line is sahih, fixed-share", () => {
    const result = classifyGrandparent(["father", "father"]);
    expect(result.classification).toBe("sahih");
    expect(result.bookCategory).toBe(1);
    expect(result.consequence).toBe("fixed-share");
    expect(result.description).toBe("father's father");
    expect(result.needsScholarConfirmation).toBe(false);
  });

  it("category 2: father's mother's father is fasid, distant relative branch 2", () => {
    const result = classifyGrandparent(["father", "mother", "father"]);
    expect(result.classification).toBe("fasid");
    expect(result.bookCategory).toBe(2);
    expect(result.consequence).toBe("distant-relative");
    expect(result.dhawulArhamBranch).toBe(2);
  });

  it("category 3: mother's father is called sahih yet is a distant relative — always flagged", () => {
    const result = classifyGrandparent(["mother", "father"]);
    expect(result.classification).toBe("sahih");
    expect(result.bookCategory).toBe(3);
    expect(result.consequence).toBe("distant-relative");
    expect(result.dhawulArhamBranch).toBe(2);
    expect(result.needsScholarConfirmation).toBe(true);
    expect(result.notes[0]).toMatch(/partly circular/);
    const longer = classifyGrandparent(["mother", "mother", "father"]);
    expect(longer.bookCategory).toBe(3);
    expect(longer.consequence).toBe("distant-relative");
  });

  it("category 4: mother's father's mother's father is fasid", () => {
    const result = classifyGrandparent(["mother", "father", "mother", "father"]);
    expect(result.classification).toBe("fasid");
    expect(result.bookCategory).toBe(4);
    expect(result.consequence).toBe("distant-relative");
  });

  it("category 5: father's mother (and father's father's mother) is sahiha, fixed-share", () => {
    expect(classifyGrandparent(["father", "mother"]).bookCategory).toBe(5);
    const result = classifyGrandparent(["father", "father", "mother"]);
    expect(result.classification).toBe("sahih");
    expect(result.bookCategory).toBe(5);
    expect(result.consequence).toBe("fixed-share");
    expect(result.description).toBe("father's father's mother");
  });

  it("category 6: father's mother's father's mother is fasida", () => {
    const result = classifyGrandparent(["father", "mother", "father", "mother"]);
    expect(result.classification).toBe("fasid");
    expect(result.bookCategory).toBe(6);
    expect(result.consequence).toBe("distant-relative");
  });

  it("category 7: mother's mother (and mother's mother's mother) is sahiha, fixed-share", () => {
    expect(classifyGrandparent(["mother", "mother"]).bookCategory).toBe(7);
    expect(classifyGrandparent(["mother", "mother", "mother"]).consequence).toBe("fixed-share");
  });

  it("category 8: mother's father's mother's mother is fasida", () => {
    const result = classifyGrandparent(["mother", "father", "mother", "mother"]);
    expect(result.classification).toBe("fasid");
    expect(result.bookCategory).toBe(8);
    expect(result.consequence).toBe("distant-relative");
  });

  it("rejects a chain that is not a grandparent", () => {
    expect(() => classifyGrandparent(["father"])).toThrow(/at least two links/);
  });
});

describe("6. Unborn child (cases 267–268)", () => {
  it("case 267: pay wife 4,875 + mother 6,500 = 11,375; hold 27,625 (estate 39,000)", () => {
    const result = calculateUnbornChild({ estate: 39000, heirs: H({ wives: 1, mother: 1, paternalUncles: 1 }) });
    expect(fractionFor(result.asSon.rows, "sons")).toBe("17/24");
    expect(amountFor(result.asSon.rows, "sons")).toBe(27625);
    expect(amountFor(result.asSon.rows, "wives")).toBe(4875);
    expect(amountFor(result.asSon.rows, "mother")).toBe(6500);
    expect(amountFor(result.asDaughter.rows, "daughters")).toBe(19500);
    expect(amountFor(result.asDaughter.rows, "paternalUncles")).toBe(8125);
    expect(amountFor(result.payNow, "wives")).toBe(4875);
    expect(amountFor(result.payNow, "mother")).toBe(6500);
    expect(result.payNowTotal).toBe(11375);
    expect(result.heldAmount).toBe(27625);
    expect(result.heldShare).toEqual({ n: 17, d: 24 });
    expect(result.needsScholarConfirmation).toBe(true);
    expect(result.scholarReasons[0]).toMatch(/twins/);
  });

  it("case 268: pay wife 1,000 + mother 1,333.33 + daughter 1,888.89; hold 3,777.78; uncle 0 now (estate 8,000)", () => {
    const result = calculateUnbornChild({ estate: 8000, heirs: H({ wives: 1, daughters: 1, mother: 1, paternalUncles: 1 }) });
    expect(amountFor(result.asSon.rows, "sons")).toBe(3777.78);
    expect(amountFor(result.asSon.rows, "daughters")).toBe(1888.89);
    // NOTE: the book prints the two daughters as 5,333.33 (2,666.67 each),
    // but 2,666.67 × 2 = 5,333.34 — the book's group figure is a 1-cent
    // artifact. Largest-remainder per person gives 2,666.67 each, so the
    // group is 5,333.34 and the scenario rows sum exactly to 8,000.
    expect(amountFor(result.asDaughter.rows, "daughters")).toBe(5333.34);
    expect(amountFor(result.asDaughter.rows, "paternalUncles")).toBe(333.33);
    expect(amountFor(result.payNow, "wives")).toBe(1000);
    expect(amountFor(result.payNow, "mother")).toBe(1333.33);
    expect(amountFor(result.payNow, "daughters")).toBe(1888.89);
    expect(amountFor(result.payNow, "paternalUncles") ?? 0).toBe(0);
    expect(result.payNowTotal).toBe(4222.22);
    expect(result.heldAmount).toBe(3777.78);
  });
});

describe("7. Missing person / prisoner (cases 274–277)", () => {
  it("case 274: pay wife 625 only; hold 4,375 (estate 5,000)", () => {
    const result = calculateMissingPerson({ estate: 5000, heirs: H({ wives: 1, sons: 1, fullBrothers: 1 }), missingKey: "sons" });
    expect(amountFor(result.ifAlive.rows, "wives")).toBe(625);
    expect(amountFor(result.ifAlive.rows, "sons")).toBe(4375);
    expect(amountFor(result.ifDead.rows, "wives")).toBe(1250);
    expect(amountFor(result.ifDead.rows, "fullBrothers")).toBe(3750);
    expect(amountFor(result.payNow, "wives")).toBe(625);
    expect(result.payNowTotal).toBe(625);
    expect(result.heldAmount).toBe(4375);
    expect(result.waitingPeriodYears).toBe(70);
    expect(result.needsScholarConfirmation).toBe(true);
  });

  it("case 275: pay wife 30,000, mother 20,000, brother 46,666.67; hold 23,333.33 (estate 120,000)", () => {
    const result = calculateMissingPerson({
      estate: 120000,
      heirs: H({ wives: 1, mother: 1, fullBrothers: 1, fullSisters: 1 }),
      missingKey: "fullSisters",
    });
    expect(amountFor(result.ifAlive.rows, "fullBrothers")).toBe(46666.67);
    expect(amountFor(result.ifAlive.rows, "fullSisters")).toBe(23333.33);
    expect(amountFor(result.ifDead.rows, "mother")).toBe(40000);
    expect(amountFor(result.ifDead.rows, "fullBrothers")).toBe(50000);
    expect(amountFor(result.payNow, "wives")).toBe(30000);
    expect(amountFor(result.payNow, "mother")).toBe(20000);
    expect(amountFor(result.payNow, "fullBrothers")).toBe(46666.67);
    expect(result.payNowTotal).toBe(96666.67);
    expect(result.heldAmount).toBe(23333.33);
  });

  it("case 276: pay husband 6,500 only; hold 19,500 (estate 26,000)", () => {
    const result = calculateMissingPerson({
      estate: 26000,
      heirs: H({ husband: 1, fullSisters: 1, sons: 1, sonsSons: 1 }),
      missingKey: "sons",
    });
    expect(amountFor(result.payNow, "husband")).toBe(6500);
    expect(result.payNowTotal).toBe(6500);
    expect(result.heldAmount).toBe(19500);
  });

  it("case 277: pay wife 2,500 + uncle 7,500; hold 10,000 (estate 20,000)", () => {
    const result = calculateMissingPerson({
      estate: 20000,
      heirs: H({ wives: 1, sonsDaughters: 1, maternalBrothers: 1, paternalUncles: 1 }),
      missingKey: "sonsDaughters",
    });
    expect(amountFor(result.ifAlive.rows, "sonsDaughters")).toBe(10000);
    expect(amountFor(result.ifAlive.rows, "paternalUncles")).toBe(7500);
    expect(amountFor(result.ifDead.rows, "maternalBrothers")).toBe(3333.33);
    expect(amountFor(result.payNow, "wives")).toBe(2500);
    expect(amountFor(result.payNow, "paternalUncles")).toBe(7500);
    expect(result.payNowTotal).toBe(10000);
    expect(result.heldAmount).toBe(10000);
  });

  it("prisoner: same two-scenario computation, with the known-alive gap flagged", () => {
    const result = calculateMissingPerson({
      estate: 5000,
      heirs: H({ wives: 1, sons: 1 }),
      missingKey: "sons",
      kind: "prisoner",
    });
    expect(result.kind).toBe("prisoner");
    expect(result.heldAmount).toBe(4375);
    expect(result.scholarReasons.some((reason) => reason.includes("known to be alive"))).toBe(true);
  });
});

describe("8. Khuntha — intersex heir (cases 280–281)", () => {
  it("case 280: all three views side by side, no averaging (estate 3,000)", () => {
    const result = calculateKhuntha({ estate: 3000, heirs: H({ sons: 1, daughters: 1 }), role: "child" });
    // As male (khuntha = son): 2 sons + 1 daughter, 5 parts.
    expect(fractionFor(result.asMale.rows, "sons")).toBe("4/5");
    expect(amountFor(result.asMale.rows, "sons")).toBe(2400);
    expect(amountFor(result.asMale.rows, "daughters")).toBe(600);
    // As female: 1 son + 2 daughters, 4 parts.
    expect(fractionFor(result.asFemale.rows, "sons")).toBe("1/2");
    expect(amountFor(result.asFemale.rows, "sons")).toBe(1500);
    expect(amountFor(result.asFemale.rows, "daughters")).toBe(1500);
    // Shafi'i: pay the lesser to each, hold 450.
    expect(amountFor(result.shafii.payNow, "sons")).toBe(1200);
    expect(amountFor(result.shafii.payNow, "daughters")).toBe(600);
    expect(amountFor(result.shafii.payNow, "khuntha")).toBe(750);
    expect(result.shafii.heldAmount).toBe(450);
    // Abu Hanifa: khuntha 750, rest 2,250 split son/daughter 2:1, hold nothing.
    expect(amountFor(result.abuHanifa.rows, "khuntha")).toBe(750);
    expect(amountFor(result.abuHanifa.rows, "sons")).toBe(1500);
    expect(amountFor(result.abuHanifa.rows, "daughters")).toBe(750);
    expect(totalAmounts(result.abuHanifa.rows)).toBe(3000);
    // Prevailing: reserve the larger for the khuntha, others get the lesser.
    expect(amountFor(result.prevailing.rows, "khuntha")).toBe(1200);
    expect(amountFor(result.prevailing.rows, "sons")).toBe(1200);
    expect(amountFor(result.prevailing.rows, "daughters")).toBe(600);
    expect(result.prevailing.heldAmount).toBe(0);
  });

  it("case 281: all three views side by side (estate 12,000 — header misprints 3,000)", () => {
    // ERRATA: the case header prints an estate of 3,000, but all tables
    // compute on 12,000; the fixture uses 12,000.
    const result = calculateKhuntha({ estate: 12000, heirs: H({ husband: 1, mother: 1 }), role: "paternalSibling" });
    // As male (paternal half-brother, Asabah): husband 6,000, mother 4,000, khuntha 2,000.
    expect(amountFor(result.asMale.rows, "husband")).toBe(6000);
    expect(amountFor(result.asMale.rows, "mother")).toBe(4000);
    expect(amountFor(result.asMale.rows, "paternalBrothers")).toBe(2000);
    // As female (paternal half-sister, 1/2 fixed; 'Awl to 8): 4,500 / 3,000 / 4,500.
    expect(amountFor(result.asFemale.rows, "husband")).toBe(4500);
    expect(amountFor(result.asFemale.rows, "mother")).toBe(3000);
    expect(amountFor(result.asFemale.rows, "paternalSisters")).toBe(4500);
    // Shafi'i: pay the lesser to each, hold 2,500.
    expect(amountFor(result.shafii.payNow, "husband")).toBe(4500);
    expect(amountFor(result.shafii.payNow, "mother")).toBe(3000);
    expect(amountFor(result.shafii.payNow, "khuntha")).toBe(2000);
    expect(result.shafii.heldAmount).toBe(2500);
    // Abu Hanifa: khuntha 2,000; the remaining 10,000 divided husband/mother 5,000 each.
    expect(amountFor(result.abuHanifa.rows, "khuntha")).toBe(2000);
    expect(amountFor(result.abuHanifa.rows, "husband")).toBe(5000);
    expect(amountFor(result.abuHanifa.rows, "mother")).toBe(5000);
    expect(totalAmounts(result.abuHanifa.rows)).toBe(12000);
    // Prevailing: reserve the larger for the khuntha.
    expect(amountFor(result.prevailing.rows, "khuntha")).toBe(4500);
    expect(amountFor(result.prevailing.rows, "husband")).toBe(4500);
    expect(amountFor(result.prevailing.rows, "mother")).toBe(3000);
    expect(result.prevailing.heldAmount).toBe(0);
  });
});

describe("9. Munasakha — multi-generation division (cases 269–270)", () => {
  it("case 269: two deaths, final totals reconcile to 2,200", () => {
    const result = calculateMunasakha({
      estate: 2200,
      deaths: [
        {
          deceasedName: "Saleem",
          heirs: H({ wives: 2, sons: 1, daughters: 3 }),
          names: { wives: ["Salma", "Jameela"], sons: ["Aaqil"], daughters: ["Asma", "Samha", "Aaliya"] },
        },
        {
          deceasedName: "Asma",
          heirs: H({ mother: 1, fullSisters: 2, paternalBrothers: 1 }),
          names: { mother: ["Jameela"], fullSisters: ["Samha", "Aaliya"], paternalBrothers: ["Aaqil"] },
        },
      ],
    });
    // Death 2 gives the residue to the paternal half-brother (book case 269)
    // where the engine alone would Radd it to the mother and sisters.
    expect(amountFor(result.deaths[1].rows, "paternalBrothers")).toBe(64.17);
    expect(amountFor(result.deaths[1].rows, "mother")).toBe(64.17);
    expect(perPersonAmount(result.deaths[1].rows, "fullSisters")).toBe(128.33);
    expect(amountFor(result.finalTotals, "Salma")).toBe(137.5);
    expect(amountFor(result.finalTotals, "Jameela")).toBe(201.67);
    expect(amountFor(result.finalTotals, "Samha")).toBe(513.33);
    expect(amountFor(result.finalTotals, "Aaliya")).toBe(513.33);
    expect(amountFor(result.finalTotals, "Aaqil")).toBe(834.17);
    expect(result.totalsBalance).toBe(true);
    expect(totalAmounts(result.finalTotals)).toBe(2200);
  });

  it("case 270: three deaths, final totals reconcile to 17,200", () => {
    const result = calculateMunasakha({
      estate: 17200,
      deaths: [
        {
          deceasedName: "Ibrahim",
          heirs: H({ wives: 1, mother: 1, daughters: 1, fullSisters: 1 }),
          names: { wives: ["Suhaila"], mother: ["Fathima"], daughters: ["Aneesa"], fullSisters: ["Zainab"] },
        },
        {
          deceasedName: "Suhaila",
          heirs: H({ husband: 1, sons: 1, daughters: 1 }),
          names: { husband: ["Umar"], sons: ["Anees"], daughters: ["Aneesa"] },
        },
        {
          deceasedName: "Zainab",
          heirs: H({ mother: 1, husband: 1, sons: 1 }),
          names: { mother: ["Fathima"], husband: ["Khalid"], sons: ["Ahmad"] },
        },
      ],
    });
    // ERRATA: one line of case 270 prints Fathima's total as 3,462.89;
    // the summary (and the arithmetic 2,866.67 + 597.22) gives 3,463.89.
    expect(amountFor(result.finalTotals, "Fathima")).toBe(3463.89);
    expect(amountFor(result.finalTotals, "Aneesa")).toBe(9137.5);
    expect(amountFor(result.finalTotals, "Umar")).toBe(537.5);
    expect(amountFor(result.finalTotals, "Anees")).toBe(1075);
    expect(amountFor(result.finalTotals, "Khalid")).toBe(895.83);
    expect(amountFor(result.finalTotals, "Ahmad")).toBe(2090.28);
    expect(result.totalsBalance).toBe(true);
    expect(totalAmounts(result.finalTotals)).toBe(17200);
  });

  it("refuses more than 3 deaths and a deceased who received nothing", () => {
    expect(() =>
      calculateMunasakha({
        estate: 1000,
        deaths: [
          { deceasedName: "A", heirs: H({ sons: 1 }) },
          { deceasedName: "B", heirs: H({ sons: 1 }) },
          { deceasedName: "C", heirs: H({ sons: 1 }) },
          { deceasedName: "D", heirs: H({ sons: 1 }) },
        ],
      }),
    ).toThrow(/up to 3 deaths/);
  });
});

describe("10. Simultaneous death (cases 278–279)", () => {
  it("case 278 order known: Munasakha flow with rule-correct fractions (estate 24,000)", () => {
    // ERRATUM (not in the report's §7 list): the book prints grandmother
    // Amina as "1/6 = 375" on Fathima's 3,000 estate — but 1/6 of 3,000
    // is 500 (375 is 1/8). The book's amounts are internally consistent
    // (1,500 + 375 + 1,125 = 3,000) but the fraction/amount pair is
    // arithmetically wrong. This calculator computes by the RULE:
    // daughter Salma 1/2 = 1,500; grandmother 1/6 = 500; uncle Ali
    // residue 1,000. Finals: Salma 13,500, Umar 9,000, Ali 1,000, Amina 500.
    const result = calculateSimultaneousDeath({
      orderKnown: true,
      deaths: [
        {
          deceasedName: "Nasar",
          estate: 24000,
          heirs: H({ wives: 1, daughters: 1, paternalUncles: 1 }),
          names: { wives: ["Fathima"], daughters: ["Salma"], paternalUncles: ["Umar"] },
        },
        {
          deceasedName: "Fathima",
          estate: 3000,
          heirs: H({ daughters: 1, maternalGrandmothers: 1, paternalUncles: 1 }),
          names: { daughters: ["Salma"], maternalGrandmothers: ["Amina"], paternalUncles: ["Ali"] },
        },
      ],
    });
    const munasakha = result.munasakha;
    expect(munasakha).toBeDefined();
    expect(fractionFor(munasakha!.deaths[1].rows, "maternalGrandmothers")).toBe("1/6");
    expect(amountFor(munasakha!.deaths[1].rows, "maternalGrandmothers")).toBe(500);
    expect(amountFor(munasakha!.deaths[1].rows, "daughters")).toBe(1500);
    expect(amountFor(munasakha!.deaths[1].rows, "paternalUncles")).toBe(1000);
    expect(amountFor(munasakha!.finalTotals, "Salma")).toBe(13500);
    expect(amountFor(munasakha!.finalTotals, "Umar")).toBe(9000);
    expect(amountFor(munasakha!.finalTotals, "Ali")).toBe(1000);
    expect(amountFor(munasakha!.finalTotals, "Amina")).toBe(500);
    expect(munasakha!.totalsBalance).toBe(true);
  });

  it("case 279 order unknown: separate divisions; Hameed inherits from both (16,000 + 750)", () => {
    const result = calculateSimultaneousDeath({
      orderKnown: false,
      deaths: [
        {
          deceasedName: "Hasan",
          estate: 16000,
          heirs: H({ wives: 1, daughters: 1, paternalUnclesSons: 1 }),
          names: { wives: ["Munira"], daughters: ["Hameeda"], paternalUnclesSons: ["Hameed"] },
        },
        {
          deceasedName: "Husain",
          estate: 750,
          heirs: H({ daughters: 2, paternalUnclesSons: 1 }),
          names: { daughters: ["Azeezah", "Haleema"], paternalUnclesSons: ["Hameed"] },
        },
      ],
    });
    expect(amountFor(result.divisions![0].rows, "wives")).toBe(2000);
    expect(amountFor(result.divisions![0].rows, "daughters")).toBe(8000);
    expect(amountFor(result.divisions![0].rows, "paternalUnclesSons")).toBe(6000);
    expect(perPersonAmount(result.divisions![1].rows, "daughters")).toBe(250);
    expect(amountFor(result.divisions![1].rows, "paternalUnclesSons")).toBe(250);
    expect(amountFor(result.combinedTotals!, "Hameed")).toBe(6250);
    expect(amountFor(result.combinedTotals!, "Munira")).toBe(2000);
    expect(amountFor(result.combinedTotals!, "Hameeda")).toBe(8000);
    expect(totalAmounts(result.combinedTotals!)).toBe(16750);
  });
});

describe("11. Renunciation (case 271)", () => {
  it("case 271: wife refuses — first division with her, re-divide her 525, final father 1,837.50 / daughter 2,362.50 (estate 4,200)", () => {
    const result = calculateRenunciation({ estate: 4200, heirs: H({ wives: 1, daughters: 1, father: 1 }), refuserKey: "wives" });
    expect(amountFor(result.firstDivision, "wives")).toBe(525);
    expect(amountFor(result.firstDivision, "daughters")).toBe(2100);
    expect(amountFor(result.firstDivision, "father")).toBe(1575);
    expect(result.refusedShare).toEqual({ n: 1, d: 8 });
    expect(result.refusedAmount).toBe(525);
    // The refused 525 is itself divided by the general method among the
    // rest (father 1/6 + residue, daughter 1/2) — 262.50 each.
    expect(amountFor(result.redistribution, "father")).toBe(262.5);
    expect(amountFor(result.redistribution, "daughters")).toBe(262.5);
    expect(amountFor(result.finalRows, "father")).toBe(1837.5);
    expect(amountFor(result.finalRows, "daughters")).toBe(2362.5);
    expect(amountFor(result.finalRows, "wives")).toBe(0);
    expect(totalAmounts(result.finalRows)).toBe(4200);
    // The wrong method (dropping the wife first) gives 2,100 each.
    expect(amountFor(result.wrongMethod, "father")).toBe(2100);
    expect(amountFor(result.wrongMethod, "daughters")).toBe(2100);
  });
});

describe("12. Apostate (cases 282–285)", () => {
  it("case 282: three opinions on 24,000 while Muslim + 30,000 after", () => {
    const result = calculateApostateEstate({ whileMuslim: 24000, afterLeaving: 30000, heirs: H({ wives: 1, mother: 1, sons: 1 }) });
    expect(amountFor(result.abuHanifa.rows, "wives")).toBe(3000);
    expect(amountFor(result.abuHanifa.rows, "mother")).toBe(4000);
    expect(amountFor(result.abuHanifa.rows, "sons")).toBe(17000);
    expect(amountFor(result.abuHanifa.rows, "bayt-al-mal")).toBe(30000);
    expect(result.abuHanifa.baytAlMal).toBe(30000);
    expect(amountFor(result.shafii.rows, "bayt-al-mal")).toBe(54000);
    expect(result.shafii.baytAlMal).toBe(54000);
    expect(amountFor(result.abuYusufMuhammad.rows, "wives")).toBe(6750);
    expect(amountFor(result.abuYusufMuhammad.rows, "mother")).toBe(9000);
    expect(amountFor(result.abuYusufMuhammad.rows, "sons")).toBe(38250);
    expect(result.needsScholarConfirmation).toBe(true);
    expect(totalAmounts(result.abuHanifa.rows)).toBe(54000);
    expect(totalAmounts(result.abuYusufMuhammad.rows)).toBe(54000);
  });

  it("case 283: 2,550 while Muslim + 1,000 after; daughter + mother + uncle", () => {
    const result = calculateApostateEstate({ whileMuslim: 2550, afterLeaving: 1000, heirs: H({ daughters: 1, mother: 1, paternalUncles: 1 }) });
    expect(amountFor(result.abuHanifa.rows, "daughters")).toBe(1275);
    expect(amountFor(result.abuHanifa.rows, "mother")).toBe(425);
    expect(amountFor(result.abuHanifa.rows, "paternalUncles")).toBe(850);
    expect(amountFor(result.abuHanifa.rows, "bayt-al-mal")).toBe(1000);
    expect(amountFor(result.abuYusufMuhammad.rows, "daughters")).toBe(1775);
    expect(amountFor(result.abuYusufMuhammad.rows, "mother")).toBe(591.67);
    expect(amountFor(result.abuYusufMuhammad.rows, "paternalUncles")).toBe(1183.33);
    expect(amountFor(result.shafii.rows, "bayt-al-mal")).toBe(3550);
    expect(totalAmounts(result.abuYusufMuhammad.rows)).toBe(3550);
  });

  it("case 284: an heir who left Islam gets nothing (estate 400,000)", () => {
    const result = calculateApostateHeir({
      estate: 400000,
      heirs: H({ wives: 1, fullSisters: 1, paternalSisters: 1, paternalUncles: 1 }),
      apostateKeys: ["wives"],
    });
    expect(amountFor(result.rows, "wives") ?? 0).toBe(0);
    expect(amountFor(result.rows, "fullSisters")).toBe(200000);
    expect(amountFor(result.rows, "paternalSisters")).toBe(66666.67);
    expect(amountFor(result.rows, "paternalUncles")).toBe(133333.33);
    expect(result.excluded[0].rule).toMatch(/Left Islam/);
    expect(totalAmounts(result.rows)).toBe(400000);
  });

  it("case 285: husband converted — son takes the whole 1,000", () => {
    const result = calculateApostateHeir({
      estate: 1000,
      heirs: H({ husband: 1, sons: 1 }),
      apostateKeys: ["husband"],
    });
    expect(amountFor(result.rows, "husband") ?? 0).toBe(0);
    expect(amountFor(result.rows, "sons")).toBe(1000);
  });
});

describe("v2 display helpers — lcmOfRows / percentOfShare / rowPercent (pure, new)", () => {
  it("lcmOfRows: LCM of the row denominators (1/8, 1/6, 2/3 -> 24)", () => {
    const rows = buildRowsForLcm([
      fraction(1, 8),
      fraction(1, 6),
      fraction(2, 3),
    ]);
    expect(lcmOfRows(rows)).toBe(24);
  });

  it("lcmOfRows: whole-estate and zero rows give 1; empty rows give 1", () => {
    expect(lcmOfRows(buildRowsForLcm([fraction(1), fraction(0)]))).toBe(1);
    expect(lcmOfRows([])).toBe(1);
  });

  it("lcmOfRows: case 113 denominators 1/4 and residue -> 4", () => {
    expect(lcmOfRows(buildRowsForLcm([fraction(1, 4), fraction(3, 4)]))).toBe(4);
  });

  it("percentOfShare: 1/4 is 25%, 2/3 is 66.666...%, 0 is 0%", () => {
    expect(percentOfShare(fraction(1, 4))).toBe(25);
    expect(percentOfShare(fraction(2, 3))).toBeCloseTo(66.6667, 3);
    expect(percentOfShare(fraction(0))).toBe(0);
  });

  it("rowPercent: a row's share as a percentage of the estate", () => {
    const rows = buildRowsForLcm([fraction(1, 8), fraction(7, 8)]);
    expect(rowPercent(rows[0])).toBe(12.5);
    expect(rowPercent(rows[1])).toBe(87.5);
  });
});

/** Minimal SpecialRow list for the LCM/percent helpers (amounts irrelevant). */
function buildRowsForLcm(shares: { n: number; d: number }[]): SpecialRow[] {
  return shares.map((share, i) => ({
    key: `row-${i}`,
    label: `Row ${i}`,
    count: 1,
    fraction: `${share.n}/${share.d}`,
    share,
    amount: 0,
  }));
}

describe("v2 custom-sum checks — distinct estates / heir mixes (not book examples)", () => {
  it("1. Dhawul Arham custom: estate 2,400, wife + daughter's son/daughter (2:1 on the residue)", () => {
    const result = calculateDhawulArham({
      estate: 2400,
      fixedHeirs: H({ wives: 1 }),
      claimants: [
        { label: "Daughter's son", branch: 1, degree: 1, sex: "male", count: 1 },
        { label: "Daughter's daughter", branch: 1, degree: 1, sex: "female", count: 1 },
      ],
    });
    expect(amountFor(result.rows, "wives")).toBe(600);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's son")).toBe(1200);
    expect(amountFor(result.rows, "dhawul-1-1-Daughter's daughter")).toBe(600);
    expect(totalAmounts(result.rows)).toBe(2400);
  });

  it("2. Grandfather custom: estate 2,400, wife + 1 full sister + grandfather — both schools sum to the estate", () => {
    const result = calculateGrandfatherWithSiblings({ estate: 2400, heirs: H({ wives: 1, fullSisters: 1, paternalGrandfather: 1 }) });
    expect(amountFor(result.hanafi.rows, "wives")).toBe(600);
    expect(amountFor(result.hanafi.rows, "fullSisters") ?? 0).toBe(0);
    expect(amountFor(result.hanafi.rows, "paternalGrandfather")).toBe(1800);
    expect(totalAmounts(result.hanafi.rows)).toBe(2400);
    expect(amountFor(result.shafii.rows, "wives")).toBe(600);
    expect(amountFor(result.shafii.rows, "fullSisters")).toBe(1200);
    expect(amountFor(result.shafii.rows, "paternalGrandfather")).toBe(600);
    expect(totalAmounts(result.shafii.rows)).toBe(2400);
  });

  it("3a. Debtor custom state 3: gross 20,000, debts 8,000, remainder 12,000 divided (mother 2,000 / son 10,000)", () => {
    const result = calculateDebtorEstate({
      grossEstate: 20000,
      debts: [
        { name: "Amina", amount: 5000 },
        { name: "Bilal", amount: 3000 },
      ],
      heirs: H({ mother: 1, sons: 1 }),
    });
    expect(result.state).toBe(3);
    expect(result.remainderForHeirs).toBe(12000);
    expect(totalAmounts(result.creditorRows)).toBe(8000);
    expect(amountFor(result.heirRows, "mother")).toBe(2000);
    expect(amountFor(result.heirRows, "sons")).toBe(10000);
    expect(totalAmounts(result.heirRows)).toBe(12000);
    expect(totalAmounts(result.rows)).toBe(20000);
  });

  it("3b. Debtor custom state 2: gross 6,000, debts 9,000 — pro-rata 4,000 / 2,000, heirs get nothing", () => {
    const result = calculateDebtorEstate({
      grossEstate: 6000,
      debts: [
        { name: "Amina", amount: 6000 },
        { name: "Bilal", amount: 3000 },
      ],
      heirs: H({ sons: 1 }),
    });
    expect(result.state).toBe(2);
    expect(amountFor(result.creditorRows, "creditor-Amina")).toBe(4000);
    expect(amountFor(result.creditorRows, "creditor-Bilal")).toBe(2000);
    expect(totalAmounts(result.creditorRows)).toBe(6000);
    expect(result.heirRows).toEqual([]);
  });

  it("4. Disqualified custom: estate 9,600, murderer son excluded — wife + daughter re-divide, rows sum to the estate", () => {
    const result = calculateDisqualifiedHeirs({
      estate: 9600,
      heirs: H({ wives: 1, daughters: 1, sons: 1 }),
      disqualified: [{ key: "sons", label: "Son", reason: "murderer" }],
    });
    expect(amountFor(result.rows, "sons") ?? 0).toBe(0);
    expect(result.excluded).toHaveLength(1);
    expect(totalAmounts(result.rows)).toBe(9600);
  });

  it("5. Sahih/Fasid custom: father's mother's father is fasid (cat. 2); mother's mother's mother is sahiha (cat. 7) — classification only, no estate step", () => {
    const fasid = classifyGrandparent(["father", "mother", "father"]);
    expect(fasid.classification).toBe("fasid");
    expect(fasid.bookCategory).toBe(2);
    expect(fasid.consequence).toBe("distant-relative");
    expect(fasid.dhawulArhamBranch).toBe(2);
    const sahih = classifyGrandparent(["mother", "mother", "mother"]);
    expect(sahih.classification).toBe("sahih");
    expect(sahih.bookCategory).toBe(7);
    expect(sahih.consequence).toBe("fixed-share");
  });

  it("6. Unborn custom: estate 12,000, wife + mother + daughter — pay-now + held reconciles to the estate", () => {
    const result = calculateUnbornChild({ estate: 12000, heirs: H({ wives: 1, mother: 1, daughters: 1 }) });
    expect(totalAmounts(result.asSon.rows)).toBe(12000);
    expect(totalAmounts(result.asDaughter.rows)).toBe(12000);
    expect(amountFor(result.payNow, "wives")).toBe(1500);
    expect(amountFor(result.payNow, "mother")).toBe(2000);
    expect(result.payNowTotal + result.heldAmount).toBe(12000);
  });

  it("7. Missing custom: estate 10,000, wife + daughter + missing son — pay-now + held reconciles", () => {
    const result = calculateMissingPerson({ estate: 10000, heirs: H({ wives: 1, daughters: 1, sons: 1 }), missingKey: "sons" });
    expect(totalAmounts(result.ifAlive.rows)).toBe(10000);
    expect(totalAmounts(result.ifDead.rows)).toBe(10000);
    expect(amountFor(result.payNow, "wives")).toBe(1250);
    expect(result.payNowTotal + result.heldAmount).toBe(10000);
    expect(result.waitingPeriodYears).toBe(70);
  });

  it("8. Khuntha custom: estate 6,000, wife + mother, child role — all three views reconcile", () => {
    const result = calculateKhuntha({ estate: 6000, heirs: H({ wives: 1, mother: 1 }), role: "child" });
    expect(totalAmounts(result.asMale.rows)).toBe(6000);
    expect(totalAmounts(result.asFemale.rows)).toBe(6000);
    expect(result.shafii.payNowTotal + result.shafii.heldAmount).toBe(6000);
    expect(totalAmounts(result.abuHanifa.rows)).toBe(6000);
    expect(totalAmounts(result.prevailing.rows) + result.prevailing.heldAmount).toBe(6000);
  });

  it("9. Munasakha custom: estate 4,800, two deaths — final totals reconcile to the original estate", () => {
    const result = calculateMunasakha({
      estate: 4800,
      deaths: [
        {
          deceasedName: "Saleem",
          heirs: H({ wives: 1, sons: 1, daughters: 1 }),
          names: { wives: ["Amina"], sons: ["Bilal"], daughters: ["Cina"] },
        },
        {
          deceasedName: "Bilal",
          heirs: H({ mother: 1, fullSisters: 1 }),
          names: { mother: ["Amina"], fullSisters: ["Cina"] },
        },
      ],
    });
    expect(totalAmounts(result.deaths[0].rows)).toBe(4800);
    expect(totalAmounts(result.deaths[1].rows)).toBe(amountFor(result.deaths[0].rows, "sons"));
    expect(result.totalsBalance).toBe(true);
    expect(totalAmounts(result.finalTotals)).toBe(4800);
  });

  it("10. Simultaneous custom, order unknown: estates 9,000 + 3,000 — combined totals sum to 12,000; Hameed inherits from both", () => {
    const result = calculateSimultaneousDeath({
      orderKnown: false,
      deaths: [
        {
          deceasedName: "Hasan",
          estate: 9000,
          heirs: H({ wives: 1, sons: 1 }),
          names: { wives: ["Munira"], sons: ["Hameed"] },
        },
        {
          deceasedName: "Husain",
          estate: 3000,
          heirs: H({ daughters: 1, paternalUnclesSons: 1 }),
          names: { daughters: ["Hameeda"], paternalUnclesSons: ["Hameed"] },
        },
      ],
    });
    expect(totalAmounts(result.divisions![0].rows)).toBe(9000);
    expect(totalAmounts(result.divisions![1].rows)).toBe(3000);
    expect(amountFor(result.combinedTotals!, "Hameed")).toBe(9375);
    expect(amountFor(result.combinedTotals!, "Munira")).toBe(1125);
    expect(amountFor(result.combinedTotals!, "Hameeda")).toBe(1500);
    expect(totalAmounts(result.combinedTotals!)).toBe(12000);
  });

  it("11. Renunciation custom: estate 9,600, wife refuses 1/8 — redistribution equals the refused amount, final rows sum to the estate", () => {
    const result = calculateRenunciation({ estate: 9600, heirs: H({ wives: 1, mother: 1, sons: 1 }), refuserKey: "wives" });
    expect(totalAmounts(result.firstDivision)).toBe(9600);
    expect(result.refusedAmount).toBe(1200);
    expect(totalAmounts(result.redistribution)).toBe(1200);
    expect(amountFor(result.finalRows, "wives")).toBe(0);
    expect(totalAmounts(result.finalRows)).toBe(9600);
  });

  it("12a. Apostate estate custom: 10,000 while Muslim + 5,000 after — all three opinions reconcile to 15,000", () => {
    const result = calculateApostateEstate({ whileMuslim: 10000, afterLeaving: 5000, heirs: H({ wives: 1, sons: 1 }) });
    expect(result.total).toBe(15000);
    expect(totalAmounts(result.abuHanifa.rows)).toBe(15000);
    expect(result.abuHanifa.baytAlMal).toBe(5000);
    expect(amountFor(result.abuHanifa.rows, "bayt-al-mal")).toBe(5000);
    expect(totalAmounts(result.shafii.rows)).toBe(15000);
    expect(result.shafii.baytAlMal).toBe(15000);
    expect(totalAmounts(result.abuYusufMuhammad.rows)).toBe(15000);
    expect(result.abuYusufMuhammad.baytAlMal).toBe(0);
  });

  it("12b. Apostate heir custom: estate 7,200, apostate son excluded — rows sum to the estate", () => {
    const result = calculateApostateHeir({
      estate: 7200,
      heirs: H({ wives: 1, sons: 1, daughters: 1 }),
      apostateKeys: ["sons"],
    });
    expect(amountFor(result.rows, "sons") ?? 0).toBe(0);
    expect(result.excluded).toHaveLength(1);
    expect(totalAmounts(result.rows)).toBe(7200);
  });
});
