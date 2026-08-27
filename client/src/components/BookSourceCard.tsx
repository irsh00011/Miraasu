/** Design: Ledger of Justice — a compact source-book reference that keeps the supplied cover visibly connected to the calculator. */
type BookSourceCardProps = { language?: "ta" | "en" | "ar" };

const copy = {
  ta: { title: "பயன்படுத்திய நூல்", detail: "இந்தக் கணக்கு உங்கள் வழங்கிய மீராஸ் நூலை அடிப்படையாகக் கொண்டது.", alt: "வழங்கப்பட்ட மீராஸ் புத்தகத்தின் அட்டை" },
  en: { title: "Source book", detail: "This worksheet is based on the Mīrāth book you supplied.", alt: "Supplied Mīrāth book cover" },
  ar: { title: "الكتاب المصدر", detail: "تعتمد هذه الورقة على كتاب المواريث الذي قدمته.", alt: "غلاف كتاب المواريث المرفق" },
};

export function BookSourceCard({ language = "ta" }: BookSourceCardProps) {
  const text = copy[language];
  return <figure className="mt-5 flex items-center gap-3 border-t border-blue-100 pt-4"><div className="h-24 w-20 shrink-0 overflow-hidden border border-blue-200 bg-white shadow-sm"><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663614458043/BYjDkbMmTRUAbYjz.png" alt={text.alt} className="size-full object-cover object-right" /></div><figcaption><p className="text-xs font-extrabold text-[#133D76]">{text.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text.detail}</p></figcaption></figure>;
}
