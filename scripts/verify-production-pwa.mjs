import { chromium } from "playwright";

const productionUrl = "https://miraasu.vercel.app";
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

  await page.getByRole("heading", { name: "சொத்துப் பங்கீட்டின் காரணத்தைத் தெளிவாகப் பாருங்கள்" }).waitFor();
  const englishPage = await browser.newPage();
  await englishPage.goto(`${productionUrl}/en`, { waitUntil: "networkidle" });
  await englishPage.getByRole("heading", { name: "See the reason behind every inheritance share." }).waitFor();
  await englishPage.close();

  console.log("Production PWA verified: stable HTTPS routes, Tamil and English pages, manifest, installation icon, and active service worker are present.");
} finally {
  await browser.close();
}
