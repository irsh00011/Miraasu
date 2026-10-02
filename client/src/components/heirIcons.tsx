/**
 * Design: heir glyphs as Lucide icons — no emojis. Keeps the scholarly blue/white
 * system consistent across Tamil, English and Arabic.
 * NOTE: emoji strings from @/lib/inheritance are only used as lookup keys here;
 * the protected calculation file itself is never modified.
 */
import { Baby, Heart, Sprout, TreePine, User, Users, type LucideIcon } from "lucide-react";

const BY_EMOJI: Record<string, LucideIcon> = {
  "👨": User,
  "👩": User,
  "🧑": User,
  "👴": User,
  "👵": User,
  "👨‍🦱": User,
  "👩‍🦰": User,
  "👨‍🦳": User,
  "💑": Heart,
  "👦": Baby,
  "👧": Baby,
  "🧒": Baby,
  "👥": Users,
  "🌿": Sprout,
  "🌳": TreePine,
};

/** Resolve a Lucide icon for an heir by its data key (preferred). */
export function heirIconForKey(key: string): LucideIcon {
  switch (key) {
    case "wives":
    case "mothersSiblings":
      return Users;
    case "husband":
    case "father":
    case "mother":
    case "paternalGrandfather":
    case "maternalGrandfather":
    case "paternalGrandmothers":
    case "maternalGrandmothers":
    case "fullBrothers":
    case "fullSisters":
    case "maternalBrothers":
    case "maternalSisters":
    case "paternalBrothers":
    case "paternalSisters":
    case "paternalUncles":
    case "consanguinePaternalUncles":
    case "fathersMaternalBrothers":
      return User;
    case "sons":
    case "daughters":
    case "sonsSons":
    case "sonsDaughters":
    case "fullBrothersSons":
    case "paternalBrothersSons":
    case "paternalUnclesSons":
    case "consanguinePaternalUnclesSons":
    case "daughtersChildren":
    case "sonsDaughtersChildren":
    case "fullBrothersDaughters":
    case "fullSistersChildren":
    case "maternalBrothersChildren":
      return Baby;
    case "furtherSonsLineDescendants":
    case "fathersMaternalBrothersDescendants":
    case "mothersSiblingsDescendants":
      return Sprout;
    case "furtherPaternalAncestors":
      return TreePine;
    default:
      return User;
  }
}

/** Fallback: resolve a Lucide icon from a legacy emoji string (extended heirs). */
export function heirIconForEmoji(emoji: string | undefined): LucideIcon {
  if (!emoji) return User;
  return BY_EMOJI[emoji] ?? User;
}
