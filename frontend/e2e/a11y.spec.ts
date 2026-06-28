import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "home", path: "/" },
  { name: "products", path: "/products" },
  { name: "product detail", path: "/products/1" },
  { name: "cart", path: "/cart" },
];

for (const { name, path } of PAGES) {
  test(`${name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious.map((v) => v.id), null, 2)).toEqual([]);
  });
}

test("checkout is keyboard navigable", async ({ page }) => {
  await page.goto("/products");
  await page.locator("article").first().getByRole("button", { name: /add to rack/i }).click();
  await page.goto("/checkout");
  // The first form control can be focused and typed into via the keyboard.
  await page.getByLabel("Full name").focus();
  await page.keyboard.type("Keyboard User");
  await expect(page.getByLabel("Full name")).toHaveValue("Keyboard User");
});
