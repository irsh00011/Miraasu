/** Calculation overlay: 2-second "computing shares" animation before the result appears. */
import { Calculator } from "lucide-react";

const copy: Record<string, string> = {
  ta: "பங்குகளை கணக்கிடுகிறது…",
  en: "Calculating shares…",
  ar: "جارٍ حساب الحصص…",
  ur: "حصے شمار کیے جا رہے ہیں…",
};

export function CalculatingOverlay({ language = "ta" }: { language?: string }) {
  return (
    <div className="ms-calc-overlay" role="status" aria-live="polite">
      <div className="ms-calc-box">
        <span className="ms-calc-icon"><Calculator size={32} /></span>
        <div className="ms-calc-bar"><span className="ms-calc-fill" /></div>
        <p className="ms-calc-text">{copy[language] ?? copy.ta}</p>
      </div>
    </div>
  );
}
