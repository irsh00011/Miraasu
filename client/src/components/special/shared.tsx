/**
 * Special Methods v4 — shared form + result components used by all 12
 * per-topic calculators. Blue-and-white only; mobile-first.
 *
 * v4 additions (redesign spec §1 + build plan step 3):
 * - SpecialTopBar (back + title + language toggle, NOT sticky)
 * - StepShell (one step open at a time; finished steps collapse to one
 *   line with Edit)
 * - HeirPickerSheet ("Add heir" → bottom sheet with plain names → chosen
 *   list with −/+ steppers; caps: single heirs 1, wives 4, others 20)
 * - AmountRow (amount 28–32 px white on blue, fraction + % small under)
 * - HeldBox, TotalCheckLine (ONE line), RoundingRow, ShowWorking
 *   (collapsible, closed by default), SwipeCards (mobile swipe with dots
 *   / desktop side-by-side), FlagLine, BranchCard, OpinionCard,
 *   Timeline, ChainDrawing, Badge
 * - Language-leak fix (spec problem 3): engine-generated row.note /
 *   summary / scholarReasons are translated here at display time from
 *   ENGINE_TEXT_TRANSLATIONS (content file) + patterns below, or HIDDEN
 *   on Tamil/Arabic screens. The engine itself is never edited.
 *
 * The v2/v3 pieces (HeirPicker wall-of-boxes, StepHeading, ResultTable
 * API, DeathEditor, …) are kept working so the 12 existing topic
 * calculators keep rendering inside the new shell; batches 2–4 rebuild
 * each calculator onto the v4 pieces.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, BookOpen, Calculator, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { ENGINE_TEXT_TRANSLATIONS, SPECIAL_METHODS_PAGE_COPY, type SpecialTopic } from "@/lib/specialMethodsContent";
import { lcmOfRows, rowPercent, type SpecialRow } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { fmt, ss, tScholar, tx3, type Lang } from "./types";
import { HEIR_LABEL, HEIR_META, heirCount } from "./heirMeta";

// ---------------------------------------------------------------------------
// Language-leak fix: translate (or hide) engine-generated English text
// ---------------------------------------------------------------------------

const ENGINE_TEXT_MAP = new Map(ENGINE_TEXT_TRANSLATIONS.map((t) => [t.en, t]));

const HAS_TAMIL = /[\u0B80-\u0BFF]/;
const HAS_ARABIC = /[\u0600-\u06FF]/;

type EnginePattern = {
  re: RegExp;
  build: (m: RegExpMatchArray, lang: Lang) => string;
};

/** Dynamic engine strings (amounts / names / fractions embedded). */
const ENGINE_PATTERNS: EnginePattern[] = [
  {
    // Dhawul Arham summary: "Residue 3/4 goes to branch 1 (degree 1) at 2:1 male:female."
    re: /^Residue (.+) goes to branch (\d+) \(degree (\d+)\) at 2:1 male:female\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `மீதம் ${m[1]} கிளை ${m[2]}க்குச் செல்கிறது (படிநிலை ${m[3]}), ஆண்:பெண் 2:1.`,
        m[0],
        `الباقي ${m[1]} يذهب إلى الفرع ${m[2]} (الدرجة ${m[3]}) بنسبة 2:1 للذكر والأنثى.`,
      ),
  },
  {
    // Grandfather summary: "Hanafi default: grandfather takes the residue; sisters take 0 (blocked)." / "... sisters absent."
    re: /^Hanafi default: grandfather takes the residue; sisters (take 0 \(blocked\)|absent)\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        m[1] === "absent"
          ? "ஹனஃபி முறை: பாட்டன் மீதத்தைப் பெறுகிறார்; சகோதரிகள் இல்லை."
          : "ஹனஃபி முறை: பாட்டன் மீதத்தைப் பெறுகிறார்; சகோதரிகள் 0 (தடுக்கப்பட்டனர்).",
        m[0],
        m[1] === "absent"
          ? "الحنفية: الجد يأخذ الباقي؛ ولا أخوات."
          : "الحنفية: الجد يأخذ الباقي؛ والأخوات 0 (محجوبات).",
      ),
  },
  {
    // Debtor state 3 summary: "Debts paid in full; remainder 5000 divided among the heirs normally."
    re: /^Debts paid in full; remainder ([\d.,]+) divided among the heirs normally\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `கடன்கள் முழுமையாகக் கொடுக்கப்பட்டன; மீதம் ${m[1]} வாரிசுகளுக்கு வழக்கம்போல் பிரிக்கப்படுகிறது.`,
        m[0],
        `سُددت الديون بالكامل؛ والباقي ${m[1]} يُقسَّم بين الورثة بالطريقة المعتادة.`,
      ),
  },
  {
    // Disqualified summary: "2 heir(s) excluded (Son, Daughter); the estate is divided among the remaining heirs."
    re: /^(\d+) heir\(s\) excluded \((.+)\); the estate is divided among the remaining heirs\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `${m[1]} வாரிசு(கள்) நீக்கப்பட்டனர் (${m[2]}); சொத்து மீதமுள்ள வாரிசுகளுக்குப் பிரிக்கப்படுகிறது.`,
        m[0],
        `استُبعد ${m[1]} من الورثة (${m[2]})؛ وتُقسَّم التركة بين الورثة الباقين.`,
      ),
  },
  {
    // Unborn summary: "Pay now 4222.22; hold 3777.78 until the child is born."
    re: /^Pay now ([\d.,]+); hold ([\d.,]+) until the child is born\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `இப்போது கொடுக்க ${m[1]}; பிறப்புவரை நிறுத்தி வைக்க ${m[2]}.`,
        m[0],
        `ادفع الآن ${m[1]}؛ واحجز ${m[2]} حتى يولد الطفل.`,
      ),
  },
  {
    // Missing summary: "Pay now 625; hold 4375 until the person returns or the waiting period ends."
    re: /^Pay now ([\d.,]+); hold ([\d.,]+) until the person returns or the waiting period ends\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `இப்போது கொடுக்க ${m[1]}; அவர் திரும்பும்வரை அல்லது காத்திருப்புக் காலம் முடியும்வரை நிறுத்தி வைக்க ${m[2]}.`,
        m[0],
        `ادفع الآن ${m[1]}؛ واحجز ${m[2]} حتى يعود الشخص أو تنتهي مدة الانتظار.`,
      ),
  },
  {
    // Munasakha summary: "Sequential division over 2 death(s); final totals reconcile exactly to the original estate."
    re: /^Sequential division over (\d+) death\(s\); final totals (reconcile exactly|DO NOT reconcile) to the original estate\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        m[2] === "reconcile exactly"
          ? `${m[1]} மரணங்களாக வரிசையாகப் பிரிக்கப்பட்டது; இறுதித் தொகைகள் அசல் சொத்துடன் சரியாகப் பொருந்துகின்றன.`
          : `${m[1]} மரணங்களாக வரிசையாகப் பிரிக்கப்பட்டது; இறுதித் தொகைகள் அசல் சொத்துடன் பொருந்தவில்லை.`,
        m[0],
        m[2] === "reconcile exactly"
          ? `تقسيم متتابع على ${m[1]} وفيات؛ والمبالغ النهائية تطابق التركة الأصلية تمامًا.`
          : `تقسيم متتابع على ${m[1]} وفيات؛ والمبالغ النهائية لا تطابق التركة الأصلية.`,
      ),
  },
  {
    // Renunciation summary: "First division includes the refuser (1/8 = 525); that share is re-divided among the rest — final total still 4200."
    re: /^First division includes the refuser \((.+) = ([\d.,]+)\); that share is re-divided among the rest — final total still ([\d.,]+)\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `முதல் பிரிவில் மறுப்பவரும் சேர்க்கப்பட்டார் (${m[1]} = ${m[2]}); அந்தப் பங்கு மற்றவர்களுக்கு மீண்டும் பிரிக்கப்பட்டது — இறுதி மொத்தம் இன்னும் ${m[3]}.`,
        m[0],
        `القسمة الأولى تشمل المتنازل (${m[1]} = ${m[2]})؛ وأُعيد تقسيم تلك الحصة بين الباقين — والمجموع النهائي ما زال ${m[3]}.`,
      ),
  },
  {
    // Apostate-heir summary: "wives left Islam and inherit(s) nothing; the estate is divided among the remaining heirs."
    re: /^(.+) left Islam and inherit\(s\) nothing; the estate is divided among the remaining heirs\.$/,
    build: (m, lang) => {
      // m[1] is one or more raw engine keys ("wives" or "wives, sons") — translate each.
      const keyLabel = m[1]
        .split(", ")
        .map((k) => (HEIR_LABEL[k] ? tx3(lang, HEIR_LABEL[k].ta, HEIR_LABEL[k].en, HEIR_LABEL[k].ar) : k))
        .join(", ");
      return tx3(
        lang,
        `${keyLabel} இஸ்லாத்தை விட்டு வெளியேறினார்; வாரிசாக மாட்டார்; சொத்து மீதமுள்ள வாரிசுகளுக்குப் பிரிக்கப்படுகிறது.`,
        m[0],
        `${keyLabel} ارتد عن الإسلام ولا يرث شيئًا؛ وتُقسَّم التركة بين الورثة الباقين.`,
      );
    },
  },
  {
    // Dhawul blocked reason: "Blocked by branch 1: an earlier branch blocks a later branch."
    re: /^Blocked by branch (\d+): an earlier branch blocks a later branch\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `கிளை ${m[1]}ஆல் தடுக்கப்பட்டார்: முந்தைய கிளை பிந்தைய கிளையைத் தடுக்கிறது.`,
        m[0],
        `محجوب بالفرع ${m[1]}: الفرع الأسبق يحجب الفرع اللاحق.`,
      ),
  },
  {
    // Dhawul blocked reason: "Blocked by a nearer degree (degree 1) in the same branch."
    re: /^Blocked by a nearer degree \(degree (\d+)\) in the same branch\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `அதே கிளையில் நெருங்கிய படிநிலையால் (படிநிலை ${m[1]}) தடுக்கப்பட்டார்.`,
        m[0],
        `محجوب بدرجة أقرب (الدرجة ${m[1]}) في الفرع نفسه.`,
      ),
  },
  {
    // Dhawul scholar reason: "No worked example in the book uses branch 2 of the distant relatives; ..."
    re: /^No worked example in the book uses branch (\d+) of the distant relatives; this computation follows the branch-and-degree rule only — scholar confirmation is needed\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `தூரத்து உறவினர்களின் கிளை ${m[1]}ஐப் பயன்படுத்தும் எடுத்துக்காட்டுக் கணக்கு நூலில் இல்லை; இந்தக் கணக்கு கிளை, படிநிலை விதியை மட்டுமே பின்பற்றுகிறது — அறிஞர் உறுதி தேவை.`,
        m[0],
        `لا يوجد مثال محلول في الكتاب يستخدم الفرع ${m[1]} من ذوي الأرحام؛ وهذا الحساب يتبع قاعدة الفرع والدرجة فقط — يلزم تأكيد عالم.`,
      ),
  },
  {
    // Dhawul distant row note: "Branch 1 — children of daughters; degree 1; 2 parts per person (male:female 2:1)."
    re: /^Branch (\d+) — .+; degree (\d+); (2 parts|1 part) per person \(male:female 2:1\)\.$/,
    build: (m, lang) => {
      const branchKey = `dhawulBranch${m[1]}` as "dhawulBranch1" | "dhawulBranch2" | "dhawulBranch3" | "dhawulBranch4";
      const parts =
        m[3] === "2 parts"
          ? tx3(lang, "2 பங்கு", "2 parts", "جزآن")
          : tx3(lang, "1 பங்கு", "1 part", "جزء واحد");
      return tx3(
        lang,
        `கிளை ${m[1]} (${ss(branchKey, lang)}); படிநிலை ${m[2]}; ஒருவருக்கு ${parts} (ஆண்:பெண் 2:1).`,
        m[0],
        `الفرع ${m[1]} (${ss(branchKey, lang)})؛ الدرجة ${m[2]}؛ ${parts} لكل شخص (للذكر والأنثى 2:1).`,
      );
    },
  },
  {
    // Debtor pro-rata row note: "Pro-rata: 7/15 of the estate."
    re: /^Pro-rata: (.+) of the estate\.$/,
    build: (m, lang) =>
      tx3(lang, `விகிதப்படி: சொத்தில் ${m[1]}.`, m[0], `بالتناسب: ${m[1]} من التركة.`),
  },
  {
    // Sahih/Fasid unmatched-chain note: "... it is classified by the book's stated rule (category 2) — scholar confirmation is needed."
    re: /^This exact chain is not literally listed among the book's 8 example chains; it is classified by the book's stated rule \(category (\d+)\) — scholar confirmation is needed\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `இந்தத் தொடர்புச் சங்கிலி நூலின் 8 எடுத்துக்காட்டுச் சங்கிலிகளில் நேரடியாக இல்லை; நூலின் விதிப்படி வகைப்படுத்தப்பட்டுள்ளது (வகை ${m[1]}) — அறிஞர் உறுதி தேவை.`,
        m[0],
        `هذه السلسلة بالذات ليست مذكورة حرفيًا بين سلاسل الكتاب الثماني المثال؛ وقد صُنفت بحسب قاعدة الكتاب (الفئة ${m[1]}) — يلزم تأكيد عالم.`,
      ),
  },
  {
    // Munasakha scholar reason: "Death 2 (Asma): the engine flags this heir combination for scholar review."
    re: /^Death (\d+) \((.+)\): the engine flags this heir combination for scholar review\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `மரணம் ${m[1]} (${m[2]}): இந்த வாரிசு அமைப்புக்கு அறிஞர் உறுதி தேவை என்று கணக்கீட்டாளர் குறிக்கிறது.`,
        m[0],
        `الوفاة ${m[1]} (${m[2]}): تشير الحاسبة إلى أن هذه المجموعة من الورثة تحتاج إلى مراجعة عالم.`,
      ),
  },
  {
    // Munasakha scholar reason: "Death 2 (Asma): the book's case-269 rule was applied — ..."
    re: /^Death (\d+) \((.+)\): the book's case-269 rule was applied — a paternal brother takes the residue as Asabah where the engine would have returned it by Radd\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `மரணம் ${m[1]} (${m[2]}): நூலின் கணக்கு 269 விதி பயன்படுத்தப்பட்டது — தந்தை வழிச் சகோதரர் மீதத்தை அஸபாவாகப் பெறுகிறார்.`,
        m[0],
        `الوفاة ${m[1]} (${m[2]}): طُبقت قاعدة المسألة 269 من الكتاب — الأخ لأب يأخذ الباقي كعاصب.`,
      ),
  },
  {
    // MissingCalc thrown error: "Missing count (2) must be between 1 and the entered count (1) for sons."
    re: /^Missing count \((\d+)\) must be between 1 and the entered count \((\d+)\) for (.+)\.$/,
    build: (m, lang) => {
      const keyLabel = HEIR_LABEL[m[3]] ? tx3(lang, HEIR_LABEL[m[3]].ta, HEIR_LABEL[m[3]].en, HEIR_LABEL[m[3]].ar) : m[3];
      return tx3(
        lang,
        `காணாமல் போனவர் எண்ணிக்கை (${m[1]}) 1-க்கும் உள்ளிட்ட எண்ணிக்கை (${m[2]})-க்கும் இடையில் இருக்க வேண்டும் (${keyLabel}).`,
        m[0],
        `يجب أن يكون عدد المفقودين (${m[1]}) بين 1 والعدد المدخل (${m[2]}) لـ (${keyLabel}).`,
      );
    },
  },
  {
    // Thrown error: "Name count mismatch for Wife: 2 name(s) given but the heir count is 1."
    re: /^Name count mismatch for (.+): (\d+) name\(s\) given but the heir count is (\d+)\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `${m[1]} பெயர் எண்ணிக்கை பொருந்தவில்லை: ${m[2]} பெயர்(கள்) கொடுக்கப்பட்டன, ஆனால் வாரிசு எண்ணிக்கை ${m[3]}.`,
        m[0],
        `عدد الأسماء غير مطابق لـ ${m[1]}: أُعطي ${m[2]} اسمًا، لكن عدد الورثة ${m[3]}.`,
      ),
  },
  {
    // Renunciation thrown error: "The refusing heir (wives) receives no share in the first division."
    re: /^The refusing heir \((.+)\) receives no share in the first division\.$/,
    build: (m, lang) => {
      const keyLabel = HEIR_LABEL[m[1]] ? tx3(lang, HEIR_LABEL[m[1]].ta, HEIR_LABEL[m[1]].en, HEIR_LABEL[m[1]].ar) : m[1];
      return tx3(
        lang,
        `மறுக்கும் வாரிசு (${keyLabel}) முதல் பிரிவில் பங்கு பெறவில்லை.`,
        m[0],
        `الوارث المتنازل (${keyLabel}) لا يحصل على حصة في القسمة الأولى.`,
      );
    },
  },
  {
    // Munasakha thrown error: "Asma received nothing in the earlier deaths, so there is no estate of theirs to divide."
    re: /^(.+) received nothing in the earlier deaths, so there is no estate of theirs to divide\.$/,
    build: (m, lang) =>
      tx3(
        lang,
        `${m[1]} முந்தைய மரணங்களில் எதுவும் பெறவில்லை; எனவே அவரது சொத்து என்று பிரிக்க எதுவும் இல்லை.`,
        m[0],
        `${m[1]} لم يحصل على شيء في الوفيات السابقة، فلا توجد تركة له لتُقسَّم.`,
      ),
  },
];

