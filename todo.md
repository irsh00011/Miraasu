# Implementation Checklist

- [x] Replace the prior visual direction with a simple white-and-blue, Tamil-first guided worksheet.
- [x] Build exact fraction helpers and estate-preparation calculations.
- [x] Implement the basic heir questionnaire for spouse, parents, children, and siblings.
- [x] Encode the MVP share, blocking, and remainder rules from the supplied guide.
- [x] Create a plain-language results worksheet with share reasons, currency amounts, and a total check.
- [x] Add clear advanced-case warnings rather than misleading automatic outcomes.
- [x] Test representative calculation paths and mobile layouts.
- [x] Capture the final visual review, save a checkpoint, and deliver the project.

## Smooth UX update

- [x] Replace the long landing explanation with a short first-instruction screen and one clear start action.
- [x] Reduce calculation to compact, progressive screens with large Back and Continue actions.
- [x] Add a local-only history page to view, reopen, and delete saved calculations.
- [x] Add automatic local saving after each completed calculation with a clear user confirmation.
- [x] Verify mobile and desktop navigation, touch targets, and history persistence.

## Family selector clarity update

- [x] Replace formal relationship wording with plain Tamil family labels and short examples.
- [x] Add emoji cues to the family choices and accessible text labels for every cue.
- [x] Add a sticky “Who should I add?” guide for the active relationship screen.
- [x] Run the family-selector browser check on mobile and desktop.

## Complete family grouping update

- [x] Show every currently supported relationship without hiding the other-family section.
- [x] Separate the selection screen into Primary Family and Other Family groups with plain Tamil headings.
- [x] Update the contextual guide and browser check for the always-visible complete family list.

## Full book-family expansion

- [x] Add every book-based immediate, descendant, sibling, uncle-line, and distant-relative group to the family input model.
- [x] Present all groups through simple progressive sections without hiding or silently ignoring a relationship.
- [x] Mark extended-relative combinations that require scholar review rather than fabricating an automatic share.
- [x] Extend browser checks and regression tests for the complete family flow.

## Family-selection usability controls

- [x] Add Tamil family search that filters all visible relationship groups.
- [x] Add a reset control for each family section and a separate start-new-calculation action.
- [x] Add a live selected-family side panel that shows counts and permits removal.
- [x] Add a clear exit/back control from the family-selection step.
- [x] Validate search, reset, summary, and exit behavior on mobile and desktop.

## English version

- [x] Add an English/Tamil language switch that preserves the current calculation state.
- [x] Translate every visible flow, family label, helper, result, history, and safety message into clear English.
- [x] Ensure browser history remains local and usable across both language versions.
- [x] Validate the complete English and Tamil experience on desktop and mobile.

## Direct English duplicate

- [x] Compare the Tamil and English routes for every visible screen and action.
- [x] Align any English route feature or layout that differs from the Tamil route.
- [x] Validate that the English route mirrors the Tamil journey while using English text only.

## GitHub, installable app, and Vercel deployment

- [x] Add a web-app manifest, icons, and offline service worker for installability.
- [x] Push the complete project to github.com/irsh00011/Miraasu.
- [x] Deploy the repository to Vercel and verify the production URL.
- [x] Confirm the install prompt requirements and provide user installation steps.

## Book-cover visual update

- [x] Generate a clean app icon inspired by the book cover’s blue, gold, and scales motif.
- [x] Add a subtle, readable book-cover-inspired background to the welcome screens.
- [x] Replace PWA install icons and validate the new visual treatment on desktop and mobile.

## Exact book-cover icon

- [x] Use the supplied book-cover image as the header icon on both language routes.
- [x] Use the supplied book-cover image as the PWA installation icon and favicon.
- [x] Verify the exact book-cover icon is readable in the website header and install metadata.

## Source audit and calculator correction

- [x] Extract the book’s exact share tables, blocking rules, remainder rules, and worked sums into a testable rule matrix.
- [x] Compare every implemented calculation branch to the source matrix and correct any mismatch.
- [x] Add coverage for book rules that can be safely automated and flag the rest as review-only.
- [x] Rebuild the family selector into a calm single-column hierarchy with clear relationship-type headings.
- [x] Add source-based regression tests, sum checks, and Tamil/English responsive browser validation.

