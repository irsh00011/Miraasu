import { chromium } from "playwright";

const productionUrl = "https://miraasu-irshad-s-projects3.vercel.app";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(productionUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(
    async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration?.active?.scriptURL.endsWith("/sw.js") ?? false;
    },
    { timeout: 15000 },
  );
  const manifest = await page.evaluate(async () => {
    const response = await fetch("/manifest.webmanifest");
    return response.json();
  });

  if (manifest.display !== "standalone" || !manifest.icons?.some((icon) => icon.src === "/book-cover-icon-512.png")) {
    throw new Error("PWA manifest is missing standalone display mode or the required installation icon.");
  }

  console.log("Production PWA verified: HTTPS, manifest, installation icon, and active service worker are present.");
} finally {
  await browser.close();
}
