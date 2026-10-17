/** Premium redesign copy for new screens — onboarding, loader, results extras, save/share, learn hub, quiz.
 *  Frontend only: words, never logic. Institution names stay in English (proper nouns). */

export type PremiumLang = "ta" | "en" | "ar" | "ur";

export type PremiumCopy = {
  skip: string; back: string; continue: string; getStarted: string; close: string; learnMore: string;
  onbWelcomeSub: string; onbWelcomeTag: string; onbWelcomeDesc: string;
  onbBookKicker: string; onbBookTitle: string; onbBookSub: string;
  onbAboutKicker: string; onbAboutTitle: string;
  onbFeats: { title: string; sub: string }[];
  onbCollabKicker: string; onbCollabTitle: string; onbCollabDesc: string; onbCollabFooter: string;
  collabWith: string;
  collabTitle: string; collabLead: string;
  collabBukhariName: string; collabBukhariTamil: string; collabBukhariAr: string; collabBukhariMotto: string;
  collabCrescentName: string; collabCrescentTamil: string; collabCrescentMotto: string;
  noShareStatus: string;
  tabLcm: string; tabPercentage: string;
  loaderTitle: string; loaderSteps: string[];
  viewDetailed: string; backToSummary: string; distTitle: string; distDesc: string;
  statHeirs: string; statShares: string; statLcm: string;
  tabTable: string; tabChart: string;
  totalEstate: string;
  saveShareTitle: string; saveShareDesc: string;
  reportTitle: string; reportDesc: string;
  saveCalc: string; savedLabel: string; downloadReport: string; shareResults: string; printReport: string;
  copiedNote: string; downloadStarted: string; sharedDone: string;
  saveDevice: string; saveDeviceSub: string;
  share: string; shareSub: string;
  newCalc: string; viewResearch: string; viewResearchSub: string;
  sharedText: string;
  learnTitle: string; learnSub: string;
  learnCards: { title: string; sub: string }[];
  articleBack: string;
  quizTitle: string; quizSub: string; quizScore: string; quizRetry: string; quizDone: string;
  quiz: { q: string; opts: string[]; answer: number; why: string }[];
};

const en: PremiumCopy = {
  skip: "Skip", back: "Back", continue: "Continue", getStarted: "Get Started", close: "Close", learnMore: "Learn More",
  onbWelcomeSub: "Islamic Inheritance Calculator", onbWelcomeTag: "Islamic Inheritance, Made Clear.",
  onbWelcomeDesc: "Calculate and understand inheritance shares with clarity and confidence.",
  onbBookKicker: "My Book", onbBookTitle: "The classical manual behind every calculation.",
  onbBookSub: "Miraasu follows this book of Islamic inheritance law — every share below traces back to it.",
  onbAboutKicker: "About Miraasu", onbAboutTitle: "Islamic Inheritance, Made Clear.",
  onbFeats: [
    { title: "Step-by-step calculator", sub: "Enter the estate, choose the family, see every share." },
    { title: "Every share explained", sub: "Fractions, percentages and amounts — with the reason shown." },
    { title: "Learn as you go", sub: "LCM method, Asabah, Radd and Hajb guides built in." },
  ],
  onbCollabKicker: "Institutions", onbCollabTitle: "Developed in Collaboration With",
  onbCollabDesc: "A collaborative educational initiative supporting the understanding of Islamic inheritance.",
  onbCollabFooter: "Knowledge • Character • Community",
  collabWith: "In Collaboration With",
  collabTitle: "About Our Collaboration",
  collabLead: "A collaborative educational initiative supporting the understanding of Islamic inheritance.",
  collabBukhariName: "Bukhari Aalim Arabic College", collabBukhariTamil: "புகாரி ஆலிம் அரபிக் கல்லூரி", collabBukhariAr: "الكلية العربية البخارية", collabBukhariMotto: "Knowledge • Character • Community",
  collabCrescentName: "BSA Crescent Institute of Science & Technology", collabCrescentTamil: "பி.எஸ். அப்துர் ரஹ்மான் கிரிசெண்ட் பல்கலைக்கழகம்", collabCrescentMotto: "Science • Innovation • Humanity",
  noShareStatus: "No share",
  tabLcm: "LCM Method", tabPercentage: "Percentage Method",
  loaderTitle: "Calculating Inheritance Shares…",
  loaderSteps: ["Checking eligibility", "Applying fixed shares", "Calculating Asabah", "Handling Radd (if any)", "Finalizing results…"],
  viewDetailed: "View Detailed Results", backToSummary: "Back to Summary",
  distTitle: "Share Distribution", distDesc: "See how the estate is distributed among eligible heirs.",
  statHeirs: "Total Heirs", statShares: "Total Shares", statLcm: "LCM Used",
  tabTable: "Shares Table", tabChart: "Visual Chart",
  totalEstate: "Total Estate",
  saveShareTitle: "Save & Share Results", saveShareDesc: "Keep a copy of your inheritance report or share it when needed.",
  reportTitle: "Inheritance Report", reportDesc: "A clear summary of the estate and the calculated family shares.",
  saveCalc: "Save Calculation", savedLabel: "Saved", downloadReport: "Download Report", shareResults: "Share Results", printReport: "Print Report",
  copiedNote: "Link copied to clipboard", downloadStarted: "Report download started", sharedDone: "Shared successfully",
  saveDevice: "Save to Device", saveDeviceSub: "PDF Report",
  share: "Share", shareSub: "With Others",
  newCalc: "New Calculation", viewResearch: "View Research", viewResearchSub: "Learn More",
  sharedText: "My Miraasu inheritance result",
  learnTitle: "Learn & Explore", learnSub: "Guides, methods and a quick quiz.",
  learnCards: [
    { title: "Basic Fractions", sub: "1/2, 1/4, 1/8, 1/6, 1/3, 2/3" },
    { title: "LCM Method", sub: "Step by step guide" },
    { title: "Asabah Guide", sub: "Explanation and examples" },
    { title: "Radd Cases", sub: "When surplus is returned" },
    { title: "Hajb (Blocking)", sub: "Who gets no share" },
    { title: "Quiz", sub: "Test your knowledge" },
  ],
  articleBack: "All topics",
  quizTitle: "Quiz", quizSub: "Test your knowledge", quizScore: "Your score", quizRetry: "Try Again", quizDone: "Quiz complete!",
  quiz: [
    { q: "A husband's fixed share when the deceased left no children?", opts: ["1/4", "1/2", "1/8", "1/3"], answer: 1, why: "With no children, the husband takes one-half." },
    { q: "Two or more daughters (and no sons) share together?", opts: ["1/2", "1/3", "2/3", "1/4"], answer: 2, why: "Two or more daughters share two-thirds collectively." },
    { q: "After fixed shares, who takes the remainder when a son is alive?", opts: ["The father", "The son, as Asabah", "The sisters", "Nobody — it is held"], answer: 1, why: "The son is the first residuary (Asabah) heir." },
    { q: "A bequest (wasiyyah) is limited to…", opts: ["One-half", "One-third", "One-fourth", "No limit"], answer: 1, why: "A bequest cannot exceed one-third of the estate." },
    { q: "If the father is alive, the paternal grandfather receives?", opts: ["1/6", "The remainder", "No share — blocked", "1/3"], answer: 2, why: "The nearer relative (father) blocks the grandfather — Hajb." },
  ],
};

