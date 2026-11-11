/**
 * Special Inheritance Methods — content data (pure data + types, no React,
 * no calculation logic).
 *
 * Source of truth: ~/workspace/miraasu/reports/meerath-book-study.md
 * (deep study, 2026-11-10, of இஸ்லாமிய வாரிசுரிமைச் சட்டம்: நவீன கணக்கீடு
 * by Maulvi Dr. S.A. Usman Ali Hasani, 335 pp, 285 worked cases).
 * Every rule, formula, page reference and worked-example number below comes
 * only from that report and the book it cites. Where the book is silent, has
 * no worked example, or gives several opinions, the topic's scholarFlag says
 * so — no gap has been filled in. Book misprints recorded in §7 of the
 * report are used with their CORRECTED values and noted in the text.
 *
 * The calculator is the core of each section; explanations are kept concise
 * and support it. Amounts are shown to 2 decimal places; rows sum exactly
 * to the estate. No design or colour decisions live in this file.
 */

export type WorkedExampleStep = {
  /** Tamil row label, e.g. "மனைவி — 1/8". */
  labelTa: string;
  /** English row label, e.g. "Wife — 1/8". */
  labelEn: string;
  labelAr?: string;
  /**
   * Exact fraction of the estate being divided, e.g. "1/8", "2/3".
   * "0" = no share, "1" = the whole estate, "—" = residue / held amount
   * (no fixed fraction; see the label).
   */
  fraction: string;
  /** Amount in the book's (unstated) currency units, to 2 decimals. */
  amount: number;
};

export type WorkedExample = {
  /** Book case number (கணக்கு எண்), e.g. 265. */
  caseNo: number;
  /** Opinion / variant this example shows, e.g. "அபூ ஹனீஃபா கருத்து". */
  variantTa?: string;
  variantEn?: string;
  variantAr?: string;
  /** Estate the example divides (for multi-estate cases, the estate of the
   * division shown here; the other estate is named in the final answer). */
  estate: number;
  steps: WorkedExampleStep[];
  /** Final-answer line, including any misprint note for this case. */
  finalAnswerTa: string;
  finalAnswerEn: string;
  finalAnswerAr?: string;
};

export type SpecialPreload = {
  /** Gross estate to prefill in the calculator. */
  estate: number;
  /**
   * Heirs to prefill, as plain engine heir keys with counts
   * (see HeirInput in client/src/lib/inheritance.ts). Keys the engine
   * cannot distinguish (e.g. a khuntha heir, a missing heir, a creditor)
   * are explained in the note, not forced into a wrong key.
   */
  heirs: Record<string, number>;
  /** Plain calculator options, e.g. { school: "hanafi" }. */
  options: Record<string, string>;
  /** What this prefill does and does not cover. */
  noteTa: string;
  noteEn: string;
  noteAr?: string;
};

export type ScholarFlag = {
  needed: boolean;
  textTa: string;
  textEn: string;
  textAr?: string;
};

export type DhawulArhamBranch = {
  titleTa: string;
  titleEn: string;
  titleAr?: string;
  itemsTa: string[];
  itemsEn: string[];
  itemsAr?: string[];
};

export type SahihFasidCategory = {
  nameTa: string;
  nameEn: string;
  nameAr?: string;
  resultTa: string;
  resultEn: string;
  resultAr?: string;
};

export type SpecialTopic = {
  id: string;
  titleTa: string;
  titleEn: string;
  titleAr?: string;
  arabicTerm: string;
  /** Book reference, e.g. "p. 279; cases 260–266". */
  bookRef: string;
  /** One short plain line for the hub card — max ~12 words, factual, no marketing. */
  cardLineTa: string;
  cardLineEn: string;
  cardLineAr?: string;
  /** 2–4 short paragraphs. Fluent standard Tamil. */
  explanationTa: string[];
  /** 2–4 short paragraphs. Clear, plain English. */
  explanationEn: string[];
  explanationAr?: string[];
  /** Plain-text formula with exact fractions. */
  formulaTa: string;
  formulaEn: string;
  formulaAr?: string;
  workedExamples: WorkedExample[];
  preload: SpecialPreload;
  scholarFlag: ScholarFlag;
  /** What to enter in the calculator for this topic. */
  hintTa: string;
  hintEn: string;
  hintAr?: string;
  /** Dhawul Arham only: the four branches (p. 279). */
  branches?: DhawulArhamBranch[];
  /** Ṣaḥīḥ / fāsid only: the eight grandparent-chain categories. */
  categories?: SahihFasidCategory[];
};

export type SpecialMethodsPageCopy = {
  pageTitleTa: string;
  pageTitleEn: string;
  pageTitleAr?: string;
  pageIntroTa: string;
  pageIntroEn: string;
  pageIntroAr?: string;
  topicGridHeadingTa: string;
  topicGridHeadingEn: string;
  topicGridHeadingAr?: string;
  prevLabelTa: string;
  prevLabelEn: string;
  prevLabelAr?: string;
  nextLabelTa: string;
  nextLabelEn: string;
  nextLabelAr?: string;
  backToCalculatorTa: string;
  backToCalculatorEn: string;
  backToCalculatorAr?: string;
  roundingRuleTa: string;
  roundingRuleEn: string;
  roundingRuleAr?: string;
  languageToggleLabelTa: string;
  languageToggleLabelEn: string;
  languageToggleLabelAr?: string;
  loadExampleTa: string;
  loadExampleEn: string;
  loadExampleAr?: string;
  calculateTa: string;
  calculateEn: string;
  calculateAr?: string;
};

