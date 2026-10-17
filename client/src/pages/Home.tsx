/** Tamil calculator — thin wrapper over the shared premium Calculator. */
import { Calculator } from "@/premium/Calculator";
import { calcCopies } from "@/premium/copies";

export default function Home() {
  return <Calculator copy={calcCopies.ta} />;
}
