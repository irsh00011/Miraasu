import { chromium } from "playwright";

const url = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });

const assertSingleColumn = async (page, languageLabel) => {
  const cards = page.getByLabel(languageLabel).locator(":scope > *");
  const boxes = await cards.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width) };
  }));
  if (boxes.length !== 4 || new Set(boxes.map((box) => box.x)).size !== 1 || new Set(boxes.map((box) => box.y)).size === 1) {
    throw new Error(`Expected four vertically ordered Tamil family-map cards, received ${JSON.stringify(boxes)}`);
  }
};

const openTamilFamily = async (page) => {
  await page.getByRole("button", { name: "சொத்தைத் தயார் செய்து வாரிசுகளைச் சேர்க்கவும்" }).click();
  await page.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await page.getByRole("heading", { name: "குடும்பத்தில் யார் உள்ளனர்?" }).waitFor();
  await page.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்").waitFor();
  await page.getByLabel("முந்தைய முடிவு ஏன் மாறியிருக்கலாம்?").waitFor();
  await assertSingleColumn(page, "எளிய குடும்ப பதிவு ஒழுங்கு");
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(url, { waitUntil: "networkidle" });
  await openTamilFamily(desktop);
  await desktop.getByText("முதன்மை குடும்பம்", { exact: true }).first().waitFor();
  await desktop.getByText("மற்ற குடும்பம்", { exact: true }).first().waitFor();
  await desktop.getByRole("button", { name: "மகன் வழி சந்ததியினர்", exact: true }).waitFor();
  await desktop.getByRole("button", { name: "தூரத்து உறவினர்கள்", exact: true }).waitFor();
  await desktop.getByRole("button", { name: "மீதிப் பங்கு வரிசையைப் பார்க்கவும்" }).click();
  await desktop.getByText("1 மகன் + 1 மகள்", { exact: true }).waitFor();

  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("அப்பா");
  await desktop.getByRole("button", { name: "அப்பா அதிகரிக்க", exact: true }).click();
  const desktopSummary = desktop.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்");
  await desktopSummary.getByText("அப்பா", { exact: false }).waitFor();
  await desktopSummary.getByRole("button", { name: "அகற்ற அப்பா", exact: true }).click();
  await desktopSummary.getByText("இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.", { exact: true }).waitFor();

  await desktop.getByRole("button", { name: "அப்பா அதிகரிக்க", exact: true }).click();
  await desktop.getByRole("button", { name: "அனைத்து உறவுகளையும் அழி", exact: true }).click();
  await desktopSummary.getByText("இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.", { exact: true }).waitFor();

  await desktop.getByRole("button", { name: "பின்செல்", exact: true }).click();
  await desktop.getByRole("heading", { name: "மொத்தச் சொத்து எவ்வளவு?" }).waitFor();
  await desktop.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await desktop.getByRole("button", { name: "வெளியேறு", exact: true }).click();
  await desktop.getByRole("heading", { name: "சொத்துப் பங்கீட்டின் காரணத்தைத் தெளிவாகப் பாருங்கள்" }).waitFor();

  await openTamilFamily(desktop);
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("இல்லாத உறவு");
  await desktop.getByRole("status").getByText("புத்தக உறவுகளில் இந்தத் தேடலுக்கு பொருத்தம் இல்லை", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "தேடலை அழி", exact: true }).click();
  await desktop.getByRole("button", { name: "தூரத்து உறவினர்கள்", exact: true }).waitFor();
  await desktop.getByRole("button", { name: "மகன் வழி சந்ததியினர்" }).last().click();
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("மகனின் மகன்கள்");
  await desktop.getByRole("button", { name: "மகனின் மகன்கள் அதிகரிக்க" }).click();
  const secondSummary = desktop.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்");
  await secondSummary.getByText("மகனின் மகன்கள்", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "மகன் வழி சந்ததியினர் உறவுகளை அழிக்க" }).click();
  await secondSummary.getByText("இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.", { exact: true }).waitFor();
  await desktop.getByLabel("குடும்ப உறவைத் தேடுக").fill("");
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/family-selector-desktop.png", fullPage: true });

  await desktop.getByRole("button", { name: "மகனின் மகன்கள் அதிகரிக்க" }).click();
  await secondSummary.getByText("மகனின் மகன்கள்", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "தந்தை வழி மாமா (அம்) வரிசை", exact: true }).click();
  await desktop.getByRole("button", { name: "முழு தந்தை வழி மாமாக்கள் (அம்) அதிகரிக்க", exact: true }).click();
  await desktop.getByRole("button", { name: "முடிவைப் பார்க்கவும்" }).click();
  await desktop.getByText("அறிஞர் உறுதிப்படுத்தல் தேவை", { exact: true }).waitFor();
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/extended-family-review-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(url, { waitUntil: "networkidle" });
  await openTamilFamily(mobile);
  await mobile.getByRole("button", { name: "அப்பா அதிகரிக்க", exact: true }).click();
  const mobileSummary = mobile.getByLabel("தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்");
  await mobileSummary.getByText("அப்பா", { exact: false }).waitFor();
  await mobileSummary.getByRole("button", { name: "அகற்ற அப்பா", exact: true }).click();
  await mobileSummary.getByText("இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.", { exact: true }).waitFor();
  await mobile.getByRole("button", { name: "அப்பா அதிகரிக்க", exact: true }).click();
  await mobile.getByRole("button", { name: "அனைத்து உறவுகளையும் அழி", exact: true }).click();
  await mobileSummary.getByText("இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.", { exact: true }).waitFor();
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/family-selector-mobile.png", fullPage: true });
  await mobile.getByRole("button", { name: "பின்செல்", exact: true }).click();
  await mobile.getByRole("heading", { name: "மொத்தச் சொத்து எவ்வளவு?" }).waitFor();
  await mobile.getByRole("button", { name: "தொடர்க", exact: true }).click();
  await mobile.getByRole("button", { name: "வெளியேறு", exact: true }).click();
  await mobile.getByRole("heading", { name: "சொத்துப் பங்கீட்டின் காரணத்தைத் தெளிவாகப் பாருங்கள்" }).waitFor();

  console.log("Tamil family selector, reset, summary, back, exit, and Asabah review flows passed on desktop and mobile.");
} finally {
  await browser.close();
}