const ta: PremiumCopy = {
  skip: "தவிர்", back: "பின்செல்", continue: "தொடர்க", getStarted: "தொடங்குக", close: "மூடுக", learnMore: "மேலும் அறிக",
  onbWelcomeSub: "இஸ்லாமிய வாரிசுரிமை கணக்கீடு", onbWelcomeTag: "இஸ்லாமிய வாரிசுரிமை, தெளிவாக.",
  onbWelcomeDesc: "வாரிசுரிமைப் பங்குகளைத் தெளிவுடனும் நம்பிக்கையுடனும் கணக்கிட்டுப் புரிந்துகொள்ளுங்கள்.",
  onbBookKicker: "என் நூல்", onbBookTitle: "ஒவ்வொரு கணக்கிற்கும் பின்னால் உள்ள பாரம்பரிய நூல்.",
  onbBookSub: "மீராஸ் இந்த இஸ்லாமிய வாரிசுரிமை நூலைப் பின்பற்றுகிறது — ஒவ்வொரு பங்கும் இதிலிருந்தே வருகிறது.",
  onbAboutKicker: "மீராஸ் பற்றி", onbAboutTitle: "இஸ்லாமிய வாரிசுரிமை, தெளிவாக.",
  onbFeats: [
    { title: "படிப்படியான கணக்கீடு", sub: "சொத்தை உள்ளிட்டு, குடும்பத்தைத் தேர்ந்து, ஒவ்வொரு பங்கையும் பார்க்கவும்." },
    { title: "ஒவ்வொரு பங்கிற்கும் விளக்கம்", sub: "காரணத்துடன் பின்னங்கள், சதவீதங்கள், தொகைகள்." },
    { title: "கற்றுக்கொண்டே செல்லுங்கள்", sub: "LCM முறை, அஸபா, ரத், ஹஜ்ப் வழிகாட்டிகள் உள்ளே." },
  ],
  onbCollabKicker: "நிறுவனங்கள்", onbCollabTitle: "இணைந்து உருவாக்கப்பட்டது",
  onbCollabDesc: "இஸ்லாமிய வாரிசுரிமையைப் புரிந்துகொள்வதை ஆதரிக்கும் கூட்டுக் கல்வி முயற்சி.",
  onbCollabFooter: "Knowledge • Character • Community",
  collabWith: "இணைந்து",
  collabTitle: "எங்கள் கூட்டு முயற்சி பற்றி",
  collabLead: "இஸ்லாமிய வாரிசுரிமையைப் புரிந்துகொள்வதை ஆதரிக்கும் கூட்டுக் கல்வி முயற்சி.",
  collabBukhariName: "Bukhari Aalim Arabic College", collabBukhariTamil: "புகாரி ஆலிம் அரபிக் கல்லூரி", collabBukhariAr: "الكلية العربية البخارية", collabBukhariMotto: "Knowledge • Character • Community",
  collabCrescentName: "BSA Crescent Institute of Science & Technology", collabCrescentTamil: "பி.எஸ். அப்துர் ரஹ்மான் கிரிசெண்ட் பல்கலைக்கழகம்", collabCrescentMotto: "Science • Innovation • Humanity",
  noShareStatus: "பங்கு இல்லை",
  tabLcm: "LCM முறை", tabPercentage: "சதவீத முறை",
  loaderTitle: "வாரிசுரிமைப் பங்குகள் கணக்கிடப்படுகின்றன…",
  loaderSteps: ["தகுதி சரிபார்க்கப்படுகிறது", "நிர்ணயப் பங்குகள் பயன்படுத்தப்படுகின்றன", "அஸபா கணக்கிடப்படுகிறது", "ரத் கையாளப்படுகிறது (தேவைப்பட்டால்)", "முடிவுகள் இறுதி செய்யப்படுகின்றன…"],
  viewDetailed: "விரிவான முடிவுகளைப் பார்க்கவும்", backToSummary: "சுருக்கத்திற்குத் திரும்புக",
  distTitle: "பங்கு விநியோகம்", distDesc: "தகுதியான வாரிசுகளிடையே சொத்து எவ்வாறு பகிரப்படுகிறது என்பதைப் பார்க்கவும்.",
  statHeirs: "மொத்த வாரிசுகள்", statShares: "மொத்தப் பங்குகள்", statLcm: "பயன்படுத்திய LCM",
  tabTable: "பங்கு அட்டவணை", tabChart: "விளக்கப் படம்",
  totalEstate: "மொத்த சொத்து",
  saveShareTitle: "முடிவுகளைச் சேமித்து பகிர்க", saveShareDesc: "உங்கள் வாரிசு அறிக்கையின் நகலை வைத்துக்கொள்ளுங்கள் அல்லது தேவைப்படும்போது பகிருங்கள்.",
  reportTitle: "வாரிசு அறிக்கை", reportDesc: "சொத்து மற்றும் கணக்கிடப்பட்ட குடும்ப பங்குகளின் தெளிவான சுருக்கம்.",
  saveCalc: "கணக்கீட்டைச் சேமி", savedLabel: "சேமிக்கப்பட்டது", downloadReport: "அறிக்கையைப் பதிவிறக்குக", shareResults: "முடிவுகளைப் பகிர்க", printReport: "அறிக்கையை அச்சிடுக",
  copiedNote: "இணைப்பு நகலெடுக்கப்பட்டது", downloadStarted: "அறிக்கை பதிவிறக்கம் தொடங்கியது", sharedDone: "பகிரப்பட்டது",
  saveDevice: "சாதனத்தில் சேமி", saveDeviceSub: "PDF அறிக்கை",
  share: "பகிர்க", shareSub: "மற்றவர்களுடன்",
  newCalc: "புதிய கணக்கு", viewResearch: "ஆய்வைப் பார்க்கவும்", viewResearchSub: "மேலும் அறிக",
  sharedText: "என் மீராஸ் வாரிசுரிமை முடிவு",
  learnTitle: "கற்க & ஆராய்க", learnSub: "வழிகாட்டிகள், முறைகள், சிறு வினாடி வினா.",
  learnCards: [
    { title: "அடிப்படைப் பின்னங்கள்", sub: "1/2, 1/4, 1/8, 1/6, 1/3, 2/3" },
    { title: "LCM முறை", sub: "படிப்படியான வழிகாட்டி" },
    { title: "அஸபா வழிகாட்டி", sub: "விளக்கம் மற்றும் எடுத்துக்காட்டுகள்" },
    { title: "ரத் நிலைகள்", sub: "மீதி திருப்பித் தரப்படும்போது" },
    { title: "ஹஜ்ப் (தடை)", sub: "யாருக்குப் பங்கு இல்லை" },
    { title: "வினாடி வினா", sub: "உங்கள் அறிவைச் சோதிக்கவும்" },
  ],
  articleBack: "அனைத்துத் தலைப்புகள்",
  quizTitle: "வினாடி வினா", quizSub: "உங்கள் அறிவைச் சோதிக்கவும்", quizScore: "உங்கள் மதிப்பெண்", quizRetry: "மீண்டும் முயல்க", quizDone: "வினாடி வினா முடிந்தது!",
  quiz: [
    { q: "பிள்ளைகள் இல்லாதபோது கணவனின் நிர்ணயப் பங்கு?", opts: ["1/4", "1/2", "1/8", "1/3"], answer: 1, why: "பிள்ளைகள் இல்லாதபோது கணவனுக்கு அரைப் பங்கு (1/2)." },
    { q: "இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள் (மகன் இல்லாமல்) சேர்ந்து பெறுவது?", opts: ["1/2", "1/3", "2/3", "1/4"], answer: 2, why: "இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள் சேர்ந்து 2/3 பெறுவர்." },
    { q: "நிர்ணயப் பங்குகளுக்குப் பிறகு, மகன் உயிருடன் இருந்தால் மீதியைப் பெறுபவர்?", opts: ["தந்தை", "மகன் — அஸபாவாக", "சகோதரிகள்", "யாருமில்லை — நிறுத்தி வைக்கப்படும்"], answer: 1, why: "மகனே முதல் மீதிப் பங்கு (அஸபா) வாரிசு." },
    { q: "வஸிய்யத் (மரண சாசனம்) வரம்பு…", opts: ["அரைப் பங்கு", "மூன்றில் ஒரு பங்கு", "நான்கில் ஒரு பங்கு", "வரம்பு இல்லை"], answer: 1, why: "வஸிய்யத் சொத்தில் மூன்றில் ஒரு பங்கைத் தாண்டக்கூடாது." },
    { q: "தந்தை உயிருடன் இருந்தால் தந்தையின் தந்தை பெறுவது?", opts: ["1/6", "மீதிப் பங்கு", "பங்கு இல்லை — தடுக்கப்படுகிறார்", "1/3"], answer: 2, why: "நெருங்கிய உறவினர் (தந்தை) தாத்தாவைத் தடுக்கிறார் — ஹஜ்ப்." },
  ],
};

