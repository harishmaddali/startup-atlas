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
  await page.locator('input[aria-label="Search the startup ecosystem"]:visible').fill("AIC T-Hub Healthcare Program");
  await page.locator("button:visible").filter({ hasText: "AIC T-Hub Healthcare Program" }).first().click();

  await expect(page.getByText(/Applications Open/i)).toBeVisible();
  const application = page.getByRole("link", { name: /Apply or join waitlist/i });
  await expect(application).toBeVisible();
  await expect(application).toHaveAttribute("href", /^https:/);
});

test("a founder can switch markets and inspect a source-backed global organization", async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole("button", { name: "Open search and filters" }).click();

  const market = page.locator('select[aria-label="Filter by market"]:visible');
  await market.selectOption("SG");
  await expect(page).toHaveURL(/(?:\?|&)market=SG(?:&|$)/);
  await page.locator('button[aria-label="Zoom map to Singapore"]:visible').first().click();

  await page.locator('input[aria-label="Search the startup ecosystem"]:visible').fill("500 Global");
  await page.getByRole("button", { name: /500 Global Singapore, Singapore Vc Firm/ }).click();

  await expect(page.getByText("Markets served")).toBeVisible();
  await expect(page.getByText("Singapore · Physical", { exact: true })).toBeVisible();
  await expect(page.getByText(/Sources · verified/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Website/ })).toHaveAttribute("href", /500\.co/);
});

test("a founder can find a market-wide program without an invented pin", async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole("button", { name: "Open search and filters" }).click();

  await page.locator('select[aria-label="Filter by market"]:visible').selectOption("NZ");
  await page.locator('input[aria-label="Search the startup ecosystem"]:visible').fill("Aspire NZ Seed Fund");

  await expect(page.locator("h2:visible").filter({ hasText: "Available New Zealand-wide" })).toBeVisible();
  await expect(page.locator("button:visible").filter({ hasText: "Aspire NZ Seed Fund" }).first()).toBeVisible();
});
