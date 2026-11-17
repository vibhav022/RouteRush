import assert from "node:assert/strict";
import { chromium } from "playwright";
// Run against a local development server and a disposable database.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    process.env.ROUTERUSH_TEST_URL || "http://localhost:3000/",
  );
  await page
    .getByRole("button", { name: "Find available journeys", exact: true })
    .click();
  await page.getByRole("heading", { name: /qualifying journeys/ }).waitFor();
  assert.ok((await page.locator("article").count()) > 0);
  assert.equal(await page.getByRole("button", {name:"Find journeys",exact:true}).isVisible(),false);
  await page.getByText("Saved journeys and account",{exact:true}).click();
  await page
    .getByLabel("Email", { exact: true })
    .fill(`browser${Date.now()}@example.com`);
  await page
    .getByLabel("Password (10+ characters)", { exact: true })
    .fill("BrowserTesting123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByRole("button", { name: "Sign out", exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Save journey", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Recheck journey", exact: true })
    .waitFor();
  await page.reload();
  await page.getByText("Saved journeys and account",{exact:true}).click();
  await page
    .getByRole("button", { name: "Recheck journey", exact: true })
    .click();
  await page.locator("article").first().waitFor();
  await page.getByLabel("Compare", { exact: true }).first().check();
  await page
    .getByRole("heading", { name: "Compare journeys", exact: true })
    .waitFor();
  await page.setViewportSize({ width: 320, height: 800 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "Page must fit a 320px viewport",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: search, register, save, reload, recheck, compare and 320px viewport",
  );
} finally {
  await browser.close();
}