const ar: PremiumCopy = {
  skip: "تخطي", back: "رجوع", continue: "التالي", getStarted: "ابدأ", close: "إغلاق", learnMore: "اعرف المزيد",
  onbWelcomeSub: "حاسبة الميراث الإسلامي", onbWelcomeTag: "الميراث الإسلامي بوضوح.",
  onbWelcomeDesc: "احسب حصص الميراث وافهمها بوضوح وثقة.",
  onbBookKicker: "كتابي", onbBookTitle: "المرجع الكلاسيكي وراء كل حساب.",
  onbBookSub: "تتبع ميراسو هذا الكتاب في المواريث الإسلامية — كل نصيب مردّه إليه.",
  onbAboutKicker: "عن ميراسو", onbAboutTitle: "الميراث الإسلامي بوضوح.",
  onbFeats: [
    { title: "حاسبة خطوة بخطوة", sub: "أدخل التركة واختر العائلة وشاهد كل نصيب." },
    { title: "شرح لكل نصيب", sub: "الكسور والنسب والمبالغ مع بيان السبب." },
    { title: "تعلّم أثناء الاستخدام", sub: "أدلة طريقة LCM والعصبة والرد والحجب مدمجة." },
  ],
  onbCollabKicker: "المؤسسات", onbCollabTitle: "طُوِّر بالتعاون مع",
  onbCollabDesc: "مبادرة تعليمية تعاونية لدعم فهم الميراث الإسلامي.",
  onbCollabFooter: "Knowledge • Character • Community",
  collabWith: "بالتعاون مع",
  collabTitle: "عن تعاوننا",
  collabLead: "مبادرة تعليمية تعاونية لدعم فهم الميراث الإسلامي.",
  collabBukhariName: "Bukhari Aalim Arabic College", collabBukhariTamil: "புகாரி ஆலிம் அரபிக் கல்லூரி", collabBukhariAr: "الكلية العربية البخارية", collabBukhariMotto: "Knowledge • Character • Community",
  collabCrescentName: "BSA Crescent Institute of Science & Technology", collabCrescentTamil: "பி.எஸ். அப்துர் ரஹ்மான் கிரிசெண்ட் பல்கலைக்கழகம்", collabCrescentMotto: "Science • Innovation • Humanity",
  noShareStatus: "لا نصيب",
  tabLcm: "طريقة المضاعف المشترك", tabPercentage: "طريقة النسبة المئوية",
  loaderTitle: "جارٍ حساب حصص الميراث…",
  loaderSteps: ["التحقق من الأهلية", "تطبيق الحصص المفروضة", "حساب العصبة", "معالجة الرد (إن وجد)", "إنهاء النتائج…"],
  viewDetailed: "عرض النتائج التفصيلية", backToSummary: "عودة إلى الملخص",
  distTitle: "توزيع الحصص", distDesc: "شاهد كيف تُوزَّع التركة بين الورثة المستحقين.",
  statHeirs: "إجمالي الورثة", statShares: "إجمالي الحصص", statLcm: "LCM المستخدم",
  tabTable: "جدول الحصص", tabChart: "مخطط مرئي",
  totalEstate: "إجمالي التركة",
  saveShareTitle: "حفظ النتائج ومشاركتها", saveShareDesc: "احتفظ بنسخة من تقرير الميراث أو شاركه عند الحاجة.",
  reportTitle: "تقرير الميراث", reportDesc: "ملخص واضح للتركة وحصص العائلة المحسوبة.",
  saveCalc: "حفظ الحساب", savedLabel: "تم الحفظ", downloadReport: "تنزيل التقرير", shareResults: "مشاركة النتائج", printReport: "طباعة التقرير",
  copiedNote: "تم نسخ الرابط", downloadStarted: "بدأ تنزيل التقرير", sharedDone: "تمت المشاركة",
  saveDevice: "حفظ في الجهاز", saveDeviceSub: "تقرير PDF",
  share: "مشاركة", shareSub: "مع الآخرين",
  newCalc: "حساب جديد", viewResearch: "عرض البحث", viewResearchSub: "اعرف المزيد",
  sharedText: "نتيجة الميراث الخاصة بي من ميراسو",
  learnTitle: "تعلَّم واستكشف", learnSub: "أدلة وطرق واختبار سريع.",
  learnCards: [
    { title: "الكسور الأساسية", sub: "1/2، 1/4، 1/8، 1/6، 1/3، 2/3" },
    { title: "طريقة LCM", sub: "دليل خطوة بخطوة" },
    { title: "دليل العصبة", sub: "شرح وأمثلة" },
    { title: "حالات الرد", sub: "عند إعادة الفائض" },
    { title: "الحجب", sub: "من لا يرث" },
    { title: "اختبار", sub: "اختبر معلوماتك" },
  ],
  articleBack: "كل المواضيع",
  quizTitle: "اختبار", quizSub: "اختبر معلوماتك", quizScore: "نتيجتك", quizRetry: "حاول مجددًا", quizDone: "اكتمل الاختبار!",
  quiz: [
    { q: "نصيب الزوج المفروض عند عدم وجود فرع وارث؟", opts: ["1/4", "1/2", "1/8", "1/3"], answer: 1, why: "عند عدم وجود الفرع الوارث يأخذ الزوج النصف." },
    { q: "بنتان فأكثر (ولا ابن) يشتركن في؟", opts: ["1/2", "1/3", "2/3", "1/4"], answer: 2, why: "البنتان فأكثر يشتركن في الثلثين." },
    { q: "بعد الفروض، من يأخذ الباقي عند وجود ابن حي؟", opts: ["الأب", "الابن عصبة", "الأخوات", "لا أحد — يُحبس"], answer: 1, why: "الابن أول العصبة بالنفس." },
    { q: "الوصية محدودة بـ…", opts: ["النصف", "الثلث", "الربع", "لا حد"], answer: 1, why: "لا تجوز الوصية بأكثر من ثلث التركة." },
    { q: "إذا كان الأب حيًّا، فجد الأب يأخذ؟", opts: ["1/6", "الباقي", "لا شيء — محجوب", "1/3"], answer: 2, why: "القريب (الأب) يحجب الجد — الحجب." },
  ],
};

