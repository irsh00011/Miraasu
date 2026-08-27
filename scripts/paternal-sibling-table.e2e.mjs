import { chromium } from "playwright";

const cases = [
  {
    route: "/",
    start: "சொத்தைத் தயார் செய்து வாரிசுகளைச் சேர்க்கவும்",
    continue: "தொடர்க",
    category: "தந்தை வழி மற்றும் உடன்பிறந்தோர் சந்ததி",
    brotherIncrease: "தந்தை வழி சகோதரர்கள் அதிகரிக்க",
    sisterIncrease: "தந்தை வழி சகோதரிகள் அதிகரிக்க",
    result: "முடிவைப் பார்க்கவும்",
    brotherResult: "தந்தை வழி சகோதரர்",
    sisterResult: "தந்தை வழி சகோதரி",
  },
  {
    route: "/en",
    start: "Prepare the estate and add heirs",
    continue: "Continue",
    category: "Paternal siblings and sibling descendants",
    brotherIncrease: "Paternal half-brothers increase",
    sisterIncrease: "Paternal half-sisters increase",
    result: "See result",
    brotherResult: "Paternal half-brothers",
    sisterResult: "Paternal half-sisters",
  },
  {
    route: "/ar",
    start: "جهّز التركة وأضف الورثة",
    continue: "التالي",
    category: "الإخوة لأب وذرية الإخوة",
    brotherIncrease: "إخوة لأب زيادة",
    sisterIncrease: "أخوات لأب زيادة",
    result: "عرض النتيجة",
    brotherResult: "الإخوة لأب",
    sisterResult: "الأخوات لأب",
  },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const item of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:3000${item.route}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: item.start }).click();
    await page.getByRole("spinbutton").first().fill("30000");
    await page.getByRole("button", { name: item.continue, exact: true }).click();
    await page.getByRole("button", { name: item.category, exact: true }).click();
    await page.getByRole("button", { name: item.brotherIncrease, exact: true }).click();
    await page.getByRole("button", { name: item.sisterIncrease, exact: true }).click();
    await page.getByRole("button", { name: item.result, exact: true }).click();
    await page.getByText(item.brotherResult, { exact: true }).waitFor();
    await page.getByText(item.sisterResult, { exact: true }).waitFor();
    await page.getByText("2/3", { exact: true }).waitFor();
    await page.getByText("1/3", { exact: true }).waitFor();
    await page.close();
  }
  console.log("Photographed paternal-sibling table path passed in Tamil, English, and Arabic.");
} finally {
  await browser.close();
}
