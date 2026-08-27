# Implementation Checklist

- [x] Replace the prior visual direction with a simple white-and-blue, Tamil-first guided worksheet.
- [x] Build exact fraction helpers and estate-preparation calculations.
- [x] Implement the basic heir questionnaire for spouse, parents, children, and siblings.
- [x] Encode the MVP share, blocking, and remainder rules from the supplied guide.
- [x] Create a plain-language results worksheet with share reasons, currency amounts, and a total check.
- [ ] Add clear advanced-case warnings rather than misleading automatic outcomes.
- [x] Test representative calculation paths and mobile layouts.
- [ ] Capture the final visual review, save a checkpoint, and deliver the project.

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
- [ ] Validate search, reset, summary, and exit behavior on mobile and desktop.

## English version

- [x] Add an English/Tamil language switch that preserves the current calculation state.
- [x] Translate every visible flow, family label, helper, result, history, and safety message into clear English.
- [x] Ensure browser history remains local and usable across both language versions.
- [x] Validate the complete English and Tamil experience on desktop and mobile.

## Direct English duplicate

- [x] Compare the Tamil and English routes for every visible screen and action.
- [x] Align any English route feature or layout that differs from the Tamil route.
- [x] Validate that the English route mirrors the Tamil journey while using English text only.

## Source-book family structure

- [ ] Extract every heir category and relationship group stated in the supplied book.
- [ ] Map the book’s hierarchy into Primary Family, Secondary Family, and extended residuary groups.
- [ ] Identify which book-based groups are already in the calculator and which remain future work.
