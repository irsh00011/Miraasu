# Design Brainstorm — Islamic Inheritance Calculator

## Three directions considered

### 1. Ledger of Justice
**Very Brief Intro:** A calm, scholarly calculation workspace inspired by carefully ruled account ledgers and illuminated manuscript margins. It makes every decision visible so families and scholars can review the distribution together.  
**Probability:** 0.07

### 2. Family Compass
**Very Brief Intro:** A gentle, step-by-step family guide that uses relationship groups and progressive questions instead of a dense form. It feels reassuring for people who know the family situation but not inheritance terminology.  
**Probability:** 0.04

### 3. Contemporary Legal Console
**Very Brief Intro:** A restrained professional dashboard with dense tabs, formal tables, and a strong audit trail. It prioritizes expert review and scenario comparison over first-time-user guidance.  
**Probability:** 0.09

## Chosen approach — Ledger of Justice

### Design Movement
**Contemporary Islamic editorial design**, combining the legibility of a modern legal worksheet with the quiet geometry, margin structure, and material warmth of archival account books. The interface must communicate responsibility and clarity, never ornament for ornament’s sake.

### Core Principles

1. **Explain before asserting.** Every share, block, remainder, and special rule must show its reason alongside the amount.
2. **Progressive disclosure.** The app asks for only the facts that affect the current scenario, keeping unfamiliar legal terminology behind optional explanations.
3. **Exactness without intimidation.** The calculation engine uses exact fractions; the visual layer turns those results into readable shares, currency amounts, and a clear total check.
4. **Scholar-review readiness.** Results are designed as an auditable worksheet rather than an opaque “answer,” with visible assumptions and selected interpretation.

### Color Philosophy
The primary color is a deep **ink green** that evokes stability, scholarship, and careful record keeping rather than a generic financial dashboard. Warm parchment neutrals soften long reading sessions; muted brass highlights distinguish confirmed values and explainable exceptions. High-contrast charcoal text keeps detailed legal information readable without relying on color alone.

### Layout Paradigm
The core calculator uses a **two-spine ledger layout** rather than a centered card stack. On desktop, the left spine is a narrow, persistent case outline showing estate preparation and completed relationship groups. The right spine is the active question or results worksheet. A bottom reconciliation strip stays visible only after calculation. On mobile, the outline becomes a compact progress drawer and the worksheet remains one focused step at a time.

### Signature Elements

1. **Rule ribbons:** slim vertical labels that identify the rule family behind a share, such as fixed share, residuary, exclusion, or special case.
2. **Fraction seals:** compact, circular fraction markers that connect the exact share to its percentage and monetary value.
3. **Reconciliation line:** a strong ledger-style baseline that visibly confirms distributable estate equals allocated amount plus any reserved amount.

### Interaction Philosophy
Interactions should feel like completing a respected document. Adding an heir opens the next relevant relationship question; an exclusion is never silently removed but appears as a muted entry with an explanation. The user can return to a previous section without losing data. Ambiguous or advanced scenarios pause the calculation and state what needs scholarly confirmation.

### Animation
Use restrained motion only to explain state changes. New worksheet rows fade and slide upward by 8–12px over 180ms; recalculated currency figures cross-fade rather than count aggressively. Rule ribbons unfold at 200ms when an explanatory detail is opened. Use no looping ornamental animation. Respect `prefers-reduced-motion`, where all transitions become nearly instant.

### Typography System
Use **Noto Serif Tamil** for Tamil headings and fractions where warmth and reading comfort matter, paired with **Noto Sans Tamil** for forms, instructions, and tables. English fallbacks use Source Serif 4 and Source Sans 3. The hierarchy follows a measured editorial rhythm: concise serif page titles, strong sans step titles, 16px+ readable body copy, and tabular numerals for amounts. Do not use Inter.

### Brand Essence
**A Tamil-first, explanation-led Islamic inheritance worksheet for families and scholars who need transparent share calculations, not a black-box result.**  
Personality: **trustworthy, clear, considerate**.

### Brand Voice
The voice is direct, calm, and precise. It should explain rules in plain Tamil-first language and never present a complicated legal outcome as casual certainty. Headlines identify the next task; CTAs state the consequence.

Example lines:

> “Prepare the distributable estate before adding heirs.”

> “Show why each person receives a share—or why the rule excludes them.”

### Wordmark & Logo
The brand mark is an **open ledger framed by two balanced geometric arcs**, suggesting documented fairness and shared understanding. The mark contains no text and can sit beside a custom Tamil wordmark derived from the ledger’s measured strokes.

### Signature Brand Color
**Ink Green — `#164A3B`**. It is the dominant anchoring color for actions, rule headings, and the ledger spine.

## Product guardrail

This calculator must always show a visible disclaimer that it is an educational calculation aid based on the supplied source material and does not replace case-specific guidance from a qualified Islamic inheritance scholar or applicable civil-law professional. Advanced cases require an explicit review state rather than an automatic final answer.

## Style Decisions

The user has refined the direction for a non-technical audience. The implementation will keep the **explanation-led worksheet** principle, but replace the prior parchment-and-ink palette with a deliberately simple **white-and-blue** interface. The visual language will use a white background, deep trustworthy blue for actions and headings, pale blue for completed steps and supportive explanations, and dark slate text for readable contrast. Decorative imagery will be avoided; the calculator will prioritize large labels, short Tamil questions, one task per screen area, simple icons, and visible next/back actions. Results will use clean tables and unobtrusive blue status markers rather than dense panels or ornamental motifs.

The white-and-blue direction uses a **deep legal blue** as the signature action color, while pale blue remains only for supportive explanations and completed states. The brand mark is an open ledger with balanced geometric arcs, built without institutional, bank, shield, or courthouse imagery. Every screen displays a concise Tamil-first educational-aid statement that confirms the result needs qualified Islamic inheritance and civil-law review before real distribution.

The smooth-flow update removes nonessential introductory copy. The first screen contains a single short instruction, a privacy reassurance, and a single primary action. Calculator input moves through a compact question sequence with one focus area per view. A separate history screen gives users a calm, local-only record of saved calculations with clear reopen and delete controls. On mobile, the main primary action is fixed near the bottom when useful; on desktop, the same action stays in the natural reading flow.

The family-selector update uses everyday Tamil labels first, then short explanatory phrases only where needed. Small emoji cues are permitted here because the user explicitly asked for an instantly recognisable family guide; every emoji is paired with visible Tamil text so that the experience never relies on symbols alone. A sticky, non-blocking guide will remain alongside the selection area on desktop and at the bottom of the mobile screen, explaining only the relationship group currently being chosen.

The complete-grouping update shows all relationships that the current calculation engine supports without requiring the user to open an additional section. The page begins with **முதன்மை குடும்பம்** (spouse, parents, children) and follows with **மற்ற குடும்பம்** (paternal grandfather, full siblings, and maternal siblings). The names remain simple and visible; the underlying legal relationship categories stay in the calculation rules rather than becoming a burden for the user.

The brand mark remains an open ledger framed by balanced geometric arcs, never a generic book, bank, shield, courthouse, or standard app icon. Deep Legal Blue anchors every primary action, active worksheet heading, and audit marker; pale blue remains reserved for support and completed states. Every major screen repeats the ledger language through ruled structure, progress framing, and a visible explanation or review statement.
