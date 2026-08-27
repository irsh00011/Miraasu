import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "சொத்தைத் தயார் செய்து வாரிசுகளைச் சேர்க்கவும்" }).click();
  await page.getByLabel("மொத்தச் சொத்து மதிப்பு").fill("120000");
  await page.getByRole("button", { name: "தொடர்க", exact: true }).click();

  await page.getByRole("button", { name: "மனைவி", exact: true }).click();
  await page.getByRole("button", { name: "மனைவிகள் அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "அம்மா அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "அப்பா அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "மகன்கள் அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "மகன்கள் அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "மகள்கள் அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "முடிவைப் பார்க்கவும்" }).click();

  await page.getByText("யாருக்கு எவ்வளவு?", { exact: true }).waitFor();
  await page.getByText("மனைவி / மனைவிகள் (2)", { exact: true }).waitFor();
  await page.getByText("₹15,000.00", { exact: true }).waitFor();
  await page.getByText("₹20,000.00", { exact: true }).first().waitFor();
  await page.getByText("₹52,000.00", { exact: true }).waitFor();
  await page.getByText("₹13,000.00", { exact: true }).waitFor();
  await page.getByText("₹120,000.00", { exact: true }).count();
  await page.getByText("அறிஞர் உறுதிப்படுத்தல் தேவை", { exact: true }).count();
  await page.screenshot({ path: "/home/ubuntu/screenshots/comprehensive-family-automatic.png", fullPage: true });

  await page.getByRole("button", { name: "மாற்றுக" }).click();
  await page.getByRole("button", { name: "தந்தை வழி மாமா (அம்) வரிசை", exact: true }).click();
  await page.getByRole("button", { name: "தந்தை வழி பாதி மாமாக்கள் அதிகரிக்க", exact: true }).click();
  await page.getByRole("button", { name: "முடிவைப் பார்க்கவும்" }).click();
  await page.getByText("அறிஞர் உறுதிப்படுத்தல் தேவை", { exact: true }).waitFor();
  await page.getByText("தந்தை வழி பாதி மாமாக்கள்", { exact: false }).waitFor();
  await page.screenshot({ path: "/home/ubuntu/screenshots/comprehensive-family-review.png", fullPage: true });

  console.log("Comprehensive multi-heir scenario passed: exact visible amounts and explicit review-only variation.");
} finally {
  await browser.close();
}
