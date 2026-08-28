# Production validation — 2026-08-28

The published Tamil root `https://islamiccalc-ruvrjtxr.manus.space/` loaded successfully with title `மீராஸ் கணக்கீடு`, the supplied book-cover icon, Tamil welcome content, language links, history control, and the start action.

The published English route `https://islamiccalc-ruvrjtxr.manus.space/en` loaded successfully with title `Mīrāth Calculator | English`, the supplied book-cover icon, English welcome content, Tamil and Arabic language links, History control, and the start action.

Both production pages rendered the white-and-blue worksheet shell and educational-use notice. Arabic production verification remains to be recorded next.

The published Arabic route `https://islamiccalc-ruvrjtxr.manus.space/ar` loaded successfully with the Arabic welcome title `حاسبة المواريث`, RTL layout, Tamil and English language links, سجل history control, supplied book-cover icon, and the Arabic start action. The Arabic educational-use notice and three-step worksheet order were visible.

The production deployment is reachable in all three supported languages. The current production domain is the managed Manus domain above; GitHub main is synchronized separately at `https://github.com/irsh00011/Miraasu`.

Post-checkpoint live PWA verification passed against `https://islamiccalc-ruvrjtxr.manus.space`: `manifest.webmanifest` returned HTTP 200 with `start_url`, root `scope`, `display: standalone`, theme/background colors, and both supplied book-cover icon references at 192×192 and 512×512; `sw.js` returned HTTP 200 and contains install, activate, and fetch handlers.
