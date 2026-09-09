# Audit against the newly uploaded book (`அட்டவணை நகல்.pdf` / `Meerath tamil Book 2024 dec new.doc`)

**Method.** The PDF is page-identical (same rule numbers 4.1.1–6.2.3) to the corresponding
appendix pages of the `.doc` book already used for `docs/book_rule_matrix.md`. Both were
converted to text and checked line by line against `client/src/lib/inheritance.ts`
(`calculateAuditedInheritance`, the function `calculateInheritance` actually uses) and against
`EXTENDED_HEIR_SECTIONS`. Nothing outside this app's existing supplied-book corpus was used.

## Result: every numbered rule in the uploaded table is already implemented correctly

| Table section | Rules checked | Status |
|---|---|---|
| 1. தந்தை (Father) | 4.1.1–4.1.3 | Already correct |
| 2. தந்தையின் தந்தை (Paternal grandfather) | 4.2.1–4.2.5 | Already correct (4.2.5, near-vs-far grandfather, is not user-selectable — only one grandfather field exists — so it cannot occur) |
| 3. தாய் வழி சகோதரன் (Maternal sibling) | 4.3.1–4.3.5 | Already correct |
| 4–5. கணவன் / மனைவி (Spouse) | 4.4.1–4.4.2, 5.1.1–5.1.2 | Already correct |
| 6–7. மகள் / மகனின் மகள் (Daughter / son's daughter) | 5.2.1–5.2.3, 5.3.1–5.3.6 | Already correct |
| 8. உடன் பிறந்த சகோதரி (Full sister) | 5.4.1–5.4.7 | Already correct, including the Abu Hanifa/Shafi'i difference in 5.4.7 (flagged for scholar review rather than silently picking one view) |
| 9. தந்தை வழி சகோதரி (Paternal sister) | 5.5.1–5.5.11 | Already correct, including the madhhab difference in 5.5.11 |
| 10. தாய் வழி சகோதரி (Maternal sister) | 5.6.1–5.6.5 | Already correct (shares the combined maternal-sibling logic with section 3) |
| 11. தாய் (Mother) | 5.7.1–5.7.4 | Already correct, including "two siblings of **any** listed type" (5.7.2) and the father+spouse 1/3-of-remainder case (5.7.4) |
| 12. பாட்டி (Grandmother) | 5.8.1–5.8.6 | Already correct — verified in detail below |
| Asabah table | 6.2.1–6.2.3 + note | Already correct; matches the son-line → father-line → brother-line → paternal-uncle-line order with "nearer class blocks later class" |

### Detailed check: grandmother rules (5.8.1–5.8.6)

This section looked, at first read, like it might disagree with the code (the code blocks the
*maternal* grandmother when the paternal grandfather is present, at line ~671). Re-reading
5.8.3+5.8.4 together confirms the code is right:

- 5.8.3: if the father is absent but the paternal grandfather is alive, a grandmother does **not**
  inherit —
- 5.8.4: **except** the paternal grandmother who is that grandfather's own wife; she still gets 1/6
  together with him, "because they are husband and wife."

The app does not track which specific grandmother is whose spouse, so it applies the rule the way
the table's own worked structure implies for the ordinary case: the paternal-line grandmother's 1/6
is conditioned only on the absence of mother/father (5.8.1, 5.8.2, 5.8.6), and the maternal-line
grandmother's 1/6 is additionally blocked when the paternal grandfather is present (5.8.3). No code
change was needed here — this note is kept so a future audit does not "fix" something that already
matches the source.

## One correction made: heir-tier categorization

The book's own structure (page 2–3) places **தாயின் தந்தை (mother's father / maternal
grandfather)** in the **second tier of ذوو الأرحام (distant relatives)** — "பாகம் பெறாத,
அஸபாவில்லாத தாயின் தந்தை" — not among the near grandparents. The app had it grouped under
"தாத்தா, பாட்டி மற்றும் மூதாதையர் / Grandparents and ancestors" instead of under "தூரத்து
உறவினர்கள் / Distant relatives."

**Fix applied:** moved the `maternalGrandfather` entry to the Distant Relatives section in
`EXTENDED_HEIR_SECTIONS` (`client/src/lib/inheritance.ts`), with its description updated to name
the tier explicitly. This is a family-list categorization change only:

- The field is still collected, still shown in the selected-family list, still counted, and still
  produces the same "qualified review" notice — nothing about *removal* or *calculation* changed.
- `maternalGrandfather` was already excluded from `VERIFIED_EXTENDED_KEYS`, so it was never given an
  automatic numeric share before or after this change — the book gives no exact fraction for this
  tier, only precedence-and-blocking language, so no numeric share is invented for it now either.

## Distant relatives (ذوو الأرحام) — confirmed all four tiers are present

The book lists four tiers (page 2–3) with the rule "closer tier blocks later tier." All four are
already represented as selectable family members, all correctly kept out of the automatic
fixed/asabah calculation (the book gives no exact fractions for this group, only who-is-included and
blocking order):

| Book tier | App fields |
|---|---|
| 1st: daughter's line, son's-daughter's line | `daughtersChildren`, `sonsDaughtersChildren` |
| 2nd: maternal grandfather; false/non-asabah paternal ancestors | `maternalGrandfather` (moved here), `furtherPaternalAncestors` |
| 3rd: brother's daughter, sister's children, maternal brother's children | `fullBrothersDaughters`, `fullSistersChildren`, `maternalBrothersChildren` |
| 4th: father's maternal brother and descendants; mother's siblings and descendants | `fathersMaternalBrothers`, `fathersMaternalBrothersDescendants`, `mothersSiblings`, `mothersSiblingsDescendants` |

## Family list / result page requirements

- No selected family member is ever dropped from the result: every selection is either allocated, put
  in `exclusions` with a book-sourced reason, or listed in `selectedReviewOnlyHeirs` (all three are
  rendered; nothing is hidden).
- The result trace (`buildTrace`) already reports LCM, exact fixed-share fraction, remainder,
  integer shares, percentage, and amount per heir, and separates fixed (`أصحاب الفروض`) from
  residuary (`العصبات`) by the `method` field — matching the requested result-page shape.

## Verification run

- `pnpm test` — 40/40 tests pass (`inheritance.test.ts`, `localHistory.test.ts`).
- `pnpm check` (`tsc --noEmit`) — no errors.
- No unrelated UI, route, or calculation logic was touched.
