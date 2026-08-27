# Refined Calculator Plan

## 1. Product objective

The calculator will be an **explanation-led inheritance worksheet**, not a black box. A user should be able to enter the estate, move through family members in a single familiar order, see exactly which rules were applied, and see an unambiguous warning where the book requires a more complex or interpretation-sensitive calculation.

> **Design rule:** Never silently ignore a chosen family member. Every selection must produce either a calculated share, a blocking explanation, or a qualified-review instruction.

## 2. Calculation authority and coverage

| Coverage tier | App behavior | Book-backed scope |
|---|---|---|
| **Automatic calculation** | The app calculates exact fractions, money amounts, and sum reconciliation. | Estate settlement order; spouse; mother; father; paternal grandfather; daughters; sons; son’s sons; son’s daughters; maternal siblings; full sisters; paternal sisters; eligible grandmothers. |
| **Qualified review** | The app records the relative, displays their position in the hierarchy, and explains that no final automatic amount is being issued. | Further son-line descendants; paternal brothers; sons of brothers; paternal uncles and their sons; maternal grandfather; non-qualifying ancestors; distant-relative branches; grandfather-with-siblings school differences. |
| **Not eligible** | The app states the nearer heir or rule that blocks the selected relative. | Blocking paths explicitly stated by the book’s tables. |

## 3. One-column family structure

The selection screen should use a single reading column in this order. The right-hand area remains only a compact live “Selected family” summary; it must never compete with the form.

| Order | Heading shown to user | Members included | Primary outcome |
|---:|---|---|---|
| 1 | **Spouse** | Husband; wife/wives | Automatic |
| 2 | **Children** | Sons; daughters | Automatic |
| 3 | **Grandchildren through a son** | Son’s sons; son’s daughters; later son-line descendants | First two automatic; later line review |
| 4 | **Parents** | Father; mother | Automatic |
| 5 | **Grandparents** | Father’s father; father’s mother; mother’s mother; mother’s father; further paternal ancestors | First three conditional; remainder review |
| 6 | **Full siblings** | Full brothers; full sisters; sons/daughters of full brothers; children of full sisters | First two automatic where source-complete; descendants review |
| 7 | **Paternal siblings** | Paternal brothers; paternal sisters; their sons | Paternal sisters conditional; others review |
| 8 | **Maternal siblings** | Maternal brothers; maternal sisters; their children | First two automatic; children review |
| 9 | **Paternal uncle line** | Father’s brothers and their sons | Qualified review |
| 10 | **Distant relatives** | Daughter’s children; descendants through a son’s daughter; father’s maternal half-brother line; mother’s sibling line | Qualified review |

Each heading has one short purpose line and an optional “Why does this matter?” expander. A section appears in the same place for every user, even when all values are zero. This makes it easy to scan, search, reset, and verify a complete family record.

## 4. Calculation sequence

1. **Prepare the estate:** funeral/burial cost → debt → bequest up to one-third → distributable estate.
2. **Collect relatives:** use the ordered one-column structure; search is available but does not change legal priority.
3. **Classify relatives:** fixed-share, residuary, distant-relative, blocked, or qualified-review.
4. **Assign fixed shares:** use exact fractions from the book.
5. **Apply precedence:** closer residuary group blocks later residuary groups; closer distant branch blocks later distant branches.
6. **Assign the remainder:** exact fractions first; display money only at the final step.
7. **Reconcile:** show `allocated + held/review amount = distributable estate` and list every selected person in one of the three outcome states.

## 5. Correctness controls

| Control | Purpose |
|---|---|
| Exact rational arithmetic | Prevent rounding from changing legal share values. |
| Source rule matrix | Keep each automatic rule linked to a book table and line reference. |
| Scenario tests | Cover direct shares, blocking, remainder, redistribution, and book examples. |
| Coverage banner | State whether the current result is automatic, partial pending review, or review-only. |
| No-silent-selection check | A test fails if a selected relation neither appears in allocation, exclusion, nor review list. |
| Tamil/English parity tests | Ensure both routes call the same rule engine and display the same outcome. |

## 6. Release sequence

The immediate release corrects descendant-aware rules and makes the family structure easy to scan. The next release automates additional source-complete sibling/ancestor cases after dedicated test tables are added. The final release should only automate distant relatives after their full precedence algorithms have been independently reviewed by a qualified inheritance scholar.

## 7. Validation record

The audited desktop family screen was checked with the full vertical selector, relation search, section reset, and live selected-family panel. The selector preserves its readable, single-column flow while the compact side panel provides a separate remove control for each selected person. The audited result screen was also checked with one automatically calculated son’s son and one review-only paternal uncle. It shows the calculated heir in the allocation panel and explicitly lists the review-only relationship in the scholar-review panel, satisfying the no-silent-selection design rule.

The Arabic mobile route was checked with an RTL header, Arabic search field, compact four-part family map, responsive relationship cards, selected-family panel, calculation result, and sum check. The map makes the entry sequence easy to scan for a first-time user; detailed relationships remain available rather than hidden. The test journey uses a non-zero estate so users see a meaningful amount and no longer receive an ambiguous scholar-review notice for a simple zero-estate input warning.

The repaired family selector was visually checked on desktop after the close-family search and click-to-open book-family controls were added. The familiar relationship categories remain ordered and visible, while the category controls let a user focus on a single book-relative group. The supplied book cover is now shown as a labelled source-book card on the Tamil-first introduction screen, and the worksheet’s custom balance-and-fractions mark has a more visible, restrained gold balance point.