## Source-book family structure

- [x] Extract every heir category and relationship group stated in the supplied book.
- [x] Map the book’s hierarchy into Primary Family, Secondary Family, and extended residuary groups.
- [x] Identify which book-based groups are already in the calculator and which remain future work.

## Arabic and simple-grid update

- [x] Add an Arabic route with complete visible translations and right-to-left reading support.
- [x] Add Arabic to the language switch without changing the shared calculation rules or local-only history.
- [x] Replace the dense family-entry experience with a simple staged grid that uses short headings, plain labels, and a visible selected-family check.
- [x] Create a new balance-and-fractions app mark inspired by the supplied book while preserving its supplied cover as the source-book/PWA visual.
- [x] Validate Tamil, English, and Arabic routes on desktop and mobile; then update GitHub and production.

## Complete family search and category repair

- [x] Recheck the supplied book’s full family-member hierarchy against the current input catalogue and make any missing labels visible.
- [x] Repair search so it finds close family, grandparents, siblings, and every book-listed extended relationship in Tamil, English, and Arabic.
- [x] Add simple click-to-open family categories that show only the chosen section while keeping a clear full-family view available.
- [x] Make the supplied book cover more prominent on the introduction screen without reducing reading contrast or changing its PWA role.
- [x] Add browser tests for close-family and extended-family searches, category switching, clear controls, and all language routes.
- [x] Publish the repaired family navigation and provide the final production link.

## ‘Asaba structure and worked examples

- [x] Add the four degree headings for ‘Asaba bi-nafsihi: descendants, ascendants, same-parent/father collaterals, and uncles.
- [x] Add clear ‘Asaba bi-ghayrihi guidance for son/daughter, son’s son/son’s daughter, full siblings, and paternal siblings with the 2:1 ratio.
- [x] Add clear ‘Asaba ma‘a ghayrihi guidance for full and paternal sisters with daughters or son’s daughters taking their fixed share first.
- [x] Add clear worked explanations for one son plus one daughter, three daughters without sons, and equal same-rank male heirs.
- [x] Verify which rules are already automated, expand only source-backed rules, and mark incomplete precedence paths for scholar review.
- [x] Add calculation and browser tests for the added ‘Asaba explanations and publish the verified update.

## Comprehensive multi-heir test

- [x] Run a representative automatic multi-heir estate calculation and reconcile every exact fraction to the full estate.
- [x] Run a variation with a review-only family member to confirm the calculator preserves its scholar-review safeguard.
- [x] Report the calculated shares, cash values, and verification result in simple language.

## Paternal-uncle (عم) update

- [x] Re-audit the supplied source text for the paternal-uncle residue order and blockers.
- [x] Add a clear Arabic, Tamil, and English explanation for full paternal uncle (عم شقيق), consanguine paternal uncle (عم لأب), and their sons.
- [x] Automate only the fully source-verified paternal-uncle residue path; preserve explicit review for any unresolved precedence case.
- [x] Add unit and browser tests for eligible, blocked, and review-only uncle-line scenarios; publish the verified update.

## Multilingual search repair

- [x] Reproduce the reported empty-search behavior after category changes in Tamil, English, and Arabic.
- [x] Ensure search always scans all relationship groups rather than being restricted by the last selected category.
- [x] Add a visible clear-search action and restore the complete family list after clearing a query.
- [x] Add browser regressions for close and extended relationships in Tamil, English, and Arabic; publish the verified repair.

## Photographed Arabic rule-table audit

- [x] Extract every visible condition and fraction from the photographed father, paternal-grandfather, and mother tables without relying on unreadable image assumptions.
- [x] Extract the readable full-sister, paternal-sister, grandmother, father, and paternal-grandfather conditions from the additional photographed tables.
- [x] Compare each photographed rule against the current audited engine and rule matrix; label it as already supported, missing, or scholar-reviewed.
- [x] Implement only clearly verified missing conditions and show their explanations in Tamil, English, and Arabic.
- [x] Add exact-fraction regressions for each automated photographed-table rule and browser checks for the explanatory labels.
- [x] Publish the validated audit update with a simple coverage summary.

