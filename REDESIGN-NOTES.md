# Miraasu — Premium Frontend Redesign (Oct 2026)

Complete UI/UX redesign. **Frontend only**: no inheritance formula, share rule,
fraction, total, or monetary amount was changed. The calculation engine
(`client/src/lib/inheritance.ts`) and history store
(`client/src/lib/localHistory.ts`) are byte-identical (hashes verified).

## What changed

**New screens**
- Splash: deep-navy screen, الميراث reveal animation, subtle geometric pattern.
- Onboarding (3 slides, skippable, remembered in localStorage): My Book (original
  book artwork), About Miraasu, Developed in Collaboration With (original
  Bukhari + Crescent logos, cropped from the supplied banner — never redrawn).
- Calculation loader: staged checklist overlay between family step and results.
- Results: navy Total Estate hero, stat chips (Total Heirs / Total Shares / LCM),
  Shares Table ⇄ Visual Chart (animated SVG donut) tabs, View Detailed Results
  expander with the full audit, Save & Share overlay (Save PDF / Share / New /
  View Research).
- Learn & Explore (`/learn`): 6 topic cards (Fractions, LCM, Asabah, Radd, Hajb,
  Quiz) with short articles in Tamil / English / Arabic / Urdu.

**Redesigned screens** (same routes, same copy, same behavior)
- Language + deceased-person selection, estate entry, family selection
  (compact square cards, section titles, blue selected states), share table
  (desktop grid / mobile stacked cards), history, print sheet, book source card.

**Design system**: `client/src/premium.css` — navy #0B2A4F, blue #1559A6,
bright #1769FF, tint #EAF3FF, border #D8E6F7, ink #102B50, muted #64748B.
~200ms micro-interactions, `prefers-reduced-motion` respected throughout.

**Engineering**: the four language pages are now thin wrappers over one shared
`client/src/premium/Calculator.tsx` (identical state/logic, per-language copy in
`client/src/premium/copies.ts`). Routes preserved: `/`, `/ta`, `/en`, `/ar`,
`/ur`, `/research`; added `/learn`. History (localStorage) format unchanged.

**Assets**: `client/public/book-cover.jpg` (original book artwork, optimized),
`client/public/bukhari-logo.png`, `client/public/crescent-logo.png` (original
seals cropped from the supplied collaboration banner). The previous AI-drawn
SVG emblems are no longer referenced.

## Modified / added files
- Added: `client/src/premium.css`, `client/src/premium/` (ui, Splash, Onboarding,
  CalcLoader, ShareDonut, SaveShare, LearnHub, Calculator, copy, copies),
  `client/src/pages/LearnPage.tsx`, `client/public/book-cover.jpg`,
  `client/public/bukhari-logo.png`, `client/public/crescent-logo.png`.
- Rewrote (same props/behavior, new markup): `pages/Entrance.tsx`,
  `pages/{Home,EnglishHome,ArabicHome,UrduHome}.tsx` (now wrappers),
  `components/FamilyList.tsx`, `components/HeirRow.tsx`,
  `components/calc/{AppHeader,StepBar,EstateStep,MoneyField,ShareTable,HistoryView,ResultHero,PrintSheet}.tsx`,
  `components/BookSourceCard.tsx`.
- Edited: `client/src/main.tsx` (premium.css import), `client/index.html`
  (fonts: Inter, Noto Sans Arabic, Noto Nastaliq Urdu; navy splash),
  `client/src/index.css` (Inter-first font stack), `client/src/App.tsx` (`/learn` route).
- Untouched: `client/src/lib/inheritance.ts`, `client/src/lib/localHistory.ts`,
  all tests, all calculation interfaces.

## Install & run
```
npm install
npm run dev      # local dev server
npm test         # 44 tests
npm run build    # production build -> dist/
```

## Test & verification results (10 Oct 2026)
- `npm test`: **44/44 passed** (inheritance 38, LCM audit 4, localHistory 2).
- `tsc --noEmit`: clean (only pre-existing lucide-react .d.ts noise, also
  present on untouched files).
- `npm run build`: success; language routes still code-split.
- Headless browser (mobile 390px + desktop): splash → onboarding (3 slides) →
  language → gender → estate → family → loader → results — zero page errors.
  Verified: hero total, stat chips, share table, donut chart, detailed audit,
  save/share overlay, Learn hub + quiz (5 questions), Arabic RTL, Tamil page.
