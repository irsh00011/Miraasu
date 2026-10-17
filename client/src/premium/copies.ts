/** Per-language copy + behavior flags for the shared premium Calculator.
 *  Preserves each language page's exact strings and behaviors (notices, history clear, labels).
 *  Frontend only: words and flags, never logic. */
import { ARABIC_EXTENDED_COPY, EXTENDED_HEIR_SECTIONS } from "@/lib/inheritance";
import type { PremiumLang } from "@/premium/copy";

export type CalcCopy = {
  lang: PremiumLang;
  rtl: boolean;
  docTitle: string;
  moneyLocale: string;
  dateLocale: string;
  stepLabels: readonly [string, string, string];
  stepsAria: string;
  stepNavAria: string;
  resetLabel: string;
  header: { title: string; subtitle: string; home: string; history: string; calculator: string; learn: string };
  estate: {
    kicker: string; title: string; subtitle: string; gross: string; optional: string; addExtras: string;
    costs: string; debts: string; bequest: string; bequestHelp?: string;
    distributable: string; next: string; back: string; showNotices: boolean;
  };
  family: { kicker: string; title: string; lead: string; back: string; seeResult: string };
  /** Heir display names by engine key; null = use the engine's own (Tamil) label. */
  labels: Record<string, string> | null;
  /** Map engine Tamil exclusion labels to display language (Urdu/Arabic). */
  exclusionLabels: Record<string, string>;
  partsWord: (n: number) => string;
  resultHero: { title: string; subtitle: string; savedNote: string };
  /** null = this language shows no translated notices on the result step (Tamil behavior). */
  translateNotice: ((notice: string) => string) | null;
  scholarBanner: string;
  resultKicker: string;
  sharesTitle: string;
  sharesDesc: string;
  totalEstateLabel: string;
  remainingLabel: string;
  noShareTitle: (n: number) => string;
  /** Fixed reason line for no-share cards; empty = use the engine's own reason (Tamil behavior). */
  noShareFixedReason: string;
  auditTitle: string;
  printLabel: string;
  downloadLabel: string;
  emptyResult: string;
  editFamily: string;
  history: {
    kicker: string; title: string; countText: (n: number) => string;
    clear: string; deleteLabel: string; emptyTitle: string; emptyBody: string; newLabel: string;
    clearConfirm: string | null; // null = no Clear-all button (English behavior)
  };
  print: {
    brand: string; title: string; estateLabel: string; heirLabel: string; shareLabel: string;
    amountLabel: string; totalLabel: string; remainingLabel: string; noShareLabel: string; dateLocale: string;
  };
};

function noticeInEnglish(notice: string) {
  if (notice.includes("சொத்து மதிப்பை")) return "Enter the estate value to continue.";
  if (notice.includes("பகிரக்கூடிய சொத்து இல்லை")) return "There is no estate remaining after costs and debts.";
  if (notice.includes("வஸிய்யத்")) return "The bequest is limited to one third after costs and debts; only the permitted amount is used.";
  if (notice.includes("கணவன் மற்றும் மனைவிகள்")) return "Husband and wife/wives cannot both be selected; the wife/wives selection is used.";
  if (notice.includes("இந்த ஆவணத்தில் இது தெளிவாக குறிப்பிடப்படவில்லை")) return "This combination is not clearly specified in the supplied reference. Confirm the priority and exact share with a qualified scholar; do not treat the automatic result below as final.";
  if (notice.includes("கூடுதல் புத்தக")) return "Additional relatives from the book have been selected. Their exact shares require qualified scholarly review; do not treat the automatic result below as final.";
  if (notice.includes("சில தூரத்து")) return "Some selected extended relatives require qualified review to confirm their priority and exact share.";
  if (notice.includes("தந்தையின் தந்தை மற்றும்")) return "A paternal grandfather and siblings are selected together. This combination has recognised interpretation differences and needs scholarly confirmation.";
  if (notice.includes("நிர்ணயிக்கப்பட்ட பங்குகள்")) return "The fixed shares exceed the estate and have been proportionately adjusted. Scholarly review is recommended.";
  if (notice.includes("கருத்து வேறுபாடு")) return "This combination has recognised differences of interpretation and needs scholarly confirmation.";
  if (notice.includes("மீதமான பங்கிற்கு")) return "No eligible heir for the remaining share is available in this simplified calculation. Scholarly review is needed.";
  if (notice.includes("இவ்வமைப்பில் மீதமான")) return "No automatic heir is available for the remaining share in this combination. Scholarly review is needed.";
  if (notice.includes("வாரிசுகள் தேர்வு")) return "No heir has been selected, or a supported relationship is needed.";
  return "This case needs qualified review before any real distribution.";
}