## Direct photographed-table inclusion

- [x] Add each readable missing photographed-table relationship and condition directly to the family selector and rule guide.
- [x] Convert complete photographed-table conditions from broad review-only status into automatic calculation paths where corroborated by the supplied book source.
- [x] Limit scholar-review labels to the precise photographed interpretation-difference cases, rather than applying them to an entire family category.

## ‘Asaba structure update

- [x] Add the four degree headings for ‘Asaba bi-nafsihi: descendants, ascendants, same-parent/father collaterals, and uncles.
- [x] Add clear ‘Asaba bi-ghayrihi guidance for son/daughter, son’s son/son’s daughter, full siblings, and paternal siblings with the 2:1 ratio.
- [x] Add clear ‘Asaba ma‘a ghayrihi guidance for full and paternal sisters with daughters or son’s daughters taking the fixed share first.
- [x] Verify which of the above rules are already automated, expand only source-backed rules, and mark incomplete precedence paths for scholar review.
- [x] Add calculation and browser tests for the added ‘Asaba explanations and publish the verified update.

## Follow-up validation gaps

- [x] Rework the family selector into one verified single-column ordered hierarchy with clear relationship-type headings, then capture code and browser-test evidence.
- [x] Add explicit desktop and mobile browser assertions for section reset, selected-family summary interactions, and exit/back controls on all supported language routes.
- [x] Re-run the complete exact-fraction, type, build, and multilingual browser suite after closing these gaps.
- [x] Save and publish the rectified ‘Asabah release only after the full checklist is verified.

## ‘Asabah rectification plan tracking

- [x] Read the supplied book’s ordered ‘Asabah classes and sister conditions.
- [x] Trace the current residue chain and identify missing third- and fourth-degree male-residuary branches.
- [x] Write the senior-level rectification plan in docs/asaba_rectification_plan.md.
- [x] Add source-ordered automatic branches for explicitly modeled solo male residuaries.
- [x] Add exact-fraction regression coverage for the corrected residue order.
- [x] Validate the corrected engine in all visible multilingual flows and publish the rectification.

## Photographed Arabic rule-table audit — rectification

- [x] Reconcile the photographed sibling tables with the source matrix and current engine.
- [x] Document the previously missing paternal-sibling automatic condition and its narrow boundaries.
- [x] Confirm the photographed rule-table audit remains consistent with the complete ‘Asabah residue sequence after the rectification.

## Development recovery note

- [x] Restore dependencies and restart the development server after the unintended template-upgrade conflict.
- [x] Resolve or verify the stale development-console dotenv warning before final release validation.

## Next validation run

- [x] Run exact rule tests, type check, build, and Tamil/English/Arabic browser journeys after the pending selector and control tests are completed.
- [x] Read todo.md in full, confirm all release items are checked, save a final checkpoint, and report the production result.

## Advanced scholar boundary

- [x] Keep unresolved madhhab differences, distant relatives, mixed precedence combinations, and unreadable photographed conditions outside automatic allocation.
- [x] Show selected unresolved relatives explicitly instead of silently omitting them.
- [x] State that production output is an educational aid requiring qualified scholar confirmation for advanced cases.

## Historical task records

- [x] Complete the three-language search repair and verify clear-search restoration.
- [x] Complete the Arabic route, RTL layout, and balance-and-fractions worksheet identity.
- [x] Complete the paternal-uncle (عم) family structure and review safeguards.
- [x] Complete comprehensive multi-heir exact-sum testing.
- [x] Complete photographed-table paternal-sibling 2:1 automation where the source condition is complete.
- [x] Complete the final ‘Asabah rectification release after the remaining validation gaps are closed.

## Release gate reminder

