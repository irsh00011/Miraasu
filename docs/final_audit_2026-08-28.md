# Miraasu final audit and improvement record

## Scope

The existing Miraasu codebase was preserved and improved in place. The calculation engine continues to use exact rational fractions and now exposes a transparent trace for eligible allocations.

## Correctness changes

The audited engine now treats a daughter or other female son-line descendant differently from a male son-line blocker when selecting a male residuary class. In particular, a daughter does not incorrectly block an otherwise eligible paternal uncle (ʿamm) from receiving the remainder. The nearest eligible ʿasabah order remains son-line, father/grandfather, full brother, paternal brother, their eligible sons, full paternal uncle, consanguine paternal uncle, and their sons. Ambiguous or unsupported extended-family combinations remain visibly qualified for scholarly review rather than receiving an invented numerical share.

The public result now includes a trace containing eligible heirs, exact fixed-share total, least common multiple, integer units, remainder, allocation reconciliation, percentage, and final amount. The trace preserves exact fractions until display.

## Learning and research additions

The existing ʿasabah guide was expanded in Tamil, English, and Arabic with the paternal uncle’s fourth-degree position, eligibility, blockers, and Ibn al-ʿamm’s later position. A new `/research` page includes all six fractions—1/2, 1/4, 1/8, 1/6, 1/3, and 2/3—with percentage equivalents, interactive fraction bars, a worked wife–daughter–paternal-uncle example, formulas, a quiz, multilingual switching, and source links.

## Validation

TypeScript checking passed. The inheritance regression suite passed all 32 tests, including a new trace test covering LCM 8, integer units 1/4/3, 37.5% uncle remainder, ₹45,000 final amount, and full reconciliation. The production build passed.

## Research references

[1] [Qur’an 4:11](https://quran.com/4/11), fixed shares for children and parents.

[2] [Qur’an 4:12](https://quran.com/4/12), spouse and maternal-sibling shares and the order after debts and bequests.

[3] [Qur’an 4:176](https://quran.com/4/176), sibling shares and the 2:1 male-to-female rule in the cited case.

[4] [Inheritance of the paternal uncle and paternal aunt](https://islamqa.info/en/answers/135906), a reference explaining the paternal uncle as residuary and listing common blockers.

> This calculator and research page are educational aids. Madhhab interpretation and national law can affect real distributions; a qualified Islamic inheritance scholar and relevant legal professional should confirm any actual estate settlement.