export const SPECIAL_TOPICS: SpecialTopic[] = [
  {
    id: "dhawul-arham",
    titleTa: "தூரத்து உறவினர்கள்",
    titleEn: "Distant Relatives",
    titleAr: "ذوو الأرحام",
    arabicTerm: "ذوو الأرحام",
    bookRef: "p. 279; cases 260–266",
    cardLineTa: "நிலையான பங்கு, மீதம் பெறும் வாரிசு இல்லாதபோது தூரத்து உறவினர்கள் வாரிசாகிறார்கள்.",
    cardLineEn: "Distant relatives inherit when no fixed or residuary heir exists.",
    cardLineAr: "يرث ذوو الأرحام عند عدم وجود وارث ذي فرض أو عاصب.",
    explanationTa: [
      "நிலையான பங்கு பெறும் வாரிசுகளோ (அஸ்ஹாபுல் ஃபுரூழ்) மீதம் பெறும் வாரிசுகளோ (அஸபா) இல்லாதபோது மட்டுமே தூரத்து உறவினர்கள் வாரிசாகிறார்கள். குர்ஆனிலோ ஹதீஸிலோ இவர்களுக்கு நிலையான பங்கு கூறப்படவில்லை; எனவே நூல் “நடைமுறையில் உள்ள பிரபலமான முறை” என்று கூறும் நான்கு கிளை முறையைப் பயன்படுத்துகிறது.",
      "உறவினர்கள் நான்கு கிளைகளாகப் பிரிக்கப்படுகிறார்கள்; முந்தைய கிளை இருந்தால் பிந்தைய கிளைக்கு எதுவும் கிடைக்காது. ஒரே கிளைக்குள் நெருங்கிய படிநிலையில் (அந்தஸ்து) உள்ளவர் முழுவதையும் பெறுகிறார்; படிநிலை சமமாக இருந்தால் ஆணுக்கு இரண்டு பங்கு, பெண்ணுக்கு ஒரு பங்கு என்ற விகிதத்தில் பிரிக்கப்படுகிறது.",
      "மனைவி அல்லது கணவர் போன்ற நிலையான பங்கு பெறும் வாரிசு இருந்தால், அவர் தமது பங்கை மட்டுமே பெறுவார்; மீதத்திலிருந்து மீண்டும் பெற மாட்டார். மீதம் தூரத்து உறவினர்களுக்குச் செல்கிறது. நூல் இந்த முறைக்கு “ஹனஃபி” என்றோ “தன்ஸீல்” என்றோ பெயர் கூறவில்லை; அருகிலுள்ள வாரிசின் இடத்தில் வைக்கும் (தன்ஸீல்) கணக்கு இதில் இல்லை.",
    ],
    explanationEn: [
      "Distant relatives inherit only when there is no fixed-share heir (Aṣḥāb al-Furūḍ) and no residuary heir (ʿAṣabah). The Qur'an and Hadith assign them no fixed share, so the book uses what it calls “the popular method in practice”: dividing them into four branches.",
      "The relatives are divided into four branches; an earlier branch blocks a later one. Within a branch, the one nearer in degree takes everything; if the degree is equal, males take two parts and females one part.",
      "If a fixed-share heir such as a wife or husband is present, they take only their fixed share and nothing again from the residue; the residue goes to the distant relatives. The book never calls this method “Hanafi” or “tanzil”, and it contains no “put in the place of a nearer heir” (tanzil) computation.",
    ],
    explanationAr: [
      "لا يرث ذوو الأرحام إلا عند عدم وجود وارث ذي فرض (أصحاب الفروض) وعدم وجود وارث عاصب (العصبة). ولم يحدد القرآن ولا الحديث لهم فرضًا ثابتًا، ولذلك يستخدم الكتاب ما يسميه «الطريقة المشهورة المعمول بها»: تقسيمهم إلى أربعة فروع.",
      "يُقسَّم الأقارب إلى أربعة فروع؛ فالفرع الأسبق يحجب الفرع اللاحق. وداخل الفرع الواحد يأخذ الأقرب درجةً كلَّ شيء؛ فإن تساوت الدرجة أخذ الذكر جزأين والأنثى جزءًا واحدًا.",
      "إذا وُجد وارث ذو فرض كالزوجة أو الزوج، فإنه يأخذ فرضه فقط ولا يأخذ شيئًا مرة أخرى من الباقي؛ ويذهب الباقي إلى ذوي الأرحام. ولا يسمي الكتاب هذه الطريقة «حنفية» ولا «تنزيلًا»، ولا يوجد فيها حساب «وضع الشخص مكان وارث أقرب» (التنزيل).",
    ],
    formulaTa:
      "முதலில் நிலையான பங்கு பெறும் வாரிசுகளுக்கும் மீதம் பெறும் வாரிசுகளுக்கும் கொடுக்கவும். எஞ்சிய தொகையை முந்தைய கிளைக்குக் கொடுக்கவும்; ஒரே கிளைக்குள் நெருங்கிய படிநிலையில் உள்ளவர் முழுவதையும் பெறுவார்; படிநிலை சமமாக இருந்தால் ஆணுக்கு 2 பங்கு, பெண்ணுக்கு 1 பங்கு.",
    formulaEn:
      "First pay the fixed-share and residuary heirs. Give the remainder to the earliest branch; within a branch the nearer in degree takes all; if the degree is equal, males take 2 parts and females 1 part.",
    formulaAr: "ادفع أولًا لأصحاب الفروض والعصبة. وأعطِ الباقي للفرع الأسبق؛ وداخل الفرع يأخذ الأقرب درجةً كلَّ شيء؛ فإن تساوت الدرجة أخذ الذكر جزأين والأنثى جزءًا واحدًا.",
    workedExamples: [
      {
        caseNo: 265,
        estate: 3000,
        steps: [
          { labelTa: "மகளின் மகன் — 2/3", labelEn: "Daughter's son — 2/3", labelAr: "ابن البنت — 2/3", fraction: "2/3", amount: 2000 },
          { labelTa: "மகளின் மகள் — 1/3", labelEn: "Daughter's daughter — 1/3", labelAr: "بنت البنت — 1/3", fraction: "1/3", amount: 1000 },
        ],
        finalAnswerTa: "மகளின் மகன் 2,000; மகளின் மகள் 1,000. இருவரும் ஒரே படிநிலையில் இருப்பதால் 2:1 என்ற விகிதத்தில் பிரிக்கப்பட்டது.",
        finalAnswerEn: "Daughter's son 2,000; daughter's daughter 1,000. Both are of the same degree, so the estate is split 2:1.",
        finalAnswerAr: "ابن البنت 2,000؛ وبنت البنت 1,000. وهما في الدرجة نفسها، ولذلك قُسِّمت التركة بنسبة 2:1.",
      },
      {
        caseNo: 260,
        estate: 1000,
        steps: [
          { labelTa: "மகளின் மகள் — நெருங்கிய படிநிலை", labelEn: "Daughter's daughter — nearer degree", labelAr: "بنت البنت — الأقرب درجةً", fraction: "1", amount: 1000 },
          { labelTa: "மகளின் மகளின் மகள் — தொலைவான படிநிலை", labelEn: "Daughter's daughter's daughter — farther degree", labelAr: "بنت بنت البنت — الأبعد درجةً", fraction: "0", amount: 0 },
        ],
        finalAnswerTa: "நெருங்கிய படிநிலையில் உள்ள மகளின் மகள் முழு 1,000ஐயும் பெறுகிறார்; தொலைவான படிநிலையில் உள்ளவருக்கு எதுவும் இல்லை.",
        finalAnswerEn: "The nearer in degree, the daughter's daughter, takes the whole 1,000; the farther in degree gets nothing.",
        finalAnswerAr: "الأقرب درجةً، وهي بنت البنت، تأخذ كامل 1,000؛ والأبعد درجةً لا يأخذ شيئًا.",
      },
      {
        caseNo: 266,
        estate: 1000,
        steps: [
          { labelTa: "மனைவி — 1/4 (நிலையான பங்கு)", labelEn: "Wife — 1/4 (fixed share)", labelAr: "الزوجة — 1/4 (فرض)", fraction: "1/4", amount: 250 },
          { labelTa: "மகளின் மகன் — மீதம் 750இல் 2/3", labelEn: "Daughter's son — 2/3 of the residue 750", labelAr: "ابن البنت — 2/3 من الباقي 750", fraction: "1/2", amount: 500 },
          { labelTa: "மகளின் மகள் — மீதம் 750இல் 1/3", labelEn: "Daughter's daughter — 1/3 of the residue 750", labelAr: "بنت البنت — 1/3 من الباقي 750", fraction: "1/4", amount: 250 },
        ],
        finalAnswerTa: "மனைவி 250; மீதம் 750 தூரத்து உறவினர்களுக்கு 2:1 என்ற விகிதத்தில் — மகளின் மகன் 500, மகளின் மகள் 250. மனைவி மீதத்திலிருந்து மீண்டும் பெற மாட்டார்.",
        finalAnswerEn: "Wife 250; the residue 750 goes to the distant relatives 2:1 — daughter's son 500, daughter's daughter 250. The wife does not inherit again from the residue.",
        finalAnswerAr: "الزوجة 250؛ والباقي 750 يذهب إلى ذوي الأرحام بنسبة 2:1 — ابن البنت 500، وبنت البنت 250. ولا ترث الزوجة مرة أخرى من الباقي.",
      },
    ],
    preload: {
      estate: 1000,
      heirs: { wives: 1, daughtersChildren: 2 },
      options: { scenario: "dhawul-arham-with-spouse" },
      noteTa:
        "கணக்கு 266இன் உள்ளீடு: மனைவி 1, மகளின் பிள்ளைகள் 2. மகளின் மகன், மகளின் மகள் என்ற வேறுபாட்டை கணக்கீட்டாளரின் வாரிசு விசைகள் பிரிக்கவில்லை; 2:1 பிரிவு மேலே உள்ள எடுத்துக்காட்டில் காட்டப்பட்டுள்ளது.",
      noteEn:
        "Input for case 266: 1 wife, 2 daughters' children. The calculator's heir keys do not separate a daughter's son from a daughter's daughter; the 2:1 split is shown in the worked example above.",
      noteAr: "إدخال للمسألة 266: زوجة واحدة، وولدا بنت (2). ولا تفرّق مفاتيح الورثة في الحاسبة بين ابن البنت وبنت البنت؛ والتقسيم بنسبة 2:1 موضح في المثال المحلول أعلاه.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "நூலில் 2ஆம் கிளைக்கும் 4ஆம் கிளைக்கும் எடுத்துக்காட்டுக் கணக்கு எதுவும் இல்லை. இந்த முறை கிளை, படிநிலை வகைப்பாடு மட்டுமே; தன்ஸீல் கணக்கு இல்லை. 2ஆம், 4ஆம் கிளைகளைப் பயன்படுத்துவதற்கு முன் அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "The book gives no worked example for the 2nd or 4th branch. The method is branch-and-degree classification only; there is no tanzil computation. Confirm with a scholar before relying on branches 2 and 4.",
      textAr: "لا يعطي الكتاب مثالًا محلولًا للفرع الثاني ولا للفرع الرابع. والطريقة هي تصنيف حسب الفرع والدرجة فقط؛ ولا يوجد فيها حساب تنزيل. تأكد مع عالم قبل الاعتماد على الفرعين الثاني والرابع.",
    },
    hintTa:
      "முதலில் நிலையான பங்கு பெறும் வாரிசு யாரேனும் இருக்கிறார்களா என்று பார்க்கவும்; இல்லையெனில் தூரத்து உறவினர்களை அவர்களின் கிளை, படிநிலை ஆகியவற்றுடன் உள்ளிடவும்.",
    hintEn:
      "First check whether any fixed-share heir exists; if none, enter the distant relatives with their branch and degree.",
    hintAr: "تحقق أولًا مما إذا كان يوجد أي وارث ذي فرض؛ وإن لم يوجد، فأدخل ذوي الأرحام مع فرعهم ودرجتهم.",
    branches: [
      {
        titleTa: "கிளை 1",
        titleEn: "Branch 1",
        titleAr: "الفرع 1",
        itemsTa: ["மகளின் பிள்ளைகளும் அவர்களின் வழித்தோன்றல்களும்", "மகனின் மகளின் பிள்ளைகளும் அவர்களின் வழித்தோன்றல்களும்"],
        itemsEn: ["Daughter's children and their descendants", "Son's daughter's children and their descendants"],
        itemsAr: ["أولاد البنت وذريتهم", "أولاد بنت الابن وذريتهم"],
      },
      {
        titleTa: "கிளை 2",
        titleEn: "Branch 2",
        titleAr: "الفرع 2",
        itemsTa: ["பங்கும் மீதமும் பெறாத தாய் வழி பாட்டனும் தந்தை வழி மூதாதையரும் — ஜத்துஃபாஸித் / ஜத்ததாஃபாஸிதா"],
        itemsEn: ["The non-share, non-Asabah maternal grandfather and paternal ancestors — jadd fāsid / jadda fāsida"],
        itemsAr: ["الجد من جهة الأم غير صاحب الفرض وغير العاصب والأسلاف من جهة الأب — جد فاسد / جدة فاسدة"],
      },
      {
        titleTa: "கிளை 3",
        titleEn: "Branch 3",
        titleAr: "الفرع 3",
        itemsTa: ["சகோதரனின் மகளும் அவளின் வழித்தோன்றல்களும்", "சகோதரிகளின் பிள்ளைகளும் அவர்களின் வழித்தோன்றல்களும்", "தாய் வழி சகோதரனின் பிள்ளைகள்"],
        itemsEn: ["Brother's daughter and her descendants", "Sisters' children and their descendants", "Maternal brother's children"],
        itemsAr: ["بنت الأخ وذريتها", "أولاد الأخوات وذريتهم", "أولاد الأخ من جهة الأم"],
      },
      {
        titleTa: "கிளை 4",
        titleEn: "Branch 4",
        titleAr: "الفرع 4",
        itemsTa: ["தந்தையின் தாய் வழி சகோதரரும் அவரின் வழித்தோன்றல்களும்", "தாயின் சகோதரர்களும் சகோதரிகளும் அவர்களின் வழித்தோன்றல்களும்"],
        itemsEn: ["Father's maternal brother and his descendants", "Mother's brothers and sisters and their descendants"],
        itemsAr: ["الأخ من جهة أم الأب وذريته", "إخوة الأم وأخواتها وذريتهم"],
      },
    ],
  },
  {
    id: "grandfather-siblings",
    titleTa: "பாட்டன் + சகோதர/சகோதரிகள்",
    titleEn: "Grandfather with Siblings",
    titleAr: "الجد مع الإخوة والأخوات",
    arabicTerm: "الجد مع الإخوة والأخوات",
    bookRef: "rules 5.4.7 / 5.5.11; cases 113/114, 138/139",
    cardLineTa: "பாட்டன் சகோதர சகோதரிகளுடன் பங்கு பெறுதல்; இரு கருத்துகளும் காட்டப்பட்டுள்ளன.",
    cardLineEn: "Grandfather sharing with brothers and sisters, both schools shown.",
    cardLineAr: "الجد مع الإخوة والأخوات، مع عرض رأيي المذهبين.",
    explanationTa: [
      "தந்தை வழி பாட்டன், உடன் பிறந்த சகோதரிகளுடன் சேர்ந்து வாரிசாகும்போது இமாம்களின் கருத்து வேறுபடுகிறது. இமாம் அபூ ஹனீஃபா (ரஹ்) கருத்துப்படி பாட்டன் சகோதரிகளைத் தடுத்து, மீதம் முழுவதையும் தாமே பெறுகிறார்.",
      "இமாம் ஷாஃபிஈ (ரஹ்) கருத்துப்படி சகோதரிகள் தங்கள் நிலையான பங்குகளைப் பெறுகிறார்கள்; பாட்டன் எஞ்சிய மீதத்தைப் பெறுகிறார். நூல் இரண்டு கருத்துகளையும் இணைந்த எடுத்துக்காட்டுகளாகக் கணக்கிட்டுக் காட்டுகிறது — முழு சகோதரிகளுக்கு கணக்கு 113/114, தந்தை வழி சகோதரிகளுக்கு கணக்கு 138/139.",
      "நூலின் எல்லா எடுத்துக்காட்டுகளிலும் ஹனஃபி முறையே பயன்படுத்தப்படுகிறது; ஷாஃபிஈ முறை இணை எடுத்துக்காட்டாகக் காட்டப்படுகிறது. கணக்கீட்டாளரில் எந்தக் கருத்தைப் பின்பற்றுவது என்பதைத் தேர்ந்தெடுக்கவும்.",
    ],
    explanationEn: [
      "When a paternal grandfather inherits together with full or paternal sisters, the schools differ. According to Imam Abu Hanifa, the grandfather blocks the sisters and takes the whole residue himself.",
      "According to Imam al-Shafi'i, the sisters keep their fixed shares and the grandfather takes the remaining residue. The book works both views as parallel examples — cases 113/114 for full sisters and cases 138/139 for paternal sisters.",
      "In every worked example the book uses the Hanafi view; the Shafi'i view is a parallel example. Choose which opinion to follow in the calculator.",
    ],
    explanationAr: [
      "عندما يرث الجد من جهة الأب مع الأخوات الشقيقات أو لأب، تختلف المذاهب. فعلى رأي الإمام أبي حنيفة، يحجب الجد الأخوات ويأخذ كل الباقي بنفسه.",
      "وعلى رأي الإمام الشافعي، تحتفظ الأخوات بفروضهن الثابتة ويأخذ الجد الباقي المتبقي. وقد حسب الكتاب الرأيين معًا كمثالين متوازيين — المسألتان 113/114 للأخوات الشقيقات، والمسألتان 138/139 للأخوات لأب.",
      "وفي كل مثال محلول يستخدم الكتاب رأي الحنفية؛ ويُعرض رأي الشافعية كمثال موازٍ. اختر في الحاسبة أيَّ الرأيين تتبع.",
    ],
    formulaTa:
      "ஹனஃபி: சகோதரிகள் 0; பாட்டன் மீதம் முழுவதையும் பெறுகிறார். ஷாஃபிஈ: சகோதரிகள் தங்கள் நிலையான பங்கைப் பெறுகிறார்கள் (ஒருவர் 1/2; இருவர் அல்லது அதற்கு மேல் 2/3); பாட்டன் எஞ்சிய மீதத்தைப் பெறுகிறார்.",
    formulaEn:
      "Hanafi: sisters 0; the grandfather takes the whole residue. Shafi'i: the sisters keep their fixed shares (one sister 1/2; two or more 2/3); the grandfather takes the remaining residue.",
    formulaAr: "الحنفية: الأخوات 0؛ والجد يأخذ كل الباقي. الشافعية: تحتفظ الأخوات بفروضهن (أخت واحدة 1/2؛ واثنتان فأكثر 2/3)؛ والجد يأخذ الباقي المتبقي.",
    workedExamples: [
      {
        caseNo: 113,
        variantTa: "ஹனஃபி கருத்து",
        variantEn: "Hanafi view",
        variantAr: "رأي الحنفية",
        estate: 1300,
        steps: [
          { labelTa: "சகோதரிகள் (2) — பாட்டனால் தடுக்கப்பட்டனர்", labelEn: "Sisters (2) — blocked by the grandfather", labelAr: "الأخوات (2) — محجوبتان بالجد", fraction: "0", amount: 0 },
          { labelTa: "மனைவி — 1/4", labelEn: "Wife — 1/4", labelAr: "الزوجة — 1/4", fraction: "1/4", amount: 325 },
          { labelTa: "பாட்டன் — மீதம்", labelEn: "Grandfather — residue", labelAr: "الجد — الباقي", fraction: "—", amount: 975 },
        ],
        finalAnswerTa: "சகோதரிகள் 0; மனைவி 325; பாட்டன் 975.",
        finalAnswerEn: "Sisters 0; wife 325; grandfather 975.",
        finalAnswerAr: "الأخوات 0؛ والزوجة 325؛ والجد 975.",
      },
      {
        caseNo: 114,
        variantTa: "ஷாஃபிஈ கருத்து",
        variantEn: "Shafi'i view",
        variantAr: "رأي الشافعية",
        estate: 1300,
        steps: [
          { labelTa: "சகோதரிகள் (2) — 2/3", labelEn: "Sisters (2) — 2/3", labelAr: "الأخوات (2) — 2/3", fraction: "2/3", amount: 866.67 },
          { labelTa: "மனைவி — 1/4", labelEn: "Wife — 1/4", labelAr: "الزوجة — 1/4", fraction: "1/4", amount: 325 },
          { labelTa: "பாட்டன் — மீதம்", labelEn: "Grandfather — residue", labelAr: "الجد — الباقي", fraction: "—", amount: 108.33 },
        ],
        finalAnswerTa:
          "சகோதரிகள் 866.67; மனைவி 325; பாட்டன் 108.33. கவனிக்க: நூலில் பாட்டனின் மீதம் 975 என்று தவறாக அச்சாகியுள்ளது (கணக்கு 113இலிருந்து நகலெடுக்கப்பட்டது); சரியான தொகை 108.33.",
        finalAnswerEn:
          "Sisters 866.67; wife 325; grandfather 108.33. Note: the book misprints the grandfather's residue as 975 (copied from case 113); the correct amount is 108.33.",
        finalAnswerAr: "الأخوات 866.67؛ والزوجة 325؛ والجد 108.33. ملاحظة: يطبع الكتاب باقي الجد خطأً 975 (منسوخ من المسألة 113)؛ والمبلغ الصحيح هو 108.33.",
      },
    ],
    preload: {
      estate: 1300,
      heirs: { wives: 1, fullSisters: 2, paternalGrandfather: 1 },
      options: { school: "hanafi" },
      noteTa: "கணக்கு 113இன் உள்ளீடு (ஹனஃபி முறை). ஷாஃபிஈ முறையைப் பார்க்க கருத்தை மாற்றவும் — அதே உள்ளீட்டில் கணக்கு 114இன் முடிவு வரும்.",
      noteEn: "Input for case 113 (Hanafi view). Switch the opinion to see the Shafi'i result — case 114 — on the same input.",
      noteAr: "إدخال للمسألة 113 (رأي الحنفية). بدّل الرأي لترى نتيجة الشافعية — المسألة 114 — على الإدخال نفسه.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "ஆண் சகோதரர்களுடன் (முழு அல்லது தந்தை வழி சகோதரர்கள்) பாட்டன் சேர்ந்து வரும் நிலை பற்றி நூல் எதுவும் கூறவில்லை. எந்தக் கருத்தைப் பின்பற்றுவது என்பதையும் அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "The book is silent on a grandfather together with male brothers (full or paternal). Confirm with a scholar which opinion to follow.",
      textAr: "الكتاب ساكت عن الجد مع الإخوة الذكور (الأشقاء أو لأب). تأكد مع عالم أيَّ رأي تتبع.",
    },
    hintTa:
      "பாட்டனையும் சகோதரிகளையும் உள்ளிட்டு, எந்த இமாமின் கருத்தைப் பின்பற்றுவது என்பதைத் தேர்ந்தெடுக்கவும்.",
    hintEn:
      "Enter the grandfather and the sisters, then choose which imam's opinion to follow.",
    hintAr: "أدخل الجد والأخوات، ثم اختر رأي أيِّ إمام تتبع.",
  },
  {
    id: "debtor",
    titleTa: "கடனாளி",
    titleEn: "The Debtor's Estate",
    titleAr: "تركة المدين",
    arabicTerm: "المدين",
    bookRef: "p. 305; cases 272–273",
    cardLineTa: "கடன் கொடுத்தவர்கள் சொத்தைத் தங்கள் கடன் விகிதத்தில் பகிர்கிறார்கள்.",
    cardLineEn: "Creditors share the estate in proportion to their debts.",
    cardLineAr: "يتقاسم الدائنون التركة بنسبة ديونهم.",
    explanationTa: [
      "இறந்தவர் கடனுடன் இறந்திருந்தால், முதலில் கடனைச் செலுத்த வேண்டும். சொத்தும் கடனும் சமமாக இருந்தால் வாரிசுகளுக்கு எதுவும் கிடைக்காது.",
      "கடன் சொத்தைவிட அதிகமாக இருந்தால், கடன் கொடுத்தவர்களுக்கு ஒவ்வொருவராக முழுமையாகச் செலுத்தக்கூடாது; மொத்தச் சொத்தையும் கடன்களின் விகிதத்தில் பிரித்துக் கொடுக்க வேண்டும்.",
      "சொத்து கடனைவிட அதிகமாக இருந்தால், கடன்களை முழுமையாகச் செலுத்திவிட்டு, மீதத்தை வாரிசுகளுக்கு வழக்கம்போல் பிரிக்க வேண்டும். கடனில் குறைவை வாரிசுகள் தங்கள் பணத்திலிருந்து நிரப்புவது நல்ல செயல் (சாலச் சிறந்தது), கட்டாயம் அல்ல.",
    ],
    explanationEn: [
      "When the deceased died in debt, the debts must be paid first. If the estate equals the debt, the heirs get nothing.",
      "If the debt exceeds the estate, do not pay creditors one by one in full; divide the whole estate among them in proportion to their debts.",
      "If the estate exceeds the debt, pay the debts in full, then divide the remainder among the heirs in the normal way. Heirs topping up an unpaid shortfall from their own money is commendable, not obligatory.",
    ],
    explanationAr: [
      "عندما يموت المتوفى وعليه دين، يجب سداد الديون أولًا. فإن ساوت التركة الدين لم يحصل الورثة على شيء.",
      "وإن زاد الدين على التركة، فلا يجوز سداد الدائنين واحدًا تلو الآخر بالكامل؛ بل يجب تقسيم التركة كلها بينهم بنسبة ديونهم.",
      "وإن زادت التركة على الدين، فاسدد الديون بالكامل، ثم اقسم الباقي بين الورثة بالطريقة المعتادة. وتكميل الورثة للنقص غير المسدد من أموالهم الخاصة أمر مستحب، وليس واجبًا.",
    ],
    formulaTa: "விட்டுப்போன சொத்து × ஒவ்வொருவருக்கும் கொடுக்க வேண்டிய கடன் / மொத்தக் கடன்",
    formulaEn: "estate × each person's debt ÷ total debt",
    formulaAr: "التركة × دين كل شخص ÷ مجموع الدين",
    workedExamples: [
      {
        caseNo: 272,
        estate: 10000,
        steps: [
          { labelTa: "காலித் — கடன் 7,000", labelEn: "Khalid — debt 7,000", labelAr: "خالد — دين 7,000", fraction: "7/15", amount: 4666.67 },
          { labelTa: "அபூபக்கர் — கடன் 5,000", labelEn: "Abu Bakr — debt 5,000", labelAr: "أبو بكر — دين 5,000", fraction: "1/3", amount: 3333.33 },
          { labelTa: "அஹ்மத் — கடன் 3,000", labelEn: "Ahmad — debt 3,000", labelAr: "أحمد — دين 3,000", fraction: "1/5", amount: 2000 },
        ],
        finalAnswerTa: "மொத்தக் கடன் 15,000; சொத்து 10,000 மட்டுமே. கடன் கொடுத்தவர்களுக்கு விகிதப்படி பிரிக்கப்பட்டது. வாரிசுகளுக்கு (தாய், தந்தை, மகன், மனைவி) எதுவும் இல்லை.",
        finalAnswerEn: "Total debt 15,000; estate only 10,000. The estate is divided pro rata among the creditors. The heirs (mother, father, son, wife) get nothing.",
        finalAnswerAr: "مجموع الدين 15,000؛ والتركة 10,000 فقط. تُقسَّم التركة بنسبة الديون بين الدائنين. والورثة (الأم، والأب، والابن، والزوجة) لا يحصلون على شيء.",
      },
      {
        caseNo: 273,
        estate: 15000,
        steps: [
          { labelTa: "கடன்கள் — முழுமையாகச் செலுத்தப்பட்டன (10,000)", labelEn: "Debts — paid in full (10,000)", labelAr: "الديون — سُددت بالكامل (10,000)", fraction: "—", amount: 10000 },
          { labelTa: "மனைவி — மீதம் 5,000இல் 1/8", labelEn: "Wife — 1/8 of the remainder 5,000", labelAr: "الزوجة — 1/8 من الباقي 5,000", fraction: "1/8", amount: 625 },
          { labelTa: "பாட்டன் — மீதம் 5,000இல் 1/6", labelEn: "Grandfather — 1/6 of the remainder 5,000", labelAr: "الجد — 1/6 من الباقي 5,000", fraction: "1/6", amount: 833.33 },
          { labelTa: "மகன் — மீதத்தில் 2/3", labelEn: "Son — 2/3 of the residue", labelAr: "الابن — 2/3 من الباقي", fraction: "—", amount: 2361.12 },
          { labelTa: "மகள் — மீதத்தில் 1/3", labelEn: "Daughter — 1/3 of the residue", labelAr: "البنت — 1/3 من الباقي", fraction: "—", amount: 1180.56 },
        ],
        finalAnswerTa: "கடன் 10,000 முழுமையாகச் செலுத்தப்பட்டது; மீதம் 5,000 வாரிசுகளுக்குப் பிரிக்கப்பட்டது — மனைவி 625, பாட்டன் 833.33, மகன் 2,361.12, மகள் 1,180.56. கவனிக்க: நூலின் வட்டமிடப்பட்ட தொகைகள் கூட்டுத்தொகை 5,000.01; கணக்கீட்டாளர் மகனுக்கு 2,361.11 தந்து சரியாக 5,000.00 ஆக்குகிறது.",
        finalAnswerEn: "Debts of 10,000 paid in full; the remainder 5,000 divided among the heirs — wife 625, grandfather 833.33, son 2,361.12, daughter 1,180.56. Note: the book's rounded figures sum to 5,000.01; the calculator gives the son 2,361.11 so the total is exactly 5,000.00.",
        finalAnswerAr: "سُددت ديون 10,000 بالكامل؛ وقُسِّم الباقي 5,000 بين الورثة — الزوجة 625، والجد 833.33، والابن 2,361.12، والبنت 1,180.56. ملاحظة: مجموع أرقام الكتاب المدوّرة 5,000.01؛ وتعطي الحاسبة الابن 2,361.11 ليكون المجموع 5,000.00 بالضبط.",
      },
    ],
    preload: {
      estate: 10000,
      heirs: { mother: 1, father: 1, sons: 1, wives: 1 },
      options: { scenario: "debts-exceed-estate" },
      noteTa:
        "கணக்கு 272இன் உள்ளீடு: சொத்து 10,000, மொத்தக் கடன் 15,000 (காலித் 7,000; அபூபக்கர் 5,000; அஹ்மத் 3,000). கடன் கொடுத்தவர்கள் வாரிசுகள் அல்ல; அவர்களின் தொகைகளைக் கடன் பகுதியில் உள்ளிடவும். வாரிசுகளுக்கு எதுவும் கிடைக்காது.",
      noteEn:
        "Input for case 272: estate 10,000, total debt 15,000 (Khalid 7,000; Abu Bakr 5,000; Ahmad 3,000). Creditors are not heirs; enter their amounts in the debts section. The heirs get nothing.",
      noteAr: "إدخال للمسألة 272: التركة 10,000، ومجموع الدين 15,000 (خالد 7,000؛ وأبو بكر 5,000؛ وأحمد 3,000). والدائنون ليسوا ورثة؛ أدخل مبالغهم في قسم الديون. والورثة لا يحصلون على شيء.",
    },
    scholarFlag: {
      needed: false,
      textTa: "மூன்று நிலைகளும் சூத்திரமும் எடுத்துக்காட்டுகளுடன் தரப்பட்டுள்ளன. அறிஞர் உறுதி தேவையில்லை.",
      textEn: "The book gives all three states, the formula and the worked examples. No scholar confirmation is needed.",
      textAr: "الحالات الثلاث والصيغة والأمثلة المحلولة كلها مذكورة. ولا حاجة إلى تأكيد من عالم.",
    },
    hintTa:
      "மொத்தச் சொத்தையும் ஒவ்வொரு கடன் கொடுத்தவருக்கும் செலுத்த வேண்டிய கடன் தொகையையும் உள்ளிடவும்; கடன் சொத்தைவிட அதிகமாக இருந்தால் கணக்கீட்டாளர் விகிதப்படி பிரித்துக் காட்டும்.",
    hintEn:
      "Enter the total estate and the debt owed to each creditor; if the debt exceeds the estate, the calculator shows the pro-rata split.",
    hintAr: "أدخل مجموع التركة والدين المستحق لكل دائن؛ فإن زاد الدين على التركة أظهرت الحاسبة التقسيم بنسبة الديون.",
  },
  {
    id: "disqualified",
    titleTa: "தகுதியற்றவர்கள்",
    titleEn: "Disqualified Heirs",
    titleAr: "الممنوعون من الإرث",
    arabicTerm: "موانع الإرث",
    bookRef: "p. 38",
    cardLineTa: "கொலை, அடிமை நிலை, மத வேறுபாடு ஆகியவற்றால் தடுக்கப்பட்ட வாரிசுகள்.",
    cardLineEn: "Heirs barred by murder, slavery, or difference of religion.",
    cardLineAr: "الورثة الممنوعون بالقتل أو الرق أو اختلاف الدين.",
    explanationTa: [
      "நூல் மூன்று தகுதியின்மைக் காரணங்களை மட்டுமே கூறுகிறது: (1) அடிமை நிலை — இப்போது பொருந்தாது என்று நூலே கூறுகிறது; (2) கொலை — சொத்துக்குரியவரைக் கொன்ற வாரிசு அந்தச் சொத்தில் வாரிசாக மாட்டார்; (3) மத வேறுபாடு — முஸ்லிம் முஸ்லிம் அல்லாதவரிடமிருந்தும், முஸ்லிம் அல்லாதவர் முஸ்லிமிடமிருந்தும் வாரிசாக மாட்டார்.",
      "இது தனி கணக்கீடு அல்ல; வாரிசுகளை உள்ளிடும் படியில் தகுதியற்றவரைக் குறித்து நீக்கும் படி. தகுதியற்றவராகக் குறிக்கப்பட்டவர் பங்கீட்டிலிருந்து முற்றிலும் நீக்கப்படுவார்; கணக்கீடு மீதமுள்ள தகுதியுள்ள வாரிசுகளைக் கொண்டு மட்டுமே செய்யப்படும்.",
      "மதம் மாறியவரின் (முர்தத்) விதி தனி அத்தியாயத்தில் வருகிறது — “இஸ்லாத்தை விட்டு வெளியேறியவர்” என்ற பகுதியைப் பார்க்கவும்.",
    ],
    explanationEn: [
      "The book lists only three disqualifiers: (1) slavery — which the book itself says does not apply now; (2) murder — an heir who kills the estate-owner cannot inherit from that estate; (3) difference of religion — a Muslim cannot inherit from a non-Muslim, and vice versa.",
      "This is not a separate calculation; it is an eligibility step when entering the heirs. An heir marked disqualified is excluded from the distribution entirely; the calculation is made with the remaining eligible heirs only.",
      "The rule for an apostate (murtadd) is in its own chapter — see “The Apostate”.",
    ],
    explanationAr: [
      "لا يذكر الكتاب إلا ثلاثة موانع: (1) الرق — ويقول الكتاب نفسه إنه لا ينطبق الآن؛ (2) القتل — فالوارث الذي يقتل صاحب التركة لا يرث من تلك التركة؛ (3) اختلاف الدين — فالمسلم لا يرث من غير المسلم، ولا غير المسلم من المسلم.",
      "وهذه ليست حسابًا مستقلًا؛ بل هي خطوة أهلية عند إدخال الورثة. فالوارث المُعلَّم بأنه ممنوع يُستبعد من التقسيم تمامًا؛ ويُجرى الحساب بالورثة المستحقين الباقين فقط.",
      "أما حكم المرتد ففي فصل مستقل — انظر «المرتد».",
    ],
    formulaTa: "தகுதியற்ற வாரிசு = 0; மீதமுள்ள தகுதியுள்ள வாரிசுகளுக்கு மட்டுமே பங்கீடு.",
    formulaEn: "A disqualified heir = 0; the division is made among the remaining eligible heirs only.",
    formulaAr: "الوارث الممنوع = 0؛ ويُجرى التقسيم بين الورثة المستحقين الباقين فقط.",
    workedExamples: [],
    preload: {
      estate: 12000,
      heirs: { wives: 1, sons: 1, daughters: 1 },
      options: { scenario: "mark-disqualified" },
      noteTa:
        "இது நூலின் எடுத்துக்காட்டு அல்ல — நூல் இந்தப் பகுதிக்கு எடுத்துக்காட்டுக் கணக்கு எதையும் தரவில்லை. தகுதியின்மையைக் குறிக்கும் படியைக் காட்டும் உள்ளீடு மட்டுமே: வாரிசுகளை உள்ளிட்டு, தகுதியற்றவரைக் குறிக்கவும்.",
      noteEn:
        "This is not a book example — the book gives no worked example for this topic. It is only an input showing the disqualification step: enter the heirs, then mark the disqualified one.",
      noteAr: "هذا ليس مثالًا من الكتاب — فالكتاب لا يعطي مثالًا محلولًا لهذا الموضوع. وهو مجرد إدخال يوضح خطوة المنع: أدخل الورثة، ثم علّم الممنوع منهم.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "நூல் இந்தப் பகுதிக்கு எடுத்துக்காட்டுக் கணக்கு எதையும் தரவில்லை; தகுதியற்றவர் மற்ற வாரிசுகளைத் தடுப்பாரா என்பதையும் கூறவில்லை. அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "The book gives no worked example for this topic and does not say whether a disqualified heir still blocks other heirs. Confirm with a scholar.",
      textAr: "الكتاب لا يعطي مثالًا محلولًا لهذا الموضوع، ولا يقول ما إذا كان الوارث الممنوع يحجب غيره من الورثة. تأكد مع عالم.",
    },
    hintTa:
      "வாரிசுகளை உள்ளிட்ட பிறகு, தகுதியற்றவரைத் தேர்ந்தெடுத்துக் குறிக்கவும்; அவர் பங்கீட்டிலிருந்து நீக்கப்படுவார்.",
    hintEn:
      "After entering the heirs, select and mark the disqualified one; they will be excluded from the distribution.",
    hintAr: "بعد إدخال الورثة، اختر الممنوع وعلّمه؛ فسيُستبعد من التقسيم.",
  },
  {
    id: "sahih-fasid",
    titleTa: "ஜத்து / ஜத்தா ஸஹீஹ் / ஃபாஸித்",
    titleEn: "Ṣaḥīḥ / Fāsid Grandparent Classification",
    titleAr: "تصنيف الجد والجدة صحيح / فاسد",
    arabicTerm: "الجد الصحيح والجد الفاسد",
    bookRef: "lines 805–834",
    cardLineTa: "தொடர்புச் சங்கிலியால் பாட்டன் பாட்டிகள் ஸஹீஹ், ஃபாஸித் என வகைப்படுத்தப்படுகிறார்கள்.",
    cardLineEn: "Grandparents classed sound or unsound by their chain of relation.",
    cardLineAr: "يُصنَّف الأجداد والجدات صحيحًا أو فاسدًا بحسب سلسلة القرابة.",
    explanationTa: [
      "பாட்டன்/பாட்டி வகைகளைப் பிரிப்பது அவர்களின் தொடர்புச் சங்கிலியில் பெண் தொடர்பு வருகிறதா என்பதைப் பொறுத்தது. தந்தையின் தந்தை போன்ற தூய ஆண் வழித் தொடர்பு ஸஹீஹ் (சரியானது); தந்தையின் தாயின் தந்தை போன்ற தொடர்பு ஃபாஸித் (சரியற்றது).",
      "இந்த வகைப்பாடே ஒருவர் நிலையான பங்கு பெறும் வாரிசா, மீதம் பெறும் வாரிசா (அஸபா), அல்லது தூரத்து உறவினரா என்பதைத் தீர்மானிக்கிறது. தாய் வழி பாட்டன் (தாயின் தந்தை) “ஸஹீஹ்” என்று கூறப்பட்டாலும், அவர் தூரத்து உறவினர் வகையைச் சேர்ந்தவர்; நிலையான பங்கு, மீதம் பெறும் வாரிசுகள் இல்லாதபோது மட்டுமே வாரிசாகிறார்.",
      "பாட்டிகளுக்கும் இதே பிரிவு பொருந்தும் (ஜத்தா ஸஹீஹா / ஃபாஸிதா). நூல் எட்டு வகைகள் உள்ளன என்கிறது; ஒவ்வொன்றின் முடிவையும் தனித்தனியாகக் கூறவில்லை — கீழே உள்ள அட்டவணையில் நூல் கூறிய முடிவுகள் மட்டுமே தரப்பட்டுள்ளன, மற்றவை அறிஞர் உறுதிக்காகக் குறிக்கப்பட்டுள்ளன.",
    ],
    explanationEn: [
      "Grandfathers and grandmothers are classified by whether a female link intervenes in their chain of relation. A pure male-line link, such as the father's father, is ṣaḥīḥ (sound); a link such as the father's mother's father is fāsid (unsound).",
      "This classification decides whether such a person is a fixed-share heir, a residuary heir (ʿAṣabah), or a distant relative. The maternal grandfather (the mother's father) is called “ṣaḥīḥ” yet still belongs to the distant kindred; he inherits only when no fixed-share or residuary heir exists.",
      "The same split applies to grandmothers (jadda ṣaḥīḥa / fāsida). The book says there are eight categories but does not state each one's outcome separately — the table below gives only the outcomes the book states; the rest are marked for scholar confirmation.",
    ],
    explanationAr: [
      "يُصنَّف الأجداد والجدات بحسب ما إذا كانت هناك رابطة أنثى في سلسلة قرابتهم. فالرابطة الذكورية الخالصة، كأبي الأب، صحيحة؛ والرابطة كأبي أم الأب فاسدة.",
      "وهذا التصنيف هو الذي يحدد ما إذا كان الشخص وارثًا ذا فرض، أو وارثًا عاصبًا، أو من ذوي الأرحام. فالجد من جهة الأم (أبو الأم) يُسمى «صحيحًا» ومع ذلك يبقى من ذوي الأرحام؛ فلا يرث إلا عند عدم وجود وارث ذي فرض أو وارث عاصب.",
      "وينطبق التقسيم نفسه على الجدات (جدة صحيحة / فاسدة). ويقول الكتاب إن هناك ثمانية أصناف لكنه لا يذكر نتيجة كل صنف على حدة — فالجدول أدناه يعطي فقط النتائج التي ذكرها الكتاب؛ والباقي مُعلَّم للتأكيد من عالم.",
    ],
    formulaTa:
      "சங்கிலியில் பெண் தொடர்பு இல்லாத தந்தை வழி பாட்டன் = ஸஹீஹ் (நிலையான பங்கு வாரிசு); பெண் தொடர்பு வரும் தொடர்பு = ஃபாஸித் (தூரத்து உறவினர்); தாய் வழி பாட்டன் = ஸஹீஹ் என்றாலும் தூரத்து உறவினர்.",
    formulaEn:
      "A paternal grandfather with no female link in the chain = ṣaḥīḥ (fixed-share heir); a link with a female intervening = fāsid (distant relative); a maternal grandfather = a distant relative even when called ṣaḥīḥ.",
    formulaAr: "الجد من جهة الأب بلا رابطة أنثى في السلسلة = صحيح (وارث ذو فرض)؛ والرابطة التي تدخل فيها أنثى = فاسد (من ذوي الأرحام)؛ والجد من جهة الأم = من ذوي الأرحام حتى وإن سُمي صحيحًا.",
    workedExamples: [],
    preload: {
      estate: 12000,
      heirs: { maternalGrandfather: 1 },
      options: { scenario: "classify-grandparent" },
      noteTa:
        "இது நூலின் எடுத்துக்காட்டு அல்ல — நூல் இந்தப் பகுதிக்கு எடுத்துக்காட்டுக் கணக்கு எதையும் தரவில்லை. வகைப்பாட்டுப் படியைக் காட்டும் உள்ளீடு மட்டுமே: தாய் வழி பாட்டன் தூரத்து உறவினராக வகைப்படுத்தப்படுவார்.",
      noteEn:
        "This is not a book example — the book gives no worked example for this topic. It is only an input showing the classification step: a maternal grandfather is classified as a distant relative.",
      noteAr: "هذا ليس مثالًا من الكتاب — فالكتاب لا يعطي مثالًا محلولًا لهذا الموضوع. وهو مجرد إدخال يوضح خطوة التصنيف: فالجد من جهة الأم يُصنَّف من ذوي الأرحام.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "சில வகைகளின் முடிவுகள் தனியாகக் கூறப்படவில்லை. வகைப்பாட்டைப் பயன்படுத்துவதற்கு முன் அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "The outcomes of some categories are not stated separately. Confirm the classification with a scholar before relying on it.",
      textAr: "نتائج بعض الأصناف غير مذكورة على حدة. تأكد من التصنيف مع عالم قبل الاعتماد عليه.",
    },
    hintTa:
      "பாட்டன்/பாட்டியின் தொடர்புச் சங்கிலியை உள்ளிடவும்; கணக்கீட்டாளர் அவரை ஸஹீஹ் அல்லது ஃபாஸித் என்று வகைப்படுத்தி, நிலையான பங்கு வாரிசா, மீதம் பெறும் வாரிசா, தூரத்து உறவினரா என்பதைக் காட்டும்.",
    hintEn:
      "Enter the grandfather's or grandmother's chain of relation; the calculator classifies them as ṣaḥīḥ or fāsid and shows whether they are a fixed-share heir, a residuary heir, or a distant relative.",
    hintAr: "أدخل سلسلة قرابة الجد أو الجدة؛ فتصنفها الحاسبة صحيحًا أو فاسدًا، وتوضح ما إذا كان وارثًا ذا فرض، أو وارثًا عاصبًا، أو من ذوي الأرحام.",
    categories: [
      {
        nameTa: "தந்தை வழி பாட்டன் — ஸஹீஹ் (தந்தையின் தந்தை, தூய ஆண் வழி)",
        nameEn: "Paternal grandfather — ṣaḥīḥ (father's father, pure male line)",
        nameAr: "الجد من جهة الأب — صحيح (أبو الأب، سلسلة ذكورية خالصة)",
        resultTa: "நிலையான பங்கு பெறும் வாரிசு.",
        resultEn: "Fixed-share heir.",
        resultAr: "وارث ذو فرض.",
      },
      {
        nameTa: "தந்தை வழி பாட்டன் — ஃபாஸித் (தந்தையின் தாயின் தந்தை)",
        nameEn: "Paternal grandfather — fāsid (father's mother's father)",
        nameAr: "الجد من جهة الأب — فاسد (أبو أم الأب)",
        resultTa: "நிலையான பங்கு வாரிசு அல்ல; தூரத்து உறவினர்.",
        resultEn: "Not a fixed-share heir; a distant relative.",
        resultAr: "ليس وارثًا ذا فرض؛ بل من ذوي الأرحام.",
      },
      {
        nameTa: "தாய் வழி பாட்டன் — ஸஹீஹ் (தாயின் தந்தை)",
        nameEn: "Maternal grandfather — ṣaḥīḥ (mother's father)",
        nameAr: "الجد من جهة الأم — صحيح (أبو الأم)",
        resultTa: "“ஸஹீஹ்” என்றாலும் தூரத்து உறவினர்; நிலையான பங்கு, மீதம் பெறும் வாரிசுகள் இல்லாதபோது மட்டுமே வாரிசு.",
        resultEn: "Called “ṣaḥīḥ” yet still a distant relative; inherits only when no fixed-share or residuary heir exists.",
        resultAr: "يُسمى «صحيحًا» ومع ذلك يبقى من ذوي الأرحام؛ فلا يرث إلا عند عدم وجود وارث ذي فرض أو وارث عاصب.",
      },
      {
        nameTa: "தாய் வழி பாட்டன் — ஃபாஸித் (தாயின் தாயின் தந்தை)",
        nameEn: "Maternal grandfather — fāsid (mother's mother's father)",
        nameAr: "الجد من جهة الأم — فاسد (أبو أم الأم)",
        resultTa: "நூலில் தனியாகக் கூறப்படவில்லை — அறிஞரிடம் உறுதி செய்க.",
        resultEn: "Not stated separately in the book — confirm with a scholar.",
        resultAr: "غير مذكور على حدة في الكتاب — تأكد مع عالم.",
      },
      {
        nameTa: "தந்தை வழி பாட்டி — ஸஹீஹா",
        nameEn: "Paternal grandmother — ṣaḥīḥa",
        nameAr: "الجدة من جهة الأب — صحيحة",
        resultTa: "நிலையான பங்கு பெறும் வாரிசு (பாட்டிகளின் 1/6 பங்கு).",
        resultEn: "Fixed-share heir (the grandmothers' 1/6 share).",
        resultAr: "وارثة ذات فرض (فرض الجدات 1/6).",
      },
      {
        nameTa: "தந்தை வழி பாட்டி — ஃபாஸிதா",
        nameEn: "Paternal grandmother — fāsida",
        nameAr: "الجدة من جهة الأب — فاسدة",
        resultTa: "நூலில் தனியாகக் கூறப்படவில்லை — அறிஞரிடம் உறுதி செய்க.",
        resultEn: "Not stated separately in the book — confirm with a scholar.",
        resultAr: "غير مذكور على حدة في الكتاب — تأكد مع عالم.",
      },
      {
        nameTa: "தாய் வழி பாட்டி — ஸஹீஹா",
        nameEn: "Maternal grandmother — ṣaḥīḥa",
        nameAr: "الجدة من جهة الأم — صحيحة",
        resultTa: "நிலையான பங்கு பெறும் வாரிசு (பாட்டிகளின் 1/6 பங்கு).",
        resultEn: "Fixed-share heir (the grandmothers' 1/6 share).",
        resultAr: "وارثة ذات فرض (فرض الجدات 1/6).",
      },
      {
        nameTa: "தாய் வழி பாட்டி — ஃபாஸிதா",
        nameEn: "Maternal grandmother — fāsida",
        nameAr: "الجدة من جهة الأم — فاسدة",
        resultTa: "நூலில் தனியாகக் கூறப்படவில்லை — அறிஞரிடம் உறுதி செய்க.",
        resultEn: "Not stated separately in the book — confirm with a scholar.",
        resultAr: "غير مذكور على حدة في الكتاب — تأكد مع عالم.",
      },
    ],
  },
  {
    id: "unborn-child",
    titleTa: "கர்ப்பத்திலுள்ள குழந்தை",
    titleEn: "The Unborn Child",
    titleAr: "الحمل",
    arabicTerm: "ميراث الحمل",
    bookRef: "p. 284; cases 267–268",
    cardLineTa: "பிறப்புவரை பிரிக்காமல் இருத்தல், அல்லது ஆண் பெண் கணக்குகள்.",
    cardLineEn: "Division waits for birth, or uses male and female scenarios.",
    cardLineAr: "يُؤجَّل التقسيم حتى الولادة، أو يُحسب بسيناريو الذكر والأنثى.",
    explanationTa: [
      "கணவர் இறக்கும்போது மனைவி கர்ப்பமாக இருந்தால், குழந்தை பிறக்கும்வரை பிரிக்காமல் இருப்பதே நூலின் அறிவுரை. வாரிசுகள் பிரிக்க வேண்டும் என்று வற்புறுத்தினால், இரண்டு முறை கணக்கிட வேண்டும்: குழந்தையை ஆணாகக் கொண்டு ஒரு முறை, பெண்ணாகக் கொண்டு ஒரு முறை.",
      "ஒவ்வொரு வாரிசுக்கும் இரண்டு கணக்குகளில் குறைவான தொகையை இப்போது கொடுக்க வேண்டும்; மீதத்தைத் தாய் பிரசவிக்கும்வரை நிறுத்தி வைக்க வேண்டும். பிறந்த பிறகு, குழந்தையின் உண்மையான பாலினத்திற்கு ஏற்ப நிறுத்தி வைத்த தொகை பிரிக்கப்படும்.",
    ],
    explanationEn: [
      "If the wife is pregnant when the husband dies, the book advises not dividing until the child is born. If the heirs insist on dividing, compute twice: once treating the unborn child as male, once as female.",
      "Pay each heir the smaller of the two amounts now, and hold the rest until the mother gives birth. After birth, the held amount is distributed according to the child's actual sex.",
    ],
    explanationAr: [
      "إذا كانت الزوجة حاملًا عند وفاة الزوج، فينصح الكتاب بعدم التقسيم حتى يولد الطفل. وإن أصر الورثة على التقسيم، فاحسب مرتين: مرة باعتبار الحمل ذكرًا، ومرة باعتبارها أنثى.",
      "ادفع لكل وارث أقل المبلغين الآن، وأوقف الباقي حتى تلد الأم. وبعد الولادة يُوزَّع المبلغ الموقوف بحسب جنس الطفل الحقيقي.",
    ],
    formulaTa: "ஆண் கணக்கு, பெண் கணக்கு என இரண்டு முறை கணக்கிடுக; ஒவ்வொருவருக்கும் குறைவான தொகையைக் கொடுத்து, மீதத்தை நிறுத்தி வைக்கவும்.",
    formulaEn: "Compute twice — a male scenario and a female scenario; pay each heir the lesser amount and hold the rest.",
    formulaAr: "احسب مرتين — سيناريو الذكر وسيناريو الأنثى؛ وادفع لكل وارث المبلغ الأقل، وأوقف الباقي.",
    workedExamples: [
      {
        caseNo: 267,
        estate: 39000,
        steps: [
          { labelTa: "மனைவி — 1/8 (இப்போது கொடுக்க)", labelEn: "Wife — 1/8 (pay now)", labelAr: "الزوجة — 1/8 (تُدفع الآن)", fraction: "1/8", amount: 4875 },
          { labelTa: "தாய் — 1/6 (இப்போது கொடுக்க)", labelEn: "Mother — 1/6 (pay now)", labelAr: "الأم — 1/6 (تُدفع الآن)", fraction: "1/6", amount: 6500 },
          { labelTa: "நிறுத்தி வைக்க — பிறப்புவரை", labelEn: "Held — until birth", labelAr: "الموقوف — حتى الولادة", fraction: "—", amount: 27625 },
        ],
        finalAnswerTa:
          "இப்போது கொடுக்க: மனைவி 4,875 + தாய் 6,500 = 11,375. நிறுத்தி வைக்க: 27,625. (ஆண் கணக்கில் பிறக்காத மகன் மீதம் 27,625; பெண் கணக்கில் பிறக்காத மகள் 1/2 = 19,500, தந்தை வழி சித்தப்பா மீதம் 8,125.)",
        finalAnswerEn:
          "Pay now: wife 4,875 + mother 6,500 = 11,375. Hold 27,625. (Male scenario: unborn son takes the residue 27,625; female scenario: unborn daughter 1/2 = 19,500, paternal uncle takes the residue 8,125.)",
        finalAnswerAr: "ادفع الآن: الزوجة 4,875 + الأم 6,500 = 11,375. وأوقف 27,625. (سيناريو الذكر: الابن الذي لم يولد يأخذ الباقي 27,625؛ وسيناريو الأنثى: البنت التي لم تولد 1/2 = 19,500، والعم من جهة الأب يأخذ الباقي 8,125.)",
      },
      {
        caseNo: 268,
        estate: 8000,
        steps: [
          { labelTa: "மனைவி — 1/8 (இப்போது கொடுக்க)", labelEn: "Wife — 1/8 (pay now)", labelAr: "الزوجة — 1/8 (تُدفع الآن)", fraction: "1/8", amount: 1000 },
          { labelTa: "தாய் — 1/6 (இப்போது கொடுக்க)", labelEn: "Mother — 1/6 (pay now)", labelAr: "الأم — 1/6 (تُدفع الآن)", fraction: "1/6", amount: 1333.33 },
          { labelTa: "மகள் — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Daughter — lesser amount (pay now)", labelAr: "البنت — المبلغ الأقل (يُدفع الآن)", fraction: "—", amount: 1888.89 },
          { labelTa: "நிறுத்தி வைக்க — பிறப்புவரை", labelEn: "Held — until birth", labelAr: "الموقوف — حتى الولادة", fraction: "—", amount: 3777.78 },
        ],
        finalAnswerTa:
          "இப்போது கொடுக்க: மனைவி 1,000 + தாய் 1,333.33 + மகள் 1,888.89 = 4,222.22. நிறுத்தி வைக்க: 3,777.78. சித்தப்பாவுக்கு இப்போது 0. (ஆண் கணக்கில் பிறக்காத மகனும் மகளும் மீதத்தை 2:1 எனப் பிரிக்கிறார்கள்; பெண் கணக்கில் இரு மகள்கள் 2/3 = 5,333.33 பெறுகிறார்கள், சித்தப்பா மீதம் 333.33.)",
        finalAnswerEn:
          "Pay now: wife 1,000 + mother 1,333.33 + daughter 1,888.89 = 4,222.22. Hold 3,777.78. The uncle gets 0 now. (Male scenario: the unborn son and the daughter share the residue 2:1; female scenario: the two daughters take 2/3 = 5,333.33, the uncle takes the residue 333.33.)",
        finalAnswerAr: "ادفع الآن: الزوجة 1,000 + الأم 1,333.33 + البنت 1,888.89 = 4,222.22. وأوقف 3,777.78. والعم لا يأخذ شيئًا الآن. (سيناريو الذكر: الابن الذي لم يولد والبنت يشتركان في الباقي بنسبة 2:1؛ وسيناريو الأنثى: البنتان تأخذان 2/3 = 5,333.33، والعم يأخذ الباقي 333.33.)",
      },
    ],
    preload: {
      estate: 8000,
      heirs: { wives: 1, daughters: 1, mother: 1, paternalUncles: 1 },
      options: { scenario: "unborn-male" },
      noteTa:
        "கணக்கு 268இன் உள்ளீடு; ஆண் கணக்கு முன்னிருப்பாக ஏற்றப்படும். பெண் கணக்கையும் மேலே உள்ள எடுத்துக்காட்டில் காண்க. பிறக்காத குழந்தைக்கு கணக்கீட்டாளரில் தனி விசை இல்லை; கர்ப்ப நிலையைத் தேர்ந்தெடுக்கவும்.",
      noteEn:
        "Input for case 268; the male scenario is prefilled. See the worked example above for the female scenario. There is no separate heir key for the unborn child; select the pregnancy option.",
      noteAr: "إدخال للمسألة 268؛ وسيناريو الذكر معبأ مسبقًا. وانظر المثال المحلول أعلاه لسيناريو الأنثى. ولا يوجد مفتاح وارث مستقل للحمل؛ فاختر خيار الحمل.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "இரட்டைக் குழந்தைகள் / பல குழந்தைகள், இறந்து பிறக்கும் குழந்தை, காத்திருப்புக்கான கால வரம்பு ஆகியவை பற்றி நூல் எதுவும் கூறவில்லை. அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "The book is silent on twins / multiple births, a stillborn child, and any time limit. Confirm with a scholar.",
      textAr: "الكتاب ساكت عن التوائم / الولادات المتعددة، وعن المولود ميتًا، وعن أي حد زمني. تأكد مع عالم.",
    },
    hintTa:
      "கர்ப்பமாக உள்ள மனைவியையும் மற்ற வாரிசுகளையும் உள்ளிடவும்; கணக்கீட்டாளர் ஆண்/பெண் இரு கணக்குகளையும் காட்டி, குறைவான தொகையையும் நிறுத்தி வைக்க வேண்டிய தொகையையும் கணக்கிடும்.",
    hintEn:
      "Enter the pregnant wife and the other heirs; the calculator shows both the male and female scenarios, the lesser amounts to pay, and the amount to hold.",
    hintAr: "أدخل الزوجة الحامل والورثة الآخرين؛ فتعرض الحاسبة سيناريو الذكر والأنثى معًا، والمبالغ الأقل للدفع، والمبلغ الواجب إيقافه.",
  },
  {
    id: "missing-person",
    titleTa: "காணாமல் போனவர் / கைதி",
    titleEn: "The Missing Person / Prisoner",
    titleAr: "المفقود / السجين",
    arabicTerm: "المفقود",
    bookRef: "p. 308; cases 274–277",
    cardLineTa: "காணாமல் போன வாரிசின் பங்கு உயிர் மரணம் தெரியும்வரை நிறுத்தி வைக்கப்படும்.",
    cardLineEn: "A missing heir's share is held until life or death is known.",
    cardLineAr: "تُوقف حصة الوارث المفقود حتى يُعرف أنه حي أو ميت.",
    explanationTa: [
      "வாரிசுகளில் ஒருவர் காணாமல் போயிருந்தாலோ, சிறையில் இருந்து அவரைப் பற்றிய செய்தி இல்லாமல் இருந்தாலோ, அவர் உயிருடன் இருக்கிறாரா இறந்துவிட்டாரா என்பது தெளிவாகும்வரை பிரிக்காமல் இருப்பதே நூலின் அறிவுரை.",
      "மற்ற வாரிசுகள் பிரிக்க வேண்டும் என்று வற்புறுத்தினால், கர்ப்பக் குழந்தை விதியைப் போலவே இரண்டு முறை கணக்கிட வேண்டும்: அவர் உயிருடன் இருப்பதாகக் கொண்டு ஒரு முறை, இறந்துவிட்டதாகக் கொண்டு ஒரு முறை; ஒவ்வொருவருக்கும் குறைவான தொகையைக் கொடுத்து, வித்தியாசத்தை நிறுத்தி வைக்க வேண்டும்.",
      "காத்திருப்புக் காலம் பற்றி அறிஞர்கள் வேறுபடுகிறார்கள்; 70 ஆண்டுகள் என்பது இமாம்களின் ஏகோபித்த கருத்து என்று நூல் கூறுகிறது. 70 ஆண்டுகளை எப்போதிருந்து எண்ணுவது, காலம் முடிந்த பிறகு நிறுத்தி வைத்த பங்கு என்ன ஆகும் என்பதை நூல் கூறவில்லை.",
    ],
    explanationEn: [
      "If one of the heirs is missing, or imprisoned with no news of him, the book advises postponing division until it is clear whether he is alive or dead.",
      "If the other heirs insist, compute twice — exactly like the unborn-child rule: once as if he is alive, once as if he is dead; pay each heir the smaller amount and hold the difference.",
      "Scholars differ on the waiting period, but the book states 70 years as the unanimous opinion of the imams. It gives no start date for counting the 70 years and no rule for what happens to the held share when the period ends.",
    ],
    explanationAr: [
      "إذا كان أحد الورثة مفقودًا، أو مسجونًا ولا خبر عنه، فينصح الكتاب بتأجيل التقسيم حتى يتضح ما إذا كان حيًا أو ميتًا.",
      "وإن أصر الورثة الآخرون على التقسيم، فاحسب مرتين — تمامًا كحكم الحمل: مرة باعتباره حيًا، ومرة باعتباره ميتًا؛ وادفع لكل وارث المبلغ الأصغر، وأوقف الفرق.",
      "يختلف العلماء في مدة الانتظار، لكن الكتاب يذكر 70 سنة باعتبارها رأي الأئمة المتفق عليه. ولا يعطي تاريخًا لبدء عدّ السبعين سنة، ولا حكمًا لما يحدث للحصة الموقوفة عند انتهاء المدة.",
    ],
    formulaTa: "உயிருடன் இருப்பதாக ஒரு கணக்கு, இறந்ததாக ஒரு கணக்கு; ஒவ்வொருவருக்கும் குறைவான தொகையைக் கொடுத்து, வித்தியாசத்தை நிறுத்தி வைக்கவும். காத்திருப்புக் காலம்: 70 ஆண்டுகள் (நூல் கூற்றுப்படி).",
    formulaEn: "One computation as if alive, one as if dead; pay each heir the lesser amount and hold the difference. Waiting period: 70 years (as stated in the book).",
    formulaAr: "حساب واحد باعتباره حيًا، وحساب واحد باعتباره ميتًا؛ وادفع لكل وارث المبلغ الأقل، وأوقف الفرق. مدة الانتظار: 70 سنة (كما ذكر الكتاب).",
    workedExamples: [
      {
        caseNo: 274,
        estate: 5000,
        steps: [
          { labelTa: "மனைவி — 1/8 (இப்போது கொடுக்க)", labelEn: "Wife — 1/8 (pay now)", labelAr: "الزوجة — 1/8 (تُدفع الآن)", fraction: "1/8", amount: 625 },
          { labelTa: "நிறுத்தி வைக்க — மகன் திரும்பும்வரை / காலம் முடியும்வரை", labelEn: "Held — until the son returns / the period ends", labelAr: "الموقوف — حتى عودة الابن / انتهاء المدة", fraction: "—", amount: 4375 },
        ],
        finalAnswerTa: "இப்போது கொடுக்க: மனைவி 625 மட்டும். நிறுத்தி வைக்க: 4,375. (உயிருடன் இருந்தால் மகன் மீதம் 4,375; இறந்திருந்தால் மனைவி 1/4 = 1,250, சகோதரர் மீதம் 3,750.)",
        finalAnswerEn: "Pay now: wife 625 only. Hold 4,375. (If alive, the son takes the residue 4,375; if dead, the wife takes 1/4 = 1,250 and the brother takes the residue 3,750.)",
        finalAnswerAr: "ادفع الآن: الزوجة 625 فقط. وأوقف 4,375. (إن كان حيًا، يأخذ الابن الباقي 4,375؛ وإن كان ميتًا، تأخذ الزوجة 1/4 = 1,250 ويأخذ الأخ الباقي 3,750.)",
      },
      {
        caseNo: 275,
        estate: 120000,
        steps: [
          { labelTa: "மனைவி — 1/4 (இப்போது கொடுக்க)", labelEn: "Wife — 1/4 (pay now)", labelAr: "الزوجة — 1/4 (تُدفع الآن)", fraction: "1/4", amount: 30000 },
          { labelTa: "தாய் — 1/6 (இப்போது கொடுக்க)", labelEn: "Mother — 1/6 (pay now)", labelAr: "الأم — 1/6 (تُدفع الآن)", fraction: "1/6", amount: 20000 },
          { labelTa: "சகோதரர் — மீதம் (இப்போது கொடுக்க)", labelEn: "Brother — residue (pay now)", labelAr: "الأخ — الباقي (يُدفع الآن)", fraction: "—", amount: 46666.67 },
          { labelTa: "நிறுத்தி வைக்க — காணாமல் போன சகோதரியின் பங்கு", labelEn: "Held — the missing sister's share", labelAr: "الموقوف — حصة الأخت المفقودة", fraction: "—", amount: 23333.33 },
        ],
        finalAnswerTa:
          "இப்போது கொடுக்க: மனைவி 30,000 + தாய் 20,000 + சகோதரர் 46,666.67 = 96,666.67. நிறுத்தி வைக்க: 23,333.33. கவனிக்க: நூலில் ஒரு இடத்தில் காணாமல் போன சகோதரியின் பங்கு 233,333.33 என்று அச்சாகியுள்ளது; சரியான தொகை 23,333.33.",
        finalAnswerEn:
          "Pay now: wife 30,000 + mother 20,000 + brother 46,666.67 = 96,666.67. Hold 23,333.33. Note: the book misprints the missing sister's share as 233,333.33 in one line; the correct figure is 23,333.33.",
        finalAnswerAr: "ادفع الآن: الزوجة 30,000 + الأم 20,000 + الأخ 46,666.67 = 96,666.67. وأوقف 23,333.33. ملاحظة: يطبع الكتاب حصة الأخت المفقودة 233,333.33 في سطر واحد؛ والرقم الصحيح هو 23,333.33.",
      },
      {
        caseNo: 276,
        estate: 26000,
        steps: [
          { labelTa: "கணவர் — 1/4 (இப்போது கொடுக்க)", labelEn: "Husband — 1/4 (pay now)", labelAr: "الزوج — 1/4 (يُدفع الآن)", fraction: "1/4", amount: 6500 },
          { labelTa: "நிறுத்தி வைக்க", labelEn: "Held", labelAr: "الموقوف", fraction: "—", amount: 19500 },
        ],
        finalAnswerTa: "இப்போது கொடுக்க: கணவர் 6,500 மட்டும். நிறுத்தி வைக்க: 19,500.",
        finalAnswerEn: "Pay now: husband 6,500 only. Hold 19,500.",
        finalAnswerAr: "ادفع الآن: الزوج 6,500 فقط. وأوقف 19,500.",
      },
      {
        caseNo: 277,
        estate: 20000,
        steps: [
          { labelTa: "மனைவி — 1/8 (இப்போது கொடுக்க)", labelEn: "Wife — 1/8 (pay now)", labelAr: "الزوجة — 1/8 (تُدفع الآن)", fraction: "1/8", amount: 2500 },
          { labelTa: "தந்தை வழி சித்தப்பா — மீதம் (இப்போது கொடுக்க)", labelEn: "Paternal uncle — residue (pay now)", labelAr: "العم من جهة الأب — الباقي (يُدفع الآن)", fraction: "—", amount: 7500 },
          { labelTa: "நிறுத்தி வைக்க", labelEn: "Held", labelAr: "الموقوف", fraction: "—", amount: 10000 },
        ],
        finalAnswerTa: "இப்போது கொடுக்க: மனைவி 2,500 + சித்தப்பா 7,500 = 10,000. நிறுத்தி வைக்க: 10,000.",
        finalAnswerEn: "Pay now: wife 2,500 + uncle 7,500 = 10,000. Hold 10,000.",
        finalAnswerAr: "ادفع الآن: الزوجة 2,500 + العم 7,500 = 10,000. وأوقف 10,000.",
      },
    ],
    preload: {
      estate: 5000,
      heirs: { wives: 1, sons: 1, fullBrothers: 1 },
      options: { scenario: "missing-alive" },
      noteTa:
        "கணக்கு 274இன் உள்ளீடு; உயிருடன் இருப்பதாகக் கொண்ட கணக்கு முன்னிருப்பாக ஏற்றப்படும். இறந்ததாகக் கொண்ட கணக்கை மேலே உள்ள எடுத்துக்காட்டில் காண்க. காணாமல் போன மகனைக் குறிக்கும் விருப்பத்தைத் தேர்ந்தெடுக்கவும்.",
      noteEn:
        "Input for case 274; the alive scenario is prefilled. See the worked example above for the dead scenario. Select the option marking the son as missing.",
      noteAr: "إدخال للمسألة 274؛ وسيناريو الحياة معبأ مسبقًا. وانظر المثال المحلول أعلاه لسيناريو الموت. واختر الخيار الذي يعلّم الابن مفقودًا.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "70 ஆண்டுகள் என்பதை அறிஞரிடம் உறுதி செய்ய வேண்டும் — எப்போதிருந்து எண்ணுவது என்றும், காலம் முடிந்த பிறகு நிறுத்தி வைத்த பங்கு என்ன ஆகும் என்றும் நூல் கூறவில்லை. சிறையில் இருப்பது தெரிந்த கைதிக்குத் தனி விதி எதுவும் நூலில் இல்லை.",
      textEn:
        "The 70 years need scholar confirmation — the book gives no start date for counting them and no rule for the held share when the period ends. There is no separate rule in the book for a prisoner known to be alive in jail.",
      textAr: "السبعون سنة تحتاج إلى تأكيد من عالم — فالكتاب لا يعطي تاريخًا لبدء عدّها، ولا حكمًا للحصة الموقوفة عند انتهاء المدة. ولا يوجد في الكتاب حكم مستقل للسجين المعروف أنه حي في السجن.",
    },
    hintTa:
      "காணாமல் போன வாரிசையும் மற்ற வாரிசுகளையும் உள்ளிடவும்; கணக்கீட்டாளர் உயிர்/மரண இரு கணக்குகளையும் காட்டி, குறைவான தொகையையும் நிறுத்தி வைக்க வேண்டிய தொகையையும் கணக்கிடும்.",
    hintEn:
      "Enter the missing heir and the other heirs; the calculator shows both the alive and dead scenarios, the lesser amounts to pay, and the amount to hold.",
    hintAr: "أدخل الوارث المفقود والورثة الآخرين؛ فتعرض الحاسبة سيناريو الحياة والموت معًا، والمبالغ الأقل للدفع، والمبلغ الواجب إيقافه.",
  },
  {
    id: "khuntha",
    titleTa: "குஃன்ஃதா (திருநங்கைகள்)",
    titleEn: "The Khuntha (Intersex Heir)",
    titleAr: "الخنثى",
    arabicTerm: "الخنثى",
    bookRef: "p. 323; cases 280–281",
    cardLineTa: "குஃன்ஃதாவின் பங்கு ஆண் பெண் கணக்குகளால் முடிவு செய்யப்படுகிறது.",
    cardLineEn: "An intersex heir's share, by male and female scenarios.",
    cardLineAr: "حصة الخنثى بحسب سيناريو الذكر والأنثى.",
    explanationTa: [
      "ஆண், பெண் உறுப்புகள் இரண்டும் சேர்ந்து பிறந்தவர், அல்லது இரண்டு உறுப்புகளும் இல்லாமல் பிறந்தவர் குஃன்ஃதா எனப்படுகிறார். இந்த வரையறை உடல் அமைப்பைப் பற்றியது; பாலின அடையாளம், அறுவை சிகிச்சை, சட்ட அங்கீகாரம் பற்றி நூல் எதுவும் கூறவில்லை.",
      "பருவ வயது வரை காத்திருக்க வேண்டும்: ஆண் தன்மைகள் மிகைத்திருந்தால் ஆணாகவும், பெண் தன்மைகள் மிகைத்திருந்தால் பெண்ணாகவும் முடிவு செய்ய வேண்டும். எந்த அடையாளங்களைக் கொண்டு முடிவு செய்வது என்பதை நூல் குறிப்பிடவில்லை.",
      "பிரிக்காமல் இருக்க முடியாவிட்டால் இரண்டு இமாம்களின் கருத்துகள் உள்ளன. இமாம் ஷாஃபிஈ: ஆண்/பெண் இரு கணக்குகளையும் செய்து, குஃன்ஃதா உட்பட ஒவ்வொருவருக்கும் குறைவான தொகையைக் கொடுத்து, வித்தியாசத்தை நிறுத்தி வைக்க வேண்டும். இமாம் அபூ ஹனீஃபா: குஃன்ஃதாவுக்கு அவரது இரு தொகைகளில் குறைவானதைக் கொடுத்து, மீதத்தை மற்ற வாரிசுகளுக்குப் பிரித்துக் கொடுக்க வேண்டும்; எதுவும் நிறுத்தி வைக்கப்படுவதில்லை. குஃன்ஃதாவுக்குப் பெரிய தொகையை ஒதுக்கி வைப்பதே மேலோங்கும் கருத்து என்று நூல் கூறுகிறது. ஆண்/பெண் பங்குகளின் சராசரி எடுக்கும் விதி நூலில் இல்லை — குறைவானதை எடுக்க வேண்டும் அல்லது வித்தியாசத்தை நிறுத்தி வைக்க வேண்டும்.",
    ],
    explanationEn: [
      "A person born with both male and female organs together, or with neither organ, is called a khuntha. The definition is anatomical; the book says nothing about gender identity, surgery, or legal gender recognition.",
      "Wait until puberty: if male traits predominate, decide male; if female traits predominate, decide female. The book does not specify which traits or signs count.",
      "If division cannot wait, there are two imams' opinions. Imam al-Shafi'i: compute the male and female scenarios, pay every heir — including the khuntha — the lesser amount, and hold the difference until the sex is known. Imam Abu Hanifa: pay the khuntha the lesser of the khuntha's two amounts, distribute the rest to the other heirs, and hold nothing back. The book says the view that prevails is to reserve the larger amount for the khuntha and give the other heirs the lesser. No “average of the male and female share” rule appears — the book takes the lesser and/or holds the difference.",
    ],
    explanationAr: [
      "الشخص المولود بعضوي الذكورة والأنوثة معًا، أو بلا عضوين، يُسمى خنثى. والتعريف تشريحي؛ والكتاب لا يقول شيئًا عن الهوية الجنسية، ولا عن الجراحة، ولا عن الاعتراف القانوني بالجنس.",
      "انتظر حتى البلوغ: فإن غلبت صفات الذكورة فاحكم بأنه ذكر؛ وإن غلبت صفات الأنوثة فاحكم بأنها أنثى. ولا يحدد الكتاب أي الصفات أو العلامات تُعتمد.",
      "وإن تعذر تأجيل التقسيم، فهناك رأيان للإمامين. الإمام الشافعي: احسب سيناريو الذكر والأنثى، وادفع لكل وارث — ومنهم الخنثى — المبلغ الأقل، وأوقف الفرق حتى يُعرف الجنس. والإمام أبو حنيفة: ادفع للخنثى أقل مبلغيه، ووزّع الباقي على الورثة الآخرين، ولا توقف شيئًا. ويقول الكتاب إن الرأي الراجح هو حجز المبلغ الأكبر للخنثى وإعطاء الورثة الآخرين الأقل. ولا توجد قاعدة «متوسط حصة الذكر والأنثى» — بل يأخذ الكتاب الأقل و/أو يوقف الفرق.",
    ],
    formulaTa:
      "ஷாஃபிஈ: ஒவ்வொருவருக்கும் குறைவான தொகை; வித்தியாசத்தை நிறுத்தி வைக்கவும். அபூ ஹனீஃபா: குஃன்ஃதாவுக்குக் குறைவான தொகை; மீதத்தை மற்றவர்களுக்குப் பிரித்துக் கொடுக்கவும்; நிறுத்தி வைப்பது இல்லை. மேலோங்கும் கருத்து: குஃன்ஃதாவுக்குப் பெரிய தொகையை ஒதுக்கி வைக்கவும். சராசரி எடுக்கக்கூடாது.",
    formulaEn:
      "Shafi'i: pay everyone the lesser amount; hold the difference. Abu Hanifa: pay the khuntha the lesser amount; distribute the rest to the others; hold nothing. Prevailing view: reserve the larger amount for the khuntha. Never average.",
    formulaAr: "الشافعي: ادفع للجميع المبلغ الأقل؛ وأوقف الفرق. أبو حنيفة: ادفع للخنثى المبلغ الأقل؛ ووزّع الباقي على الآخرين؛ ولا توقف شيئًا. الرأي الراجح: احجز المبلغ الأكبر للخنثى. ولا تأخذ المتوسط أبدًا.",
    workedExamples: [
      {
        caseNo: 280,
        variantTa: "அபூ ஹனீஃபா கருத்து",
        variantEn: "Abu Hanifa view",
        variantAr: "رأي أبي حنيفة",
        estate: 3000,
        steps: [
          { labelTa: "குஃன்ஃதா — குறைவான தொகை", labelEn: "Khuntha — lesser amount", labelAr: "الخنثى — المبلغ الأقل", fraction: "1/4", amount: 750 },
          { labelTa: "மகன் — மீதத்தில் 2/3", labelEn: "Son — 2/3 of the residue", labelAr: "الابن — 2/3 من الباقي", fraction: "1/2", amount: 1500 },
          { labelTa: "மகள் — மீதத்தில் 1/3", labelEn: "Daughter — 1/3 of the residue", labelAr: "البنت — 1/3 من الباقي", fraction: "1/4", amount: 750 },
        ],
        finalAnswerTa: "குஃன்ஃதா 750; மகன் 1,500; மகள் 750. நிறுத்தி வைப்பது இல்லை (0). (ஆண் கணக்கில் குஃன்ஃதா மகனாக 1,200; பெண் கணக்கில் மகளாக 750 — குறைவானது 750.)",
        finalAnswerEn: "Khuntha 750; son 1,500; daughter 750. Nothing held (0). (Male scenario: the khuntha as a son takes 1,200; female scenario: as a daughter, 750 — the lesser is 750.)",
        finalAnswerAr: "الخنثى 750؛ والابن 1,500؛ والبنت 750. ولا شيء موقوف (0). (سيناريو الذكر: الخنثى كابن يأخذ 1,200؛ وسيناريو الأنثى: كبنت 750 — والأقل هو 750.)",
      },
      {
        caseNo: 280,
        variantTa: "ஷாஃபிஈ கருத்து",
        variantEn: "Shafi'i view",
        variantAr: "رأي الشافعية",
        estate: 3000,
        steps: [
          { labelTa: "மகன் — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Son — lesser amount (pay now)", labelAr: "الابن — المبلغ الأقل (يُدفع الآن)", fraction: "2/5", amount: 1200 },
          { labelTa: "மகள் — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Daughter — lesser amount (pay now)", labelAr: "البنت — المبلغ الأقل (تُدفع الآن)", fraction: "1/5", amount: 600 },
          { labelTa: "குஃன்ஃதா — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Khuntha — lesser amount (pay now)", labelAr: "الخنثى — المبلغ الأقل (يُدفع الآن)", fraction: "1/4", amount: 750 },
          { labelTa: "நிறுத்தி வைக்க", labelEn: "Held", labelAr: "الموقوف", fraction: "—", amount: 450 },
        ],
        finalAnswerTa: "இப்போது கொடுக்க: மகன் 1,200 + மகள் 600 + குஃன்ஃதா 750 = 2,550. நிறுத்தி வைக்க: 450.",
        finalAnswerEn: "Pay now: son 1,200 + daughter 600 + khuntha 750 = 2,550. Hold 450.",
        finalAnswerAr: "ادفع الآن: الابن 1,200 + البنت 600 + الخنثى 750 = 2,550. وأوقف 450.",
      },
      {
        caseNo: 281,
        variantTa: "அபூ ஹனீஃபா கருத்து",
        variantEn: "Abu Hanifa view",
        variantAr: "رأي أبي حنيفة",
        estate: 12000,
        steps: [
          { labelTa: "குஃன்ஃதா (தந்தை வழி அரை உடன்பிறப்பு) — குறைவான தொகை", labelEn: "Khuntha (paternal half-sibling) — lesser amount", labelAr: "الخنثى (أخ/أخت لأب) — المبلغ الأقل", fraction: "1/6", amount: 2000 },
          { labelTa: "கணவர் — மீதத்தில் பங்கு", labelEn: "Husband — share of the remainder", labelAr: "الزوج — حصة من الباقي", fraction: "5/12", amount: 5000 },
          { labelTa: "தாய் — மீதத்தில் பங்கு (மீதமுள்ள 1 பங்கு தாய்க்கு)", labelEn: "Mother — share of the remainder (the remaining 1 share goes to the mother)", labelAr: "الأم — حصة من الباقي (الحصة الواحدة المتبقية تذهب إلى الأم)", fraction: "5/12", amount: 5000 },
        ],
        finalAnswerTa:
          "குஃன்ஃதா 2,000; கணவர் 5,000; தாய் 5,000. கவனிக்க: கணக்குத் தலைப்பில் சொத்து 3,000 என்று அச்சாகியுள்ளது; எல்லா அட்டவணைகளும் 12,000இல் கணக்கிடுகின்றன. (ஆண் கணக்கில் குஃன்ஃதா அரை சகோதரராக மீதம் 2,000; பெண் கணக்கில் அரை சகோதரியாக 1/2 = 4,500 — குறைவானது 2,000.)",
        finalAnswerEn:
          "Khuntha 2,000; husband 5,000; mother 5,000. Note: the case header misprints the estate as 3,000; all tables compute on 12,000. (Male scenario: the khuntha as a half-brother takes the residue 2,000; female scenario: as a half-sister, 1/2 = 4,500 — the lesser is 2,000.)",
        finalAnswerAr: "الخنثى 2,000؛ والزوج 5,000؛ والأم 5,000. ملاحظة: يطبع عنوان المسألة التركة 3,000؛ وجميع الجداول تحسب على 12,000. (سيناريو الذكر: الخنثى كأخ لأب يأخذ الباقي 2,000؛ وسيناريو الأنثى: كأخت لأب 1/2 = 4,500 — والأقل هو 2,000.)",
      },
      {
        caseNo: 281,
        variantTa: "ஷாஃபிஈ கருத்து",
        variantEn: "Shafi'i view",
        variantAr: "رأي الشافعية",
        estate: 12000,
        steps: [
          { labelTa: "கணவர் — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Husband — lesser amount (pay now)", labelAr: "الزوج — المبلغ الأقل (يُدفع الآن)", fraction: "3/8", amount: 4500 },
          { labelTa: "தாய் — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Mother — lesser amount (pay now)", labelAr: "الأم — المبلغ الأقل (تُدفع الآن)", fraction: "1/4", amount: 3000 },
          { labelTa: "குஃன்ஃதா — குறைவான தொகை (இப்போது கொடுக்க)", labelEn: "Khuntha — lesser amount (pay now)", labelAr: "الخنثى — المبلغ الأقل (يُدفع الآن)", fraction: "1/6", amount: 2000 },
          { labelTa: "நிறுத்தி வைக்க", labelEn: "Held", labelAr: "الموقوف", fraction: "—", amount: 2500 },
        ],
        finalAnswerTa: "இப்போது கொடுக்க: கணவர் 4,500 + தாய் 3,000 + குஃன்ஃதா 2,000 = 9,500. நிறுத்தி வைக்க: 2,500.",
        finalAnswerEn: "Pay now: husband 4,500 + mother 3,000 + khuntha 2,000 = 9,500. Hold 2,500.",
        finalAnswerAr: "ادفع الآن: الزوج 4,500 + الأم 3,000 + الخنثى 2,000 = 9,500. وأوقف 2,500.",
      },
    ],
    preload: {
      estate: 3000,
      heirs: { sons: 1, daughters: 1 },
      options: { school: "hanafi", scenario: "khuntha-as-female" },
      noteTa:
        "கணக்கு 280இன் உள்ளீடு (அபூ ஹனீஃபா கருத்து). குஃன்ஃதாவுக்கு கணக்கீட்டாளரில் தனி வாரிசு விசை இல்லை; குஃன்ஃதா விருப்பத்தைத் தேர்ந்தெடுத்து, அவரை ஆணாகவும் பெண்ணாகவும் கணக்கிடவும்.",
      noteEn:
        "Input for case 280 (Abu Hanifa view). There is no separate heir key for the khuntha; select the khuntha option and compute them as both male and female.",
      noteAr: "إدخال للمسألة 280 (رأي أبي حنيفة). ولا يوجد مفتاح وارث مستقل للخنثى؛ فاختر خيار الخنثى واحسبه ذكرًا وأنثى معًا.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "பருவ வயதுவரை காத்திருக்க வேண்டும்; எந்த அடையாளங்களைக் கொண்டு ஆண்/பெண் தன்மை மிகைத்திருப்பதை முடிவு செய்வது என்பதை நூல் குறிப்பிடவில்லை. மூன்று நிலைகள் உள்ளன — நூல் மேலோங்கும் கருத்தைச் சுட்டுகிறது, ஆனால் ஒன்றை ஏற்கவில்லை. அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "Wait until puberty; the book does not specify which traits decide predominance. There are three positions — the book leans toward the prevailing view but adopts none. Confirm with a scholar.",
      textAr: "انتظر حتى البلوغ؛ والكتاب لا يحدد أي الصفات تقرر غلبة الذكورة أو الأنوثة. وهناك ثلاثة أقوال — ويميل الكتاب إلى الرأي الراجح لكنه لا يتبنى أيًا منها. تأكد مع عالم.",
    },
    hintTa:
      "குஃன்ஃதாவையும் மற்ற வாரிசுகளையும் உள்ளிட்டு, எந்த இமாமின் கருத்தைப் பின்பற்றுவது என்பதைத் தேர்ந்தெடுக்கவும்; கணக்கீட்டாளர் ஆண்/பெண் இரு கணக்குகளையும் காட்டும்.",
    hintEn:
      "Enter the khuntha and the other heirs, then choose which imam's opinion to follow; the calculator shows both the male and female scenarios.",
    hintAr: "أدخل الخنثى والورثة الآخرين، ثم اختر رأي أيِّ إمام تتبع؛ فتعرض الحاسبة سيناريو الذكر والأنثى معًا.",
  },
  {
    id: "munasakha",
    titleTa: "முனாஸஹா",
    titleEn: "Munasakha (Multi-Generation Division)",
    titleAr: "المناسخة (تقسيم متعدد الأجيال)",
    arabicTerm: "المناسخة",
    bookRef: "p. 292; cases 269–270",
    cardLineTa: "தலைமுறைகளாகப் பிரிக்கப்படாத சொத்து மரணம் மரணமாகப் பிரிக்கப்படுகிறது.",
    cardLineEn: "Estates divided death by death across generations.",
    cardLineAr: "تُقسَّم التركة وفاةً وفاةً عبر الأجيال.",
    explanationTa: [
      "குடும்பச் சொத்து பல தலைமுறைகளாகப் பிரிக்கப்படாமல் இருந்து, பங்கீட்டுக்கு முன்பே வாரிசுகள் இறந்துகொண்டே இருந்தால், முனாஸஹா முறை பயன்படுத்தப்படுகிறது.",
      "முதலில் முதலில் இறந்தவரின் சொத்தை அவரது வாரிசுகளுக்கு வழக்கம்போல் பிரிக்க வேண்டும். பிறகு பங்கீட்டுக்கு முன் இறந்த ஒவ்வொரு வாரிசின் பங்கும் அவரது சொத்தாகி, அவரது சொந்த வாரிசுகளுக்குப் பிரிக்கப்படுகிறது — அவர்களில் முதலில் இறந்தவரின் வாரிசுகளாக இல்லாதவர்களும் இருக்கலாம் (எடுத்துக்காட்டாக இரண்டாவது கணவர்/மனைவி, வேறு திருமணத்தின் பிள்ளை).",
      "இறுதியில் உயிருடன் உள்ள ஒவ்வொருவரும் எல்லா மரணங்களிலிருந்தும் பெற்ற தொகைகளைக் கூட்டினால், மொத்தம் முதல் சொத்துக்குச் சரியாகச் சமமாக இருக்க வேண்டும். நூல் ஒரே எல்.சி.எம் அடிப்படையில் (தஸ்ஹீஹ்/ஜாமிஆ) சேர்க்கும் குறுக்குவழியைத் தரவில்லை; மரணம் மரணமாகப் பணத் தொகைகளில் கணக்கிடுகிறது.",
    ],
    explanationEn: [
      "When a family's estate has not been divided for several generations and heirs keep dying before distribution, the Munasakha method is used.",
      "First divide the first deceased's estate among his or her heirs in the normal way. Then each heir who dies before distribution — the share they received becomes their estate, divided among their own heirs, who may include people who were not heirs of the first deceased (for example a second spouse or a child from another marriage).",
      "Adding up what each surviving person receives across all the deaths, the grand total must equal the original estate exactly. The book does not give the single-LCM “combined base” (tas'hih / jami'a) shortcut; it works death by death with money amounts.",
    ],
    explanationAr: [
      "عندما تبقى تركة الأسرة بلا تقسيم لعدة أجيال ويستمر الورثة في الموت قبل التقسيم، تُستخدم طريقة المناسخة.",
      "قسّم أولًا تركة أول متوفًّى بين ورثته بالطريقة المعتادة. ثم إن كل وارث يموت قبل التقسيم — فالحصة التي أخذها تصبح تركته، وتُقسَّم بين ورثته هو، وقد يكون من بينهم من لم يكن وارثًا للمتوفى الأول (مثل الزوج أو الزوجة الثانية، أو ولد من زواج آخر).",
      "وبجمع ما يأخذه كل شخص حي من جميع الوفيات، يجب أن يساوي المجموع الكلي التركة الأصلية تمامًا. ولا يعطي الكتاب اختصار «القاعدة الموحدة بالمضاعف المشترك الأصغر» (التصحيح / الجامعة)؛ بل يعمل وفاةً وفاةً بمبالغ مالية.",
    ],
    formulaTa: "முதல் மரணத்தைப் பிரிக்கவும்; இறந்த வாரிசின் பங்கை அவரது சொத்தாக்கி அவரது வாரிசுகளுக்குப் பிரிக்கவும்; இறுதித் தொகைகளின் கூட்டுத்தொகை முதல் சொத்துக்குச் சமமாக இருக்க வேண்டும்.",
    formulaEn: "Divide the first death; take a deceased heir's share as their estate and divide it among their heirs; the final totals must sum to the original estate.",
    formulaAr: "قسّم الوفاة الأولى؛ وخذ حصة الوارث المتوفى باعتبارها تركته وقسّمها بين ورثته؛ ويجب أن يساوي مجموع المبالغ النهائية التركة الأصلية.",
    workedExamples: [
      {
        caseNo: 269,
        estate: 2200,
        steps: [
          { labelTa: "மரணம் 1 (ஸலீம்) — இரு மனைவிகள் 1/8", labelEn: "Death 1 (Saleem) — two wives 1/8", labelAr: "الوفاة 1 (سليم) — زوجتان 1/8", fraction: "1/8", amount: 275 },
          { labelTa: "மரணம் 1 — மகன் ஆகில் (மீதம்)", labelEn: "Death 1 — son Aaqil (residue)", labelAr: "الوفاة 1 — الابن عاقل (الباقي)", fraction: "7/20", amount: 770 },
          { labelTa: "மரணம் 1 — மகள் ஸம்ஹா", labelEn: "Death 1 — daughter Samha", labelAr: "الوفاة 1 — البنت سمحة", fraction: "7/40", amount: 385 },
          { labelTa: "மரணம் 1 — மகள் ஆலியா", labelEn: "Death 1 — daughter Aaliya", labelAr: "الوفاة 1 — البنت عالية", fraction: "7/40", amount: 385 },
          { labelTa: "மரணம் 1 — மகள் அஸ்மா", labelEn: "Death 1 — daughter Asma", labelAr: "الوفاة 1 — البنت أسماء", fraction: "7/40", amount: 385 },
          { labelTa: "மரணம் 2 (அஸ்மா, சொத்து 385) — தாய் ஜமீலா 1/6", labelEn: "Death 2 (Asma, estate 385) — mother Jameela 1/6", labelAr: "الوفاة 2 (أسماء، التركة 385) — الأم جميلة 1/6", fraction: "1/6", amount: 64.17 },
          { labelTa: "மரணம் 2 — இரு சகோதரிகள் 2/3", labelEn: "Death 2 — two sisters 2/3", labelAr: "الوفاة 2 — أختان 2/3", fraction: "2/3", amount: 256.66 },
          { labelTa: "மரணம் 2 — தந்தை வழி அரை சகோதரர் ஆகில் (மீதம்)", labelEn: "Death 2 — paternal half-brother Aaqil (residue)", labelAr: "الوفاة 2 — الأخ لأب عاقل (الباقي)", fraction: "—", amount: 64.17 },
        ],
        finalAnswerTa:
          "இறுதி மொத்தங்கள்: ஸல்மா 137.50; ஜமீலா 201.67; ஸம்ஹா 513.33; ஆலியா 513.33; ஆகில் 834.17. கூட்டுத்தொகை 2,200 — முதல் சொத்துக்குச் சமம்.",
        finalAnswerEn:
          "Final totals: Salma 137.50; Jameela 201.67; Samha 513.33; Aaliya 513.33; Aaqil 834.17. Total 2,200 — equal to the original estate.",
        finalAnswerAr: "المجاميع النهائية: سلمى 137.50؛ وجميلة 201.67؛ وسمحة 513.33؛ وعالية 513.33؛ وعاقل 834.17. المجموع 2,200 — يساوي التركة الأصلية.",
      },
      {
        caseNo: 270,
        estate: 17200,
        steps: [
          { labelTa: "மரணம் 1 (இப்ராஹீம்) — மனைவி ஸுஹைலா 1/8", labelEn: "Death 1 (Ibrahim) — wife Suhaila 1/8", labelAr: "الوفاة 1 (إبراهيم) — الزوجة سهيلة 1/8", fraction: "1/8", amount: 2150 },
          { labelTa: "மரணம் 1 — தாய் ஃபாத்திமா 1/6", labelEn: "Death 1 — mother Fathima 1/6", labelAr: "الوفاة 1 — الأم فاطمة 1/6", fraction: "1/6", amount: 2866.67 },
          { labelTa: "மரணம் 1 — மகள் அனீஸா 1/2", labelEn: "Death 1 — daughter Aneesa 1/2", labelAr: "الوفاة 1 — البنت أنيسة 1/2", fraction: "1/2", amount: 8600 },
          { labelTa: "மரணம் 1 — சகோதரி ஸைனப் (மீதம்)", labelEn: "Death 1 — sister Zainab (residue)", labelAr: "الوفاة 1 — الأخت زينب (الباقي)", fraction: "—", amount: 3583.33 },
          { labelTa: "மரணம் 2 (ஸுஹைலா, சொத்து 2,150) — இரண்டாவது கணவர் உமர் 1/4", labelEn: "Death 2 (Suhaila, estate 2,150) — second husband Umar 1/4", labelAr: "الوفاة 2 (سهيلة، التركة 2,150) — الزوج الثاني عمر 1/4", fraction: "1/4", amount: 537.5 },
          { labelTa: "மரணம் 2 — மகன் அனீஸ் (மீதத்தில் 2/3)", labelEn: "Death 2 — son Anees (2/3 of the residue)", labelAr: "الوفاة 2 — الابن أنيس (2/3 من الباقي)", fraction: "1/2", amount: 1075 },
          { labelTa: "மரணம் 2 — மகள் அனீஸா (மீதத்தில் 1/3)", labelEn: "Death 2 — daughter Aneesa (1/3 of the residue)", labelAr: "الوفاة 2 — البنت أنيسة (1/3 من الباقي)", fraction: "1/4", amount: 537.5 },
          { labelTa: "மரணம் 3 (ஸைனப், சொத்து 3,583.33) — தாய் ஃபாத்திமா 1/6", labelEn: "Death 3 (Zainab, estate 3,583.33) — mother Fathima 1/6", labelAr: "الوفاة 3 (زينب، التركة 3,583.33) — الأم فاطمة 1/6", fraction: "1/6", amount: 597.22 },
          { labelTa: "மரணம் 3 — கணவர் காலித் 1/4", labelEn: "Death 3 — husband Khalid 1/4", labelAr: "الوفاة 3 — الزوج خالد 1/4", fraction: "1/4", amount: 895.83 },
          { labelTa: "மரணம் 3 — மகன் அஹ்மத் (மீதம்)", labelEn: "Death 3 — son Ahmad (residue)", labelAr: "الوفاة 3 — الابن أحمد (الباقي)", fraction: "—", amount: 2090.28 },
        ],
        finalAnswerTa:
          "இறுதி மொத்தங்கள்: ஃபாத்திமா 3,463.89; அனீஸா 9,137.50; உமர் 537.50; அனீஸ் 1,075; காலித் 895.83; அஹ்மத் 2,090.28. கூட்டுத்தொகை 17,200 — முதல் சொத்துக்குச் சமம். கவனிக்க: நூலில் ஒரு இடத்தில் ஃபாத்திமாவின் மொத்தம் 3,462.89 என்று அச்சாகியுள்ளது; சுருக்கத்தில் உள்ள 3,463.89 என்பதே சரி.",
        finalAnswerEn:
          "Final totals: Fathima 3,463.89; Aneesa 9,137.50; Umar 537.50; Anees 1,075; Khalid 895.83; Ahmad 2,090.28. Total 17,200 — equal to the original estate. Note: the book prints Fathima's total as 3,462.89 in one line; 3,463.89 in the summary is correct.",
        finalAnswerAr: "المجاميع النهائية: فاطمة 3,463.89؛ وأنيسة 9,137.50؛ وعمر 537.50؛ وأنيس 1,075؛ وخالد 895.83؛ وأحمد 2,090.28. المجموع 17,200 — يساوي التركة الأصلية. ملاحظة: يطبع الكتاب مجموع فاطمة 3,462.89 في سطر واحد؛ و3,463.89 في الخلاصة هو الصحيح.",
      },
    ],
    preload: {
      estate: 2200,
      heirs: { wives: 2, sons: 1, daughters: 3 },
      options: { scenario: "first-death" },
      noteTa:
        "கணக்கு 269இன் முதல் மரணத்தின் (ஸலீம்) உள்ளீடு மட்டுமே. முனாஸஹாவில் ஒவ்வொரு மரணமும் தனித்தனியே கணக்கிடப்படும்; இரண்டாவது மரணத்தை (அஸ்மா, சொத்து 385) அடுத்த படியாகச் சேர்க்கவும்.",
      noteEn:
        "Input for the first death only of case 269 (Saleem). In Munasakha each death is computed separately; add the second death (Asma, estate 385) as the next step.",
      noteAr: "إدخال للوفاة الأولى فقط من المسألة 269 (سليم). وفي المناسخة تُحسب كل وفاة على حدة؛ وأضف الوفاة الثانية (أسماء، التركة 385) كخطوة تالية.",
    },
    scholarFlag: {
      needed: false,
      textTa: "நூல் மரணம் மரணமாகக் கணக்கிடும் முறையை இரண்டு எடுத்துக்காட்டுகளுடன் தருகிறது. அறிஞர் உறுதி தேவையில்லை.",
      textEn: "The book gives the death-by-death method with two worked examples. No scholar confirmation is needed.",
      textAr: "يعطي الكتاب طريقة الوفاة تلو الوفاة، مع مثالين محلولين. ولا حاجة إلى تأكيد من عالم.",
    },
    hintTa:
      "முதலில் இறந்தவரையும் அவரது வாரிசுகளையும் உள்ளிடவும்; பிறகு ஒவ்வொரு அடுத்த மரணத்தையும் தனித்தனியே சேர்க்கவும் — இறந்த வாரிசின் பங்கு அவரது சொத்தாகும்.",
    hintEn:
      "Enter the first deceased and their heirs; then add each following death separately — a deceased heir's share becomes their estate.",
    hintAr: "أدخل أول متوفًّى وورثته؛ ثم أضف كل وفاة تالية على حدة — فحصة الوارث المتوفى تصبح تركته.",
  },
  {
    id: "simultaneous-death",
    titleTa: "ஒட்டு மொத்தமாக மரணித்தால்",
    titleEn: "Simultaneous Death",
    titleAr: "موت الجماعة",
    arabicTerm: "موت الجماعة",
    bookRef: "p. 318; cases 278–279",
    cardLineTa: "ஒன்றாக இறந்த குடும்பத்தினர்; மரண வரிசை தெரிந்ததா இல்லையா.",
    cardLineEn: "Family members dying together, order known or unknown.",
    cardLineAr: "وفاة أفراد الأسرة معًا، بترتيب معروف أو غير معروف.",
    explanationTa: [
      "ஒரே குடும்பத்தினர் ஒன்றாக இறந்தால், மரண வரிசை தெரிந்தால் முனாஸஹா முறையில் கணக்கிட வேண்டும்: முதலில் இறந்தவரின் பங்கு அடுத்து இறந்தவரின் சொத்தில் சேரும்.",
      "மரண வரிசை தெரியாவிட்டால், ஒவ்வொருவரின் சொத்தும் தனித்தனியே, வழக்கம்போல், அவரவர் சொந்த வாரிசுகளுக்குப் பிரிக்கப்படும்; ஒன்றாக இறந்தவர்கள் ஒருவரிடமிருந்து ஒருவர் வாரிசாக மாட்டார்கள்.",
    ],
    explanationEn: [
      "If a whole family dies together and the order of death is known, compute by Munasakha: the first deceased's share passes into the second deceased's estate.",
      "If the order cannot be known, each person's estate is divided separately, in the ordinary way, among that person's own heirs; the co-deceased do not inherit from each other.",
    ],
    explanationAr: [
      "إذا ماتت أسرة كاملة معًا وكان ترتيب الوفاة معروفًا، فاحسب بالمناسخة: فحصة أول متوفًّى تنتقل إلى تركة المتوفى التالي.",
      "وإذا تعذر معرفة الترتيب، فتُقسَّم تركة كل شخص على حدة، بالطريقة المعتادة، بين ورثته هو؛ ولا يرث المتوفون معًا بعضهم من بعض.",
    ],
    formulaTa: "வரிசை தெரிந்தால்: முனாஸஹா (மரணம் மரணமாக). வரிசை தெரியாவிட்டால்: ஒவ்வொருவரின் சொத்தையும் தனித்தனியே பிரிக்கவும்; ஒன்றாக இறந்தவர்கள் ஒருவருக்கொருவர் வாரிசாக மாட்டார்கள்.",
    formulaEn: "Order known: Munasakha (death by death). Order unknown: divide each person's estate separately; the co-deceased do not inherit from each other.",
    formulaAr: "الترتيب معروف: المناسخة (وفاةً وفاةً). الترتيب غير معروف: قسّم تركة كل شخص على حدة؛ ولا يرث المتوفون معًا بعضهم من بعض.",
    workedExamples: [
      {
        caseNo: 278,
        variantTa: "வரிசை தெரியும் — கணவர் முதலில், பிறகு மனைவி",
        variantEn: "Order known — husband first, then wife",
        variantAr: "الترتيب معروف — الزوج أولًا، ثم الزوجة",
        estate: 24000,
        steps: [
          { labelTa: "நஸார் சொத்து — மனைவி ஃபாத்திமா 1/8", labelEn: "Nasar's estate — wife Fathima 1/8", labelAr: "تركة نصار — الزوجة فاطمة 1/8", fraction: "1/8", amount: 3000 },
          { labelTa: "நஸார் சொத்து — மகள் ஸல்மா 1/2", labelEn: "Nasar's estate — daughter Salma 1/2", labelAr: "تركة نصار — البنت سلمى 1/2", fraction: "1/2", amount: 12000 },
          { labelTa: "நஸார் சொத்து — சித்தப்பா உமர் (மீதம்)", labelEn: "Nasar's estate — paternal uncle Umar (residue)", labelAr: "تركة نصار — العم من جهة الأب عمر (الباقي)", fraction: "—", amount: 9000 },
          { labelTa: "ஃபாத்திமா சொத்து (3,000) — பாட்டி ஆமினா 1/6", labelEn: "Fathima's estate (3,000) — grandmother Amina 1/6", labelAr: "تركة فاطمة (3,000) — الجدة آمنة 1/6", fraction: "1/6", amount: 375 },
          { labelTa: "ஃபாத்திமா சொத்து — மகள் ஸல்மா 1/2", labelEn: "Fathima's estate — daughter Salma 1/2", labelAr: "تركة فاطمة — البنت سلمى 1/2", fraction: "1/2", amount: 1500 },
          { labelTa: "ஃபாத்திமா சொத்து — சித்தப்பா அலி (மீதம்)", labelEn: "Fathima's estate — paternal uncle Ali (residue)", labelAr: "تركة فاطمة — العم من جهة الأب علي (الباقي)", fraction: "—", amount: 1125 },
        ],
        finalAnswerTa:
          "இறுதி: ஸல்மா 13,500; உமர் 9,000; அலி 1,125; ஆமினா 375. கவனிக்க: நூல் பாட்டி ஆமினாவுக்கு 1/6 என்று கூறி 375 என்று கணக்கிடுகிறது; 3,000இல் 1/6 என்பது 500 ஆகும். இந்த வேறுபாட்டை அறிஞரிடம் உறுதி செய்க.",
        finalAnswerEn:
          "Final: Salma 13,500; Umar 9,000; Ali 1,125; Amina 375. Note: the book states 1/6 for grandmother Amina but computes 375; 1/6 of 3,000 is 500. Confirm this difference with a scholar.",
        finalAnswerAr: "النتيجة: سلمى 13,500؛ وعمر 9,000؛ وعلي 1,125؛ وآمنة 375. ملاحظة: يذكر الكتاب 1/6 للجدة آمنة لكنه يحسب 375؛ و1/6 من 3,000 هي 500. تأكد من هذا الفرق مع عالم.",
      },
      {
        caseNo: 279,
        variantTa: "வரிசை தெரியாது — ஹஸன் சொத்து 16,000",
        variantEn: "Order unknown — Hasan's estate 16,000",
        variantAr: "الترتيب غير معروف — تركة حسن 16,000",
        estate: 16000,
        steps: [
          { labelTa: "மனைவி முனீரா — 1/8", labelEn: "Wife Munira — 1/8", labelAr: "الزوجة منيرة — 1/8", fraction: "1/8", amount: 2000 },
          { labelTa: "மகள் ஹமீதா — 1/2", labelEn: "Daughter Hameeda — 1/2", labelAr: "البنت حميدة — 1/2", fraction: "1/2", amount: 8000 },
          { labelTa: "தந்தை வழி ஒன்றுவிட்ட சகோதரர் ஹமீத் — மீதம்", labelEn: "Paternal cousin Hameed — residue", labelAr: "ابن العم من جهة الأب حميد — الباقي", fraction: "—", amount: 6000 },
        ],
        finalAnswerTa: "ஹஸனின் சொத்து அவரது வாரிசுகளுக்கு மட்டுமே பிரிக்கப்பட்டது — மனைவி 2,000; மகள் 8,000; ஹமீத் 6,000. ஹுஸைனின் சொத்து தனியே பிரிக்கப்பட்டது (கீழே காண்க).",
        finalAnswerEn: "Hasan's estate is divided among his heirs only — wife 2,000; daughter 8,000; Hameed 6,000. Husain's estate is divided separately (see below).",
        finalAnswerAr: "تُقسَّم تركة حسن بين ورثته فقط — الزوجة 2,000؛ والبنت 8,000؛ وحميد 6,000. وتُقسَّم تركة حسين على حدة (انظر أدناه).",
      },
      {
        caseNo: 279,
        variantTa: "வரிசை தெரியாது — ஹுஸைன் சொத்து 750",
        variantEn: "Order unknown — Husain's estate 750",
        variantAr: "الترتيب غير معروف — تركة حسين 750",
        estate: 750,
        steps: [
          { labelTa: "மகள்கள் அஸீஸா, ஹலீமா — 2/3 (தலா 250)", labelEn: "Daughters Azeezah and Haleema — 2/3 (250 each)", labelAr: "البنتان عزيزة وحليمة — 2/3 (250 لكل واحدة)", fraction: "2/3", amount: 500 },
          { labelTa: "தந்தை வழி ஒன்றுவிட்ட சகோதரர் ஹமீத் — மீதம்", labelEn: "Paternal cousin Hameed — residue", labelAr: "ابن العم من جهة الأب حميد — الباقي", fraction: "—", amount: 250 },
        ],
        finalAnswerTa: "ஹுஸைனின் சொத்து அவரது வாரிசுகளுக்கு மட்டுமே பிரிக்கப்பட்டது — மகள்கள் தலா 250; ஹமீத் 250. ஹமீதின் மொத்தம்: இரு சொத்துகளிலிருந்தும் 6,000 + 250 = 6,250.",
        finalAnswerEn: "Husain's estate is divided among his heirs only — daughters 250 each; Hameed 250. Hameed's total: 6,000 + 250 = 6,250 from both estates.",
        finalAnswerAr: "تُقسَّم تركة حسين بين ورثته فقط — البنتان 250 لكل واحدة؛ وحميد 250. ومجموع حميد: 6,000 + 250 = 6,250 من التركتين.",
      },
    ],
    preload: {
      estate: 16000,
      heirs: { wives: 1, daughters: 1, paternalUnclesSons: 1 },
      options: { scenario: "order-unknown" },
      noteTa:
        "கணக்கு 279இன் ஹஸன் சொத்தின் (16,000) உள்ளீடு; வரிசை தெரியாத நிலை. ஹுஸைனின் சொத்து (750) தனியே கணக்கிடப்படும். ஹமீத் இரு சொத்துகளிலும் தந்தை வழி ஒன்றுவிட்ட சகோதரராக வாரிசாகிறார்.",
      noteEn:
        "Input for Hasan's estate (16,000) in case 279; order unknown. Husain's estate (750) is computed separately. Hameed inherits from both estates as paternal cousin to both.",
      noteAr: "إدخال لتركة حسن (16,000) في المسألة 279؛ والترتيب غير معروف. وتُحسب تركة حسين (750) على حدة. ويرث حميد من التركتين باعتباره ابن عم من جهة الأب لكليهما.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "கணக்கு 278இல் நூல் பாட்டி ஆமினாவுக்கு 1/6 என்று கூறி 375 என்று கணக்கிடுகிறது; 3,000இல் 1/6 என்பது 500 ஆகும். இந்த வேறுபாட்டை அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "In case 278 the book states 1/6 for grandmother Amina but computes 375; 1/6 of 3,000 is 500. Confirm this difference with a scholar.",
      textAr: "في المسألة 278 يذكر الكتاب 1/6 للجدة آمنة لكنه يحسب 375؛ و1/6 من 3,000 هي 500. تأكد من هذا الفرق مع عالم.",
    },
    hintTa:
      "மரண வரிசை தெரியுமா என்பதைத் தேர்ந்தெடுக்கவும்; தெரிந்தால் முனாஸஹா முறையிலும், தெரியாவிட்டால் தனித்தனிப் பங்கீடாகவும் கணக்கிடப்படும்.",
    hintEn:
      "Choose whether the order of death is known; if known it is computed by Munasakha, if not as separate divisions.",
    hintAr: "اختر ما إذا كان ترتيب الوفاة معروفًا؛ فإن كان معروفًا حُسب بالمناسخة، وإن لم يكن حُسب كتقسيمين منفصلين.",
  },
  {
    id: "renunciation",
    titleTa: "வாரிசுதாரர் வேண்டாம் என்று மறுத்தால்",
    titleEn: "Renunciation of a Share",
    titleAr: "التنازل عن الحصة",
    arabicTerm: "التنازل عن الإرث",
    bookRef: "p. 301; case 271",
    cardLineTa: "மறுக்கப்பட்ட பங்கு மீதமுள்ள வாரிசுகளுக்கு மீண்டும் பிரிக்கப்படுகிறது.",
    cardLineEn: "A refused share is re-divided among the remaining heirs.",
    cardLineAr: "تُعاد قسمة الحصة المتنازل عنها بين الورثة الباقين.",
    explanationTa: [
      "ஒரு வாரிசு தமது பங்கு வேண்டாம் என்று மறுத்து விலகினால், முதல் பங்கீட்டை மறுப்பவரையும் சேர்த்தே செய்ய வேண்டும். அவரை முதலிலேயே நீக்கிவிட்டுக் கணக்கிடுவது தவறு.",
      "பிறகு மறுப்பவரின் பங்கை எடுத்து, மீதமுள்ள வாரிசுகளின் பங்குகளின் விகிதத்தில் அவர்களுக்குப் பிரித்துக் கொடுக்க வேண்டும். மறுக்கப்பட்ட பங்கு மற்ற வாரிசுகளுக்குச் செல்கிறது; அது அரசுக்கோ (பைத்துல் மால்) தர்மத்துக்கோ செல்லும் என்று நூல் கூறவில்லை.",
    ],
    explanationEn: [
      "If an heir refuses their share and steps aside, the first division must be done with the refusing heir included. Removing them first gives a wrong answer.",
      "Then take the refusing heir's share and re-divide it among the remaining heirs in proportion to their own shares. The refused share passes to the other heirs; the book says nothing about it going to the state (Bayt al-Mal) or to charity.",
    ],
    explanationAr: [
      "إذا رفض وارث حصته وتنحى، فيجب إجراء التقسيم الأول مع إدراج الوارث المتنازل. وإسقاطه أولًا يعطي جوابًا خاطئًا.",
      "ثم خذ حصة المتنازل وأعد تقسيمها بين الورثة الباقين بنسبة حصصهم هم. وتذهب الحصة المتنازل عنها إلى الورثة الآخرين؛ ولا يقول الكتاب شيئًا عن ذهابها إلى الدولة (بيت المال) أو إلى الصدقة.",
    ],
    formulaTa: "முதலில் மறுப்பவரையும் சேர்த்துப் பிரிக்கவும்; பிறகு அவரது பங்கை மற்றவர்களின் பங்கு விகிதத்தில் பிரித்துக் கொடுக்கவும். மறுப்பவரை முதலிலேயே நீக்குவது தவறு.",
    formulaEn: "First divide with the refuser included; then re-divide their share among the others in proportion to their shares. Dropping the refuser first is wrong.",
    formulaAr: "قسّم أولًا مع إدراج المتنازل؛ ثم أعد تقسيم حصته بين الآخرين بنسبة حصصهم. وإسقاط المتنازل أولًا خطأ.",
    workedExamples: [
      {
        caseNo: 271,
        estate: 4200,
        steps: [
          { labelTa: "தந்தை — 1/6 + மீதம், மறுப்புப் பங்கில் பாதி", labelEn: "Father — 1/6 + residue, plus half the refused share", labelAr: "الأب — 1/6 + الباقي، مع نصف الحصة المتنازل عنها", fraction: "—", amount: 1837.5 },
          { labelTa: "மகள் — 1/2, மறுப்புப் பங்கில் பாதி", labelEn: "Daughter — 1/2, plus half the refused share", labelAr: "البنت — 1/2، مع نصف الحصة المتنازل عنها", fraction: "—", amount: 2362.5 },
          { labelTa: "மனைவி — மறுத்துவிட்டார்", labelEn: "Wife — refused", labelAr: "الزوجة — تنازلت عن حصتها", fraction: "0", amount: 0 },
        ],
        finalAnswerTa:
          "முதல் பங்கீடு: மனைவி 525 (1/8), மகள் 2,100 (1/2), தந்தை 1,575 (1/6 + மீதம்). மனைவியின் 525ஐத் தந்தைக்கும் மகளுக்கும் சமமாக (262.50 + 262.50) பிரித்ததில் இறுதி: தந்தை 1,837.50, மகள் 2,362.50, மனைவி 0. மனைவியை முதலிலேயே நீக்கியிருந்தால் தந்தைக்கும் மகளுக்கும் தலா 2,100 கிடைத்திருக்கும் — இது தவறு என்று நூல் கூறுகிறது.",
        finalAnswerEn:
          "First division: wife 525 (1/8), daughter 2,100 (1/2), father 1,575 (1/6 + residue). Re-dividing the wife's 525 equally between father and daughter (262.50 + 262.50) gives the final: father 1,837.50, daughter 2,362.50, wife 0. Dropping the wife first would have given father and daughter 2,100 each — the book says this is wrong.",
        finalAnswerAr: "التقسيم الأول: الزوجة 525 (1/8)، والبنت 2,100 (1/2)، والأب 1,575 (1/6 + الباقي). وبإعادة تقسيم 525 للزوجة بالتساوي بين الأب والبنت (262.50 + 262.50) تكون النتيجة: الأب 1,837.50، والبنت 2,362.50، والزوجة 0. ولو أُسقطت الزوجة أولًا لحصل الأب والبنت على 2,100 لكل منهما — ويقول الكتاب إن هذا خطأ.",
      },
    ],
    preload: {
      estate: 4200,
      heirs: { wives: 1, daughters: 1, father: 1 },
      options: { scenario: "wife-renounces" },
      noteTa: "கணக்கு 271இன் உள்ளீடு: மனைவி மறுக்கிறார். மனைவியைப் பட்டியலிலிருந்து நீக்க வேண்டாம் — மறுப்பவராகக் குறிக்கவும்; கணக்கீட்டாளர் முதலில் அவரையும் சேர்த்துப் பிரித்து, பிறகு அவரது பங்கை மற்றவர்களுக்குப் பகிரும்.",
      noteEn: "Input for case 271: the wife renounces. Do not delete the wife from the list — mark her as renouncing; the calculator first divides with her included, then shares her portion among the others.",
      noteAr: "إدخال للمسألة 271: الزوجة تتنازل. ولا تحذف الزوجة من القائمة — بل علّمها متنازلة؛ فتقسم الحاسبة أولًا مع إدراجها، ثم توزع حصتها على الآخرين.",
    },
    scholarFlag: {
      needed: false,
      textTa: "நூல் இந்த விதியையும் தவறான முறையையும் கூறுகிறது. அறிஞர் உறுதி தேவையில்லை.",
      textEn: "The book states this rule and the wrong method. No scholar confirmation is needed.",
      textAr: "يذكر الكتاب هذه القاعدة والطريقة الخاطئة. ولا حاجة إلى تأكيد من عالم.",
    },
    hintTa:
      "மறுக்கும் வாரிசையும் சேர்த்து வாரிசுகளை உள்ளிடவும்; பிறகு யார் மறுக்கிறார் என்பதைத் தேர்ந்தெடுக்கவும் — கணக்கீட்டாளர் முதலில் அவரையும் சேர்த்துப் பிரித்து, பிறகு அவரது பங்கை மற்றவர்களுக்குப் பகிரும்.",
    hintEn:
      "Enter all the heirs including the one who renounces; then select who renounces — the calculator first divides with them included, then shares their portion among the others.",
    hintAr: "أدخل جميع الورثة ومنهم المتنازل؛ ثم اختر من يتنازل — فتقسم الحاسبة أولًا مع إدراجه، ثم توزع حصته على الآخرين.",
  },
  {
    id: "apostate",
    titleTa: "இஸ்லாத்தை விட்டு வெளியேறியவர்",
    titleEn: "The Apostate",
    titleAr: "المرتد",
    arabicTerm: "المرتد",
    bookRef: "p. 330; cases 282–285",
    cardLineTa: "மதம் மாறியவரின் சொத்து, சொத்து எப்போது சம்பாதிக்கப்பட்டது என்பதைப் பொறுத்தது.",
    cardLineEn: "An apostate's estate, by when the property was earned.",
    cardLineAr: "تركة المرتد بحسب وقت كسب المال.",
    explanationTa: [
      "முஸ்லிம் முஸ்லிம் அல்லாதவரிடமிருந்து வாரிசாக மாட்டார்; மத வேறுபாடு வாரிசுரிமையைத் தடுக்கிறது. மதம் மாறியவரின் சொத்தைப் பற்றி இமாம்கள் மூன்று கருத்துகளைக் கூறுகிறார்கள் — சொத்து எப்போது சம்பாதிக்கப்பட்டது என்பதைப் பொறுத்தது.",
      "இமாம் அபூ ஹனீஃபா: முஸ்லிமாக இருந்தபோது சம்பாதித்த சொத்து (அதன் மதிப்பு அறிய முடிந்தால்) முஸ்லிம் வாரிசுகளுக்குப் பிரிக்கப்படும்; மதம் மாறிய பிறகு சம்பாதித்தது பைத்துல் மாலுக்கு (பொதுக் கருவூலம்) செல்லும். இமாம் ஷாஃபிஈ: இரண்டும் பைத்துல் மாலுக்கே; வாரிசுகளுக்கு எதுவும் இல்லை. இமாம் அபூ யூசுஃப், இமாம் முஹம்மது: இரண்டும் வாரிசுகளுக்குப் பிரிக்கப்படும்.",
      "மதம் மாறிய வாரிசுக்கு எதுவும் கிடைக்காது — “வாரிசாக மாட்டார்”. பைத்துல் மால் நூல் முழுவதிலும் இந்த அத்தியாயத்தில் மட்டுமே வருகிறது.",
    ],
    explanationEn: [
      "A Muslim cannot inherit from a non-Muslim; difference of religion blocks inheritance. For the apostate's own estate the imams give three opinions, depending on when the property was earned.",
      "Imam Abu Hanifa: property earned while Muslim (if its value can be known) is divided among the Muslim heirs; property earned after leaving goes to Bayt al-Mal (the public treasury). Imam al-Shafi'i: both go to Bayt al-Mal; the heirs get nothing. Imam Abu Yusuf and Imam Muhammad: both are divided among the heirs.",
      "An heir who left Islam gets nothing. Bayt al-Mal appears nowhere else in the book — only in this chapter.",
    ],
    explanationAr: [
      "المسلم لا يرث من غير المسلم؛ فاختلاف الدين يمنع الإرث. وفي تركة المرتد يعطي الأئمة ثلاثة أقوال، بحسب وقت كسب المال.",
      "الإمام أبو حنيفة: المال المكتسب وهو مسلم (إن أمكن معرفة قيمته) يُقسَّم بين الورثة المسلمين؛ والمال المكتسب بعد الارتداد يذهب إلى بيت المال (الخزينة العامة). الإمام الشافعي: كلاهما يذهب إلى بيت المال؛ والورثة لا يحصلون على شيء. الإمام أبو يوسف والإمام محمد: كلاهما يُقسَّم بين الورثة.",
      "والوارث الذي ارتد لا يحصل على شيء. ولا يظهر بيت المال في الكتاب كله إلا في هذا الفصل.",
    ],
    formulaTa: "அபூ ஹனீஃபா: முஸ்லிமாக இருந்தபோது சம்பாதித்தது வாரிசுகளுக்கு; பிறகு சம்பாதித்தது பைத்துல் மாலுக்கு. ஷாஃபிஈ: அனைத்தும் பைத்துல் மாலுக்கு. அபூ யூசுஃப்/முஹம்மது: அனைத்தும் வாரிசுகளுக்கு.",
    formulaEn: "Abu Hanifa: earned while Muslim goes to the heirs; earned after leaving goes to Bayt al-Mal. Shafi'i: all to Bayt al-Mal. Abu Yusuf/Muhammad: all to the heirs.",
    formulaAr: "أبو حنيفة: المكتسب وهو مسلم يذهب إلى الورثة؛ والمكتسب بعد الارتداد يذهب إلى بيت المال. الشافعي: الكل إلى بيت المال. أبو يوسف/محمد: الكل إلى الورثة.",
    workedExamples: [
      {
        caseNo: 282,
        variantTa: "அபூ ஹனீஃபா கருத்து",
        variantEn: "Abu Hanifa view",
        variantAr: "رأي أبي حنيفة",
        estate: 54000,
        steps: [
          { labelTa: "மனைவி — முஸ்லிமாக இருந்தபோது சம்பாதித்த 24,000இல் 1/8", labelEn: "Wife — 1/8 of the 24,000 earned while Muslim", labelAr: "الزوجة — 1/8 من 24,000 المكتسبة وهو مسلم", fraction: "1/8", amount: 3000 },
          { labelTa: "தாய் — 24,000இல் 1/6", labelEn: "Mother — 1/6 of 24,000", labelAr: "الأم — 1/6 من 24,000", fraction: "1/6", amount: 4000 },
          { labelTa: "மகன் — 24,000இல் மீதம்", labelEn: "Son — residue of 24,000", labelAr: "الابن — باقي 24,000", fraction: "—", amount: 17000 },
          { labelTa: "பைத்துல் மால் — பிறகு சம்பாதித்த 30,000", labelEn: "Bayt al-Mal — the 30,000 earned after leaving", labelAr: "بيت المال — 30,000 المكتسبة بعد الارتداد", fraction: "—", amount: 30000 },
        ],
        finalAnswerTa: "மனைவி 3,000; தாய் 4,000; மகன் 17,000; பைத்துல் மால் 30,000.",
        finalAnswerEn: "Wife 3,000; mother 4,000; son 17,000; Bayt al-Mal 30,000.",
        finalAnswerAr: "الزوجة 3,000؛ والأم 4,000؛ والابن 17,000؛ وبيت المال 30,000.",
      },
      {
        caseNo: 282,
        variantTa: "ஷாஃபிஈ கருத்து",
        variantEn: "Shafi'i view",
        variantAr: "رأي الشافعية",
        estate: 54000,
        steps: [
          { labelTa: "பைத்துல் மால் — அனைத்தும் (24,000 + 30,000)", labelEn: "Bayt al-Mal — all (24,000 + 30,000)", labelAr: "بيت المال — الكل (24,000 + 30,000)", fraction: "1", amount: 54000 },
        ],
        finalAnswerTa: "அனைத்து 54,000உம் பைத்துல் மாலுக்கு; வாரிசுகளுக்கு எதுவும் இல்லை.",
        finalAnswerEn: "All 54,000 to Bayt al-Mal; the heirs get nothing.",
        finalAnswerAr: "كل 54,000 إلى بيت المال؛ والورثة لا يحصلون على شيء.",
      },
      {
        caseNo: 282,
        variantTa: "அபூ யூசுஃப் / முஹம்மது கருத்து",
        variantEn: "Abu Yusuf / Muhammad view",
        variantAr: "رأي أبي يوسف / محمد",
        estate: 54000,
        steps: [
          { labelTa: "மனைவி — 54,000இல் 1/8", labelEn: "Wife — 1/8 of 54,000", labelAr: "الزوجة — 1/8 من 54,000", fraction: "1/8", amount: 6750 },
          { labelTa: "தாய் — 54,000இல் 1/6", labelEn: "Mother — 1/6 of 54,000", labelAr: "الأم — 1/6 من 54,000", fraction: "1/6", amount: 9000 },
          { labelTa: "மகன் — மீதம்", labelEn: "Son — residue", labelAr: "الابن — الباقي", fraction: "—", amount: 38250 },
        ],
        finalAnswerTa: "மனைவி 6,750; தாய் 9,000; மகன் 38,250.",
        finalAnswerEn: "Wife 6,750; mother 9,000; son 38,250.",
        finalAnswerAr: "الزوجة 6,750؛ والأم 9,000؛ والابن 38,250.",
      },
      {
        caseNo: 283,
        variantTa: "அபூ ஹனீஃபா கருத்து",
        variantEn: "Abu Hanifa view",
        variantAr: "رأي أبي حنيفة",
        estate: 3550,
        steps: [
          { labelTa: "மகள் — முஸ்லிமாக இருந்தபோது சம்பாதித்த 2,550இல் 1/2", labelEn: "Daughter — 1/2 of the 2,550 earned while Muslim", labelAr: "البنت — 1/2 من 2,550 المكتسبة وهو مسلم", fraction: "1/2", amount: 1275 },
          { labelTa: "தாய் — 2,550இல் 1/6", labelEn: "Mother — 1/6 of 2,550", labelAr: "الأم — 1/6 من 2,550", fraction: "1/6", amount: 425 },
          { labelTa: "தந்தை வழி சித்தப்பா — 2,550இல் மீதம்", labelEn: "Paternal uncle — residue of 2,550", labelAr: "العم من جهة الأب — باقي 2,550", fraction: "—", amount: 850 },
        ],
        finalAnswerTa: "மகள் 1,275; தாய் 425; சித்தப்பா 850. பிறகு சம்பாதித்த 1,000 பைத்துல் மாலுக்குச் செல்லும்.",
        finalAnswerEn: "Daughter 1,275; mother 425; uncle 850. The 1,000 earned after leaving goes to Bayt al-Mal.",
        finalAnswerAr: "البنت 1,275؛ والأم 425؛ والعم 850. والألف المكتسبة بعد الارتداد تذهب إلى بيت المال.",
      },
      {
        caseNo: 283,
        variantTa: "அபூ யூசுஃப் / முஹம்மது கருத்து",
        variantEn: "Abu Yusuf / Muhammad view",
        variantAr: "رأي أبي يوسف / محمد",
        estate: 3550,
        steps: [
          { labelTa: "மகள் — 3,550இல் 1/2", labelEn: "Daughter — 1/2 of 3,550", labelAr: "البنت — 1/2 من 3,550", fraction: "1/2", amount: 1775 },
          { labelTa: "தாய் — 3,550இல் 1/6", labelEn: "Mother — 1/6 of 3,550", labelAr: "الأم — 1/6 من 3,550", fraction: "1/6", amount: 591.67 },
          { labelTa: "தந்தை வழி சித்தப்பா — மீதம்", labelEn: "Paternal uncle — residue", labelAr: "العم من جهة الأب — الباقي", fraction: "—", amount: 1183.33 },
        ],
        finalAnswerTa: "மகள் 1,775; தாய் 591.67; சித்தப்பா 1,183.33. (ஷாஃபிஈ கருத்துப்படி அனைத்து 3,550உம் பைத்துல் மாலுக்கு.)",
        finalAnswerEn: "Daughter 1,775; mother 591.67; uncle 1,183.33. (Shafi'i view: all 3,550 to Bayt al-Mal.)",
        finalAnswerAr: "البنت 1,775؛ والأم 591.67؛ والعم 1,183.33. (رأي الشافعية: كل 3,550 إلى بيت المال.)",
      },
      {
        caseNo: 284,
        variantTa: "மதம் மாறிய வாரிசு — மனைவி",
        variantEn: "Heir who left Islam — wife",
        variantAr: "وارث ارتد — الزوجة",
        estate: 400000,
        steps: [
          { labelTa: "மனைவி — மதம் மாறியதால் 0", labelEn: "Wife — 0, having left Islam", labelAr: "الزوجة — 0، لأنها ارتدت", fraction: "0", amount: 0 },
          { labelTa: "முழு சகோதரி — 1/2", labelEn: "Full sister — 1/2", labelAr: "الأخت الشقيقة — 1/2", fraction: "1/2", amount: 200000 },
          { labelTa: "தந்தை வழி அரை சகோதரி — 1/6", labelEn: "Paternal half-sister — 1/6", labelAr: "الأخت لأب — 1/6", fraction: "1/6", amount: 66666.67 },
          { labelTa: "தந்தை வழி சித்தப்பா — மீதம்", labelEn: "Paternal uncle — residue", labelAr: "العم من جهة الأب — الباقي", fraction: "—", amount: 133333.33 },
        ],
        finalAnswerTa: "மனைவி 0; முழு சகோதரி 200,000; தந்தை வழி அரை சகோதரி 66,666.67; சித்தப்பா 133,333.33.",
        finalAnswerEn: "Wife 0; full sister 200,000; paternal half-sister 66,666.67; uncle 133,333.33.",
        finalAnswerAr: "الزوجة 0؛ والأخت الشقيقة 200,000؛ والأخت لأب 66,666.67؛ والعم 133,333.33.",
      },
      {
        caseNo: 285,
        variantTa: "மதம் மாறிய வாரிசு — கணவர்",
        variantEn: "Heir who left Islam — husband",
        variantAr: "وارث ارتد — الزوج",
        estate: 1000,
        steps: [
          { labelTa: "கணவர் — மதம் மாறியதால் 0", labelEn: "Husband — 0, having left Islam", labelAr: "الزوج — 0، لأنه ارتد", fraction: "0", amount: 0 },
          { labelTa: "மகன் — மீதம் முழுவதும்", labelEn: "Son — the whole residue", labelAr: "الابن — كل الباقي", fraction: "1", amount: 1000 },
        ],
        finalAnswerTa: "கணவர் 0; மகன் முழு 1,000ஐயும் பெறுகிறார்.",
        finalAnswerEn: "Husband 0; the son takes the whole 1,000.",
        finalAnswerAr: "الزوج 0؛ والابن يأخذ كامل 1,000.",
      },
    ],
    preload: {
      estate: 54000,
      heirs: { wives: 1, mother: 1, sons: 1 },
      options: { school: "hanafi", scenario: "apostate" },
      noteTa:
        "கணக்கு 282இன் உள்ளீடு (அபூ ஹனீஃபா கருத்து): முஸ்லிமாக இருந்தபோது சம்பாதித்தது 24,000; பிறகு சம்பாதித்தது 30,000. இரண்டு தொகைகளையும் தனித்தனியே உள்ளிடவும்.",
      noteEn:
        "Input for case 282 (Abu Hanifa view): 24,000 earned while Muslim; 30,000 earned after leaving. Enter the two amounts separately.",
      noteAr: "إدخال للمسألة 282 (رأي أبي حنيفة): 24,000 مكتسبة وهو مسلم؛ و30,000 مكتسبة بعد الارتداد. أدخل المبلغين على حدة.",
    },
    scholarFlag: {
      needed: true,
      textTa:
        "மூன்று கருத்துகள் உள்ளன; நூல் ஒன்றை ஏற்கவில்லை. முஸ்லிமாக இருந்தபோது சம்பாதித்த சொத்தின் மதிப்பு அறிய முடியாவிட்டால் என்ன செய்வது என்று நூல் கூறவில்லை. பைத்துல் மால் நூல் முழுவதிலும் இந்த அத்தியாயத்தில் மட்டுமே வருகிறது. எந்தக் கருத்தைப் பின்பற்றுவது என்பதை அறிஞரிடம் உறுதி செய்க.",
      textEn:
        "There are three opinions; the book adopts none. It does not say what happens if the value of the property earned while Muslim cannot be known. Bayt al-Mal appears nowhere else in the book. Confirm with a scholar which opinion to follow.",
      textAr: "هناك ثلاثة أقوال؛ والكتاب لا يتبنى أيًا منها. ولا يقول ما يحدث إذا تعذرت معرفة قيمة المال المكتسب وهو مسلم. ولا يظهر بيت المال في الكتاب كله إلا هنا. تأكد مع عالم أيَّ رأي تتبع.",
    },
    hintTa:
      "மதம் மாறியவர் இறந்தவரா அல்லது வாரிசா என்பதையும், சொத்து எப்போது சம்பாதிக்கப்பட்டது என்பதையும் உள்ளிட்டு, எந்த இமாமின் கருத்தைப் பின்பற்றுவது என்பதைத் தேர்ந்தெடுக்கவும்.",
    hintEn:
      "Enter whether the apostate is the deceased or an heir, and when the property was earned, then choose which imam's opinion to follow.",
    hintAr: "أدخل ما إذا كان المرتد هو المتوفى أو وارثًا، ومتى كُسب المال، ثم اختر رأي أيِّ إمام تتبع.",
  },
];

