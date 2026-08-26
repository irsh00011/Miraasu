import { chromium } from "playwright";

const url = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(url, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "பங்கீட்டைத் தயாரிக்கவும்" }).click();
  await desktop.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await desktop.getByRole("heading", { name: "குடும்பத்தில் யார் உள்ளனர்?" }).waitFor();
  await desktop.getByLabel("யாரைச் சேர்க்க வேண்டும் என்ற உதவி").waitFor();
  await desktop.getByText("முதன்மை குடும்பம்", { exact: true }).first().waitFor();
  await desktop.getByText("மற்ற குடும்பம்", { exact: true }).first().waitFor();
  await desktop.getByText("அப்பாவின் அப்பா", { exact: true }).waitFor();
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/family-selector-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(url, { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "பங்கீட்டைத் தயாரிக்கவும்" }).click();
  await mobile.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await mobile.getByLabel("யாரைச் சேர்க்க வேண்டும் என்ற உதவி").waitFor();
  await mobile.getByText("மற்ற குடும்பம்", { exact: true }).first().waitFor();
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/family-selector-mobile.png", fullPage: true });

  console.log("Family selector flow passed on desktop and mobile.");
} finally {
  await browser.close();
}