const ur: PremiumCopy = {
  skip: "چھوڑیں", back: "پیچھے", continue: "جاری رکھیں", getStarted: "شروع کریں", close: "بند کریں", learnMore: "مزید جانیں",
  onbWelcomeSub: "اسلامی وراثت کیلکولیٹر", onbWelcomeTag: "اسلامی وراثت، واضح انداز میں۔",
  onbWelcomeDesc: "وراثت کے حصوں کا حساب لگائیں اور انہیں واضح اور پُراعتماد انداز میں سمجھیں۔",
  onbBookKicker: "میری کتاب", onbBookTitle: "ہر حساب کے پیچھے کلاسیکی مرجع۔",
  onbBookSub: "میراسو اسلامی وراثت کی اس کتاب کی پیروی کرتا ہے — ہر حصہ اسی سے ہے۔",
  onbAboutKicker: "میراسو کے بارے میں", onbAboutTitle: "اسلامی وراثت، واضح انداز میں۔",
  onbFeats: [
    { title: "مرحلہ وار کیلکولیٹر", sub: "ترکہ درج کریں، خاندان چنیں، ہر حصہ دیکھیں۔" },
    { title: "ہر حصے کی وضاحت", sub: "وجہ کے ساتھ کسریں، فیصد اور رقوم۔" },
    { title: "استعمال کے ساتھ سیکھیں", sub: "ایل سی ایم طریقہ، عصبہ، رد اور حجب کی رہنمائی شامل۔" },
  ],
  onbCollabKicker: "ادارے", onbCollabTitle: "اشتراک سے تیار کردہ",
  onbCollabDesc: "اسلامی وراثت کو سمجھنے کی معاونت کرنے والی ایک مشترکہ تعلیمی پہل۔",
  onbCollabFooter: "Knowledge • Character • Community",
  collabWith: "اشتراک سے",
  collabTitle: "ہمارے اشتراک کے بارے میں",
  collabLead: "اسلامی وراثت کو سمجھنے کی معاونت کرنے والی ایک مشترکہ تعلیمی پہل۔",
  collabBukhariName: "Bukhari Aalim Arabic College", collabBukhariTamil: "புகாரி ஆலிம் அரபிக் கல்லூரி", collabBukhariAr: "الكلية العربية البخارية", collabBukhariMotto: "Knowledge • Character • Community",
  collabCrescentName: "BSA Crescent Institute of Science & Technology", collabCrescentTamil: "பி.எஸ். அப்துர் ரஹ்மான் கிரிசெண்ட் பல்கலைக்கழகம்", collabCrescentMotto: "Science • Innovation • Humanity",
  noShareStatus: "حصہ نہیں",
  tabLcm: "LCM طریقہ", tabPercentage: "فیصدی طریقہ",
  loaderTitle: "وراثتی حصوں کا حساب لگایا جا رہا ہے…",
  loaderSteps: ["اہلیت کی جانچ", "مقررہ حصے لگائے جا رہے ہیں", "عصبہ کا حساب", "رد کا معاملہ (اگر ہو)", "نتائج کو حتمی شکل…"],
  viewDetailed: "تفصیلی نتائج دیکھیں", backToSummary: "خلاصے پر واپس",
  distTitle: "حصوں کی تقسیم", distDesc: "دیکھیں کہ ترکہ مستحق وارثوں میں کیسے تقسیم ہوا۔",
  statHeirs: "کل ورثاء", statShares: "کل حصے", statLcm: "استعمال شدہ LCM",
  tabTable: "حصوں کی جدول", tabChart: "بصری چارٹ",
  totalEstate: "کل ترکہ",
  saveShareTitle: "نتائج محفوظ اور شیئر کریں", saveShareDesc: "اپنی وراثت رپورٹ کی کاپی رکھیں یا ضرورت پر شیئر کریں۔",
  reportTitle: "وراثت رپورٹ", reportDesc: "ترکہ اور حساب شدہ خاندانی حصوں کا واضح خلاصہ۔",
  saveCalc: "حساب محفوظ کریں", savedLabel: "محفوظ ہو گیا", downloadReport: "رپورٹ ڈاؤن لوڈ کریں", shareResults: "نتائج شیئر کریں", printReport: "رپورٹ پرنٹ کریں",
  copiedNote: "لنک کاپی ہو گیا", downloadStarted: "رپورٹ ڈاؤن لوڈ شروع ہو گئی", sharedDone: "شیئر ہو گیا",
  saveDevice: "ڈیوائس میں محفوظ کریں", saveDeviceSub: "PDF رپورٹ",
  share: "شیئر کریں", shareSub: "دوسروں کے ساتھ",
  newCalc: "نیا حساب", viewResearch: "تحقیق دیکھیں", viewResearchSub: "مزید جانیں",
  sharedText: "میراسو سے میرا وراثتی نتیجہ",
  learnTitle: "سیکھیں اور دریافت کریں", learnSub: "رہنما، طریقے اور مختصر کوئز۔",
  learnCards: [
    { title: "بنیادی کسریں", sub: "1/2، 1/4، 1/8، 1/6، 1/3، 2/3" },
    { title: "ایل سی ایم طریقہ", sub: "مرحلہ وار رہنمائی" },
    { title: "عصبہ رہنمائی", sub: "وضاحت اور مثالیں" },
    { title: "رد کے معاملات", sub: "جب زائد واپس کیا جائے" },
    { title: "حجب", sub: "کسے حصہ نہیں ملتا" },
    { title: "کوئز", sub: "اپنے علم کو آزمائیں" },
  ],
  articleBack: "تمام موضوعات",
  quizTitle: "کوئز", quizSub: "اپنے علم کو آزمائیں", quizScore: "آپ کا اسکور", quizRetry: "دوبارہ کوشش کریں", quizDone: "کوئز مکمل!",
  quiz: [
    { q: "شوہر کا مقررہ حصہ جب کوئی اولاد نہ ہو؟", opts: ["1/4", "1/2", "1/8", "1/3"], answer: 1, why: "اولاد نہ ہونے پر شوہر نصف لیتا ہے۔" },
    { q: "دو یا زیادہ بیٹیاں (بیٹا نہ ہو) مل کر؟", opts: ["1/2", "1/3", "2/3", "1/4"], answer: 2, why: "دو یا زیادہ بیٹیاں مل کر دو تہائی لیتی ہیں۔" },
    { q: "مقررہ حصوں کے بعد، بیٹا زندہ ہو تو باقی کون لے گا؟", opts: ["باپ", "بیٹا بطور عصبہ", "بہنیں", "کوئی نہیں — روکا جائے گا"], answer: 1, why: "بیٹا پہلا عصبہ وارث ہے۔" },
    { q: "وصیت کی حد…", opts: ["نصف", "تہائی", "چوتھائی", "کوئی حد نہیں"], answer: 1, why: "وصیت ترکہ کے تہائی سے زیادہ نہیں ہو سکتی۔" },
    { q: "باپ زندہ ہو تو دادا کو؟", opts: ["1/6", "باقی", "کچھ نہیں — محجوب", "1/3"], answer: 2, why: "قریبی رشتہ دار (باپ) دادا کو روکتا ہے — حجب۔" },
  ],
};

