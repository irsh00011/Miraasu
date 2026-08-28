# Source Rule Matrix — *Islamic Inheritance Law: Modern Calculation*

**Source:** User-supplied `_MeerathtamilBook2024decnew.doc`, converted text. The references below identify the conversion’s line ranges so every automated rule can be traced back to the book before release.

## Distribution order

| Order | Required action | Source lines |
|---|---|---|
| 1 | Deduct funeral and burial costs. | 826–829 |
| 2 | Settle debts. | 828–830 |
| 3 | Apply a valid will/bequest from the remaining estate, limited to one-third. | 830 |
| 4 | Distribute the remaining estate to eligible heirs. | 831 |

## Heir hierarchy

| Category | Book structure | Product handling |
|---|---|---|
| Fixed-share heirs | Father, paternal grandfather, husband, wife, daughter, son’s daughter, full sister, paternal sister, maternal sibling, mother, and eligible grandmothers. | Automate only rules verified below. |
| Residuary heirs | Son-line descendants; father/grandfather line; brothers and their sons; paternal brothers and their sons; paternal uncles and their sons. A nearer group blocks a later group. | Use order-preserving rules; show review whenever a rule is not yet source-verified. |
| Distant relatives | Daughter’s descendants, descendants through son’s daughters, maternal grandfather and non-qualifying ancestors, specified sibling descendants, father’s maternal half-brother line, and mother’s sibling line. A nearer branch blocks later branches. | Collect and identify clearly; require qualified review until all branch calculations are encoded. |

Source lines: 843–918.

## Verified share rules for safe automation

| Heir | Verified condition | Share | Source lines |
|---|---|---:|---|
| Husband | No child or male descendant through a son. | 1/2 | 1047–1054 |
| Husband | Child or male descendant through a son exists. | 1/4 | 1051–1054 |
| Wife/wives | No child or male descendant through a son. | 1/4 collectively | 1069–1076 |
| Wife/wives | Child or male descendant through a son exists. | 1/8 collectively | 1073–1076 |
| Father | Son or male descendant through a son exists. | 1/6 | 957–960 |
| Father | Daughter or female descendant through a son exists. | 1/6 + remainder | 961–968 |
| Father | No descendants. | Remainder | 969–971 |
| Paternal grandfather | Father absent and son-line male descendant exists. | 1/6 | 984–987 |
| Paternal grandfather | Father absent and a daughter/female son-line descendant exists. | 1/6 + remainder | 988–995 |
| Paternal grandfather | Father is alive. | Blocked | 999–1001 |
| Mother | Any child/son-line descendant or two or more siblings of any listed sibling type. | 1/6 | 1276–1283 |
| Mother | No descendant and fewer than two siblings. | 1/3 | 1284–1287 |
| Mother | With father and spouse, after spouse allocation. | 1/3 of remainder | 1288–1292 |
| Daughter | One daughter and no son. | 1/2 | 1091–1094 |
| Daughter | Two or more daughters and no son. | 2/3 collectively | 1095–1098 |
| Son + daughter | Residue. | 2:1 male:female | 1099–1101 |
| Son’s daughter | One. | 1/2 | 1115–1118 |
| Son’s daughter | Two or more. | 2/3 collectively | 1119–1122 |
| Son’s daughter | With one daughter. | 1/6 | 1123–1126 |
| Son’s daughter | With son’s son. | Residue, 2:1 male:female | 1127–1129 |
| Son’s daughter | With two or more daughters or a son. | Blocked | 1130–1137 |
| Maternal sibling(s) | One maternal sibling. | 1/6 | 1017–1020; 1244–1247 |
| Maternal sibling(s) | Two or more, in any mix. | 1/3 collectively, equal division | 1021–1028; 1248–1255 |
| Maternal sibling(s) | Child/son-line descendant, father, or paternal grandfather exists. | Blocked | 1029–1034; 1256–1263 |
| Full sister(s) | One full sister only. | 1/2 | 1150–1153 |
| Full sister(s) | Two or more full sisters only. | 2/3 collectively | 1154–1157 |
| Full brother + sister | Residue. | 2:1 male:female | 1158–1160 |
| Full sister(s) | With daughter or son’s daughter. | Remainder | 1161–1163 |
| Full sister(s) | Son, son-line male descendant, or father exists. | Blocked | 1164–1171 |
| Paternal sister(s) | One only. | 1/2 | 1189–1192 |
| Paternal sister(s) | Two or more only. | 2/3 collectively | 1193–1196 |
| Paternal sister(s) | With one full sister. | 1/6 | 1197–1200 |
| Paternal brother + sister | Residue. | 2:1 male:female when no son-line descendant, father, paternal grandfather, or full sibling is selected. Other combinations remain visibly qualified for review. | 1201–1203; 1207–1230 |
| Paternal sister(s) | Son, son-line male descendant, father, qualifying full sibling, or two+ full sisters. | Blocked | 1207–1226 |
| Grandmother(s) | Mother absent, subject to nearer-parent/grandparent conditions. | 1/6 | 1305–1320 |

## Current engine audit finding

The original calculation engine treated only direct sons and daughters as descendants. That conflicts with the book’s spouse, father, grandfather, mother, maternal-sibling, and full-sister tables, which expressly refer to the son-line descendant conditions. The correction work must first distinguish: **male son-line descendants**, **female son-line descendants**, and **all descendants**, then use those tests in every block/share condition.

## ‘Asaba structure and worked examples

| Structure | Clear user-facing order or rule | Product handling |
|---|---|---|
| ‘Asaba bi-nafsihi — first degree | Son → son’s son → lower male son-line descendants. | Son and son’s son residue rules are automated where their full conditions are verified; lower descendants remain review-only. |
| ‘Asaba bi-nafsihi — second degree | Father → paternal grandfather → higher male paternal ancestors. | Father and paternal-grandfather rules are automated under verified conditions; higher ancestors remain review-only. |
| ‘Asaba bi-nafsihi — third degree | Full brother → paternal half-brother → their sons. | Full-brother residue rules and explicitly modeled solo paternal-brother / brother’s-son paths are automated only when no closer class is selected; mixed or incomplete sibling chains remain review-only. |
| ‘Asaba bi-nafsihi — fourth degree | Full paternal uncle → consanguine paternal uncle → their sons. | The explicitly modeled solo uncle-line paths now follow the source order after earlier classes are absent; mixed uncle classes or incomplete precedence combinations remain review-only. |
| ‘Asaba bi-ghayrihi | Son/daughter, son’s son/son’s daughter, full brother/full sister, paternal brother/paternal sister. The male/female pair uses 2:1. | Source-backed pairings are automatically calculated where their complete conditions are met, including the narrow paternal-brother/paternal-sister case. Other combinations remain visibly qualified for review. |
| ‘Asaba ma‘a ghayrihi | A full or paternal sister may take the remainder with a daughter or son’s daughter after the female descendant’s fixed share. | Source-backed full-sister and paternal-sister paths are automated only when no listed blocker applies. |

The guided examples deliberately distinguish a **fixed collective share** from a **residuary share**. One son plus one daughter splits the available residue 2:1. Three daughters with no son collectively receive the verified fixed 2/3 share, divided equally among the three; other eligible heirs and any applicable redistribution affect the final estate picture. Equal male heirs of the same eligible rank divide the residue equally.

## Product rule

The app must never show a numerical automatic share for a case where the source matrix does not yet define a complete precedence and blocking path. It may collect the relative, show their selection in the structured family list, and label the result **Qualified review required**.