const noticeArabic = (notice: string) => notice.includes("சொத்து மதிப்பை") ? "أدخل قيمة التركة أولاً." : notice.includes("பகிரக்கூடிய சொத்து இல்லை") ? "لا توجد تركة قابلة للقسمة بعد التكاليف والديون." : notice.includes("வஸிய்யத்") ? "استُخدم الحد المسموح للوصية في هذا الحساب." : notice.includes("வாரிசுகள் தேர்வு") ? "لم تُضف علاقة مدعومة بعد." : notice.includes("தூரத்து") || notice.includes("புத்தக") ? "هناك قرابة مختارة تحتاج إلى مراجعة مختص مؤهل قبل القسمة الفعلية." : notice.includes("மீதமான") ? "لا يوجد وارث تلقائي للباقي في هذا المسار المبسط؛ يلزم مراجعة مختص." : "هذه الحالة تحتاج مراجعة مختص مؤهل قبل القسمة الفعلية.";

function noticeInUrdu(notice: string) {
  if (notice.includes("சொத்து மதிப்பை")) return "جاری رکھنے کے لیے ترکہ کی مالیت درج کریں۔";
  if (notice.includes("பகிரக்கூடிய சொத்து இல்லை")) return "اخراجات اور قرضوں کے بعد کوئی قابلِ تقسیم ترکہ باقی نہیں۔";
  if (notice.includes("வஸிய்யத்")) return "وصیت اخراجات اور قرضوں کے بعد ایک تہائی تک محدود ہے؛ صرف جائز رقم استعمال کی گئی ہے۔";
  if (notice.includes("கணவன் மற்றும் மனைவிகள்")) return "شوہر اور بیوی/بیویاں ایک ساتھ منتخب نہیں ہو سکتے؛ بیوی/بیویوں کا انتخاب استعمال کیا گیا ہے۔";
  if (notice.includes("இந்த ஆவணத்தில் இது தெளிவாக குறிப்பிடப்படவில்லை")) return "یہ صورت حوالہ دستاویز میں واضح طور پر بیان نہیں؛ ترجیح اور صحیح حصے کی تصدیق مستند عالم سے کرائیں؛ نیچے دیا خودکار نتیجہ حتمی نہ سمجھیں۔";
  if (notice.includes("கூடுதல் புத்தக")) return "کتاب سے اضافی رشتہ دار منتخب کیے گئے ہیں۔ ان کے صحیح حصوں کے لیے مستند علمی جائزہ ضروری ہے؛ خودکار نتیجہ حتمی نہ سمجھیں۔";
  if (notice.includes("சில தூரத்து")) return "کچھ منتخب دور کے رشتہ داروں کی ترجیح اور صحیح حصے کی تصدیق کے لیے مستند جائزہ ضروری ہے۔";
  if (notice.includes("தந்தையின் தந்தை மற்றும்")) return "دادا اور بہن بھائی ایک ساتھ منتخب ہیں۔ اس صورت میں تفسیری اختلافات تسلیم شدہ ہیں اور علمی تصدیق ضروری ہے۔";
  if (notice.includes("நிர்ணயிக்கப்பட்ட பங்குகள்")) return "مقررہ حصے ترکہ سے بڑھ گئے ہیں اور متناسب طور پر ایڈجسٹ کیے گئے ہیں۔ علمی جائزہ تجویز کیا جاتا ہے۔";
  if (notice.includes("கருத்து வேறுபாடு")) return "اس صورت میں تفسیری اختلافات تسلیم شدہ ہیں اور علمی تصدیق ضروری ہے۔";
  if (notice.includes("மீதமான பங்கிற்கு")) return "اس آسان حساب میں باقی حصے کا کوئی مستحق وارث دستیاب نہیں۔ علمی جائزہ ضروری ہے۔";
  if (notice.includes("இவ்வமைப்பில் மீதமான")) return "اس صورت میں باقی حصے کا کوئی خودکار وارث دستیاب نہیں۔ علمی جائزہ ضروری ہے۔";
  if (notice.includes("வாரிசுகள் தேர்வு")) return "کوئی وارث منتخب نہیں کیا گیا، یا معاون رشتہ درکار ہے۔";
  return "کسی بھی حقیقی تقسیم سے پہلے اس کیس کا مستند جائزہ ضروری ہے۔";
}

