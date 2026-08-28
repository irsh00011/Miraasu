import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

const assertSingleColumn = async (page, languageLabel) => {
  const cards = page.getByLabel(languageLabel).locator(":scope > *");
  const boxes = await cards.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width) };
  }));
  if (boxes.length !== 4 || new Set(boxes.map((box) => box.x)).size !== 1 || new Set(boxes.map((box) => box.y)).size === 1) {
    throw new Error(`Expected four vertically ordered English family-map cards, received ${JSON.stringify(boxes)}`);
  }
};

const openEnglishFamily = async (page) => {
  await page.getByRole("button", { name: "Prepare the estate and add heirs" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "Which family members are alive?" }).waitFor();
  await page.getByLabel("Selected family members").waitFor();
  await assertSingleColumn(page, "Simple family entry order");
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await openEnglishFamily(desktop);
  await desktop.getByRole("button", { name: "See the residuary-heir order" }).click();
  await desktop.getByText("One son + one daughter", { exact: true }).waitFor();

  await desktop.getByLabel("Search family relationships").fill("Father");
  await desktop.getByRole("button", { name: "Father increase", exact: true }).click();
  const desktopSummary = desktop.getByLabel("Selected family members");
  await desktopSummary.getByText("Father", { exact: false }).waitFor();
  await desktopSummary.getByRole("button", { name: "Remove Father", exact: true }).click();
  await desktopSummary.getByText("No family member has been selected yet.", { exact: true }).waitFor();

  await desktop.getByRole("button", { name: "Father increase", exact: true }).click();
  await desktop.getByRole("button", { name: "Clear all family", exact: true }).click();
  await desktopSummary.getByText("No family member has been selected yet.", { exact: true }).waitFor();

  await desktop.getByRole("button", { name: "Back", exact: true }).click();
  await desktop.getByRole("heading", { name: "What is the total estate?" }).waitFor();
  await desktop.getByRole("button", { name: "Continue", exact: true }).click();
  await desktop.getByRole("button", { name: "Exit", exact: true }).click();
  await desktop.getByRole("heading", { name: "See the reason behind every inheritance share." }).waitFor();

  await openEnglishFamily(desktop);
  await desktop.getByLabel("Search family relationships").fill("not a relationship");
  await desktop.getByRole("status").getByText("No book-family relationship matches this search", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "Clear search", exact: true }).click();
  await desktop.getByRole("button", { name: "Distant relatives", exact: true }).waitFor();
  await desktop.getByRole("button", { name: "Descendants through sons" }).last().click();
  await desktop.getByLabel("Search family relationships").fill("Sons of sons");
  await desktop.getByRole("button", { name: "Sons of sons increase" }).click();
  const secondSummary = desktop.getByLabel("Selected family members");
  await secondSummary.getByText("Sons of sons", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "Clear Descendants through sons", exact: true }).click();
  await secondSummary.getByText("No family member has been selected yet.", { exact: true }).waitFor();
  await desktop.getByLabel("Search family relationships").fill("");
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/english-family-selector-desktop.png", fullPage: true });

  await desktop.getByRole("button", { name: "Sons of sons increase" }).click();
  await secondSummary.getByText("Sons of sons", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "Paternal uncle (ʿamm) line", exact: true }).click();
  await desktop.getByRole("button", { name: "Full paternal uncles (ʿamm) increase", exact: true }).click();
  await desktop.getByRole("button", { name: "See result" }).click();
  await desktop.getByText("Scholar review required", { exact: true }).waitFor();
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/english-review-desktop.png", fullPage: true });

  const soloUncle = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await soloUncle.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await soloUncle.getByRole("button", { name: "Prepare the estate and add heirs" }).click();
  await soloUncle.getByLabel("Total estate value").fill("1000");
  await soloUncle.getByRole("button", { name: "Continue", exact: true }).click();
  await soloUncle.getByRole("button", { name: "Paternal uncle (ʿamm) line", exact: true }).click();
  await soloUncle.getByRole("button", { name: "Full paternal uncles (ʿamm) increase", exact: true }).click();
  await soloUncle.getByRole("button", { name: "See result", exact: true }).click();
  if (await soloUncle.getByText("Scholar review required", { exact: true }).count() !== 0) {
    throw new Error("A solo full paternal uncle should use the tested automatic fallback path.");
  }
  await soloUncle.getByRole("heading", { name: "Who receives what?" }).waitFor();
  await soloUncle.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await openEnglishFamily(mobile);
  await mobile.getByRole("button", { name: "Father increase", exact: true }).click();
  const mobileSummary = mobile.getByLabel("Selected family members");
  await mobileSummary.getByText("Father", { exact: false }).waitFor();
  await mobileSummary.getByRole("button", { name: "Remove Father", exact: true }).click();
  await mobileSummary.getByText("No family member has been selected yet.", { exact: true }).waitFor();
  await mobile.getByRole("button", { name: "Father increase", exact: true }).click();
  await mobile.getByRole("button", { name: "Clear all family", exact: true }).click();
  await mobileSummary.getByText("No family member has been selected yet.", { exact: true }).waitFor();
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/english-family-mobile.png", fullPage: true });
  await mobile.getByRole("button", { name: "Back", exact: true }).click();
  await mobile.getByRole("heading", { name: "What is the total estate?" }).waitFor();
  await mobile.getByRole("button", { name: "Continue", exact: true }).click();
  await mobile.getByRole("button", { name: "Exit", exact: true }).click();
  await mobile.getByRole("heading", { name: "See the reason behind every inheritance share." }).waitFor();

  console.log("English family selector, reset, summary, back, exit, and Asabah review flows passed on desktop and mobile.");
} finally {
  await browser.close();
}
