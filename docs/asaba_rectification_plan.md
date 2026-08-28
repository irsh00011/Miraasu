# ‘Asabah Rectification Plan

**Purpose.** Reconcile the calculator with the supplied book’s rule that fixed-share heirs receive their prescribed shares first, then the remaining estate goes to the nearest eligible ‘Asabah class. The app must not redistribute a remainder to fixed-share heirs while a nearer, selected, eligible male residuary exists.

## 1. Source anchors

The supplied book defines the estate order as funeral costs, debts, a bequest limited to one third, and only then inheritance distribution (source text lines 827–831). It identifies the ‘Asabah classes as follows:

| Priority | Book structure | Source text |
|---|---|---:|
| First degree | Son; son’s son and lower male son-line descendants | 895, 1340–1341 |
| Second degree | Father; father’s father and higher male ascendants | 897, 1343–1344 |
| Third degree | Full brother, brother’s son, paternal half-brother, and paternal half-brother’s son | 898, 1346–1347 |
| Fourth degree | Full paternal uncle, paternal uncle’s son, and the corresponding paternal-uncle line | 899, 1349–1351 |

The book states that a later class cannot inherit while an earlier class is present (901, 1354–1355). The sister tables separately state that a brother and sister of the same class share the residue in a 2:1 ratio, and that full or paternal sisters can take the residue with a daughter or son’s daughter after other eligible shares are assigned (1159–1163, 1202–1206).

## 2. Why the current result can be wrong

Before this rectification, the final residue chain ended after the paternal-sibling branches. A selected solo paternal brother, brother’s son, paternal brother’s son, paternal uncle, or uncle’s son could therefore be omitted from the nearest-class sequence, leaving a remainder unallocated or sending it to fallback redistribution.

The rectified engine now inserts explicitly modeled solo male residuaries in source order after closer classes have been excluded: full-brother sons, paternal brothers, paternal-brother sons, full paternal uncles, paternal-uncle sons, consanguine paternal uncles, and their sons. The paternal-brother plus paternal-sister pair remains automatic only under its narrow complete condition; broader mixed precedence combinations remain review-only.

## 3. Correct calculation sequence

1. Start with the net estate: funeral costs, debts, and the permitted bequest are removed first.
2. Determine the fixed shares of eligible أصحاب الفروض, including spouse, mother, daughters, son’s daughters, maternal siblings, grandmothers, and sisters where their table condition applies.
3. Resolve any over-allocation using the book’s documented calculation method; do not silently present an unsourced normalization as authoritative.
4. Determine the nearest eligible ‘Asabah degree. A nearer degree blocks all later degrees.
5. For male and female heirs of the same degree, apply the photographed 2:1 rule only when the table condition is complete and the relationship pair is explicit.
6. Allocate the remainder to that nearest class before any spouse-excluded redistribution. Redistribution is a fallback only when no eligible residuary is selected and the source-supported method permits it.
7. Record every selected relationship as allocated, blocked with a reason, or requiring qualified review. No selected relationship may disappear silently.

## 4. Safe automation tiers

| Tier | Rule handling |
|---|---|
| A — automatic | Complete, source-matched conditions covered by exact-fraction tests: descendants, father/grandfather, photographed sister cases, maternal siblings, grandmothers, the narrow paternal-brother plus paternal-sister pair, and explicitly modeled solo male-residuary fallbacks. |
| B — bounded automatic additions | Additional male-residuary branches may be promoted only when their source condition, nearest-class blockers, and exact test fixture are complete. |
| C — qualified review | Grandfather with siblings where the book states a madhhab difference; distant relatives; incomplete precedence combinations; and any case whose photographed/source wording does not identify a complete allocation path. |

## 5. Required rectification tests

The test suite must include exact fractions and total reconciliation for: one son with one daughter; three daughters without a son; equal same-rank male heirs; father with a son-line descendant; paternal grandfather without the father and with a son-line descendant; full brother with full sister; paternal brother with paternal sister; a solo paternal brother after all closer classes are absent; a brother’s-son case after the brother class is absent; a paternal uncle case after all earlier classes are absent; and a blocked later-class case when an earlier ‘Asabah is present.

Every test must verify both the allocation and the reason for any exclusion or review state. Browser tests must repeat representative cases in Tamil, English, and Arabic.

## 7. Post-rectification verification record

The exact-fraction regression file `client/src/lib/inheritance.test.ts` now includes the mixed case with one wife, mother, father, daughter, paternal brother, and paternal uncle. It verifies wife `1/8`, mother `1/6`, daughter `1/2`, father `5/24`, no silent allocation to the selected third- or fourth-degree relatives, scholar-review status, and a reconciled total of `1`. The full unit run reports 32 passing tests across the inheritance and local-history suites.

The browser journeys `scripts/family-flow.e2e.mjs`, `scripts/english-flow.e2e.mjs`, and `scripts/arabic-flow.e2e.mjs` verify the ordered single-column map, search restoration, global reset, section reset while filtered, selected-family chip removal, back navigation, exit-to-welcome, and the scholar-review path on desktop and mobile. The visible-app release claim remains limited to the source-matched and explicitly modeled branches; it does not claim complete automation of every advanced branch in the supplied book.

## 6. Release gate

No ‘Asabah rectification is production-ready until the engine, labels, guide, source matrix, exact-fraction tests, browser tests, and review banner agree. The release must report which classes are automatic and which remain qualified review; it must not claim that every advanced branch of the book has been automated until each branch has a source-derived fixture.

This plan is an implementation roadmap, not a personal legal ruling. A qualified Islamic inheritance scholar should review the final advanced precedence rules before real-world distribution.

