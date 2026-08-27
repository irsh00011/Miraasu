import { chromium } from "playwright";

const url = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(url, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "சொத்தைத் தயார் செய்து வாரிசுகளைச் சேர்க்கவும்" }).click();
  await desktop.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await desktop.getByRole("heading", { name: "குடும்பத்தில் யார் உள்ளனர்?" }).waitFor();
  await desktop.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்").waitFor();
  await desktop.getByText("முதன்மை குடும்பம்", { exact: true }).first().waitFor();
  await desktop.getByText("மற்ற குடும்பம்", { exact: true }).first().waitFor();
  await desktop.getByRole("button", { name: "மகன் வழி சந்ததியினர்", exact: true }).waitFor();
  await desktop.getByRole("button", { name: "தூரத்து உறவினர்கள்", exact: true }).waitFor();
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("அப்பா");
  await desktop.getByRole("button", { name: "அப்பா அதிகரிக்க", exact: true }).click();
  await desktop.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்").getByText("அப்பா", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "அப்பா குறைக்க", exact: true }).click();
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("");
  await desktop.getByRole("button", { name: "மகன் வழி சந்ததியினர்" }).last().click();
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("மகனின் மகன்கள்");
  await desktop.getByRole("button", { name: "மகனின் மகன்கள் அதிகரிக்க" }).click();
  await desktop.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்").getByText("மகனின் மகன்கள்", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "மகன் வழி சந்ததியினர் உறவுகளை அழிக்க" }).click();
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("");
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/family-selector-desktop.png", fullPage: true });
  await desktop.getByRole("button", { name: "மகனின் மகன்கள் அதிகரிக்க" }).click();
  await desktop.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்").getByText("மகனின் மகன்கள்", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "தந்தையின் சகோதரர்கள் அதிகரிக்க" }).click();
  await desktop.getByRole("button", { name: "முடிவைப் பார்க்கவும்" }).click();
  await desktop.getByText("அறிஞர் உறுதிப்படுத்தல் தேவை", { exact: true }).waitFor();
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/extended-family-review-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(url, { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "சொத்தைத் தயார் செய்து வாரிசுகளைச் சேர்க்கவும்" }).click();
  await mobile.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await mobile.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்").waitFor();
  await mobile.getByText("மற்ற குடும்பம்", { exact: true }).first().waitFor();
  await mobile.getByRole("button", { name: "தூரத்து உறவினர்கள்", exact: true }).waitFor();
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/family-selector-mobile.png", fullPage: true });
  await mobile.getByRole("button", { name: "வெளியேறு" }).click();
  await mobile.getByRole("heading", { name: "சொத்துப் பங்கீட்டின் காரணத்தைத் தெளிவாகப் பாருங்கள்" }).waitFor();

  console.log("Family selector flow passed on desktop and mobile.");
} finally {
  await browser.close();
}
