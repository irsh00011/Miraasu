/**
 * Special Methods v2 — registry of the 12 per-topic calculators.
 * The page imports this record and renders the component for each topic id.
 * Every component takes { topic, lang } (TopicCalcProps).
 */
import type { ComponentType } from "react";
import type { TopicCalcProps } from "./types";
import DhawulArhamCalc from "./DhawulArhamCalc";
import GrandfatherCalc from "./GrandfatherCalc";
import DebtorCalc from "./DebtorCalc";
import DisqualifiedCalc from "./DisqualifiedCalc";
import SahihFasidCalc from "./SahihFasidCalc";
import UnbornCalc from "./UnbornCalc";
import MissingCalc from "./MissingCalc";
import KhunthaCalc from "./KhunthaCalc";
import MunasakhaCalc from "./MunasakhaCalc";
import SimultaneousCalc from "./SimultaneousCalc";
import RenunciationCalc from "./RenunciationCalc";
import ApostateCalc from "./ApostateCalc";

export const SPECIAL_CALCULATORS: Record<string, ComponentType<TopicCalcProps>> = {
  "dhawul-arham": DhawulArhamCalc,
  "grandfather-siblings": GrandfatherCalc,
  debtor: DebtorCalc,
  disqualified: DisqualifiedCalc,
  "sahih-fasid": SahihFasidCalc,
  "unborn-child": UnbornCalc,
  "missing-person": MissingCalc,
  khuntha: KhunthaCalc,
  munasakha: MunasakhaCalc,
  "simultaneous-death": SimultaneousCalc,
  renunciation: RenunciationCalc,
  apostate: ApostateCalc,
};

export type { Lang, TopicCalcProps } from "./types";
export { tx3, fmt } from "./types";