/**
 * Translate one engine-generated English string for a Tamil/Arabic screen.
 * Returns the translated string, the original (English screens, or text
 * already in the display language), or null when it cannot be translated —
 * callers HIDE null on Tamil/Arabic screens instead of leaking English.
 * Display-only: no calculation is touched.
 */
export function translateEngineText(text: string, lang: Lang): string | null {
  if (lang === "en") return text;
  const exact = ENGINE_TEXT_MAP.get(text);
  if (exact) return lang === "ta" ? exact.ta : exact.ar;
  for (const p of ENGINE_PATTERNS) {
    const m = text.match(p.re);
    if (m) return p.build(m, lang);
  }
  if (HAS_TAMIL.test(text)) return lang === "ta" ? text : null;
  if (HAS_ARABIC.test(text)) return lang === "ar" ? text : null;
  return null;
}

// ---------------------------------------------------------------------------
// Form primitives (v2/v3 — kept for the existing topic calculators)
// ---------------------------------------------------------------------------

export function StepHeading({ n, title, help }: { n: number; title: string; help?: string }) {
  return (
    <div className="ms-special-step">
      <h3 className="ms-special-step-title">
        <span className="ms-special-step-num" aria-hidden="true">{n}</span> {title}
      </h3>
      {help ? <p className="ms-special-step-help">{help}</p> : null}
    </div>
  );
}

