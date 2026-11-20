import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.ROUTERUSH_TEST_URL || "http://localhost:3000/");
  await page
    .getByRole("button", { name: "Find available journeys", exact: true })
    .click();
  await page.waitForURL(/\/search\?/);
  await page.getByRole("heading", { name: /possible ways from/ }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Find journeys", exact: true })
      .count(),
    0,
  );
  assert.equal(
    await page.getByText("Manage schedules", { exact: true }).count(),
    0,
  );
  await page
    .getByRole("button", { name: /View complete journey/ })
    .first()
    .click();
  await page.getByRole("dialog").waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: home → original journey cards → itinerary details, without intermediate planner",
  );
} finally {
  await browser.close();
}
