# Miraasu Primary Reference Specification

This specification is transcribed from the confirmed user-supplied `pasted_content.txt`. It is the primary product source for supported automatic calculations. The app must not silently add rules from outside this specification.

## Heir groups

| Arabic group | Product meaning | Order |
|---|---|---:|
| أصحاب الفروض | Fixed-share heirs | 1 |
| العصبات | Remainder heirs after fixed shares | 2 |
| ذوو الأرحام | Distant relatives considered when the first two groups are absent | 3 |

## Residuary categories

| Category | Meaning |
|---|---|
| العصبة بالنفس | A male residuary who takes the remainder by himself, subject to the stated hierarchy and blocking. |
| العصبة بالغير | A female heir who becomes residuary with a qualifying male counterpart; the source specifies the 2:1 male-to-female rule where applicable. |
| العصبة مع الغير | A full sister or paternal sister who takes the remainder with a qualifying daughter or son’s daughter. |

## Residuary hierarchy

1. Son / son’s son.
2. Father / paternal grandfather.
3. Brother and related brother-line heirs.
4. Paternal uncle / paternal-cousin line.

A later class does not inherit when an applicable earlier class exists. The paternal uncle is not blocked merely because a daughter exists; the source examples must govern that case. Ibn al-ʿamm is later than the paternal-uncle class.

## Exact fixed shares

| Heir or case | Exact share |
|---|---:|
| Husband, without children | 1/2 |
| Husband, with children | 1/4 |
| Wife or wives, without children | 1/4 collectively |
| Wife or wives, with children | 1/8 collectively |
| One daughter, without a son | 1/2 |
| Two or more daughters, without a son | 2/3 collectively |
| One maternal brother or sister | 1/6 |
| Two or more maternal siblings | 1/3 collectively, equal division |
| One full sister | 1/2 |
| Two or more full sisters | 2/3 collectively |
| One paternal sister | 1/2 |
| Two or more paternal sisters | 2/3 collectively |
| Grandmother when eligible | 1/6 |
| Mother with qualifying descendants or multiple siblings | 1/6 |
| Mother otherwise | 1/3 |
| Mother with father and spouse | 1/3 of the remainder after the spouse share |

The source also states father/grandfather 1/6 plus remainder rules, son-and-daughter 2:1 residue, son’s-daughter cases, and full/paternal sister combinations. If a combination is not clearly supported by the source, the app must say: **இந்த ஆவணத்தில் இது தெளிவாக குறிப்பிடப்படவில்லை**.

## Calculation protocol

The app must show: **heirs → eligibility/blocking → fixed shares → LCM → integer shares → remainder → applicable ʿasabah → percentage → final amount → reason**. Fractions remain exact internally. Percentages are display values only and must never drive decisions. The remainder is calculated as `1 − assigned exact shares`, and the final amount is `distributable estate × exact share`.

## Source boundary

After fixed shares and any applicable ʿasabah, if an exact remainder remains and no applicable ʿasabah exists, apply Radd to eligible أصحاب الفروض in proportion to their original fixed fractions. Exclude الزوج and الزوجة from Radd. Radd must never override an applicable ʿasabah. Preserve any scholarly difference explicitly stated by the source. Do not merge differing views into one silent rule. Do not produce a generic review response when this specification directly supports the case. Use qualified-review language only for combinations not clearly covered by the primary source.
