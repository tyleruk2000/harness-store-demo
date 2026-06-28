import { test, expect } from "@playwright/test";

const PASSCODE = process.env.ADMIN_PASSCODE || "belay-on";

test("admin gate rejects a wrong passcode and accepts the right one", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /admin access/i })).toBeVisible();

  await page.getByLabel(/admin passcode/i).fill("wrong-code");
  await page.getByRole("button", { name: /unlock admin/i }).click();
  await expect(page.getByText(/didn't work/i)).toBeVisible();

  await page.getByLabel(/admin passcode/i).fill(PASSCODE);
  await page.getByRole("button", { name: /unlock admin/i }).click();
  await expect(page.getByRole("heading", { name: "Admin", level: 1 })).toBeVisible();
  await expect(page.getByText(/demo admin area/i)).toBeVisible();
});

test("admin can add a product that then appears in the catalogue", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel(/admin passcode/i).fill(PASSCODE);
  await page.getByRole("button", { name: /unlock admin/i }).click();
  await expect(page.getByRole("heading", { name: "Admin", level: 1 })).toBeVisible();

  const name = `E2E Test Carabiner ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Category").selectOption("carabiners");
  await page.getByLabel("Short description").fill("Added by the E2E suite");
  await page.getByLabel("Price (£)").fill("17.50");
  await page.getByLabel("Stock quantity").fill("8");
  await page.getByRole("button", { name: /add product/i }).click();

  await expect(page.getByText(new RegExp(`Added .${name}`))).toBeVisible();

  // It shows up in the storefront catalogue.
  await page.goto(`/products?search=${encodeURIComponent("E2E Test Carabiner")}`);
  await expect(page.getByText(name).first()).toBeVisible();
});