const enLabels: Record<string, string> = {
  husband: "Husband", wives: "Wife / wives", mother: "Mother", father: "Father", paternalGrandfather: "Father’s father", sons: "Sons", daughters: "Daughters",
  sonsSons: "Sons of sons", sonsDaughters: "Daughters of sons", paternalGrandmothers: "Father’s mother", maternalGrandmothers: "Mother’s mother",
  fullBrothers: "Full brothers", fullSisters: "Full sisters", paternalBrothers: "Paternal half-brothers", paternalSisters: "Paternal half-sisters",
  maternalBrothers: "Maternal half-brothers", maternalSisters: "Maternal half-sisters",
  ...Object.fromEntries(EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items).map((item) => [item.key, item.labelEn])),
};

const arabicLabels: Record<string, string> = {
  husband: "الزوج", wives: "الزوجة / الزوجات", father: "الأب", mother: "الأم", paternalGrandfather: "جد الأب", sons: "الأبناء", daughters: "البنات",
  fullBrothers: "الإخوة الأشقاء", fullSisters: "الأخوات الشقيقات", maternalBrothers: "الإخوة لأم", maternalSisters: "الأخوات لأم",
  sonsSons: "أبناء الابن", sonsDaughters: "بنات الابن", paternalGrandmothers: "جدة الأب", maternalGrandmothers: "جدة الأم",
  paternalBrothers: "الإخوة لأب", paternalSisters: "الأخوات لأب",
  ...Object.fromEntries(Object.entries(ARABIC_EXTENDED_COPY).map(([key, value]) => [key, value.label])),
};
const arabicExclusionLabels: Record<string, string> = { "தந்தையின் தந்தை": "جد الأب", "தந்தை வழி பாட்டி": "جدة الأب", "தாய் வழி பாட்டி": "جدة الأم", "மகனின் மகள்": "بنت الابن", "தாய் வழி சகோதரர் / சகோதரி": "الإخوة لأم", "உடன் பிறந்த சகோதரர் / சகோதரி": "الإخوة الأشقاء", "தந்தை வழி சகோதரி": "الأخوات لأب" };

