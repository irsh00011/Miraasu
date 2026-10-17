/** Design: Miraasu Scholarly Ledger — compact source-book reference with the supplied cover. */
type BookSourceCardProps = { language?: "ta" | "en" | "ar" | "ur" };

const copy = {
  ta: { title: "பயன்படுத்திய நூல்", detail: "இந்தக் கணக்கு உங்கள் வழங்கிய மீராஸ் நூலை அடிப்படையாகக் கொண்டது.", alt: "வழங்கப்பட்ட மீராஸ் புத்தகத்தின் அட்டை" },
  en: { title: "Source book", detail: "This worksheet is based on the Mīrāth book you supplied.", alt: "Supplied Mīrāth book cover" },
  ar: { title: "الكتاب المصدر", detail: "تعتمد هذه الورقة على كتاب المواريث الذي قدمته.", alt: "غلاف كتاب المواريث المرفق" },
  ur: { title: "ماخذ کتاب", detail: "یہ ورک شیٹ آپ کی فراہم کردہ میراث کتاب پر مبنی ہے۔", alt: "فراہم کردہ میراث کتاب کا سرورق" },
};

export function BookSourceCard({ language = "ta" }: BookSourceCardProps) {
  const text = copy[language];
  return (
    <figure className="pb-card mt-6 flex items-center gap-4 p-4">
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-[#d8e6f7] bg-white shadow-md shadow-blue-100">
        <img src="/book-cover.jpg" alt={text.alt} className="size-full object-cover" loading="lazy" />
      </div>
      <figcaption>
        <p className="text-xs font-extrabold tracking-wide text-[#1559a6]">{text.title}</p>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{text.detail}</p>
      </figcaption>
    </figure>
  );
}
