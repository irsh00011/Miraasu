import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

const assertSingleColumn = async (page, languageLabel) => {
  const cards = page.getByLabel(languageLabel).locator(":scope > *");
  const boxes = await cards.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width) };
  }));
  if (boxes.length !== 4 || new Set(boxes.map((box) => box.x)).size !== 1 || new Set(boxes.map((box) => box.y)).size === 1) {
    throw new Error(`Expected four vertically ordered Arabic family-map cards, received ${JSON.stringify(boxes)}`);
  }
};

const openArabicFamily = async (page) => {
  await page.getByRole("button", { name: "جهّز التركة وأضف الورثة" }).click();
  await page.getByLabel("إجمالي قيمة التركة").fill("1000");
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("heading", { name: "من الأقارب الأحياء؟" }).waitFor();
  await page.getByLabel("أفراد العائلة المختارون").waitFor();
  await assertSingleColumn(page, "خريطة العائلة السهلة");
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto("http://127.0.0.1:3000/ar", { waitUntil: "networkidle" });
  await openArabicFamily(desktop);
  await desktop.getByText("الأبناء والوالدان", { exact: true }).first().waitFor();
  await desktop.getByRole("button", { name: "عرض ترتيب العصبة" }).click();
  await desktop.getByText("ابن واحد + بنت واحدة", { exact: true }).waitFor();

  await desktop.getByLabel("البحث عن قرابة").fill("الأم");
  await desktop.getByRole("button", { name: "الأم زيادة", exact: true }).click();
  const desktopSummary = desktop.getByLabel("أفراد العائلة المختارون");
  await desktopSummary.getByText("الأم", { exact: false }).waitFor();
  await desktopSummary.getByRole("button", { name: "حذف الأم", exact: true }).click();
  await desktopSummary.getByText("لم تتم إضافة أي فرد من العائلة بعد.", { exact: true }).waitFor();

  await desktop.getByRole("button", { name: "الأم زيادة", exact: true }).click();
  await desktop.getByRole("button", { name: "مسح العائلة", exact: true }).click();
  await desktopSummary.getByText("لم تتم إضافة أي فرد من العائلة بعد.", { exact: true }).waitFor();

  await desktop.getByRole("button", { name: "السابق", exact: true }).click();
  await desktop.getByRole("heading", { name: "ما قيمة التركة؟" }).waitFor();
  await desktop.getByRole("button", { name: "التالي", exact: true }).click();
  await desktop.getByRole("button", { name: "خروج", exact: true }).click();
  await desktop.getByRole("heading", { name: "اعرف سبب كل نصيب في الميراث." }).waitFor();

  await openArabicFamily(desktop);
  await desktop.getByLabel("البحث عن قرابة").fill("قرابة غير موجودة");
  await desktop.getByRole("status").getByText("لا توجد قرابة من أقارب الكتاب مطابقة للبحث", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "مسح البحث", exact: true }).click();
  await desktop.getByRole("button", { name: "ذوو الأرحام", exact: true }).waitFor();
  await desktop.getByRole("button", { name: "أحفاد عن طريق الابن", exact: true }).click();
  await desktop.getByLabel("البحث عن قرابة").fill("أبناء الابن");
  await desktop.getByRole("button", { name: "أبناء الابن زيادة", exact: true }).click();
  const secondSummary = desktop.getByLabel("أفراد العائلة المختارون");
  await secondSummary.getByText("أبناء الابن", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "مسح أحفاد عن طريق الابن", exact: true }).click();
  await secondSummary.getByText("لم تتم إضافة أي فرد من العائلة بعد.", { exact: true }).waitFor();
  await desktop.getByLabel("البحث عن قرابة").fill("");
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/arabic-family-selector-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://127.0.0.1:3000/ar", { waitUntil: "networkidle" });
  await openArabicFamily(mobile);
  await mobile.getByRole("button", { name: "الأم زيادة", exact: true }).click();
  const mobileSummary = mobile.getByLabel("أفراد العائلة المختارون");
  await mobileSummary.getByText("الأم", { exact: false }).waitFor();
  await mobileSummary.getByRole("button", { name: "حذف الأم", exact: true }).click();
  await mobileSummary.getByText("لم تتم إضافة أي فرد من العائلة بعد.", { exact: true }).waitFor();
  await mobile.getByRole("button", { name: "الأم زيادة", exact: true }).click();
  await mobile.getByRole("button", { name: "مسح العائلة", exact: true }).click();
  await mobileSummary.getByText("لم تتم إضافة أي فرد من العائلة بعد.", { exact: true }).waitFor();
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/arabic-family-mobile.png", fullPage: true });
  await mobile.getByRole("button", { name: "السابق", exact: true }).click();
  await mobile.getByRole("heading", { name: "ما قيمة التركة؟" }).waitFor();
  await mobile.getByRole("button", { name: "التالي", exact: true }).click();
  await mobile.getByRole("button", { name: "خروج", exact: true }).click();
  await mobile.getByRole("heading", { name: "اعرف سبب كل نصيب في الميراث." }).waitFor();

  console.log("Arabic family selector, reset, summary, back, exit, and Asabah guide flows passed on desktop and mobile.");
} finally {
  await browser.close();
}