export function MoneyField({
  id,
  label,
  value,
  onChange,
  min = 0,
  help,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  help?: string;
}) {
  return (
    <label className="ms-special-field" htmlFor={id}>
      <span className="ms-special-field-label">{label}</span>
      {help ? <span className="ms-special-field-help">{help}</span> : null}
      <span className="ms-special-money-wrap">
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step="any"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="ms-special-input"
        />
      </span>
    </label>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  max = 20,
  min = 0,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
}) {
  return (
    <div className="ms-special-stepper">
      <span className="ms-special-stepper-label">{label}</span>
      <span className="ms-special-stepper-controls">
        <button type="button" aria-label={`${label} −`} disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="ms-special-step-btn">−</button>
        <span className="ms-special-step-value" aria-live="polite">{value}</span>
        <button type="button" aria-label={`${label} +`} disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="ms-special-step-btn">+</button>
      </span>
    </div>
  );
}

export type NamesMap = Partial<Record<string, string[]>>;

function defaultName(key: string, index: number, count: number, lang: Lang): string {
  const label = lang === "ta" ? HEIR_LABEL[key]?.ta ?? key : lang === "ar" ? HEIR_LABEL[key]?.ar ?? key : HEIR_LABEL[key]?.en ?? key;
  return count > 1 ? `${label} ${index + 1}` : label;
}