export const premiumCopy: Record<PremiumLang, PremiumCopy> = { ta, en, ar, ur };

/** Short learn articles: title + intro + bullets, per language. Index: 0 fractions, 1 lcm, 3 radd, 4 hajb. (2 = Asabah uses AsabaGuide.) */
export type LearnArticle = { title: string; intro: string; bullets: string[] };
export const learnArticles: Record<PremiumLang, LearnArticle[]> = {
  en: [
    { title: "Basic Fractions", intro: "Every share in Islamic inheritance is one of six fixed fractions.", bullets: ["1/2 — one half: e.g. a husband with no children, or a lone daughter.", "1/4 — one quarter: e.g. a husband with children, or wives with no children.", "1/8 — one eighth: wives when children exist.", "1/6 — one sixth: e.g. each parent when children exist.", "1/3 — one third: e.g. the mother with no children or siblings.", "2/3 — two thirds: e.g. two or more daughters together."] },
    { title: "LCM Method", intro: "Turn fractions into whole units so money divides cleanly.", bullets: ["List the denominators of the fixed shares (e.g. 8, 6, 3).", "Take their lowest common multiple — the 'root' (here 24).", "Convert each share: 1/8 → 3 units, 1/6 → 4 units, 2/3 → 16 units.", "Units left over form one remainder pool for Asabah or Radd.", "Each heir's money = net estate × exact fraction — never rounded inside."] },
    { title: "Asabah Guide", intro: "", bullets: [] },
    { title: "Radd Cases", intro: "When fixed shares leave a surplus and no residuary heir exists, it returns.", bullets: ["Radd applies only when there is no Asabah heir for the leftover.", "The surplus returns to the fixed-share heirs in their original proportions.", "The spouse (husband/wife) never receives Radd.", "Example: wife 1/8 + mother 1/6 + two daughters 2/3 = 23/24 — the last 1/24 returns to mother and daughters."] },
    { title: "Hajb (Blocking)", intro: "A nearer relative blocks a more distant one from inheriting.", bullets: ["Father alive → paternal grandfather gets nothing.", "Son alive → siblings and son's daughters get nothing.", "Children or father alive → maternal half-siblings get nothing.", "Mother alive → grandmothers get nothing.", "Blocked relatives are listed under 'No share' with the reason."] },
    { title: "Quiz", intro: "", bullets: [] },
  ],
  ta: [
    { title: "அடிப்படைப் பின்னங்கள்", intro: "இஸ்லாமிய வாரிசுரிமையில் ஒவ்வொரு பங்கும் ஆறு நிர்ணயப் பின்னங்களில் ஒன்று.", bullets: ["1/2 — அரைப் பங்கு: எ.கா. பிள்ளைகள் இல்லாத கணவன், அல்லது ஒரே மகள்.", "1/4 — கால் பங்கு: எ.கா. பிள்ளைகள் உள்ள கணவன், அல்லது பிள்ளைகள் இல்லாத மனைவிகள்.", "1/8 — எட்டில் ஒரு பங்கு: பிள்ளைகள் இருந்தால் மனைவிகள்.", "1/6 — ஆறில் ஒரு பங்கு: எ.கா. பிள்ளைகள் இருந்தால் பெற்றோர் ஒவ்வொருவரும்.", "1/3 — மூன்றில் ஒரு பங்கு: எ.கா. பிள்ளை/சகோதரர் இல்லாத தாய்.", "2/3 — மூன்றில் இரண்டு: எ.கா. இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள் சேர்ந்து."] },
    { title: "LCM முறை", intro: "பின்னங்களை முழு அலகுகளாக மாற்றி, தொகை சுத்தமாகப் பிரியும்.", bullets: ["நிர்ணயப் பங்குகளின் பகுதிகளைப் பட்டியலிடுக (எ.கா. 8, 6, 3).", "அவற்றின் மீச்சிறு பொது மடங்கை எடுக்கவும் — 'அடிப்படை' (இங்கு 24).", "ஒவ்வொரு பங்கையும் மாற்றுக: 1/8 → 3 அலகு, 1/6 → 4 அலகு, 2/3 → 16 அலகு.", "மீதமுள்ள அலகுகள் அஸபா அல்லது ரத்-க்கான ஒரே தொகுப்பாகும்.", "ஒவ்வொரு வாரிசின் தொகை = நிகர சொத்து × துல்லியப் பின்னம் — உள்ளே வட்டமிடப்படாது."] },
    { title: "அஸபா வழிகாட்டி", intro: "", bullets: [] },
    { title: "ரத் நிலைகள்", intro: "நிர்ணயப் பங்குகளுக்குப் பிறகு மீதி இருந்து, மீதிப் பங்கு வாரிசு இல்லாதபோது அது திரும்பும்.", bullets: ["மீதிக்கு அஸபா வாரிசு இல்லாதபோது மட்டுமே ரத் பொருந்தும்.", "மீதி, அசல் விகிதத்தில் நிர்ணயப் பங்கு வாரிசுகளுக்குத் திரும்பும்.", "துணைவர் (கணவன்/மனைவி) ரத் பெறமாட்டார்.", "எடுத்துக்காட்டு: மனைவி 1/8 + தாய் 1/6 + இரு மகள்கள் 2/3 = 23/24 — கடைசி 1/24 தாய்க்கும் மகள்களுக்கும் திரும்பும்."] },
    { title: "ஹஜ்ப் (தடை)", intro: "நெருங்கிய உறவினர், தூரத்து உறவினரை வாரிசுரிமையிலிருந்து தடுக்கிறார்.", bullets: ["தந்தை உயிருடன் → தந்தையின் தந்தைக்குப் பங்கு இல்லை.", "மகன் உயிருடன் → சகோதரர்கள், மகனின் மகள்களுக்குப் பங்கு இல்லை.", "பிள்ளைகள் அல்லது தந்தை உயிருடன் → தாய் வழி சகோதரர்களுக்குப் பங்கு இல்லை.", "தாய் உயிருடன் → பாட்டிகளுக்குப் பங்கு இல்லை.", "தடுக்கப்பட்டவர்கள் 'பங்கு இல்லை' பகுதியில் காரணத்துடன் பட்டியலிடப்படுவர்."] },
    { title: "வினாடி வினா", intro: "", bullets: [] },
  ],
  ar: [
    { title: "الكسور الأساسية", intro: "كل نصيب في الميراث الإسلامي واحد من ستة كسور مفروضة.", bullets: ["1/2 — النصف: كالزوج عند عدم وجود الفرع، أو البنت الواحدة.", "1/4 — الربع: كالزوج مع الفرع، أو الزوجات عند عدم وجود الفرع.", "1/8 — الثمن: الزوجات عند وجود الفرع.", "1/6 — السدس: ككل واحد من الأبوين عند وجود الفرع.", "1/3 — الثلث: كالأم عند عدم وجود الفرع والإخوة.", "2/3 — الثلثان: كبنتين فأكثر مجتمعتين."] },
    { title: "طريقة LCM", intro: "حوّل الكسور إلى وحدات صحيحة ليُقسَّم المال بدقة.", bullets: ["اذكر مقامات الفروض (مثل 8، 6، 3).", "خذ مضاعفها المشترك الأصغر — 'الأصل' (هنا 24).", "حوّل كل فرض: 1/8 ← 3 وحدات، 1/6 ← 4 وحدات، 2/3 ← 16 وحدة.", "الوحدات الباقية تجمع واحد للعصبة أو الرد.", "مال كل وارث = صافي التركة × الكسر الدقيق — دون تقريب في الداخل."] },
    { title: "دليل العصبة", intro: "", bullets: [] },
    { title: "حالات الرد", intro: "عند بقاء فائض بعد الفروض ولا عصبة له، يُرَدّ.", bullets: ["لا يُطبَّق الرد إلا عند عدم وجود عاصب للباقي.", "يعود الفائض إلى أصحاب الفروض بنسب فروضهم الأصلية.", "الزوج/الزوجة لا يأخذ من الرد أبدًا.", "مثال: زوجة 1/8 + أم 1/6 + بنتان 2/3 = 23/24 — الـ1/24 الأخيرة تعود للأم والبنتين."] },
    { title: "الحجب", intro: "القريب يحجب البعيد عن الميراث.", bullets: ["الأب حي ← لا شيء لجد الأب.", "الابن حي ← لا شيء للإخوة وبنات الابن.", "الفرع أو الأب حي ← لا شيء للإخوة لأم.", "الأم حية ← لا شيء للجدات.", "يُدرَج المحجوبون تحت 'لا نصيب' مع السبب."] },
    { title: "اختبار", intro: "", bullets: [] },
  ],
  ur: [
    { title: "بنیادی کسریں", intro: "اسلامی وراثت میں ہر حصہ چھ مقررہ کسروں میں سے ایک ہے۔", bullets: ["1/2 — نصف: مثلاً اولاد نہ ہونے پر شوہر، یا اکلوتی بیٹی۔", "1/4 — چوتھائی: مثلاً اولاد ہونے پر شوہر، یا اولاد نہ ہونے پر بیویاں۔", "1/8 — آٹھواں: اولاد ہونے پر بیویاں۔", "1/6 — چھٹا: مثلاً اولاد ہونے پر والدین میں سے ہر ایک۔", "1/3 — تہائی: مثلاً اولاد اور بہن بھائی نہ ہونے پر ماں۔", "2/3 — دو تہائی: مثلاً دو یا زیادہ بیٹیاں مل کر۔"] },
    { title: "ایل سی ایم طریقہ", intro: "کسروں کو مکمل اکائیوں میں بدلیں تاکہ رقم صاف تقسیم ہو۔", bullets: ["مقررہ حصوں کے مخرج لکھیں (مثلاً 8، 6، 3).", "ان کا ذواضعاف اقل لیں — 'اصل' (یہاں 24).", "ہر حصہ بدلیں: 1/8 ← 3 اکائی، 1/6 ← 4 اکائی، 2/3 ← 16 اکائی۔", "بچی اکائیاں عصبہ یا رد کے لیے ایک مجموعہ بنتی ہیں۔", "ہر وارث کی رقم = خالص ترکہ × درست کسر — اندر راؤنڈنگ نہیں۔"] },
    { title: "عصبہ رہنمائی", intro: "", bullets: [] },
    { title: "رد کے معاملات", intro: "مقررہ حصوں کے بعد زائد بچے اور کوئی عصبہ نہ ہو تو واپس کیا جاتا ہے۔", bullets: ["رد صرف تب جب باقی کے لیے کوئی عصبہ نہ ہو۔", "زائد اصل نسبت سے مقررہ حصے والوں کو واپس ملتا ہے۔", "شوہر/بیوی کو رد کبھی نہیں ملتا۔", "مثال: بیوی 1/8 + ماں 1/6 + دو بیٹیاں 2/3 = 23/24 — آخری 1/24 ماں اور بیٹیوں کو واپس۔"] },
    { title: "حجب", intro: "قریبی رشتہ دار دور کے رشتہ دار کو وراثت سے روکتا ہے۔", bullets: ["باپ زندہ ← دادا کو کچھ نہیں۔", "بیٹا زندہ ← بہن بھائیوں اور پوتیوں کو کچھ نہیں۔", "اولاد یا باپ زندہ ← اخیافی بہن بھائیوں کو کچھ نہیں۔", "ماں زندہ ← دادیوں نانیوں کو کچھ نہیں۔", "محجوب 'بے حصہ' میں وجہ کے ساتھ درج ہوتے ہیں۔"] },
    { title: "کوئز", intro: "", bullets: [] },
  ],
};
