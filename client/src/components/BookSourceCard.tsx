/** Design: Miraasu Scholarly Ledger — compact source-book reference with the supplied cover. */
type BookSourceCardProps = { language?: "ta" | "en" | "ar" };

const copy = {
  ta: { title: "பயன்படுத்திய நூல்", detail: "இந்தக் கணக்கு உங்கள் வழங்கிய மீராஸ் நூலை அடிப்படையாகக் கொண்டது.", alt: "வழங்கப்பட்ட மீராஸ் புத்தகத்தின் அட்டை" },
  en: { title: "Source book", detail: "This worksheet is based on the Mīrāth book you supplied.", alt: "Supplied Mīrāth book cover" },
  ar: { title: "الكتاب المصدر", detail: "تعتمد هذه الورقة على كتاب المواريث الذي قدمته.", alt: "غلاف كتاب المواريث المرفق" },
};

export function BookSourceCard({ language = "ta" }: BookSourceCardProps) {
  const text = copy[language];
  return (
    <figure className="mt-6 flex items-center gap-4 border-t border-[rgba(22,79,134,0.14)] pt-5">
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-[rgba(22,79,134,0.2)] bg-white shadow-md shadow-blue-100">
        <img src="/book-cover-icon-512.png" alt={text.alt} className="size-full object-cover object-right" loading="lazy" />
      </div>
      <figcaption>
        <p className="text-xs font-extrabold tracking-wide text-[#164f86]">{text.title}</p>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{text.detail}</p>
      </figcaption>
    </figure>
  );
}
