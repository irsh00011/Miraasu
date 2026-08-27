import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://127.0.0.1:3000/ar", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "اعرف سبب كل نصيب في الميراث." }).waitFor();
  await page.getByRole("button", { name: "جهّز التركة وأضف الورثة" }).click();
  await page.getByLabel("إجمالي قيمة التركة").fill("1000");
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("heading", { name: "من الأقارب الأحياء؟" }).waitFor();
  await page.getByText("الأبناء والوالدان", { exact: true }).first().waitFor();
  await page.getByLabel("البحث عن قرابة").fill("الأم");
  await page.getByRole("button", { name: "الأم زيادة", exact: true }).click();
  await page.getByLabel("أفراد العائلة المختارون").getByText("الأم", { exact: false }).waitFor();
  await page.getByRole("button", { name: "الأم إنقاص", exact: true }).click();
  await page.getByLabel("البحث عن قرابة").fill("");
  await page.getByRole("button", { name: "الأبناء زيادة" }).click();
  await page.getByLabel("أفراد العائلة المختارون").getByText("الأبناء", { exact: false }).waitFor();
  await page.screenshot({ path: "/home/ubuntu/screenshots/arabic-family-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "عرض النتيجة" }).click();
  await page.getByText("نتيجة تلقائية مدعومة بالقواعد.", { exact: false }).waitFor();
  await page.screenshot({ path: "/home/ubuntu/screenshots/arabic-result-mobile.png", fullPage: true });
  console.log("Arabic calculator flow passed on mobile.");
} finally {
  await browser.close();
}