export const SPECIAL_METHODS_PAGE_COPY: SpecialMethodsPageCopy = {
  pageTitleTa: "சிறப்பு வாரிசுரிமை முறைகள்",
  pageTitleEn: "Special Inheritance Methods",
  pageTitleAr: "طرق الإرث الخاصة",
  pageIntroTa: "நூலிலுள்ள பன்னிரண்டு சிறப்பு நிலைகள்; ஒவ்வொன்றுக்கும் தனிக் கணக்கீட்டாளர்.",
  pageIntroEn: "Twelve special cases from the book, each with its own calculator.",
  pageIntroAr: "اثنتا عشرة حالة خاصة من الكتاب، ولكل منها حاسبتها الخاصة.",
  topicGridHeadingTa: "பன்னிரண்டு சிறப்பு முறைகள்",
  topicGridHeadingEn: "Twelve special methods",
  topicGridHeadingAr: "الطرق الخاصة الاثنتا عشرة",
  prevLabelTa: "முந்தையது",
  prevLabelEn: "Previous",
  prevLabelAr: "السابق",
  nextLabelTa: "அடுத்தது",
  nextLabelEn: "Next",
  nextLabelAr: "التالي",
  backToCalculatorTa: "கணக்கீட்டாளருக்குத் திரும்புக",
  backToCalculatorEn: "Back to calculator",
  backToCalculatorAr: "العودة إلى الحاسبة",
  roundingRuleTa: "தொகைகள் இரண்டு தசம இடங்களுக்குக் காட்டப்படும்; எல்லா வரிசைகளின் கூட்டுத்தொகையும் சொத்துக்குச் சரியாகச் சமமாக இருக்கும்.",
  roundingRuleEn: "Amounts are shown to 2 decimal places; the rows always sum exactly to the estate.",
  roundingRuleAr: "تُعرض المبالغ بمنزلتين عشريتين؛ ومجموع الصفوف يساوي التركة تمامًا دائمًا.",
  languageToggleLabelTa: "மொழியை மாற்றுக",
  languageToggleLabelEn: "Change language",
  languageToggleLabelAr: "تغيير اللغة",
  loadExampleTa: "நூல் எடுத்துக்காட்டை ஏற்றுக",
  loadExampleEn: "Load book example",
  loadExampleAr: "تحميل مثال الكتاب",
  calculateTa: "கணக்கிடுக",
  calculateEn: "Calculate",
  calculateAr: "احسب",
};

