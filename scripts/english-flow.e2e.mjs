import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: "See the reason behind every inheritance share." }).waitFor();
  await desktop.getByRole("button", { name: "Prepare the estate and add heirs" }).click();
  await desktop.getByRole("button", { name: "Continue" }).click();
  await desktop.getByRole("heading", { name: "Which family members are alive?" }).waitFor();
  await desktop.getByRole("button", { name: "See the residuary-heir order" }).click();
  await desktop.getByText("One son + one daughter", { exact: true }).waitFor();
  await desktop.getByLabel("Search family relationships").fill("Father");
  await desktop.getByRole("button", { name: "Father increase", exact: true }).click();
  await desktop.getByLabel("Selected family members").getByText("Father", { exact: false }).waitFor();
  await desktop.getByRole("button", { name: "Father decrease", exact: true }).click();
  await desktop.getByLabel("Search family relationships").fill("");
  await desktop.getByRole("button", { name: "Descendants through sons" }).last().click();
  await desktop.getByLabel("Search family relationships").fill("Sons of sons");
  await desktop.getByRole("button", { name: "Sons of sons increase" }).click();
  await desktop.getByLabel("Selected family members").getByText("Sons of sons", { exact: false }).waitFor();
  await desktop.getByLabel("Search family relationships").fill("");
  await desktop.getByRole("button", { name: "Full paternal uncles increase", exact: true }).click();
  await desktop.getByRole("button", { name: "See result" }).click();
  await desktop.getByText("Scholar review required", { exact: true }).waitFor();
  await desktop.screenshot({ path: "/home/ubuntu/screenshots/english-review-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://127.0.0.1:3000/en", { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "Prepare the estate and add heirs" }).click();
  await mobile.getByRole("button", { name: "Continue" }).click();
  await mobile.getByRole("heading", { name: "Which family members are alive?" }).waitFor();
  await mobile.getByLabel("Selected family members").waitFor();
  await mobile.screenshot({ path: "/home/ubuntu/screenshots/english-family-mobile.png", fullPage: true });

  console.log("English calculator flow passed on desktop and mobile.");
} finally {
  await browser.close();
}
