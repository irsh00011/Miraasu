/** Arabic calculator — thin wrapper over the shared premium Calculator. */
import { Calculator } from "@/premium/Calculator";
import { calcCopies } from "@/premium/copies";

export default function ArabicHome() {
  return <Calculator copy={calcCopies.ar} />;
}
