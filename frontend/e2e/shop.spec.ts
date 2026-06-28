import { test, expect } from "@playwright/test";

// Full demo happy path: browse → product → cart → checkout → success → orders.
test("the full shopping journey works end to end", async ({ page }) => {
  // 1. Homepage hero + featured + demo badge.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /gear up for your next send/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /crew picks/i })).toBeVisible();
  await expect(page.getByText(/Docker-powered, Kubernetes-ready/i).first()).toBeVisible();

  // 2. Browse harnesses.
  await page.goto("/products?category=harnesses");
  await expect(page.getByRole("heading", { name: "Harnesses", level: 1 })).toBeVisible();
  const firstCard = page.locator("article").first();
  await expect(firstCard).toBeVisible();

  // 3. Open a product detail page (click the title link, which covers the card).
  await firstCard.getByRole("heading").getByRole("link").click();
  await expect(page.getByText("Technical details")).toBeVisible();

  // 4. Add to basket from the detail page (first = the main add bar; related
  // products below also have add buttons).
  await page.getByRole("button", { name: /add to rack/i }).first().click();
  await expect(page.getByText(/added to rack|added/i).first()).toBeVisible();

  // 5. Add a helmet from another category too.
  await page.goto("/products?category=helmets");
  await page.locator("article").first().getByRole("button", { name: /add to rack/i }).click();

  // 6. Go to the basket — two line items.
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /your basket/i })).toBeVisible();
  const lineItems = page.locator("div").filter({ has: page.getByLabel("Increase quantity") });
  await expect(lineItems.first()).toBeVisible();

  // 7. Checkout.
  await page.getByRole("link", { name: /proceed to checkout/i }).click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

  const email = `e2e-${Date.now()}@example.com`;
  await page.getByLabel("Full name").fill("E2E Climber");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Street address").fill("1 Boulder Lane");
  await page.getByLabel("City").fill("Sheffield");
  await page.getByLabel("Postcode").fill("S1 2AB");
  // Country has a default value already.
  await page.getByRole("button", { name: /send order/i }).click();

  // 8. Success page with a confirmation number.
  await expect(page.getByRole("heading", { name: /all racked up/i })).toBeVisible();
  await expect(page.getByText(/CRX-\d{8}-[0-9A-F]{8}/)).toBeVisible();

  // Cart cleared after checkout.
  await page.goto("/cart");
  await expect(page.getByText(/your rack's empty/i)).toBeVisible();

  // 9. Order history by email shows the new order.
  await page.goto(`/orders?email=${encodeURIComponent(email)}`);
  await expect(page.getByText(/CRX-\d{8}-[0-9A-F]{8}/).first()).toBeVisible();
});

test("checkout validates before submitting", async ({ page }) => {
  // Put something in the basket first.
  await page.goto("/products");
  await page.locator("article").first().getByRole("button", { name: /add to rack/i }).click();
  await page.goto("/checkout");
  await page.getByRole("button", { name: /send order/i }).click();
  // Stays on checkout and shows a validation error.
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByText(/valid email|name/i).first()).toBeVisible();
});