/**
 * Redesign spec v4 (§1 shared strings + §2–§13 section E per-topic strings).
 *
 * One trilingual entry per visible string. `{x}` / `{n}` are placeholders
 * filled in by the caller (amounts are formatted with fmt() first).
 * New Arabic strings are written from the spec and NEED a native-Arabic
 * read-through before they are treated as final (spec §14 step 1).
 */
export type TriString = { ta: string; en: string; ar: string };

export const SPECIAL_STRINGS = {
  // -- §1 shared strings (used by every topic) --
  backToAllMethods: { ta: "அனைத்து முறைகள்", en: "All methods", ar: "كل الطرق" },
  calculate: { ta: "கணக்கிடுக", en: "Calculate", ar: "احسب" },
  reset: { ta: "மீண்டும் தொடங்குக", en: "Reset", ar: "إعادة" },
  loadBookExample: { ta: "நூல் எடுத்துக்காட்டு", en: "Book example", ar: "مثال الكتاب" },
  showWorking: { ta: "வேலையைக் காட்டுக", en: "Show working", ar: "أظهر الحساب" },
  totalCheck: {
    ta: "மொத்தம் ₹{x} — சொத்துடன் சரியாகப் பொருந்துகிறது.",
    en: "Total ₹{x} — matches the estate exactly.",
    ar: "المجموع ₹{x} — يطابق التركة تمامًا.",
  },
  held: { ta: "நிறுத்தி வைக்க", en: "Held", ar: "الموقوف" },
  payNow: { ta: "இப்போது கொடுக்க", en: "Pay now", ar: "ادفع الآن" },
  addHeir: { ta: "வாரிசைச் சேர்", en: "Add heir", ar: "أضف وارثًا" },
  edit: { ta: "திருத்துக", en: "Edit", ar: "تعديل" },
  stepEstate: { ta: "சொத்து", en: "Estate", ar: "التركة" },
  stepHeirs: { ta: "வாரிசுகள்", en: "Heirs", ar: "الورثة" },
  noShare: { ta: "பங்கு இல்லை", en: "No share", ar: "لا حصة" },
  rounding: { ta: "சுற்றுதல்", en: "Rounding", ar: "التقريب" },
  bookSilent: { ta: "இது பற்றி நூலில் இல்லை", en: "Not in the book", ar: "ليس في الكتاب" },
  // -- §2 Dhawul Arham --
  dhawulBranch1: { ta: "மகளின் பிள்ளைகள்", en: "Daughter's children", ar: "أولاد البنت" },
  dhawulBranch2: { ta: "பாட்டன், பாட்டி (ஃபாஸித்)", en: "Grandparents (unsound line)", ar: "الأجداد (الفاسد)" },
  dhawulBranch3: { ta: "சகோதர, சகோதரிகளின் பிள்ளைகள்", en: "Brothers' and sisters' children", ar: "أولاد الإخوة والأخوات" },
  dhawulBranch4: { ta: "தாய் / தந்தை வழி மாமா, அத்தை", en: "Mother's and father's maternal uncles", ar: "أخوال الوالدين" },
  dhawulBranchAnswered: { ta: "கிளை {n} பதிலளித்தது", en: "Branch {n} answered", ar: "أجاب الفرع {n}" },
  dhawulSplit21: { ta: "2:1 — ஆணுக்கு 2, பெண்ணுக்கு 1", en: "2:1 — male 2, female 1", ar: "2:1 — 2 للذكر و1 للأنثى" },
  // -- §3 Grandfather with siblings --
  grandfatherHanafi: { ta: "ஹனஃபி", en: "Hanafi", ar: "الحنفي" },
  grandfatherShafii: { ta: "ஷாஃபிஈ", en: "Shafi'i", ar: "الشافعي" },
  grandfatherBrotherAdded: {
    ta: "ஆண் சகோதரருடன் பாட்டன் — இது பற்றி நூலில் இல்லை",
    en: "Grandfather with a male brother — not in the book",
    ar: "الجد مع أخ ذكر — ليس في الكتاب",
  },
  // -- §4 Debtor --
  debtorCreditor: { ta: "கடன் கொடுத்தவர்", en: "Creditor", ar: "الدائن" },
  debtorTotalDebt: { ta: "மொத்தக் கடன்", en: "Total debt", ar: "مجموع الدين" },
  debtorBurialCosts: { ta: "அடக்கச் செலவு", en: "Burial costs", ar: "تكاليف الدفن" },
  debtorAddCreditor: { ta: "கடன் கொடுத்தவரைச் சேர்", en: "Add creditor", ar: "أضف دائنًا" },
  debtorStateA: {
    ta: "சொத்து = கடன் — கடன் கொடுத்தவர்கள் அனைத்தையும் பெறுகிறார்கள்",
    en: "Estate = debt — creditors take all",
    ar: "التركة = الدين — يأخذ الدائنون كل شيء",
  },
  debtorStateB: {
    ta: "கடன் சொத்தை விட அதிகம் — விகிதத்தில் பிரிக்கப்படுகிறது",
    en: "Debt is more than the estate — divided pro-rata",
    ar: "الدين أكثر من التركة — يُقسَّم بالتناسب",
  },
  debtorStateC: {
    ta: "சொத்து கடனை விட அதிகம் — கடன் முழுதும் கொடுத்து, மீதம் வாரிசுகளுக்கு",
    en: "Estate is more than the debt — debts paid in full, rest to heirs",
    ar: "التركة أكثر من الدين — تُسدَّد الديون كاملة والباقي للورثة",
  },
  debtorShareOfDebt: { ta: "கடன் விகிதம்", en: "Share of debt", ar: "نسبة الدين" },
  debtorAmountPaid: { ta: "கொடுக்கப்பட்ட தொகை", en: "Amount paid", ar: "المبلغ المدفوع" },
  grandfatherDifferentViews: {
    ta: "வெவ்வேறு கருத்துகள். சராசரி எடுக்கப்படவில்லை.",
    en: "Different views. Not averaged.",
    ar: "رأيان مختلفان. دون توسط.",
  },
  disqRedivided: {
    ta: "பங்குகள் {n} வாரிசுகளுக்கு மீண்டும் பிரிக்கப்பட்டன",
    en: "Shares re-divided among {n} heirs",
    ar: "أُعيد تقسيم الحصص بين {n} من الورثة",
  },
  // -- §5 Disqualified --
  disqCannotInherit: { ta: "வாரிசாக முடியாது", en: "Cannot inherit", ar: "لا يرث" },
  disqReasonKiller: { ta: "கொலையாளி", en: "Killer", ar: "القاتل" },
  disqReasonReligion: { ta: "மத வேறுபாடு", en: "Different religion", ar: "اختلاف الدين" },
  disqReasonSlave: { ta: "அடிமை — இப்போது பொருந்தாது", en: "Slave — not applied now", ar: "الرق — لا يُطبَّق الآن" },
  disqDemoInput: { ta: "மாதிரி உள்ளீடு", en: "Demo input", ar: "إدخال تجريبي" },
  // -- §6 Sahih / Fasid --
  sahihAddLink: { ta: "தொடர்பைச் சேர்", en: "Add a link", ar: "أضف رابطًا" },
  sahihFathersSide: { ta: "தந்தை வழி", en: "Father's side", ar: "جهة الأب" },
  sahihMothersSide: { ta: "தாய் வழி", en: "Mother's side", ar: "جهة الأم" },
  sahihMaleFemale: { ta: "ஆண் / பெண்", en: "Male / Female", ar: "ذكر / أنثى" },
  sahihBadgeSound: { ta: "ஸஹீஹ் — சரியானது", en: "Ṣaḥīḥ — sound", ar: "صحيح" },
  sahihBadgeBroken: { ta: "ஃபாஸித் — முறிந்தது", en: "Fāsid — broken", ar: "فاسد" },
  sahihConsequenceFixed: { ta: "நிலையான பங்கு பெறும் வாரிசு", en: "Fixed-share heir", ar: "وارث ذو فرض" },
  sahihConsequenceDistant: {
    ta: "தூரத்து உறவினர் — நிலையான பங்கு, மீதம் பெறும் வாரிசு இல்லாதபோது மட்டும்",
    en: "Distant relative — only when no fixed or residuary heir exists",
    ar: "من ذوي الأرحام — فقط عند عدم وجود وارث ذي فرض أو عاصب",
  },
  // -- §7 Unborn child --
  unbornIfBoy: { ta: "ஆண் குழந்தை என்றால்", en: "If boy", ar: "إن كان ذكرًا" },
  unbornIfGirl: { ta: "பெண் குழந்தை என்றால்", en: "If girl", ar: "إن كانت أنثى" },
  unbornHeldUntilBirth: { ta: "பிறப்புவரை நிறுத்தி வைக்க", en: "Held until birth", ar: "الموقوف حتى الولادة" },
  unbornAfterBirth: { ta: "பிறந்த பிறகு", en: "After birth", ar: "بعد الولادة" },
  unbornBoyGirl: { ta: "ஆண் / பெண்", en: "Boy / Girl", ar: "ذكر / أنثى" },
  unbornPregnantWife: { ta: "கர்ப்பமான மனைவி", en: "Pregnant wife", ar: "الزوجة الحامل" },
  unbornBestNotDivide: {
    ta: "பிறப்புவரை பிரிக்காமல் இருப்பது நல்லது",
    en: "Best not to divide until birth.",
    ar: "الأفضل عدم التقسيم حتى الولادة",
  },
  // -- §8 Missing person --
  missingIfAlive: { ta: "உயிருடன் இருந்தால்", en: "If alive", ar: "إن كان حيًا" },
  missingIfDead: { ta: "இறந்திருந்தால்", en: "If dead", ar: "إن كان ميتًا" },
  missingWho: { ta: "காணாமல் போனவர் யார்?", en: "Who is missing?", ar: "من المفقود؟" },
  missingWaitingPeriod: { ta: "காத்திருப்புக் காலம்", en: "Waiting period", ar: "مدة الانتظار" },
  missingSeventyYears: {
    ta: "70 ஆண்டுகள் — எப்போதிருந்து என்று நூல் கூறவில்லை",
    en: "70 years — the book gives no start date",
    ar: "سبعون سنة — الكتاب لا يعطي تاريخًا لبدئها",
  },
  missingPrisoner: { ta: "கைதி", en: "Prisoner", ar: "السجين" },
  // -- §9 Khuntha --
  khunthaCanWait: { ta: "பருவ வயதுவரை காத்திருக்க முடியுமா?", en: "Can we wait for puberty?", ar: "هل يمكن الانتظار حتى البلوغ؟" },
  khunthaBookSaysWait: { ta: "நூல் காத்திருக்கச் சொல்கிறது", en: "Book says wait", ar: "الكتاب يقول انتظر" },
  khunthaWaitThenDecide: {
    ta: "பருவ வயதுவரை காத்திருந்து, மிகைத்திருக்கும் அடையாளத்தால் முடிவு செய்க",
    en: "Wait until puberty, then decide by predominant traits",
    ar: "انتظر حتى البلوغ، ثم احكم بالصفات الغالبة",
  },
  khunthaPrevailing: { ta: "மேலோங்கும் கருத்து", en: "Prevailing view", ar: "الرأي الراجح" },
  khunthaChild: { ta: "குஃன்ஃதா குழந்தை", en: "Khuntha child", ar: "الطفل الخنثى" },
  // -- §10 Munasakha --
  munasakhaAddDeath: { ta: "ஒரு மரணத்தைச் சேர்", en: "Add a death", ar: "أضف وفاة" },
  munasakhaWhoDied: { ta: "இறந்தவர் யார்?", en: "Who died?", ar: "من المتوفى؟" },
  munasakhaStage: { ta: "நிலை {n}", en: "Stage {n}", ar: "المرحلة {n}" },
  munasakhaFromStage: { ta: "நிலை {n}-இல் இருந்து", en: "From Stage {n}", ar: "من المرحلة {n}" },
  munasakhaFinalAmounts: { ta: "இறுதித் தொகைகள்", en: "Final amounts", ar: "المبالغ النهائية" },
  munasakhaEstateOfDeath: { ta: "இந்த மரணத்தின் சொத்து", en: "Estate of this death", ar: "تركة هذه الوفاة" },
  // Radd-correction flag (cases 269 and 284): the book's cases reassign
  // the Radd pool to the nearest later Asabah class instead of returning
  // it to the sisters; a scholar should confirm this reading before it
  // is treated as settled (spec §15 Q6).
  raddCorrectionFlag: {
    ta: "Radd திருத்தம் — அறிஞர் உறுதி தேவை",
    en: "Radd correction — needs a scholar's confirmation",
    ar: "تصحيح الرد — يلزم تأكيد عالم",
  },
  // -- §11 Simultaneous death --
  simulOrderKnown: { ta: "மரண வரிசை தெரியுமா?", en: "Is the order of death known?", ar: "هل ترتيب الوفاة معروف؟" },
  simulKnownUnknown: { ta: "தெரியும் / தெரியாது", en: "Known / Unknown", ar: "معروف / غير معروف" },
  simulNoOneInherits: { ta: "ஒருவரும் மற்றவரிடமிருந்து வாரிசாக மாட்டார்", en: "No one inherits from the others", ar: "لا يرث أحد من الآخر" },
  simulAddDeceased: { ta: "இறந்தவரைச் சேர்", en: "Add a deceased", ar: "أضف متوفًى" },
  simulCombinedTotal: { ta: "மொத்தமாக", en: "Combined total", ar: "المجموع الكلي" },
  // Case 278 has TWO printed errors (v4-verifications.md §5a): the book
  // prints the grandmother as 375 (rule: 500) AND the paternal uncle as
  // 1,125 (rule: 1,000 — residue 3,000 − 500 − 1,500). The calculator
  // already gives the corrected figures; this flag says so, one line.
  simulCase278Flag: {
    ta: "கணக்கு 278: நூலில் பாட்டி 375 என்றும் தந்தை வழிச் சகோதரர் 1,125 என்றும் அச்சாகியுள்ளது; விதிப்படி பாட்டி 500, தந்தை வழிச் சகோதரர் 1,000.",
    en: "Case 278: the book prints the grandmother as 375 and the paternal uncle as 1,125; the rule gives 500 and 1,000.",
    ar: "المسألة 278: يطبع الكتاب الجدة 375 والعم 1,125؛ والقاعدة تعطي 500 و1,000.",
  },
  // -- §12 Renunciation --
  renunWhoRefuses: { ta: "மறுப்பவர் யார்?", en: "Who refuses?", ar: "من المتنازل؟" },
  renunRefuses: { ta: "மறுக்கிறார்", en: "Refuses", ar: "متنازل" },
  renunFirstDivision: { ta: "முதல் பிரிவு", en: "First division", ar: "القسمة الأولى" },
  renunShareRedivided: { ta: "அவரது பங்கு மீண்டும் பிரிக்கப்பட்டது", en: "Their share re-divided", ar: "أُعيد تقسيم حصته" },
  renunDoNotRemove: {
    ta: "மறுப்பவரை முதலில் நீக்க வேண்டாம் — மற்றவர்களின் பங்குகள் மாறிவிடும்",
    en: "Do not remove the refuser first — it changes the others' shares",
    ar: "لا تُسقط المتنازل أولًا فذلك يغيّر حصص الآخرين",
  },
  // -- §13 Apostate --
  apostateDeceasedLeft: { ta: "இறந்தவர் மதம் மாறினார்", en: "The deceased left Islam", ar: "المتوفى ارتد" },
  apostateHeirLeft: { ta: "ஒரு வாரிசு மதம் மாறினார்", en: "An heir left Islam", ar: "أحد الورثة ارتد" },
  apostateEarnedWhileMuslim: { ta: "முஸ்லிமாக இருந்தபோது சம்பாதித்தது", en: "Earned while Muslim", ar: "ما كُسب وهو مسلم" },
  apostateEarnedAfter: { ta: "வெளியேறிய பிறகு சம்பாதித்தது", en: "Earned after leaving", ar: "ما كُسب بعد الردة" },
  apostateNotSure: { ta: "தெரியவில்லை", en: "Not sure", ar: "لست متأكدًا" },
  apostateBaytAlMal: { ta: "பைத்துல் மால் (பொதுக் கருவூலம்)", en: "Bayt al-Mal (public treasury)", ar: "بيت المال" },
  apostateWhoLeft: { ta: "மதம் மாறியவர் யார்?", en: "Who left Islam?", ar: "من المرتد؟" },
  apostateHanafiCannotCalc: {
    ta: "முஸ்லிமாக இருந்தபோது சம்பாதித்த தொகை தெரியவில்லை — ஹனஃபி பிரிவைக் கணக்கிட முடியாது",
    en: "While-Muslim value unknown — Hanafi split cannot be calculated",
    ar: "قيمة ما كُسب وهو مسلم غير معروفة — لا يمكن حساب قسمة الحنفية",
  },
  // Case 282 printed error (v4-verifications.md §5b): the book prints
  // 170,000 for the son's share of 24,000 once, then continues with
  // 17,000. 17,000 is correct; the calculator already gives it.
  apostateCase282Flag: {
    ta: "கணக்கு 282: மகனின் பங்கு ஒரு இடத்தில் 170,000 என்று அச்சாகியுள்ளது; சரியான தொகை 17,000.",
    en: "Case 282: the book prints the son's share as 170,000 once; the correct figure is 17,000.",
    ar: "المسألة 282: يطبع الكتاب حصة الابن 170,000 مرة واحدة؛ والرقم الصحيح 17,000.",
  },
} as const;

