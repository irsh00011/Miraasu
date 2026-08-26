/**
 * Rule model: Tamil-first, simple guided inheritance calculation.
 * Exact fractions are retained until amounts are rendered to avoid display-rounding errors.
 * Scope: ordinary single-death cases only; the UI flags advanced situations for review.
 */

export type Fraction = { n: number; d: number };

export type EstateInput = {
  grossEstate: number;
  funeralCosts: number;
  debts: number;
  bequest: number;
};

export type HeirInput = {
  husband: number;
  wives: number;
  father: number;
  mother: number;
  paternalGrandfather: number;
  sons: number;
  daughters: number;
  fullBrothers: number;
  fullSisters: number;
  maternalBrothers: number;
  maternalSisters: number;
};

export type Allocation = {
  key: string;
  label: string;
  count: number;
  share: Fraction;
  reason: string;
  method: "fixed" | "remainder" | "redistribution";
};

export type Exclusion = {
  label: string;
  reason: string;
};

export type CalculationResult = {
  netEstate: number;
  appliedBequest: number;
  bequestLimit: number;
  allocations: Allocation[];
  exclusions: Exclusion[];
  unallocatedShare: Fraction;
  notices: string[];
  fixedSharesAdjusted: boolean;
};

const gcd = (a: number, b: number): number => {
  const x = Math.abs(a);
  const y = Math.abs(b);
  return y === 0 ? x : gcd(y, x % y);
};

export const fraction = (n: number, d = 1): Fraction => {
  if (d === 0) return { n: 0, d: 1 };
  const sign = d < 0 ? -1 : 1;
  const divisor = gcd(n, d) || 1;
  return { n: (sign * n) / divisor, d: Math.abs(d) / divisor };
};

const add = (a: Fraction, b: Fraction) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
const subtract = (a: Fraction, b: Fraction) => fraction(a.n * b.d - b.n * a.d, a.d * b.d);
const multiply = (a: Fraction, b: Fraction) => fraction(a.n * b.n, a.d * b.d);
const divide = (a: Fraction, b: Fraction) => fraction(a.n * b.d, a.d * b.n);
const greaterThan = (a: Fraction, b: Fraction) => a.n * b.d > b.n * a.d;
const equal = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;
const sum = (items: Fraction[]) => items.reduce((total, item) => add(total, item), fraction(0));

export const fractionToNumber = (value: Fraction) => value.n / value.d;
export const fractionToText = (value: Fraction) => (value.d === 1 ? `${value.n}` : `${value.n}/${value.d}`);

const mergeAllocations = (items: Allocation[]): Allocation[] => {
  const merged = new Map<string, Allocation>();

  items.forEach((item) => {
    const current = merged.get(item.key);
    if (!current) {
      merged.set(item.key, item);
      return;
    }

    merged.set(item.key, {
      ...current,
      share: add(current.share, item.share),
      reason: current.reason.includes(item.reason) ? current.reason : `${current.reason} ${item.reason}`,
      method: current.method === item.method ? current.method : "remainder",
    });
  });

  return Array.from(merged.values()).filter((item) => greaterThan(item.share, fraction(0)));
};

const allocation = (
  key: string,
  label: string,
  count: number,
  share: Fraction,
  reason: string,
  method: Allocation["method"],
): Allocation => ({ key, label, count, share, reason, method });

