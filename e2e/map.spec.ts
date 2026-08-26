import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("startup-atlas:initial-map-view", "1");
  });
  await page.goto("/");
});

test("a founder can find an investor, inspect fit, and review evidence", async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole("button", { name: "Open search and filters" }).click();
  await page.locator('input[aria-label="Search the startup ecosystem"]:visible').fill("3one4 Capital");
  await page.locator("button:visible").filter({ hasText: "3one4 Capital" }).first().click();

  await expect(page.getByRole("button", { name: "Close profile" })).toBeFocused();
  await expect(page.getByText("Investment thesis")).toBeVisible();
  await expect(page.getByText("Stages", { exact: true })).toBeVisible();
  await expect(page.getByText(/Sources · verified/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Website/ })).toHaveAttribute("href", /3one4capital/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a founder can open a live program and reach its application path", async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole("button", { name: "Open search and filters" }).click();
  await page
    .locator('input[aria-label="Search the startup ecosystem"]:visible')
    .fill("R.K. Lagu Fellowship for Technology Immersion");
  await page
    .locator("button:visible")
    .filter({ hasText: "R.K. Lagu Fellowship for Technology Immersion" })
    .first()
    .click();

  await expect(page.getByText(/Applications Open/i)).toBeVisible();
  const application = page.getByRole("link", { name: /Apply or join waitlist/i });
  await expect(application).toBeVisible();
  await expect(application).toHaveAttribute("href", /^https:/);
});

test("the map offers only India data while the rollout is market-scoped", async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole("button", { name: "Open search and filters" }).click();

  const market = page.locator('select[aria-label="Filter by market"]:visible');
  await expect(market.locator("option")).toHaveText(["All markets", "India"]);
  await expect(market.locator('option[value="SG"]')).toHaveCount(0);
  await expect(market.locator('option[value="NZ"]')).toHaveCount(0);
});