const urLabels: Record<string, string> = {
  husband: "شوہر", wives: "بیوی / بیویاں", mother: "ماں", father: "باپ", paternalGrandfather: "دادا", sons: "بیٹے", daughters: "بیٹیاں",
  sonsSons: "پوتے", sonsDaughters: "پوتیاں", paternalGrandmothers: "دادی", maternalGrandmothers: "نانی",
  fullBrothers: "سگے بھائی", fullSisters: "سگی بہنیں", paternalBrothers: "باپ کی طرف کے بھائی", paternalSisters: "باپ کی طرف کی بہنیں",
  maternalBrothers: "ماں کی طرف کے بھائی", maternalSisters: "ماں کی طرف کی بہنیں",
  furtherSonsLineDescendants: "بیٹے کی طرف سے مزید نسل", maternalGrandfather: "نانا", furtherPaternalAncestors: "باپ کی طرف سے مزید آباؤ اجداد",
  fullBrothersSons: "سگے بھائیوں کے بیٹے", paternalBrothersSons: "باپ کی طرف کے بھائیوں کے بیٹے",
  paternalUncles: "سگے چچا (عم)", paternalUnclesSons: "سگے چچاؤں کے بیٹے",
  consanguinePaternalUncles: "باپ کی طرف کے چچا", consanguinePaternalUnclesSons: "باپ کی طرف کے چچاؤں کے بیٹے",
  daughtersChildren: "بیٹی کے بچے", sonsDaughtersChildren: "پوتی کے بچے",
  fullBrothersDaughters: "سگے بھائیوں کی بیٹیاں", fullSistersChildren: "سگی بہنوں کے بچے",
  maternalBrothersChildren: "ماں کی طرف کے بھائیوں کے بچے", fathersMaternalBrothers: "باپ کا مادری بھائی",
  fathersMaternalBrothersDescendants: "ان کی اولاد", mothersSiblings: "ماں کے بہن بھائی", mothersSiblingsDescendants: "ان کی اولاد",
};
const urExclusionLabels: Record<string, string> = {
  "தந்தையின் தந்தை": "دادا", "தந்தை வழி பாட்டி": "دادی", "தாய் வழி பாட்டி": "نانی", "மகனின் மகள்": "پوتی",
  "தாய் வழி சகோதரர் / சகோதரி": "ماں کی طرف کے بہن بھائی", "உடன் பிறந்த சகோதரர் / சகோதரி": "سگے بہن بھائی", "தந்தை வழி சகோதரி": "باپ کی طرف کی بہنیں",
};