export function calculateInheritance(estate: EstateInput, heirs: HeirInput): CalculationResult {
  const grossEstate = Math.max(0, estate.grossEstate || 0);
  const funeralCosts = Math.max(0, estate.funeralCosts || 0);
  const debts = Math.max(0, estate.debts || 0);
  const afterCosts = Math.max(0, grossEstate - funeralCosts - debts);
  const bequestLimit = afterCosts / 3;
  const appliedBequest = Math.min(Math.max(0, estate.bequest || 0), bequestLimit);
  const netEstate = Math.max(0, afterCosts - appliedBequest);

  const fixed: Allocation[] = [];
  const remainder: Allocation[] = [];
  const exclusions: Exclusion[] = [];
  const notices: string[] = [];

  const hasSpouse = heirs.husband > 0 || heirs.wives > 0;
  const hasChildren = heirs.sons > 0 || heirs.daughters > 0;
  const siblingCount =
    heirs.fullBrothers + heirs.fullSisters + heirs.maternalBrothers + heirs.maternalSisters;

  if (grossEstate === 0) notices.push("சொத்து மதிப்பை உள்ளிடவும்.");
  if (grossEstate > 0 && funeralCosts + debts >= grossEstate) {
    notices.push("செலவுகள் மற்றும் கடன்கள் காரணமாகப் பகிரக்கூடிய சொத்து இல்லை.");
  }
  if (estate.bequest > bequestLimit && afterCosts > 0) {
    notices.push("வஸிய்யத் தொகை ஒரு மூன்றில் ஒரு பங்கைத் தாண்டியுள்ளது; கணக்கில் அனுமதிக்கப்பட்ட அளவு மட்டும் பயன்படுத்தப்பட்டுள்ளது.");
  }
  if (heirs.husband > 0 && heirs.wives > 0) {
    notices.push("கணவன் மற்றும் மனைவிகள் இருவரையும் ஒரே நேரத்தில் தேர்வு செய்ய முடியாது; மனைவி தேர்வு கணக்கில் பயன்படுத்தப்பட்டுள்ளது.");
  }

  const spouseShare = heirs.wives > 0
    ? hasChildren
      ? fraction(1, 8)
      : fraction(1, 4)
    : heirs.husband > 0
      ? hasChildren
        ? fraction(1, 4)
        : fraction(1, 2)
      : fraction(0);

  if (heirs.wives > 0) {
    fixed.push(
      allocation(
        "wives",
        "மனைவி / மனைவிகள்",
        heirs.wives,
        spouseShare,
        hasChildren ? "பிள்ளைகள் இருப்பதால் மனைவிகளின் மொத்தப் பங்கு 1/8." : "பிள்ளைகள் இல்லாததால் மனைவிகளின் மொத்தப் பங்கு 1/4.",
        "fixed",
      ),
    );
  } else if (heirs.husband > 0) {
    fixed.push(
      allocation(
        "husband",
        "கணவன்",
        1,
        spouseShare,
        hasChildren ? "பிள்ளைகள் இருப்பதால் கணவனின் பங்கு 1/4." : "பிள்ளைகள் இல்லாததால் கணவனின் பங்கு 1/2.",
        "fixed",
      ),
    );
  }

  const motherSpecialCase = heirs.mother > 0 && heirs.father > 0 && hasSpouse && !hasChildren && siblingCount < 2;
  if (heirs.mother > 0) {
    if (hasChildren || siblingCount >= 2) {
      fixed.push(allocation("mother", "தாய்", 1, fraction(1, 6), "பிள்ளைகள் அல்லது இரண்டு/அதற்கு மேற்பட்ட சகோதரர்கள் இருப்பதால் தாயின் பங்கு 1/6.", "fixed"));
    } else if (motherSpecialCase) {
      fixed.push(
        allocation(
          "mother",
          "தாய்",
          1,
          multiply(subtract(fraction(1), spouseShare), fraction(1, 3)),
          "கணவன்/மனைவி மற்றும் தந்தையுடன் இருப்பதால், துணையின் பங்குக்குப் பிறகு மீதத்தில் 1/3.",
          "fixed",
        ),
      );
    } else {
      fixed.push(allocation("mother", "தாய்", 1, fraction(1, 3), "பிள்ளைகள் மற்றும் இரண்டு சகோதரர்கள் இல்லாததால் தாயின் பங்கு 1/3.", "fixed"));
    }
  }

  let fatherGetsRemainder = false;
  let grandfatherGetsRemainder = false;
  if (heirs.father > 0) {
    if (heirs.sons > 0) {
      fixed.push(allocation("father", "தந்தை", 1, fraction(1, 6), "மகன் இருப்பதால் தந்தையின் பங்கு 1/6.", "fixed"));
    } else if (heirs.daughters > 0) {
      fixed.push(allocation("father", "தந்தை", 1, fraction(1, 6), "மகள் இருப்பதால் தந்தைக்கு 1/6; மீதமும் தந்தைக்கு செல்லலாம்.", "fixed"));
      fatherGetsRemainder = true;
    } else {
      fatherGetsRemainder = true;
    }
    if (heirs.paternalGrandfather > 0) {
      exclusions.push({ label: "தந்தையின் தந்தை", reason: "தந்தை இருப்பதால் தந்தையின் தந்தைக்கு பங்கு இல்லை." });
    }
  } else if (heirs.paternalGrandfather > 0) {
    if (heirs.sons > 0) {
      fixed.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, fraction(1, 6), "மகன் இருப்பதால் தந்தையின் தந்தையின் பங்கு 1/6.", "fixed"));
    } else if (heirs.daughters > 0) {
      fixed.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, fraction(1, 6), "மகள் இருப்பதால் 1/6; மீதமும் செல்லலாம்.", "fixed"));
      grandfatherGetsRemainder = true;
    } else {
      grandfatherGetsRemainder = true;
    }
    if (heirs.fullBrothers + heirs.fullSisters > 0) {
      notices.push("தந்தையின் தந்தை மற்றும் உடன்பிறந்த சகோதரர்கள் உள்ளனர். இந்த நிலையில் மத்ஹப் வேறுபாடு இருக்கலாம்; அறிஞர் உறுதிப்படுத்தல் அவசியம்.");
    }
  }

  if (heirs.sons > 0) {
    // Sons and daughters share the remainder together at a 2:1 ratio.
  } else if (heirs.daughters === 1) {
    fixed.push(allocation("daughters", "மகள்", 1, fraction(1, 2), "ஒரு மகள் மட்டுமே; மகன் இல்லாததால் பங்கு 1/2.", "fixed"));
  } else if (heirs.daughters > 1) {
    fixed.push(allocation("daughters", "மகள்கள்", heirs.daughters, fraction(2, 3), "இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள்; மகன் இல்லாததால் மொத்தப் பங்கு 2/3.", "fixed"));
  }

  const maternalCount = heirs.maternalBrothers + heirs.maternalSisters;
  const maternalEligible = maternalCount > 0 && !hasChildren && heirs.father === 0 && heirs.paternalGrandfather === 0;
  if (maternalCount > 0 && !maternalEligible) {
    exclusions.push({
      label: "தாய் வழி சகோதரர் / சகோதரி",
      reason: hasChildren ? "பிள்ளைகள் இருப்பதால் தாய் வழி சகோதரர்களுக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் தாய் வழி சகோதரர்களுக்கு பங்கு இல்லை.",
    });
  }
  if (maternalEligible) {
    const maternalTotal = maternalCount === 1 ? fraction(1, 6) : fraction(1, 3);
    if (heirs.maternalBrothers > 0) {
      fixed.push(
        allocation(
          "maternalBrothers",
          "தாய் வழி சகோதரர்",
          heirs.maternalBrothers,
          multiply(maternalTotal, fraction(heirs.maternalBrothers, maternalCount)),
          maternalCount === 1 ? "ஒரு தாய் வழி சகோதரர்; பங்கு 1/6." : "தாய் வழி சகோதரர்/சகோதரிகளின் மொத்தப் பங்கு 1/3; சமமாகப் பகிரப்படும்.",
          "fixed",
        ),
      );
    }
    if (heirs.maternalSisters > 0) {
      fixed.push(
        allocation(
          "maternalSisters",
          "தாய் வழி சகோதரி",
          heirs.maternalSisters,
          multiply(maternalTotal, fraction(heirs.maternalSisters, maternalCount)),
          maternalCount === 1 ? "ஒரு தாய் வழி சகோதரி; பங்கு 1/6." : "தாய் வழி சகோதரர்/சகோதரிகளின் மொத்தப் பங்கு 1/3; சமமாகப் பகிரப்படும்.",
          "fixed",
        ),
      );
    }
  }

  const fullSiblingCount = heirs.fullBrothers + heirs.fullSisters;
  const fullSiblingsEligible = fullSiblingCount > 0 && heirs.father === 0 && heirs.paternalGrandfather === 0 && heirs.sons === 0;
  let fullSiblingsGetRemainder = false;
  if (fullSiblingCount > 0 && !fullSiblingsEligible) {
    exclusions.push({
      label: "உடன் பிறந்த சகோதரர் / சகோதரி",
      reason: heirs.sons > 0 ? "மகன் இருப்பதால் உடன்பிறந்த சகோதரர்களுக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் உடன்பிறந்த சகோதரர்களுக்கு பங்கு இல்லை.",
    });
  } else if (fullSiblingsEligible) {
    if (heirs.fullBrothers > 0 || heirs.daughters > 0) {
      fullSiblingsGetRemainder = true;
    } else if (heirs.fullSisters === 1) {
      fixed.push(allocation("fullSisters", "உடன் பிறந்த சகோதரி", 1, fraction(1, 2), "ஒரு உடன்பிறந்த சகோதரி மட்டும்; பங்கு 1/2.", "fixed"));
    } else if (heirs.fullSisters > 1) {
      fixed.push(allocation("fullSisters", "உடன் பிறந்த சகோதரிகள்", heirs.fullSisters, fraction(2, 3), "இரண்டு அல்லது அதற்கு மேற்பட்ட உடன்பிறந்த சகோதரிகள்; மொத்தப் பங்கு 2/3.", "fixed"));
    }
  }

  let fixedTotal = sum(fixed.map((item) => item.share));
  let fixedSharesAdjusted = false;
  let effectiveFixed = fixed;

  if (greaterThan(fixedTotal, fraction(1))) {
    effectiveFixed = fixed.map((item) => ({ ...item, share: divide(item.share, fixedTotal) }));
    fixedTotal = fraction(1);
    fixedSharesAdjusted = true;
    notices.push("நிர்ணயிக்கப்பட்ட பங்குகளின் கூட்டுத்தொகை சொத்தைத் தாண்டுகிறது. விகிதாசாரமாகச் சரிசெய்து முடிவு காட்டப்பட்டுள்ளது; அறிஞர் உறுதிப்படுத்தல் பரிந்துரைக்கப்படுகிறது.");
  }

  const availableRemainder = subtract(fraction(1), fixedTotal);
  if (greaterThan(availableRemainder, fraction(0))) {
    if (heirs.sons > 0) {
      const units = heirs.sons * 2 + heirs.daughters;
      remainder.push(allocation("sons", "மகன்", heirs.sons, multiply(availableRemainder, fraction(heirs.sons * 2, units)), "மீதமான சொத்தில் மகனுக்கு இரண்டு பங்கு.", "remainder"));
      if (heirs.daughters > 0) {
        remainder.push(allocation("daughters", "மகள்", heirs.daughters, multiply(availableRemainder, fraction(heirs.daughters, units)), "மீதமான சொத்தில் மகளுக்கு ஒரு பங்கு.", "remainder"));
      }
    } else if (fatherGetsRemainder && heirs.father > 0) {
      remainder.push(allocation("father", "தந்தை", 1, availableRemainder, "மீதமான சொத்து தந்தைக்கு செல்கிறது.", "remainder"));
    } else if (grandfatherGetsRemainder && heirs.paternalGrandfather > 0) {
      remainder.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, availableRemainder, "மீதமான சொத்து தந்தையின் தந்தைக்கு செல்கிறது.", "remainder"));
    } else if (fullSiblingsGetRemainder) {
      const units = heirs.fullBrothers * 2 + heirs.fullSisters;
      if (heirs.fullBrothers > 0) {
        remainder.push(allocation("fullBrothers", "உடன் பிறந்த சகோதரர்", heirs.fullBrothers, multiply(availableRemainder, fraction(heirs.fullBrothers * 2, units)), "மீதமான சொத்தில் சகோதரருக்கு இரண்டு பங்கு.", "remainder"));
      }
      if (heirs.fullSisters > 0) {
        remainder.push(allocation("fullSisters", "உடன் பிறந்த சகோதரி", heirs.fullSisters, multiply(availableRemainder, fraction(heirs.fullSisters, units)), heirs.fullBrothers > 0 ? "மீதமான சொத்தில் சகோதரிக்கு ஒரு பங்கு." : "மகளுடன் இருப்பதால் மீதமான பங்கு உடன்பிறந்த சகோதரிக்கு செல்கிறது.", "remainder"));
      }
    }
  }

  const allocationsBeforeRedistribution = mergeAllocations([...effectiveFixed, ...remainder]);
  const allocatedBeforeRedistribution = sum(allocationsBeforeRedistribution.map((item) => item.share));
  const remainingAfterResiduary = subtract(fraction(1), allocatedBeforeRedistribution);
  let redistribution: Allocation[] = [];
  let unallocatedShare = fraction(0);

  if (greaterThan(remainingAfterResiduary, fraction(0))) {
    const eligibleForRedistribution = allocationsBeforeRedistribution.filter((item) => item.key !== "husband" && item.key !== "wives");
    const eligibleTotal = sum(eligibleForRedistribution.map((item) => item.share));
    if (greaterThan(eligibleTotal, fraction(0))) {
      redistribution = eligibleForRedistribution.map((item) =>
        allocation(
          item.key,
          item.label,
          item.count,
          multiply(remainingAfterResiduary, divide(item.share, eligibleTotal)),
          "மீதமான பங்கு, துணையின் பங்கைத் தவிர்த்து தகுதியுள்ள வாரிசுகளுக்கு மீள்பகிர்வு செய்யப்பட்டது.",
          "redistribution",
        ),
      );
    } else if (!equal(remainingAfterResiduary, fraction(0))) {
      unallocatedShare = remainingAfterResiduary;
      notices.push("இந்த எளிய கணக்கில் மீதமான பங்கிற்கு தகுதியுள்ள வாரிசு இல்லை. அறிஞர் உறுதிப்படுத்தல் தேவை.");
    }
  }

  if (fullSiblingCount > 0 && heirs.paternalGrandfather > 0) {
    notices.push("சகோதரர்கள் மற்றும் தந்தையின் தந்தை தொடர்பான சில விதிகளில் கருத்து வேறுபாடு உள்ளது; இது தற்காலிக விளக்கம் மட்டுமே.");
  }

  if (allocationsBeforeRedistribution.length === 0 && netEstate > 0) {
    notices.push("வாரிசுகள் தேர்வு செய்யப்படவில்லை அல்லது இந்த எளிய பதிப்பில் ஆதரிக்கப்படாத உறவு தேவைப்படுகிறது.");
  }

  return {
    netEstate,
    appliedBequest,
    bequestLimit,
    allocations: mergeAllocations([...allocationsBeforeRedistribution, ...redistribution]),
    exclusions,
    unallocatedShare,
    notices,
    fixedSharesAdjusted,
  };
}