- Calculation spot-check (wife + father + mother, ₹12,00,000): wife 1/4
  ₹3,00,000 · mother 1/4 ₹3,00,000 (Umariyyatain: 1/3 of remainder) · father
  1/2 ₹6,00,000 · LCM 4 — identical to the engine output before the redesign.

## Notes / limitations
- Google Fonts (Inter / Noto) load from the network; offline, system fonts apply.
- The Learn articles are simplified educational summaries; the app already
  advises scholar review for real distributions.
- PWA install prompt appears only when the browser offers it (unchanged).

## Update — 17 Oct 2026: welcome animation, collaboration page & result UI

**Entrance flow** (all frontend, `client/src/pages/Entrance.tsx`):
- New flow: Splash → **Welcome** (`client/src/premium/Welcome.tsx`) →
  **About Our Collaboration** (`client/src/premium/Collaboration.tsx`) →
  Language → Gender → Calculator.
- Welcome page: both institution logos removed; Miraasu identity carried by
  typography/colour/layout. Staggered fade-up entrance, subtle light sweep
  around the card, one prominent Get Started CTA, `prefers-reduced-motion`
  respected. Renders in English (language is chosen on the next step — same
  convention as the old onboarding).
- Collaboration page: follows the supplied reference — Bukhari Aalim Arabic
  College + BSA Crescent Institute of Science & Technology logos side by side
  with "In Collaboration With", bordered cards, names in English/Tamil/Arabic
  (from the reference), mottos, Continue → language, Back → welcome.
- Removed the old 3-slide `Onboarding.tsx` (superseded; only Entrance used it).
  The `miraasu-onboarded` localStorage key still skips intro pages for
  returning users. Language-page top no longer shows the two logos.
- Copy added to `client/src/premium/copy.ts` in ta/en/ar/ur (collaboration
  strings, `noShareStatus`, detailed-view tab labels).

**Result page** (`Calculator.tsx`, `ShareTable.tsx`, `CalculationTrace.tsx`,
`MethodPanels.tsx`, `premium.css`):
- Estate summary is now a prominent white card: 2px navy border, subtle
  shadow, large bold navy amount (was a navy gradient hero).
- Simple result renders bordered heir cards (blue accents, highlighted amount
  area). Fixed-share heirs show name + percent/LCM chips + amount.
- Taʿṣīb heirs show **name + amount only** — no parts, units or generated
  fractions in the simple result (`ShareTableRow.isAsabah`, derived from the
  engine's `remainder` method; engine untouched).
- No-share heirs render as red-tinted cards: light-red border, name, red
  "No share" status chip (`பங்கு இல்லை` / No share / لا نصيب / حصہ نہیں),
  readable red reason. `CalcCopy.noShareReason` replaced by
  `noShareFixedReason` (ta keeps the engine's own reason).
- Radd: unchanged engine behaviour verified — `aggregateAllocationsForDisplay`
  already combines an heir's components; each heir appears once with the
  combined amount (E2E: mother fixed+Radd = ₹84,000 on one card).
- Detailed view ("View Detailed Results"): the allocation schedule is now
  **LCM | Percentage** tabs. LCM mode highlights the Root LCM badge
  prominently; Taʿṣīb rows show parts only (no generated per-heir fractions).
  The Taʿṣīb ratio line ("male = 2 parts, female = 1 part", previously defined
  but never rendered) now shows with the total remainder parts. Fixed-share
  work, reconciliation, case notes and full trace unchanged.

**Verification (17 Oct 2026)**
- `npm test`: **44/44 passed**.
- `tsc --noEmit`: clean apart from the pre-existing lucide-react .d.ts noise.
- `npm run build`: success.
- Protected files byte-identical: `inheritance.ts`
  `297f2ba4…4621`, `localHistory.ts` `0807307f…7cfd`.
- E2E (`check-results-screen.mjs`, rewritten for the new flow) on mobile 390px
  **and** desktop 1280px — all green, zero page errors: welcome (no logos),
  collaboration (both logos, back/forward), language (no logos, back →
  collaboration), Taʿṣīb case (wife+father+mother+son, ₹12,00,000 → son
  ₹6,50,000 amount-only), no-share case (father + grandfather → 1 red card),
  Radd case (wife+mother+2 daughters, ₹4,80,000 → 3 cards, mother ₹84,000),
  LCM/Percentage tabs, donut chart, save/share, `/ta` `/ar` (RTL) `/ur` loads.
  (Console shows only pre-existing resource noise: analytics-endpoint 404 and
  blocked external font fetches — no JS errors.)
- **Not deployed**: awaiting your "push" per your batch-at-final rule.