/** Resize a names array to a count, filling new slots with defaults. */
export function sizedNames(prev: string[] | undefined, key: string, count: number, lang: Lang): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(prev?.[i] ?? defaultName(key, i, count, lang));
  return out;
}

export function HeirPicker({
  heirs,
  onChange,
  keys,
  lang,
  names,
  onNamesChange,
}: {
  heirs: HeirInput;
  onChange: (next: HeirInput) => void;
  keys: (keyof HeirInput)[];
  lang: Lang;
  names?: NamesMap;
  onNamesChange?: (next: NamesMap) => void;
}) {
  const setCount = (key: keyof HeirInput, count: number) => {
    const next = { ...heirs, [key]: count } as HeirInput;
    onChange(next);
    if (onNamesChange && names) {
      const nextNames: NamesMap = { ...names };
      if (count > 0) nextNames[key] = sizedNames(names[key], String(key), count, lang);
      else delete nextNames[key];
      onNamesChange(nextNames);
    }
  };
  return (
    <fieldset className="ms-special-heirs">
      <legend className="ms-special-field-label">{tx3(lang, "வாரிசுகள்", "Heirs", "الورثة")}</legend>
      <div className="ms-special-heir-grid">
        {keys.map((key) => {
          const meta = HEIR_META.find((m) => m.key === key);
          if (!meta) return null;
          const count = heirCount(heirs, key);
          const label = tx3(lang, meta.ta, meta.en, meta.ar);
          if (meta.single) {
            const on = count > 0;
            return (
              <div key={key} className="ms-special-heir-row">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCount(key, on ? 0 : 1)}
                  className={`ms-special-single ${on ? "is-on" : ""}`}
                >
                  {label}
                </button>
                {onNamesChange && names && on ? (
                  <input
                    type="text"
                    aria-label={tx3(lang, "பெயர்", "Name", "الاسم")}
                    value={names[key]?.[0] ?? defaultName(String(key), 0, 1, lang)}
                    onChange={(e) => onNamesChange({ ...names, [key]: [e.target.value] })}
                    className="ms-special-input ms-special-name-input"
                  />
                ) : null}
              </div>
            );
          }
          return (
            <div key={key} className="ms-special-heir-row">
              <Stepper label={label} value={count} onChange={(v) => setCount(key, v)} max={key === "wives" ? 4 : 20} />
              {onNamesChange && names && count > 0 ? (
                <div className="ms-special-names">
                  {sizedNames(names[key], String(key), count, lang).map((nm, i) => (
                    <input
                      key={i}
                      type="text"
                      aria-label={`${label} ${i + 1}`}
                      value={nm}
                      onChange={(e) => {
                        const arr = sizedNames(names[key], String(key), count, lang);
                        arr[i] = e.target.value;
                        onNamesChange({ ...names, [key]: arr });
                      }}
                      className="ms-special-input ms-special-name-input"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Display label for a result row: heir keys translate; names/creditors pass through. */
export function rowLabel(row: SpecialRow, lang: Lang): string {
  const known = HEIR_LABEL[row.key];
  if (known) return tx3(lang, known.ta, known.en, known.ar);
  if (row.key === "__held__") {
    // A held row may carry its own specific label (e.g. "Held until the
    // sex is known", "Unborn child (held)") — show it when it translates
    // (English shows it as-is); otherwise the generic held label.
    if (lang === "en") return row.label;
    const translated = translateEngineText(row.label, lang);
    if (translated !== null) return translated;
    return tx3(lang, "நிறுத்தி வைக்கப்பட்டது / ஒதுக்கப்படாதது", "Held / unallocated", "محجوز / غير موزَّع");
  }
  if (row.key === "bayt-al-mal")
    return tx3(lang, "பைத்துல் மால் (பொதுக் கருவூலம்)", "Bayt al-Mal (public treasury)", "بيت المال");
  // Engine-produced labels (e.g. "Khuntha heir", "Held until the sex is
  // known") translate via the dictionary; user-entered names (creditors,
  // distant relatives, deceased names) pass through unchanged — they are
  // the user's own input, not app strings.
  if (lang !== "en") {
    const translated = translateEngineText(row.label, lang);
    if (translated !== null) return translated;
  }
  return row.label;
}

const rowCount = (row: SpecialRow): string => (row.count > 1 ? ` × ${row.count}` : "");

// ---------------------------------------------------------------------------
// v4 shared pieces (redesign spec §1)
// ---------------------------------------------------------------------------

/** Top bar: back arrow + title + language toggle. NOT sticky (fix 9). */
export function SpecialTopBar({
  title,
  lang,
  onLangChange,
  backHref,
  backLabel,
}: {
  title: string;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <div className="ms4-topbar">
      <Link href={backHref} className="ms4-topbar-back" aria-label={backLabel ?? ss("backToAllMethods", lang)}>
        <ArrowLeft size={17} aria-hidden="true" />{" "}
        <span className="ms4-topbar-back-label">{backLabel ?? ss("backToAllMethods", lang)}</span>
      </Link>
      <span className="ms4-topbar-title">{title}</span>
      <div className="ms4-topbar-lang" role="group" aria-label={tx3(lang, "மொழியை மாற்றுக", "Change language", "تغيير اللغة")}>
        {(["ta", "en", "ar"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={lang === l} onClick={() => onLangChange(l)} className={lang === l ? "is-on" : ""}>
            {l === "ta" ? "தமிழ்" : l === "en" ? "English" : "العربية"}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Step shell: one step open at a time (the parent holds the open step).
 * A finished step collapses to one summary line with an Edit link.
 */
export function StepShell({
  n,
  title,
  summary,
  open,
  onOpen,
  error,
  lang,
  children,
}: {
  n: number;
  title: string;
  /** One-line summary of a finished step; omit while the step is undone. */
  summary?: string | null;
  open: boolean;
  onOpen: () => void;
  error?: string | null;
  lang: Lang;
  children: ReactNode;
}) {
  if (!open) {
    if (!summary) {
      return (
        <section className="ms4-step" aria-label={`${n}. ${title}`}>
          <button type="button" className="ms4-step-head ms4-step-head-btn" onClick={onOpen}>
            <span className="ms4-step-num" aria-hidden="true">{n}</span>
            <span className="ms4-step-title">{title}</span>
          </button>
        </section>
      );
    }
    return (
      <section className="ms4-step" aria-label={`${n}. ${title}`}>
        <div className="ms4-step-head">
          <span className="ms4-step-num" aria-hidden="true">{n}</span>
          <span className="ms4-step-summary">{summary}</span>
          <button type="button" className="ms4-step-edit" onClick={onOpen}>
            {ss("edit", lang)}
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="ms4-step is-open" aria-label={`${n}. ${title}`}>
      <div className="ms4-step-head">
        <span className="ms4-step-num" aria-hidden="true">{n}</span>
        <h3 className="ms4-step-title">{title}</h3>
      </div>
      <div className="ms4-step-body">{children}</div>
      {error ? <p className="ms4-step-error" role="alert">{error}</p> : null}
    </section>
  );
}

export type SheetExtraOption = {
  id: string;
  ta: string;
  en: string;
  ar: string;
  onPick: () => void;
};

/**
 * Bottom-sheet heir picker (fix 5): "Add heir" opens a bottom sheet
 * (mobile) / dropdown panel (desktop) listing plain relationship names
 * only. Tapping a name adds it to the chosen list below, each row with a
 * −/+ stepper (caps: single heirs 1, wives 4, others 20) and a remove ×.
 * Selected state IS the list — no filled/unfilled confusion.
 */
export function HeirPickerSheet({
  heirs,
  onChange,
  keys,
  lang,
  names,
  onNamesChange,
  extraOptions,
}: {
  heirs: HeirInput;
  onChange: (next: HeirInput) => void;
  keys: (keyof HeirInput)[];
  lang: Lang;
  names?: NamesMap;
  onNamesChange?: (next: NamesMap) => void;
  extraOptions?: SheetExtraOption[];
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);
  const setCount = (key: keyof HeirInput, count: number) => {
    const next = { ...heirs, [key]: count } as HeirInput;
    onChange(next);
    if (onNamesChange && names) {
      const nextNames: NamesMap = { ...names };
      if (count > 0) nextNames[key] = sizedNames(names[key], String(key), count, lang);
      else delete nextNames[key];
      onNamesChange(nextNames);
    }
  };
  const chosen = keys.filter((k) => heirCount(heirs, k) > 0);
  const closeLabel = tx3(lang, "மூடுக", "Close", "إغلاق");
  return (
    <div className="ms4-picker-wrap">
      <button type="button" className="ms4-add-heir-btn" onClick={() => setOpen(true)} aria-expanded={open}>
        <Plus size={15} aria-hidden="true" /> {ss("addHeir", lang)}
      </button>
      {chosen.length > 0 ? (
        <div className="ms4-chosen-list">
          {chosen.map((key) => {
            const meta = HEIR_META.find((m) => m.key === key);
            if (!meta) return null;
            const count = heirCount(heirs, key);
            const label = tx3(lang, meta.ta, meta.en, meta.ar);
            return (
              <div key={key} className="ms4-chosen-row">
                <span className="ms4-chosen-stepper">
                  <Stepper
                    label={label}
                    value={count}
                    onChange={(v) => setCount(key, v)}
                    max={meta.single ? 1 : key === "wives" ? 4 : 20}
                    min={0}
                  />
                </span>
                {onNamesChange && names && count > 0 ? (
                  <span className="ms-special-names">
                    {sizedNames(names[key], String(key), count, lang).map((nm, i) => (
                      <input
                        key={i}
                        type="text"
                        aria-label={`${label} ${i + 1}`}
                        value={nm}
                        onChange={(e) => {
                          const arr = sizedNames(names[key], String(key), count, lang);
                          arr[i] = e.target.value;
                          onNamesChange({ ...names, [key]: arr });
                        }}
                        className="ms-special-input ms-special-name-input"
                      />
                    ))}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="ms4-chosen-remove"
                  aria-label={`${tx3(lang, "நீக்குக", "Remove", "احذف")} ${label}`}
                  onClick={() => setCount(key, 0)}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
      {open ? (
        <>
          <div className="ms4-sheet-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="ms4-sheet" role="dialog" aria-modal="true" aria-label={ss("addHeir", lang)}>
            <h4 className="ms4-sheet-title">{ss("addHeir", lang)}</h4>
            <div className="ms4-sheet-list">
              {extraOptions?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="ms4-sheet-item"
                  onClick={() => {
                    opt.onPick();
                  }}
                >
                  {tx3(lang, opt.ta, opt.en, opt.ar)}
                </button>
              ))}
              {keys.map((key) => {
                const meta = HEIR_META.find((m) => m.key === key);
                if (!meta) return null;
                const count = heirCount(heirs, key);
                const cap = meta.single ? 1 : key === "wives" ? 4 : 20;
                return (
                  <button
                    key={key}
                    type="button"
                    className="ms4-sheet-item"
                    disabled={count >= cap}
                    onClick={() => setCount(key, Math.min(cap, count + 1))}
                  >
                    {tx3(lang, meta.ta, meta.en, meta.ar)}
                    {count > 0 ? ` × ${count}` : ""}
                  </button>
                );
              })}
            </div>
            <button type="button" className="ms4-sheet-close" onClick={() => setOpen(false)}>
              {closeLabel}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Amount row: the amount is the largest text (28–32 px, white on blue). */
export function AmountRow({
  label,
  amount,
  fraction,
  percent,
  note,
  lang,
}: {
  label: string;
  amount: number;
  fraction?: string;
  percent?: number;
  note?: string;
  lang: Lang;
}) {
  const translatedNote = note ? translateEngineText(note, lang) : null;
  const sub = [fraction, percent !== undefined ? `${percent.toFixed(2)}%` : null].filter(Boolean).join(" · ");
  return (
    <div className="ms4-amount-row">
      <div className="ms4-amount-row-name">{label}</div>
      <div className="ms4-amount-row-amount">₹{fmt(amount)}</div>
      {sub ? <div className="ms4-amount-row-sub">{sub}</div> : null}
      {translatedNote ? <p className="ms4-row-note">{translatedNote}</p> : null}
    </div>
  );
}

/** Held / reserved box — only when the method needs one. */
export function HeldBox({ label, amount, lang }: { label?: string; amount: number; lang: Lang }) {
  return (
    <div className="ms4-held-box">
      <div className="ms4-held-box-label">{label ?? ss("held", lang)}</div>
      <div className="ms4-held-box-amount">₹{fmt(amount)}</div>
    </div>
  );
}

/** Total check — ONE line per result table (fix 4). */
export function TotalCheckLine({ total, lang, ok = true }: { total: number; lang: Lang; ok?: boolean }) {
  if (ok) {
    return (
      <p className="ms4-total-check" role="status">
        {ss("totalCheck", lang, { x: fmt(total) })}
      </p>
    );
  }
  return (
    <p className="ms4-total-check is-bad" role="status">
      {tx3(
        lang,
        `⚠ மொத்தம் ₹${fmt(total)} — சொத்துடன் பொருந்தவில்லை.`,
        `⚠ Total ₹${fmt(total)} — does not match the estate.`,
        `⚠ المجموع ₹${fmt(total)} — لا يطابق التركة.`,
      )}
    </p>
  );
}

/**
 * Plain total line for a partial table (e.g. the re-division of one refused
 * share): its sum is NOT the estate, so it must never claim "matches the
 * estate exactly".
 */
export function TotalLine({ total, lang }: { total: number; lang: Lang }) {
  return (
    <p className="ms4-total-check" role="status">
      {tx3(lang, `மொத்தம் ₹${fmt(total)}`, `Total ₹${fmt(total)}`, `المجموع ₹${fmt(total)}`)}
    </p>
  );
}

/** Rounding row — visible only when rounding happened. */
export function RoundingRow({
  label,
  amount,
  bookAmount,
  lang,
}: {
  label: string;
  amount: number;
  bookAmount: number;
  lang: Lang;
}) {
  return (
    <p className="ms4-rounding-row">
      <strong>{ss("rounding", lang)}</strong> — {label} ₹{fmt(amount)} —{" "}
      {tx3(
        lang,
        `நூல் ₹${fmt(bookAmount)} என்று அச்சிடுகிறது.`,
        `the book prints ₹${fmt(bookAmount)}.`,
        `الكتاب يطبع ₹${fmt(bookAmount)}.`,
      )}
    </p>
  );
}

/** "Show working" collapsible — LCM, formulas, step-by-step. Closed by default. */
export function ShowWorking({ lang, lcm, children }: { lang: Lang; lcm?: number; children: ReactNode }) {
  return (
    <details className="ms4-show-working">
      <summary>{ss("showWorking", lang)}</summary>
      {lcm !== undefined && lcm > 1 ? (
        <p className="ms4-lcm">
          {tx3(lang, "பொது மடங்கு: ", "Common base (LCM): ", "المضاعف المشترك الأصغر: ")}
          {lcm}
        </p>
      ) : null}
      {children}
    </details>
  );
}

/**
 * Swipeable cards: mobile swipe with page dots; side-by-side on desktop.
 * Each card: { title, content }.
 */
export function SwipeCards({
  cards,
  lang,
}: {
  cards: { title: string; content: ReactNode }[];
  lang: Lang;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".ms4-swipe-card");
    if (!card) return;
    const step = card.offsetWidth + 12;
    if (step > 0) setActive(Math.min(cards.length - 1, Math.max(0, Math.round(Math.abs(el.scrollLeft) / step))));
  };
  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>(".ms4-swipe-card")[i];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      setActive(i);
    }
  };
  return (
    <div>
      <div className="ms4-swipe" ref={trackRef} onScroll={onScroll}>
        {cards.map((c, i) => (
          <article key={i} className={`ms4-swipe-card ${i === active ? "is-active" : ""}`}>
            <h4 className="ms4-swipe-card-title">{c.title}</h4>
            {c.content}
          </article>
        ))}
      </div>
      {cards.length > 1 ? (
        <div className="ms4-dots" role="tablist" aria-label={tx3(lang, "அட்டைகள்", "Cards", "البطاقات")}>
          {cards.map((c, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${i + 1} / ${cards.length}`}
              className={`ms4-dot ${i === active ? "is-on" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** One-line flag, placed where it applies (fix 2) — never above the inputs. */
export function FlagLine({ text, lang }: { text: string; lang: Lang }) {
  const shown = translateEngineText(text, lang);
  if (shown === null) return null;
  return (
    <p className="ms4-flag" role="note">
      {shown}
    </p>
  );
}

/** Dhawul Arham branch card: one tap selects. */
export function BranchCard({
  title,
  sub,
  selected,
  onSelect,
  flag,
  lang,
}: {
  title: string;
  sub?: string;
  selected: boolean;
  onSelect: () => void;
  flag?: string | null;
  lang: Lang;
}) {
  const shownFlag = flag ? translateEngineText(flag, lang) : null;
  return (
    <button type="button" className={`ms4-branch-card ${selected ? "is-selected" : ""}`} aria-pressed={selected} onClick={onSelect}>
      <span className="ms4-branch-card-title">{title}</span>
      {sub ? <span className="ms4-branch-card-sub">{sub}</span> : null}
      {shownFlag ? <span className="ms4-branch-flag">{shownFlag}</span> : null}
    </button>
  );
}

/** Opinion card: equal weight with its siblings, no "recommended" tag. */
export function OpinionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="ms4-opinion-card">
      <h4 className="ms4-opinion-title">{title}</h4>
      {children}
    </article>
  );
}

/** Stage timeline (Munasakha / Simultaneous): numbered dots + connecting line. */
export function Timeline({ items }: { items: { summary: ReactNode }[] }) {
  return (
    <ol className="ms4-timeline">
      {items.map((item, i) => (
        <li key={i} className="ms4-timeline-item">
          <span className="ms4-timeline-dot" aria-hidden="true">{i + 1}</span>
          <div className="ms4-timeline-body">
            <div className="ms4-timeline-summary">{item.summary}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Chain drawing (Sahih / Fasid): links from the deceased upward. */
export function ChainDrawing({ links }: { links: string[] }) {
  return (
    <div className="ms4-chain" aria-label={links.join(" → ")}>
      {links.map((link, i) => (
        <span key={i} style={{ display: "contents" }}>
          <span className="ms4-chain-link">{link}</span>
          {i < links.length - 1 ? <span className="ms4-chain-arrow" aria-hidden="true">↓</span> : null}
        </span>
      ))}
    </div>
  );
}

/** Result badge: Ṣaḥīḥ (blue filled) or Fāsid (white, blue border). */
export function Badge({ kind, lang }: { kind: "sahih" | "fasid"; lang: Lang }) {
  return (
    <span className={`ms4-badge ${kind === "sahih" ? "is-sound" : "is-broken"}`}>
      {kind === "sahih" ? ss("sahihBadgeSound", lang) : ss("sahihBadgeBroken", lang)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Result display (v4: amount cards + held box + red no-share card +
// one total-check line + "Show working"; same props as v3)
// ---------------------------------------------------------------------------

export function ResultTable({
  rows,
  lang,
  title,
  total,
  estate,
  verifyTotal,
  showDetails = true,
}: {
  rows: SpecialRow[];
  lang: Lang;
  title?: string;
  total?: number;
  /** Estate this table divides (for the step-by-step detail lines). */
  estate?: number;
  /** When set, the footer verifies rows sum exactly to this amount. */
  verifyTotal?: number;
  showDetails?: boolean;
}) {
  const shown = rows.filter((r) => r.amount > 0 || r.count > 0);
  const sum = total ?? rows.reduce((s, r) => s + r.amount, 0);
  const lcm = lcmOfRows(rows);
  const verified =
    verifyTotal !== undefined ? Math.abs(sum - verifyTotal) < 0.005 : null;
  // Spec §1 result order: amounts large → held box → red no-share card →
  // total check (ONE line) → rounding row (separate component) → "Show
  // working" (closed by default).
  const positives = shown.filter((r) => r.amount > 0 && r.key !== "__held__");
  const held = shown.filter((r) => r.key === "__held__");
  const zero = shown.filter((r) => r.amount === 0 && r.key !== "__held__");
  return (
    <div className="ms4-results">
      {title ? <h4 className="ms4-results-title">{title}</h4> : null}
      <div className="ms4-result-list">
        {positives.map((row) => (
          <AmountRow
            key={`${row.key}-${row.label}`}
            label={`${rowLabel(row, lang)}${rowCount(row)}`}
            amount={row.amount}
            fraction={row.fraction}
            percent={rowPercent(row)}
            note={row.note}
            lang={lang}
          />
        ))}
        {held.map((row) => (
          <HeldBox
            key={`${row.key}-${row.label}`}
            label={rowLabel(row, lang)}
            amount={row.amount}
            lang={lang}
          />
        ))}
        {zero.map((row) => {
          const reason = row.note ? translateEngineText(row.note, lang) : null;
          return (
            <div key={`${row.key}-${row.label}`} className="ms4-noshare-card">
              <div className="ms4-noshare-card-name">
                {rowLabel(row, lang)}
                {rowCount(row)}
                <span className="ms4-noshare-tag">{ss("noShare", lang)}</span>
              </div>
              {reason ? <p className="ms4-noshare-card-reason">{reason}</p> : null}
            </div>
          );
        })}
      </div>
      {verifyTotal !== undefined ? (
        <TotalCheckLine total={sum} lang={lang} ok={verified ?? true} />
      ) : (
        <TotalLine total={sum} lang={lang} />
      )}
      {showDetails && estate !== undefined && shown.length > 0 ? (
        <ShowWorking lang={lang} lcm={lcm}>
          <ol className="ms4-show-working-list">
            {shown.map((row) => (
              <li key={`d-${row.key}-${row.label}`}>
                {rowLabel(row, lang)}
                {rowCount(row)}: {row.fraction} × ₹{fmt(estate)} = ₹{fmt(row.amount)}
                {` (${rowPercent(row).toFixed(2)}%)`}
              </li>
            ))}
          </ol>
        </ShowWorking>
      ) : null}
    </div>
  );
}

/**
 * Final-answer line. Engine summaries are single-language English, so a
 * string child is translated (or hidden on Tamil/Arabic screens when it
 * cannot be translated). Pass lang={lang} — without it the text renders
 * as-is, as before.
 */
export function FinalAnswer({ children, lang }: { children: ReactNode; lang?: Lang }) {
  if (typeof children === "string" && lang && lang !== "en") {
    const translated = translateEngineText(children, lang);
    if (translated === null) return null;
    return <p className="ms-special-final">{translated}</p>;
  }
  return <p className="ms-special-final">{children}</p>;
}

export function ScholarBanner({ topic, lang }: { topic: SpecialTopic; lang: Lang }) {
  if (!topic.scholarFlag.needed) return null;
  return (
    <div className="ms-special-scholar" role="note">
      <p className="ms-special-scholar-title">
        {tx3(lang, "அறிஞர் உறுதி தேவை", "Scholar confirmation needed", "يلزم تأكيد عالم")}
      </p>
      <p>{tScholar(topic, lang)}</p>
    </div>
  );
}

export function CalcError({ message, lang }: { message: string | null; lang: Lang }) {
  if (!message) return null;
  // Validation messages are already in the current language; engine error
  // strings translate via the dictionary, or fall back to a generic line
  // so no English leaks onto a Tamil/Arabic screen.
  const shown = translateEngineText(message, lang);
  return (
    <p className="ms-special-error" role="alert">
      {shown ?? tx3(lang, "கணக்கிட முடியவில்லை.", "Could not calculate.", "تعذّر الحساب.")}
    </p>
  );
}

export function ResultNotes({
  notes,
  scholarReasons,
  lang,
}: {
  notes: string[];
  scholarReasons: string[];
  lang: Lang;
}) {
  const shownNotes = notes
    .map((n) => translateEngineText(n, lang))
    .filter((n): n is string => n !== null);
  const shownReasons = scholarReasons
    .map((n) => translateEngineText(n, lang))
    .filter((n): n is string => n !== null);
  if (shownNotes.length === 0 && shownReasons.length === 0) return null;
  return (
    <div className="ms4-notes">
      {shownNotes.map((n, i) => (
        <p key={`n${i}`}>{n}</p>
      ))}
      {shownReasons.map((n, i) => (
        <p key={`s${i}`} className="is-flag">
          {tx3(lang, "கவனிக்க: ", "Note: ", "ملاحظة: ")}
          {n}
        </p>
      ))}
    </div>
  );
}

export function HeldLine({ label, amount, lang }: { label: string; amount: number; lang: Lang }) {
  return <HeldBox label={label} amount={amount} lang={lang} />;
}

export function ExcludedList({
  title,
  items,
  lang,
}: {
  title: string;
  items: { label: string; rule: string }[];
  lang: Lang;
}) {
  if (items.length === 0) return null;
  return (
    <div className="ms4-results">
      <h4 className="ms4-results-title">{title}</h4>
      <div className="ms4-result-list">
        {items.map((x, i) => {
          const rule = translateEngineText(x.rule, lang);
          return (
            <div key={i} className="ms4-noshare-card">
              <div className="ms4-noshare-card-name">
                {x.label}
                <span className="ms4-noshare-tag">{ss("noShare", lang)}</span>
              </div>
              {rule ? <p className="ms4-noshare-card-reason">{rule}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons (v4: Calculate is a 52 px full-width primary; "Load book
// example" / "Reset" are small text links, never buttons — spec §1)
// ---------------------------------------------------------------------------

export function LoadExampleButton({ onLoad, lang }: { onLoad: () => void; lang: Lang }) {
  return (
    <button type="button" onClick={onLoad} className="ms4-load-link">
      <BookOpen size={15} aria-hidden="true" /> {ss("loadBookExample", lang)}
    </button>
  );
}

export function CalcButton({ onClick, lang }: { onClick: () => void; lang: Lang }) {
  return (
    <button type="button" onClick={onClick} className="ms4-calc-btn">
      <Calculator size={17} aria-hidden="true" /> {ss("calculate", lang)}
    </button>
  );
}

export function ResetButton({ onReset, lang }: { onReset: () => void; lang: Lang }) {
  return (
    <button type="button" onClick={onReset} className="ms4-load-link">
      <RotateCcw size={15} aria-hidden="true" /> {ss("reset", lang)}
    </button>
  );
}

export function AddButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="ms-special-add-btn">
      <Plus size={15} /> {children}
    </button>
  );
}

export function RemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="ms-special-icon-btn">
      <Trash2 size={16} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Multi-death editor (Munasakha / simultaneous death)
// ---------------------------------------------------------------------------

export type DeathForm = {
  deceasedName: string;
  estate: number;
  heirs: HeirInput;
  names: NamesMap;
};

export function namesForHeirs(h: HeirInput, lang: Lang): NamesMap {
  const out: NamesMap = {};
  for (const m of HEIR_META) {
    const count = heirCount(h, m.key);
    if (count > 0) out[m.key] = sizedNames(undefined, String(m.key), count, lang);
  }
  return out;
}

export function cleanNames(names: NamesMap, heirs: HeirInput, lang: Lang): NamesMap {
  const out: NamesMap = {};
  for (const m of HEIR_META) {
    const count = heirCount(heirs, m.key);
    if (count > 0) out[m.key] = sizedNames(names[m.key], String(m.key), count, lang);
  }
  return out;
}

export function DeathEditor({
  death,
  index,
  lang,
  onChange,
  onRemove,
  canRemove,
  earlierNames,
  showEstate,
}: {
  death: DeathForm;
  index: number;
  lang: Lang;
  onChange: (next: DeathForm) => void;
  onRemove: () => void;
  canRemove: boolean;
  earlierNames: string[];
  showEstate: boolean;
}) {
  const listId = `earlier-names-${index}`;
  const [open, setOpen] = useState(true);
  // HeirPicker fires onChange (heirs) and onNamesChange (names) back-to-back
  // inside one stepper click, and both spread the same `death` prop — so the
  // second call would clobber the first and the stepper would silently do
  // nothing. Keep the latest form in a ref, updated synchronously, so the
  // two calls merge instead of overwriting each other.
  const latestRef = useRef(death);
  latestRef.current = death;
  const update = (next: DeathForm) => {
    latestRef.current = next;
    onChange(next);
  };
  return (
    <details className="ms-special-death" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="ms-special-death-summary">
        <span className="ms-special-result-title">
          {tx3(lang, "மரணம்", "Death", "الوفاة")} {index + 1}
          {death.deceasedName ? ` — ${death.deceasedName}` : ""}
        </span>
        {canRemove ? (
          <span onClick={(e) => e.preventDefault()}>
            <RemoveButton onClick={onRemove} label={tx3(lang, "இந்த மரணத்தை நீக்கு", "Remove this death", "احذف هذه الوفاة")} />
          </span>
        ) : null}
      </summary>
      <label className="ms-special-field">
        {tx3(lang, "இறந்தவர் பெயர்", "Name of the deceased", "اسم المتوفى")}
        <input
          type="text"
          list={earlierNames.length > 0 ? listId : undefined}
          value={death.deceasedName}
          onChange={(e) => onChange({ ...death, deceasedName: e.target.value })}
          className="ms-special-input"
          placeholder={tx3(lang, "எ.கா. ஸலீம்", "e.g. Saleem", "مثال: سالم")}
        />
        {earlierNames.length > 0 ? (
          <datalist id={listId}>
            {earlierNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        ) : null}
      </label>
      {showEstate ? (
        <MoneyField
          id={`death-estate-${index}`}
          label={tx3(lang, "இந்தச் சொத்து", "This estate", "هذه التركة")}
          value={death.estate}
          onChange={(v) => onChange({ ...death, estate: v })}
        />
      ) : null}
      <HeirPicker
        heirs={death.heirs}
        onChange={(h) => update({ ...latestRef.current, heirs: h, names: cleanNames(latestRef.current.names, h, lang) })}
        keys={[
          "husband",
          "wives",
          "father",
          "mother",
          "paternalGrandfather",
          "paternalGrandmothers",
          "maternalGrandmothers",
          "sons",
          "daughters",
          "fullBrothers",
          "fullSisters",
          "maternalBrothers",
          "maternalSisters",
          "paternalBrothers",
          "paternalSisters",
          "paternalUncles",
          "paternalUnclesSons",
          "sonsSons",
          "sonsDaughters",
        ]}
        lang={lang}
        names={death.names}
        onNamesChange={(n) => update({ ...latestRef.current, names: n })}
      />
    </details>
  );
}