- [x] Do not claim complete book automation until every advanced precedence chain has a source-derived fixture and qualified review.
- [x] Do not save the final release checkpoint until the selector, controls, regression suite, and stale warning are verified.

## User-facing completion summary

- [x] Prepare a simple explanation of why the previous ‘Asabah result could differ and what the corrected sequence now does.
- [x] Provide the final production link only after the rectified release is live and verified.

## Current plan status

- [x] Source extraction and engine diagnosis completed.
- [x] Rectification plan documented.
- [x] First rectification implementation and exact tests completed.
- [x] Final UI/control validation and production publication completed.

## Explicit test scenarios

- [x] Son + daughter residue 2:1.
- [x] Three daughters fixed 2/3 before other eligible shares.
- [x] Equal same-rank full brothers divide residue equally.
- [x] Full brother’s son selected after the full-brother class is absent.
- [x] Solo paternal brother selected after closer residuary classes are absent.
- [x] Solo paternal-brother’s son selected after its closer class is absent.
- [x] Solo full paternal uncle selected after earlier classes are absent.
- [x] Solo consanguine paternal uncle selected after earlier classes are absent.
- [x] Later uncle descendants do not silently allocate in an ambiguous mixed class.
- [x] Combined ‘Asabah case with wife, mother, father, daughter, and a selected third/fourth-degree residuary is validated against the documented precedence sequence.

## Documentation quality

- [x] Update the source rule matrix after the first ‘Asabah rectification.
- [x] Save a dedicated ‘Asabah rectification plan.
- [x] Add final source line references and test names to the release note.
- [x] Keep the production coverage statement narrower than the complete 335-page book claim.

## Regression protection

- [x] Unit suite currently passes after first rectification implementation.
- [x] Type check currently passes after first rectification implementation.
- [x] Production build currently passes after first rectification implementation.
- [x] Add the visible-app regression for the corrected solo paternal-uncle sequence.
- [x] Add visible-app reset/summary/exit assertions for Tamil, English, and Arabic.
- [x] Run production PWA verification after the final rectification checkpoint.

## Final user handoff

- [x] Explain automatic versus scholar-reviewed ‘Asabah cases in short Tamil/English/Arabic-friendly language.
- [x] Attach the final project version checkpoint.
- [x] Provide GitHub and stable production URLs.

## Integrity rule

- [x] Never replace a source gap with a guessed inheritance share.
- [x] Preserve exact fractions until final display.
- [x] Reconcile every automatic result to the full net estate or explicitly show any unallocated/review state.
- [x] Independent qualified scholar review remains recommended before real-world distribution.

## Post-rectification release

- [x] Save checkpoint after all pending items above are genuinely completed.
- [x] Synchronize the post-rectification code and documentation to GitHub main.
- [x] Confirm the final production deployment is ready.
- [x] Deliver the final rectification report.

## Source-audit confidence

- [x] High confidence: estate preparation order, spouse descendant awareness, mother/father/grandfather verified branches, daughter/son’s-daughter fixed shares, maternal sibling equality, and tested sister branches.
- [x] Medium confidence: source-ordered solo paternal brother, brother’s-son, and paternal-uncle fallback branches after explicit nearest-class checks.
- [x] Documented requirement: independent scholar sign-off remains necessary for complete grandfather/sibling madhhab alternatives, all distant-relative chains, complex mixed branches, and any conditions not directly readable in the photographs.

## Final checklist owner note

- [x] Keep the app simple for non-technical users while exposing the rule reason beside every automatic or review outcome.
- [x] Keep Tamil-first ordering and Arabic RTL behavior intact during the rectification.
- [x] Preserve the supplied book cover as source identity and PWA icon.
- [x] Re-run the full release gate after any further rule edit.

## Audit status

- [x] Rectification is not considered complete until every pending release-gate item is validated and checkpointed.
- [x] Add a short user-facing Tamil, English, and Arabic explanation of why an earlier ‘Asabah result could differ and how the nearest-class sequence now resolves it.
- [x] Fix Tamil search so “தந்தையின் சகோதரர்” finds the paternal-uncle entries and add a browser regression.