export const calcCopies: Record<PremiumLang, CalcCopy> = {
  ta: {
    lang: "ta", rtl: false, docTitle: "மீராஸ் கணக்கீடு", moneyLocale: "en-IN", dateLocale: "ta-IN",
    stepLabels: ["தொகை", "உறவுகள்", "முடிவு"], stepsAria: "படிகள்", stepNavAria: "படிகளுக்கு இடையே செல்ல", resetLabel: "புதிய கணக்கு",
    header: { title: "Islamic Inheritance Calculator", subtitle: "பங்கு காரணம் அறியும் பதிவு", home: "முகப்பு", history: "வரலாறு", calculator: "கணக்கீடு", learn: "கற்க" },
    estate: { kicker: "படி 1 / 3", title: "சொத்து விவரங்களை உள்ளிடுக", subtitle: "மொத்த சொத்து மற்றும் கழிவுகளை உள்ளிடுக.", gross: "மொத்த சொத்து மதிப்பு", optional: "விருப்பம்", addExtras: "கழிவுகள்", costs: "அடக்கச் செலவுகள்", debts: "நிலுவைக் கடன்கள்", bequest: "வஸிய்யத் (மரண சாசனம்)", distributable: "பகிரக்கூடிய சொத்து", next: "தொடர்க", back: "பின்செல்", showNotices: true },
    family: { kicker: "படி 2 / 3", title: "உயிருடன் உள்ள உறவினர்களைத் தேர்வு செய்க", lead: "மறைந்தவர் இறந்தபோது உயிருடன் இருந்த அனைத்து உறவினர்களையும் தேர்வு செய்க.", back: "பின்செல்", seeResult: "முடிவைப் பார்க்கவும்" },
    labels: null, exclusionLabels: {},
    partsWord: (n) => (n === 1 ? "பங்கு" : "பங்குகள்"),
    resultHero: { title: "வாரிசு சுருக்கம்", subtitle: "சொத்து வாரிசுகளிடையே எவ்வாறு பகிரப்படுகிறது என்பதைப் பார்க்கவும்.", savedNote: "வரலாற்றில் சேமிக்கப்பட்டது" },
    resultKicker: "படி 3 / 3", sharesTitle: "குடும்ப பங்குகள்", sharesDesc: "ஒவ்வொரு தகுதியான வாரிசின் பங்கின் தெளிவான விவரம்.",
    translateNotice: null, scholarBanner: "",
    totalEstateLabel: "பகிரக்கூடிய சொத்து", remainingLabel: "மீதமுள்ள தொகை",
    noShareTitle: (n) => `பங்கு இல்லாதவர்கள் (${n})`,
    noShareFixedReason: "",
    auditTitle: "முழு கணக்குத் தணிக்கை", printLabel: "அச்சிடுக", downloadLabel: "பதிவிறக்குக",
    emptyResult: "வாரிசுகளைச் சேர்க்கவும்.", editFamily: "உறவுகளை மாற்றுக",
    history: { kicker: "இந்தச் சாதனத்தில் மட்டும்", title: "சேமித்த கணக்குகள்", countText: (n) => `${n} உறவுகள்`, clear: "அனைத்தையும் அழி", deleteLabel: "கணக்கை அழிக்க", emptyTitle: "இன்னும் சேமித்த கணக்கு இல்லை", emptyBody: "ஒரு கணக்கை முடித்ததும் அது இங்கே தானாக சேமிக்கப்படும்.", newLabel: "புதிய கணக்கு", clearConfirm: "சேமித்த கணக்குகள் அனைத்தையும் அழிக்கவா?" },
    print: { brand: "மீராஸ்", title: "பங்கீட்டு முடிவு", estateLabel: "மொத்த சொத்து", heirLabel: "வாரிசு", shareLabel: "பங்கு", amountLabel: "தொகை", totalLabel: "மொத்தம் பகிரப்பட்டது", remainingLabel: "மீதமுள்ள தொகை", noShareLabel: "பங்கு இல்லாதவர்கள்", dateLocale: "ta-IN" },
  },
  en: {
    lang: "en", rtl: false, docTitle: "Mīrāth Calculator | English", moneyLocale: "en-IN", dateLocale: "en-IN",
    stepLabels: ["Amount", "Family", "Result"], stepsAria: "Steps", stepNavAria: "Move between steps", resetLabel: "New calculation",
    header: { title: "Islamic Inheritance Calculator", subtitle: "Reason-led inheritance worksheet", home: "Home", history: "History", calculator: "Calculator", learn: "Learn" },
    estate: { kicker: "STEP 1 OF 3", title: "Enter Estate Details", subtitle: "Enter the total estate and any deductions.", gross: "Total Estate Value", optional: "Optional", addExtras: "Deductions", costs: "Funeral Expenses", debts: "Outstanding Debts", bequest: "Bequests (Wasiyyah)", distributable: "Distributable Estate", next: "Continue", back: "Back", showNotices: true },
    family: { kicker: "STEP 2 OF 3", title: "Select Living Relatives", lead: "Choose all relatives who were alive when the deceased passed away.", back: "Back", seeResult: "See result" },
    labels: enLabels, exclusionLabels: {},
    partsWord: (n) => (n === 1 ? "part" : "parts"),
    resultHero: { title: "Inheritance Summary", subtitle: "See how the estate is distributed among the heirs.", savedNote: "Saved to history" },
    resultKicker: "STEP 3 OF 3", sharesTitle: "Family Shares", sharesDesc: "A clear breakdown of each eligible heir's inheritance.",
    translateNotice: noticeInEnglish, scholarBanner: "Scholar review required — this result is not final.",
    totalEstateLabel: "Distributable Estate", remainingLabel: "Remaining amount",
    noShareTitle: (n) => `No share (${n})`,
    noShareFixedReason: "Blocked by a nearer relative.",
    auditTitle: "Full calculation audit", printLabel: "Print", downloadLabel: "Download",
    emptyResult: "Add family members to see a result.", editFamily: "Edit family",
    history: { kicker: "Only on this device", title: "Saved calculations", countText: (n) => `${n} selected relatives`, clear: "Clear all", deleteLabel: "Delete calculation", emptyTitle: "No saved calculation yet", emptyBody: "A completed calculation is automatically saved here.", newLabel: "New calculation", clearConfirm: null },
    print: { brand: "MIRAASU", title: "Distribution result", estateLabel: "Total estate", heirLabel: "Heir", shareLabel: "Share", amountLabel: "Amount", totalLabel: "Total distributed", remainingLabel: "Remaining amount", noShareLabel: "No share", dateLocale: "en-IN" },
  },
  ar: {
    lang: "ar", rtl: true, docTitle: "حاسبة الميراث | العربية", moneyLocale: "ar", dateLocale: "ar",
    stepLabels: ["المبلغ", "العائلة", "النتيجة"], stepsAria: "الخطوات", stepNavAria: "التنقل بين الخطوات", resetLabel: "حساب جديد",
    header: { title: "Islamic Inheritance Calculator", subtitle: "سجل يوضح سبب كل نصيب", home: "الرئيسية", history: "السجل", calculator: "الحاسبة", learn: "تعلَّم" },
    estate: { kicker: "الخطوة 1 من 3", title: "أدخل تفاصيل التركة", subtitle: "أدخل إجمالي التركة وأي خصومات.", gross: "إجمالي قيمة التركة", optional: "اختياري", addExtras: "الخصومات", costs: "مصاريف الجنازة", debts: "الديون المستحقة", bequest: "الوصية", bequestHelp: "بحسب الضوابط المناسبة", distributable: "التركة القابلة للتوزيع", next: "التالي", back: "رجوع", showNotices: false },
    family: { kicker: "الخطوة 2 من 3", title: "اختر الأقارب الأحياء", lead: "اختر جميع الأقارب الذين كانوا على قيد الحياة عند وفاة المتوفى.", back: "السابق", seeResult: "عرض النتيجة" },
    labels: arabicLabels, exclusionLabels: arabicExclusionLabels,
    partsWord: (n) => (n === 1 ? "سهم" : "أسهم"),
    resultHero: { title: "ملخص الميراث", subtitle: "شاهد كيف تُوزَّع التركة بين الورثة.", savedNote: "حُفظ في السجل" },
    resultKicker: "الخطوة 3 من 3", sharesTitle: "حصص العائلة", sharesDesc: "تفصيل واضح لميراث كل وارث مستحق.",
    translateNotice: noticeArabic, scholarBanner: "يلزم تأكيد من مختص — هذه النتيجة غير نهائية.",
    totalEstateLabel: "التركة القابلة للتوزيع", remainingLabel: "المبلغ المتبقي",
    noShareTitle: (n) => `قرابات لا ترث في هذه الحالة (${n})`,
    noShareFixedReason: "محجوب بقريب أقرب.",
    auditTitle: "التدقيق الكامل للحساب", printLabel: "طباعة", downloadLabel: "تنزيل",
    emptyResult: "أضف الورثة لعرض النتيجة.", editFamily: "تعديل العائلة",
    history: { kicker: "في هذا الجهاز فقط", title: "الحسابات المحفوظة", countText: (n) => `${n} أقارب`, clear: "حذف الكل", deleteLabel: "حذف الحساب", emptyTitle: "لا توجد حسابات محفوظة", emptyBody: "يُحفظ الحساب تلقائياً عند إكماله.", newLabel: "حساب جديد", clearConfirm: "هل تريد حذف كل الحسابات المحفوظة؟" },
    print: { brand: "ميراسو", title: "نتيجة القسمة", estateLabel: "إجمالي التركة", heirLabel: "الوارث", shareLabel: "الحصة", amountLabel: "المبلغ", totalLabel: "إجمالي الموزع", remainingLabel: "المبلغ المتبقي", noShareLabel: "لا نصيب لهم", dateLocale: "ar" },
  },
  ur: {
    lang: "ur", rtl: true, docTitle: "میراث کیلکولیٹر | اردو", moneyLocale: "ur", dateLocale: "ur",
    stepLabels: ["رقم", "خاندان", "نتیجہ"], stepsAria: "مراحل", stepNavAria: "مراحل کے درمیان جائیں", resetLabel: "نیا حساب",
    header: { title: "Islamic Inheritance Calculator", subtitle: "حصوں کی وجہ جاننے کا رجسٹر", home: "ہوم", history: "ہسٹری", calculator: "کیلکولیٹر", learn: "سیکھیں" },
    estate: { kicker: "مرحلہ 1 از 3", title: "ترکہ کی تفصیلات درج کریں", subtitle: "کل ترکہ اور کٹوتیاں درج کریں۔", gross: "کل ترکہ کی مالیت", optional: "اختیاری", addExtras: "کٹوتیاں", costs: "تجہیز و تکفین کے اخراجات", debts: "واجب الادا قرضے", bequest: "وصیت", distributable: "قابل تقسیم ترکہ", next: "جاری رکھیں", back: "پیچھے", showNotices: false },
    family: { kicker: "مرحلہ 2 از 3", title: "زندہ رشتہ دار منتخب کریں", lead: "وہ تمام رشتہ دار منتخب کریں جو متوفی کی وفات کے وقت زندہ تھے۔", back: "پیچھے", seeResult: "نتیجہ دیکھیں" },
    labels: urLabels, exclusionLabels: urExclusionLabels,
    partsWord: (n) => (n === 1 ? "حصہ" : "حصے"),
    resultHero: { title: "وراثت کا خلاصہ", subtitle: "دیکھیں کہ ترکہ وارثوں میں کیسے تقسیم ہوا۔", savedNote: "ہسٹری میں محفوظ ہو گیا" },
    resultKicker: "مرحلہ 3 از 3", sharesTitle: "خاندانی حصے", sharesDesc: "ہر مستحق وارث کی وراثت کی واضح تفصیل۔",
    translateNotice: noticeInUrdu, scholarBanner: "مستند عالم سے تصدیق ضروری ہے — یہ نتیجہ حتمی نہیں۔",
    totalEstateLabel: "قابل تقسیم ترکہ", remainingLabel: "باقی رقم",
    noShareTitle: (n) => `اس صورت میں بے حصہ رشتہ دار (${n})`,
    noShareFixedReason: "قرابت کی ترتیب سے محجوب۔",
    auditTitle: "مکمل حساب کی تدقیق", printLabel: "پرنٹ", downloadLabel: "ڈاؤن لوڈ",
    emptyResult: "نتیجہ دیکھنے کے لیے خاندان شامل کریں۔", editFamily: "خاندان بدلیں",
    history: { kicker: "صرف اس ڈیوائس پر", title: "محفوظ شدہ حسابات", countText: (n) => `${n} رشتہ دار`, clear: "سب صاف کریں", deleteLabel: "حساب حذف کریں", emptyTitle: "ابھی کوئی محفوظ حساب نہیں", emptyBody: "حساب مکمل ہوتے ہی یہاں خودکار محفوظ ہو جائے گا۔", newLabel: "نیا حساب", clearConfirm: "کیا تمام محفوظ شدہ حسابات حذف کر دیں؟" },
    print: { brand: "میراث", title: "تقسیم کا نتیجہ", estateLabel: "کل جائیداد", heirLabel: "وارث", shareLabel: "حصہ", amountLabel: "رقم", totalLabel: "کل تقسیم شدہ", remainingLabel: "باقی رقم", noShareLabel: "جن کا حصہ نہیں", dateLocale: "ur" },
  },
};