export type SpecialStringKey = keyof typeof SPECIAL_STRINGS;

/**
 * Language-leak fix (spec §1, problem 3): the calculation module
 * (client/src/lib/specialMethods.ts) and the general engine emit
 * single-language English strings as row notes, summaries, notes and
 * scholar reasons. The engine itself must NOT be edited, so the special
 * module translates them HERE, at display time: exact-match entries are
 * translated, dynamic strings are handled by patterns in
 * components/special/shared.tsx, and anything unmapped is HIDDEN on
 * Tamil/Arabic screens (never shown in English there).
 *
 * Tamil strings from the engine (row reasons) are already Tamil, so they
 * need no entry here; they are hidden on Arabic screens by the same rule.
 * New Arabic strings below need a native-Arabic read-through.
 */
export type EngineTextTranslation = { en: string; ta: string; ar: string };

export const ENGINE_TEXT_TRANSLATIONS: EngineTextTranslation[] = [
  // -- Row labels produced by the calculation module --
  { en: "Not in the book", ta: "இது பற்றி நூலில் இல்லை", ar: "ليس في الكتاب" },
  // Case 272 flag (spec §4 D): the book's question prints Khalid's debt as
  // 70,000; the working uses 7,000. Shown as a one-line flag under the
  // creditor table when the case-272 figures are loaded.
  {
    en: "Case 272: the book's question prints Khalid's debt as 70,000; the working uses 7,000.",
    ta: "கணக்கு 272: நூலின் கேள்வியில் காலிதின் கடன் 70,000 என்று அச்சாகியுள்ளது; கணக்கில் 7,000 பயன்படுத்தப்பட்டுள்ளது.",
    ar: "المسألة 272: يطبع سؤال الكتاب دين خالد 70,000؛ بينما يستخدم الحل 7,000.",
  },
  { en: "Khuntha heir", ta: "குஃன்ஃதா வாரிசு", ar: "الوارث الخنثى" },
  { en: "Held / unallocated", ta: "நிறுத்தி வைக்கப்பட்டது / ஒதுக்கப்படாதது", ar: "محجوز / غير موزَّع" },
  { en: "Held / unallocated (while-Muslim portion)", ta: "நிறுத்தி வைக்கப்பட்டது / ஒதுக்கப்படாதது (முஸ்லிமாக இருந்தபோது சம்பாதித்த பகுதி)", ar: "محجوز / غير موزَّع (الجزء المُكتسب وهو مسلم)" },
  { en: "Held / unallocated residue", ta: "நிறுத்தி வைக்கப்பட்ட மீதம்", ar: "الباقي المحجوز" },
  { en: "Held until the position is known", ta: "நிலை தெரியும்வரை நிறுத்தி வைக்க", ar: "محجوز حتى يُعرف الوضع" },
  { en: "Held until the sex is known", ta: "பாலினம் தெரியும்வரை நிறுத்தி வைக்க", ar: "محجوز حتى يُعرف الجنس" },
  { en: "Unborn child (held)", ta: "கர்ப்பத்திலுள்ள குழந்தை (நிறுத்தி வைக்க)", ar: "الطفل في الحمل (محجوز)" },
  { en: "Missing person (held)", ta: "காணாமல் போனவர் (நிறுத்தி வைக்க)", ar: "المفقود (محجوز)" },
  { en: "Prisoner (held)", ta: "கைதி (நிறுத்தி வைக்க)", ar: "السجين (محجوز)" },
  // -- Row notes --
  { en: "The general method names no automatic recipient for this remainder.", ta: "இந்த மீதத்திற்கு பொது முறை தானாகப் பெறுபவரைக் கூறவில்லை.", ar: "الطريقة العامة لا تسمي مستلمًا تلقائيًا لهذا الباقي." },
  { en: "Pay each heir the lesser of the two scenarios; hold the difference.", ta: "ஒவ்வொரு வாரிசுக்கும் இரு கணக்குகளில் குறைந்த தொகையைக் கொடுக்கவும்; வித்தியாசத்தை நிறுத்தி வைக்கவும்.", ar: "ادفع لكل وارث الأقل من السيناريوهين؛ واحجز الفرق." },
  { en: "No distant relative entered to take the residue.", ta: "மீதத்தைப் பெற தூரத்து உறவினர் யாரும் உள்ளிடப்படவில்லை.", ar: "لم يُدخل أي قريب بعيد ليأخذ الباقي." },
  { en: "Fixed shares exceed the estate ('Awl), so the grandfather as Asabah takes nothing.", ta: "நிலையான பங்குகள் சொத்தை விட அதிகம் (அவ்ல்); எனவே மீதம் பெறும் வாரிசாக பாட்டனுக்கு எதுவும் இல்லை.", ar: "الفروض تتجاوز التركة (العول)، فالجد كعاصب لا يأخذ شيئًا." },
  { en: "Shafi'i: the grandfather takes the residue after the sisters' fixed shares.", ta: "ஷாஃபிஈ: சகோதரிகளின் நிலையான பங்குகளுக்குப் பிறகு பாட்டன் மீதத்தைப் பெறுகிறார்.", ar: "الشافعية: يأخذ الجد الباقي بعد فروض الأخوات." },
  { en: "Nothing left to pay.", ta: "கொடுக்க எதுவும் மீதமில்லை.", ar: "لم يبقَ شيء للدفع." },
  { en: "Paid in full.", ta: "முழுமையாகக் கொடுக்கப்பட்டது.", ar: "دُفع بالكامل." },
  { en: "Abu Hanifa: the khuntha is paid the lesser of the two scenario amounts.", ta: "அபூ ஹனீஃபா: குஃன்ஃதாவுக்கு இரு கணக்குகளில் குறைந்த தொகை கொடுக்கப்படுகிறது.", ar: "أبو حنيفة: يُدفع للخنثى الأقل من مبلغي السيناريوهين." },
  { en: "Abu Hanifa: share of the remaining estate after the khuntha's lesser is set aside.", ta: "அபூ ஹனீஃபா: குஃன்ஃதாவின் குறைந்த தொகை ஒதுக்கிய பிறகு மீதமுள்ள சொத்தின் பங்கு.", ar: "أبو حنيفة: حصة من التركة الباقية بعد حجز الأقل للخنثى." },
  { en: "A death's division left a remainder the general method does not allocate.", ta: "ஒரு மரணத்தின் பிரிவில் பொது முறை ஒதுக்காத மீதம் இருந்தது.", ar: "ترك تقسيم إحدى الوفيات باقيًا لا توزعه الطريقة العامة." },
  { en: "Share of all estates combined.", ta: "அனைத்துச் சொத்துகளின் கூட்டுப் பங்கு.", ar: "حصة من مجموع التركات." },
  { en: "Increment from the re-divided refused share.", ta: "மீண்டும் பிரிக்கப்பட்ட மறுக்கப்பட்ட பங்கிலிருந்து கூடுதல்.", ar: "زيادة من الحصة المتنازَل عنها بعد إعادة تقسيمها." },
  { en: "Refused their share.", ta: "தமது பங்கை மறுத்தார்.", ar: "تنازل عن حصته." },
  { en: "Abu Hanifa: share of the property earned while Muslim.", ta: "அபூ ஹனீஃபா: முஸ்லிமாக இருந்தபோது சம்பாதித்த சொத்தின் பங்கு.", ar: "أبو حنيفة: حصة من المال المُكتسب وهو مسلم." },
  { en: "Abu Hanifa: property earned after leaving Islam goes to Bayt al-Mal.", ta: "அபூ ஹனீஃபா: இஸ்லாத்தை விட்டு வெளியேறிய பிறகு சம்பாதித்த சொத்து பைத்துல் மாலுக்குச் செல்கிறது.", ar: "أبو حنيفة: المال المُكتسب بعد الردة يذهب إلى بيت المال." },
  { en: "Al-Shafi'i: both the while-Muslim and after-leaving property go to Bayt al-Mal; the heirs get nothing.", ta: "அஷ்-ஷாஃபிஈ: முஸ்லிமாக இருந்தபோதும் வெளியேறிய பிறகும் சம்பாதித்த சொத்து இரண்டும் பைத்துல் மாலுக்குச் செல்கிறது; வாரிசுகளுக்கு எதுவும் இல்லை.", ar: "الشافعية: المال المُكتسب وهو مسلم وبعد الردة كله يذهب إلى بيت المال؛ والورثة لا يأخذون شيئًا." },
  { en: "Khuntha treated as male.", ta: "குஃன்ஃதா ஆணாகக் கணக்கிடப்பட்டார்.", ar: "الخنثى يُحسب ذكرًا." },
  { en: "Khuntha treated as female.", ta: "குஃன்ஃதா பெண்ணாகக் கணக்கிடப்பட்டார்.", ar: "الخنثى يُحسب أنثى." },
  { en: "Computed as if the person is alive.", ta: "அவர் உயிருடன் இருப்பதாகக் கணக்கிடப்பட்டது.", ar: "حُسب على أنه حي." },
  { en: "Computed as if the person is dead.", ta: "அவர் இறந்துவிட்டதாகக் கணக்கிடப்பட்டது.", ar: "حُسب على أنه ميت." },
  { en: "Hanafi (Imam Abu Hanifa): the grandfather blocks the sisters entirely and takes the residue himself.", ta: "ஹனஃபி (இமாம் அபூ ஹனீஃபா): பாட்டன் சகோதரிகளை முற்றிலும் தடுத்து, மீதத்தைத் தாமே பெறுகிறார்.", ar: "الحنفية (الإمام أبو حنيفة): الجد يحجب الأخوات تمامًا ويأخذ الباقي بنفسه." },
  { en: "Shafi'i (Imam al-Shafi'i): the sisters keep their fixed shares and the grandfather takes the residue.", ta: "ஷாஃபிஈ (இமாம் அஷ்-ஷாஃபிஈ): சகோதரிகள் தங்கள் நிலையான பங்குகளை வைத்துக்கொள்கிறார்கள்; பாட்டன் மீதத்தைப் பெறுகிறார்.", ar: "الشافعية (الإمام الشافعي): تحتفظ الأخوات بفروضهن ويأخذ الجد الباقي." },
  { en: "Shafi'i: identical here — the grandfather's share is unaffected by the school difference in this combination.", ta: "ஷாஃபிஈ: இங்கு இரண்டும் ஒன்றே — இந்த அமைப்பில் மத்ஹப் வேறுபாடு பாட்டனின் பங்கை மாற்றாது.", ar: "الشافعية: هنا النتيجة نفسها — اختلاف المذهب لا يؤثر في حصة الجد في هذه الحالة." },
  { en: "Shafi'i (Imam al-Shafi'i): the sisters keep their fixed shares; the fixed shares exceed the estate ('Awl), so the grandfather takes nothing.", ta: "ஷாஃபிஈ (இமாம் அஷ்-ஷாஃபிஈ): சகோதரிகள் தங்கள் நிலையான பங்குகளை வைத்துக்கொள்கிறார்கள்; நிலையான பங்குகள் சொத்தை விட அதிகம் (அவ்ல்), எனவே பாட்டனுக்கு எதுவும் இல்லை.", ar: "الشافعية (الإمام الشافعي): تحتفظ الأخوات بفروضهن؛ والفروض تتجاوز التركة (العول)، فالجد لا يأخذ شيئًا." },
  // -- Notes / summaries / scholar reasons (static) --
  { en: "An Asabah (residuary) heir exists, so the distant relatives inherit nothing — they inherit only when no fixed-share heir and no Asabah exists.", ta: "மீதம் பெறும் வாரிசு (அஸபா) இருப்பதால் தூரத்து உறவினர்களுக்கு எதுவும் இல்லை — நிலையான பங்கு பெறும் வாரிசும் மீதம் பெறும் வாரிசும் இல்லாதபோது மட்டுமே அவர்கள் வாரிசாகிறார்கள்.", ar: "يوجد وارث عاصب، فذوو الأرحام لا يرثون شيئًا — وهم يرثون فقط عند عدم وجود وارث ذي فرض ولا عاصب." },
  { en: "No distant relative was entered, so the residue after the fixed-share heirs is held.", ta: "தூரத்து உறவினர் யாரும் உள்ளிடப்படவில்லை; எனவே நிலையான பங்கு பெறும் வாரிசுகளுக்குப் பிறகு மீதம் நிறுத்தி வைக்கப்படுகிறது.", ar: "لم يُدخل أي قريب بعيد، فالباقي بعد أصحاب الفروض محجوز." },
  { en: "The father is alive, so the grandfather is blocked entirely in both schools.", ta: "தந்தை உயிருடன் இருப்பதால் பாட்டன் இரு கருத்துகளிலும் முற்றிலும் தடுக்கப்படுகிறார்.", ar: "الأب حي، فالجد محجوب تمامًا في المذهبين." },
  { en: "Funeral costs consume the whole estate; nothing is left for creditors or heirs.", ta: "அடக்கச் செலவு முழுச் சொத்தையும் எடுத்துக்கொண்டது; கடன் கொடுத்தவர்களுக்கும் வாரிசுகளுக்கும் எதுவும் மீதமில்லை.", ar: "تكاليف الدفن استهلكت التركة كلها؛ ولم يبقَ شيء للدائنين ولا للورثة." },
  { en: "The estate equals the debt: the creditors are paid in full and the heirs get nothing at all.", ta: "சொத்தும் கடனும் சமம்: கடன் கொடுத்தவர்களுக்கு முழுமையாகக் கொடுக்கப்படுகிறது; வாரிசுகளுக்கு எதுவும் இல்லை.", ar: "التركة تساوي الدين: يُدفع للدائنين بالكامل ولا يحصل الورثة على شيء إطلاقًا." },
  { en: "The debt exceeds the estate: the estate is divided among the creditors pro rata (estate × each debt ÷ total debt). The heirs get nothing.", ta: "கடன் சொத்தை விட அதிகம்: சொத்து கடன் கொடுத்தவர்களுக்கு விகிதப்படி பிரிக்கப்படுகிறது (சொத்து × ஒவ்வொருவரின் கடன் ÷ மொத்தக் கடன்). வாரிசுகளுக்கு எதுவும் இல்லை.", ar: "الدين يتجاوز التركة: تُقسَّم التركة بين الدائنين بالتناسب (التركة × دين كل واحد ÷ مجموع الدين). والورثة لا يحصلون على شيء." },
  { en: "The estate exceeds the debt: the debts are paid in full, then the remainder is divided among the heirs normally.", ta: "சொத்து கடனை விட அதிகம்: கடன்கள் முழுமையாகக் கொடுக்கப்பட்டு, மீதம் வாரிசுகளுக்கு வழக்கம்போல் பிரிக்கப்படுகிறது.", ar: "التركة تتجاوز الدين: تُسدَّد الديون بالكامل، ثم يُقسَّم الباقي بين الورثة بالطريقة المعتادة." },
  { en: "Slave (அடிமையானவர்): listed in the book (p. 38) as the third disqualifier, stated as not applicable now — 'no need to know about it'. It is shown here for information only and never changes a calculation.", ta: "அடிமை: நூலில் (ப. 38) மூன்றாவது தகுதியின்மைக் காரணமாகக் கூறப்பட்டுள்ளது; இப்போது பொருந்தாது என்று நூலே கூறுகிறது — “இதைப் பற்றி அறிய வேண்டியதில்லை”. இது தகவலுக்காக மட்டும் காட்டப்படுகிறது; எந்தக் கணக்கையும் மாற்றாது.", ar: "الرق: مذكور في الكتاب (ص. 38) كالمانع الثالث، ويقول الكتاب إنه لا ينطبق الآن — «لا حاجة لمعرفته». وهو مذكور للمعلومة فقط ولا يغيّر أي حساب." },
  { en: "An heir who kills the estate-owner cannot inherit from that estate (book p. 38).", ta: "சொத்துக்குரியவரைக் கொன்ற வாரிசு அந்தச் சொத்தில் வாரிசாக முடியாது (நூல் ப. 38).", ar: "الوارث الذي يقتل صاحب التركة لا يرث من تلك التركة (الكتاب ص. 38)." },
  { en: "Difference of religion blocks inheritance: Muslims cannot inherit from non-Muslims and vice versa (book p. 38).", ta: "மத வேறுபாடு வாரிசுரிமையைத் தடுக்கிறது: முஸ்லிம் முஸ்லிம் அல்லாதவரிடமிருந்தும், முஸ்லிம் அல்லாதவர் முஸ்லிமிடமிருந்தும் வாரிசாக முடியாது (நூல் ப. 38).", ar: "اختلاف الدين يمنع الإرث: فالمسلم لا يرث من غير المسلم، ولا غير المسلم من المسلم (الكتاب ص. 38)." },
  { en: "Left Islam — does not inherit (book p. 330).", ta: "இஸ்லாத்தை விட்டு வெளியேறினார் — வாரிசாக மாட்டார் (நூல் ப. 330).", ar: "ارتد عن الإسلام — لا يرث (الكتاب ص. 330)." },
  { en: "The book calls this grandfather sahih, yet states he belongs to the distant kindred and inherits only when no fixed-share heir and no Asabah exists — the book's own wording here is terse and partly circular.", ta: "நூல் இந்தப் பாட்டனை ஸஹீஹ் என்கிறது; ஆனால் அவர் தூரத்து உறவினர் என்றும், நிலையான பங்கு பெறும் வாரிசும் மீதம் பெறும் வாரிசும் இல்லாதபோது மட்டுமே வாரிசாவார் என்றும் கூறுகிறது — நூலின் சொற்கள் இங்கு சுருக்கமாகவும் ஓரளவு வட்டமாகவும் உள்ளன.", ar: "الكتاب يسمي هذا الجد صحيحًا، لكنه يقول إنه من ذوي الأرحام ويرث فقط عند عدم وجود وارث ذي فرض ولا عاصب — وعبارة الكتاب هنا موجزة ودائرية جزئيًا." },
  { en: "Fixed-share heir: 1/6 (plus the residue when there is no closer Asabah heir), when the father is absent.", ta: "நிலையான பங்கு பெறும் வாரிசு: 1/6 (நெருங்கிய மீதம் பெறும் வாரிசு இல்லாதபோது மீதமும்), தந்தை இல்லாதபோது.", ar: "وارث ذو فرض: 1/6 (مع الباقي عند عدم وجود عاصب أقرب)، عند غياب الأب." },
  { en: "Fixed-share heir: shares 1/6 with the other eligible grandmothers, when the mother is absent.", ta: "நிலையான பங்கு பெறும் வாரிசு: தாய் இல்லாதபோது மற்ற தகுதியுள்ள பாட்டிகளுடன் 1/6ஐப் பகிர்கிறார்.", ar: "وارث ذو فرض: يتقاسم 1/6 مع الجدات المستحقات الأخريات، عند غياب الأم." },
  { en: "Dhawul Arham (distant relative), branch 2 — inherits only when no fixed-share heir and no Asabah exists.", ta: "தூரத்து உறவினர், கிளை 2 — நிலையான பங்கு பெறும் வாரிசும் மீதம் பெறும் வாரிசும் இல்லாதபோது மட்டுமே வாரிசாவார்.", ar: "من ذوي الأرحام، الفرع 2 — يرث فقط عند عدم وجود وارث ذي فرض ولا عاصب." },
  { en: "Best course is not to divide until the child is born; this is the division-if-the-heirs-insist.", ta: "குழந்தை பிறக்கும்வரை பிரிக்காமல் இருப்பதே நல்லது; வாரிசுகள் வற்புறுத்தினால் செய்யும் பிரிவு இது.", ar: "الأفضل عدم التقسيم حتى يولد الطفل؛ وهذا هو التقسيم عند إصرار الورثة." },
  { en: "Each heir is paid the lesser of the as-son and as-daughter amounts; the rest is held until birth.", ta: "ஒவ்வொரு வாரிசுக்கும் ஆண் கணக்கு, பெண் கணக்கு இரண்டில் குறைந்த தொகை கொடுக்கப்படுகிறது; மீதம் பிறப்புவரை நிறுத்தி வைக்கப்படுகிறது.", ar: "يُدفع لكل وارث الأقل من مبلغي سيناريو الذكر والأنثى؛ والباقي محجوز حتى الولادة." },
  { en: "The book is silent on twins/multiple births, on a stillborn child, and on any time limit for the hold-back.", ta: "இரட்டையர் / பல குழந்தைகள், இறந்து பிறக்கும் குழந்தை, நிறுத்தி வைக்கும் கால எல்லை ஆகியவை பற்றி நூலில் இல்லை.", ar: "الكتاب ساكت عن التوائم والولادات المتعددة، وعن المولود ميتًا، وعن أي حد زمني للحجز." },
  { en: "Best course is to postpone division until it is clear whether the person is alive or dead.", ta: "அவர் உயிருடன் இருக்கிறாரா இறந்துவிட்டாரா என்று தெரியும்வரை பிரிவைத் தள்ளிப்போடுவதே நல்லது.", ar: "الأفضل تأجيل التقسيم حتى يتضح ما إذا كان الشخص حيًا أو ميتًا." },
  { en: "Waiting period as the book states it: 70 years (stated as the unanimous opinion of the imams).", ta: "நூல் கூறும் காத்திருப்புக் காலம்: 70 ஆண்டுகள் (இமாம்களின் ஒருமித்த கருத்து என்று கூறப்பட்டுள்ளது).", ar: "مدة الانتظار كما يذكرها الكتاب: 70 سنة (قيل إنها رأي الأئمة بالإجماع)." },
  { en: "The book states a 70-year wait as the unanimous opinion of the imams, but gives no start date for counting the 70 years and no rule for what happens to the held share when the period ends.", ta: "நூல் 70 ஆண்டுகள் காத்திருப்பை இமாம்களின் ஒருமித்த கருத்து என்று கூறுகிறது; ஆனால் 70 ஆண்டுகளை எப்போதிருந்து எண்ணுவது என்றும், காலம் முடிந்ததும் நிறுத்தி வைக்கப்பட்ட பங்கு என்ன ஆகும் என்றும் கூறவில்லை.", ar: "الكتاب يذكر انتظار 70 سنة كرأي الأئمة بالإجماع، لكنه لا يعطي تاريخًا لبدء عدّ السبعين سنة ولا حكمًا لما يحدث للحصة المحجوزة عند انتهاء المدة." },
  { en: "The book gives the prisoner no separate rule despite the chapter heading naming him, and is silent on a prisoner known to be alive in jail.", ta: "அத்தியாயத் தலைப்பில் கைதி கூறப்பட்டிருந்தாலும் நூல் கைதிக்குத் தனி விதி எதையும் தரவில்லை; சிறையில் உயிருடன் இருப்பது தெரிந்த கைதி பற்றியும் நூலில் இல்லை.", ar: "الكتاب لا يعطي السجين حكمًا مستقلًا رغم أن عنوان الفصل يذكره، وهو ساكت عن سجين يُعرف أنه حي في السجن." },
  { en: "Wait until puberty if division can wait: if male traits predominate decide male; if female traits predominate, decide female. The book does not specify which traits/signs count.", ta: "பிரிவைத் தள்ளிப்போட முடிந்தால் பருவ வயதுவரை காத்திருக்கவும்: ஆண் அடையாளங்கள் மிகைத்திருந்தால் ஆண் என்றும், பெண் அடையாளங்கள் மிகைத்திருந்தால் பெண் என்றும் முடிவு செய்க. எந்த அடையாளங்கள் கணக்கில் வரும் என்று நூல் கூறவில்லை.", ar: "انتظر حتى البلوغ إن أمكن تأجيل التقسيم: فإن غلبت الصفات الذكرية فاحكم بالذكورة، وإن غلبت الصفات الأنثوية فاحكم بالأنوثة. والكتاب لا يحدد أي الصفات تُعتمد." },
  { en: "The book never averages the male and female shares; it always takes the lesser and/or holds the difference.", ta: "நூல் ஆண் பெண் பங்குகளை ஒருபோதும் சராசரி எடுப்பதில்லை; எப்போதும் குறைந்ததை எடுத்து, வித்தியாசத்தை நிறுத்தி வைக்கிறது.", ar: "الكتاب لا يأخذ أبدًا متوسط حصتي الذكر والأنثى؛ بل يأخذ دائمًا الأقل و/أو يحجز الفرق." },
  { en: "Each death is divided in the normal way; a deceased heir's received share becomes their own estate for the next death.", ta: "ஒவ்வொரு மரணமும் வழக்கம்போல் பிரிக்கப்படுகிறது; இறந்த வாரிசு பெற்ற பங்கு அடுத்த மரணத்தில் அவரது சொந்தச் சொத்தாகிறது.", ar: "تُقسَّم كل وفاة بالطريقة المعتادة؛ وتصبح حصة الوارث المتوفى تركته الخاصة في الوفاة التالية." },
  { en: "The first deceased's share passes to the second, becoming part of the second's estate.", ta: "முதலில் இறந்தவரின் பங்கு இரண்டாமவருக்குச் சென்று, இரண்டாமவரின் சொத்தில் சேர்கிறது.", ar: "تنتقل حصة أول المتوفين إلى الثاني، فتصبح جزءًا من تركة الثاني." },
  { en: "Each person's estate is divided among that person's own heirs only.", ta: "ஒவ்வொருவரின் சொத்தும் அவரவரின் சொந்த வாரிசுகளுக்கு மட்டுமே பிரிக்கப்படுகிறது.", ar: "تُقسَّم تركة كل شخص بين ورثته هو فقط." },
  { en: "Bayt al-Mal appears nowhere else in the book — only in this chapter.", ta: "பைத்துல் மால் நூலில் வேறு எங்கும் வரவில்லை — இந்த அத்தியாயத்தில் மட்டுமே.", ar: "بيت المال لا يظهر في أي موضع آخر من الكتاب — فقط في هذا الفصل." },
  { en: "Abu Hanifa's division depends on knowing the value earned while Muslim ('if its value can be known'); the book gives no fallback if that value cannot be known.", ta: "அபூ ஹனீஃபாவின் பிரிவு முஸ்லிமாக இருந்தபோது சம்பாதித்த சொத்தின் மதிப்பு தெரிவதைப் பொறுத்தது (“அதன் மதிப்பு தெரிந்தால்”); அந்த மதிப்பு தெரியாவிட்டால் என்ன செய்வது என்று நூல் கூறவில்லை.", ar: "قسمة أبي حنيفة تعتمد على معرفة قيمة ما كُسب وهو مسلم («إن عُرفت قيمته»)؛ والكتاب لا يعطي بديلًا إذا لم تُعرف تلك القيمة." },
  { en: "The book gives no case of a grandfather together with male (full or paternal) brothers — the book is silent there.", ta: "ஆண் சகோதரர்களுடன் (முழு அல்லது தந்தை வழி) பாட்டன் சேர்ந்து வரும் நிலை பற்றி நூல் எந்தக் கணக்கும் தரவில்லை — இது பற்றி நூலில் இல்லை.", ar: "الكتاب لا يعطي حالة للجد مع إخوة ذكور (أشقاء أو لأب) — الكتاب ساكت هنا." },
  { en: "A sister here takes the residue as Asabah (with a daughter) rather than a fixed share; the book does not cover a grandfather together with a sister-as-Asabah, so the Shafi'i side gives the sisters their fixed shares only and the grandfather the residue.", ta: "இங்கு சகோதரி மீதத்தை அஸபாவாக (மகளுடன்) பெறுகிறார், நிலையான பங்காக அல்ல; அஸபா சகோதரியுடன் பாட்டன் சேரும் நிலை பற்றி நூலில் இல்லை; எனவே ஷாஃபிஈ பக்கம் சகோதரிகளுக்கு நிலையான பங்குகளை மட்டும் தந்து, மீதத்தைப் பாட்டனுக்குக் கொடுக்கிறது.", ar: "الأخت هنا تأخذ الباقي كعاصبة (مع بنت) لا كفرض؛ والكتاب لا يغطي الجد مع أخت كعاصبة، ولذلك يعطي الجانب الشافعي الأخوات فروضهن فقط والجد الباقي." },
  // -- Static summaries --
  { en: "An Asabah heir takes the residue; the distant relatives inherit nothing.", ta: "மீதம் பெறும் வாரிசு மீதத்தைப் பெறுகிறார்; தூரத்து உறவினர்களுக்கு எதுவும் இல்லை.", ar: "العاصب يأخذ الباقي؛ وذوو الأرحام لا يرثون شيئًا." },
  { en: "No distant relative takes the residue.", ta: "தூரத்து உறவினர் யாரும் மீதத்தைப் பெறவில்லை.", ar: "لا يأخذ أي قريب بعيد الباقي." },
  { en: "Shafi'i: sisters keep their fixed shares; grandfather takes the residue.", ta: "ஷாஃபிஈ: சகோதரிகள் தங்கள் நிலையான பங்குகளை வைத்துக்கொள்கிறார்கள்; பாட்டன் மீதத்தைப் பெறுகிறார்.", ar: "الشافعية: تحتفظ الأخوات بفروضهن؛ والجد يأخذ الباقي." },
  { en: "Estate equals debt — creditors paid in full, heirs get nothing.", ta: "சொத்து = கடன் — கடன் கொடுத்தவர்களுக்கு முழுமையாகக் கொடுக்கப்பட்டது; வாரிசுகளுக்கு எதுவும் இல்லை.", ar: "التركة = الدين — دُفع للدائنين بالكامل؛ والورثة لا يحصلون على شيء." },
  { en: "Debt exceeds estate — creditors share the estate pro rata, heirs get nothing.", ta: "கடன் சொத்தை விட அதிகம் — கடன் கொடுத்தவர்கள் சொத்தை விகிதப்படி பகிர்கிறார்கள்; வாரிசுகளுக்கு எதுவும் இல்லை.", ar: "الدين أكثر من التركة — يتقاسم الدائنون التركة بالتناسب؛ والورثة لا يحصلون على شيء." },
  { en: "No heir disqualified; the ordinary division applies.", ta: "தகுதியற்ற வாரிசு யாரும் இல்லை; வழக்கமான பிரிவு பொருந்தும்.", ar: "لا يوجد وارث ممنوع؛ وينطبق التقسيم المعتاد." },
  { en: "Order of death known — divided by Munasakha, death by death in sequence.", ta: "மரண வரிசை தெரியும் — முனாஸஹா முறையில் மரணம் மரணமாக வரிசையாகப் பிரிக்கப்பட்டது.", ar: "ترتيب الوفاة معروف — قُسِّمت بالمناسخة، وفاةً وفاةً بالترتيب." },
  { en: "Order of death unknown — each estate divided separately; the co-deceased do not inherit from each other.", ta: "மரண வரிசை தெரியாது — ஒவ்வொரு சொத்தும் தனித்தனியே பிரிக்கப்பட்டது; ஒன்றாக இறந்தவர்கள் ஒருவரிடமிருந்து மற்றவர் வாரிசாக மாட்டார்கள்.", ar: "ترتيب الوفاة غير معروف — قُسِّمت كل تركة على حدة؛ والمتوفون معًا لا يرث بعضهم من بعض." },
  { en: "Three opinions, side by side: Abu Hanifa divides only the while-Muslim property; al-Shafi'i sends all to Bayt al-Mal; Abu Yusuf and Muhammad divide all among the heirs.", ta: "மூன்று கருத்துகள், அருகருகே: அபூ ஹனீஃபா முஸ்லிமாக இருந்தபோது சம்பாதித்த சொத்தை மட்டும் பிரிக்கிறார்; அஷ்-ஷாஃபிஈ அனைத்தையும் பைத்துல் மாலுக்கு அனுப்புகிறார்; அபூ யூஸுஃபும் முஹம்மதும் அனைத்தையும் வாரிசுகளுக்குப் பிரிக்கிறார்கள்.", ar: "ثلاثة آراء جنبًا إلى جنب: أبو حنيفة يقسم فقط المال المُكتسب وهو مسلم؛ والشافعي يرسل الكل إلى بيت المال؛ وأبو يوسف ومحمد يقسمان الكل بين الورثة." },
  { en: "No heir left Islam; the ordinary division applies.", ta: "மதம் மாறிய வாரிசு யாரும் இல்லை; வழக்கமான பிரிவு பொருந்தும்.", ar: "لا يوجد وارث ارتد؛ وينطبق التقسيم المعتاد." },
  { en: "Three views, side by side: Shafi'i (pay lesser, hold the difference), Abu Hanifa (khuntha takes the lesser, rest distributed, nothing held), prevailing (reserve the larger for the khuntha). No averaging.", ta: "மூன்று கருத்துகள், அருகருகே: ஷாஃபிஈ (குறைந்ததைக் கொடு, வித்தியாசத்தை நிறுத்தி வை), அபூ ஹனீஃபா (குஃன்ஃதா குறைந்ததை எடுக்கிறார், மீதம் பிரிக்கப்படுகிறது, எதுவும் நிறுத்தி வைக்கப்படவில்லை), மேலோங்கும் கருத்து (பெரிய தொகையை குஃன்ஃதாவுக்கு ஒதுக்கு). சராசரி இல்லை.", ar: "ثلاثة آراء جنبًا إلى جنب: الشافعية (ادفع الأقل واحجز الفرق)، وأبو حنيفة (الخنثى يأخذ الأقل والباقي يُوزَّع ولا شيء محجوز)، والرأي الراجح (احجز الأكبر للخنثى). ولا توسط." },
  // Renunciation notes (case 271) — missed in the first pass, found by the
  // Playwright leak scan on the production build.
  { en: "Removing the refuser first gives a wrong answer (the book: 'இது தவறானது' — this is wrong); the first division must include them.", ta: "மறுப்பவரை முதலிலேயே நீக்கினால் தவறான முடிவு வரும் (நூல்: “இது தவறானது”); முதல் பிரிவில் அவரையும் சேர்க்க வேண்டும்.", ar: "إسقاط المتنازل أولًا يعطي نتيجة خاطئة (الكتاب: «هذا خطأ»)؛ ويجب أن تشمله القسمة الأولى." },
  { en: "The book says nothing about the refused share going to the state (Bayt al-Mal) or to charity.", ta: "மறுக்கப்பட்ட பங்கு அரசுக்கு (பைத்துல் மால்) அல்லது தர்மத்திற்குச் செல்வது பற்றி நூல் எதுவும் கூறவில்லை.", ar: "الكتاب لا يقول شيئًا عن ذهاب الحصة المتنازَل عنها إلى الدولة (بيت المال) أو إلى الصدقة." },
  // -- Thrown errors surfaced by CalcError --
  { en: "The apostate's estate must be greater than zero.", ta: "மதம் மாறியவரின் சொத்து பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.", ar: "يجب أن تكون تركة المرتد أكبر من صفر." },
  { en: "A grandparent chain needs at least two links (e.g. ['father', 'father'] for father's father).", ta: "பாட்டன் / பாட்டி தொடர்புச் சங்கிலிக்கு குறைந்தது இரண்டு தொடர்புகள் வேண்டும் (எ.கா. தந்தையின் தந்தைக்கு ['father', 'father']).", ar: "سلسلة الجد أو الجدة تحتاج إلى رابطين على الأقل (مثال: ['father', 'father'] لجد الأب)." },
];
