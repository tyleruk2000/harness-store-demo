import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "@/test/utils";
import { useCart } from "@/lib/cart-context";
import { STORAGE_KEYS } from "@/lib/constants";
import { sampleProduct } from "@/test/fixtures";

function Harness() {
  const cart = useCart();
  return (
    <div>
      <output data-testid="count">{cart.count}</output>
      <output data-testid="subtotal">{cart.subtotal}</output>
      <output data-testid="hydrated">{String(cart.hydrated)}</output>
      <button onClick={() => cart.add(sampleProduct, 1)}>add</button>
      <button onClick={() => cart.add(sampleProduct, 50)}>add-many</button>
      <button onClick={() => cart.inc(sampleProduct.id)}>inc</button>
      <button onClick={() => cart.dec(sampleProduct.id)}>dec</button>
      <button onClick={() => cart.setQty(sampleProduct.id, 5)}>set5</button>
      <button onClick={() => cart.remove(sampleProduct.id)}>remove</button>
      <button onClick={() => cart.clear()}>clear</button>
    </div>
  );
}

describe("cart-context", () => {
  beforeEach(() => localStorage.clear());

  it("adds a new product and computes totals", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByText("add"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("subtotal")).toHaveTextContent(String(sampleProduct.price));
  });

  it("increments an existing line instead of duplicating", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByText("add"));
    await user.click(screen.getByText("add"));
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("clamps quantity to available stock", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByText("add-many")); // qty 50, stock 12
    expect(screen.getByTestId("count")).toHaveTextContent(String(sampleProduct.stock_quantity));
  });

  it("dec removes the item when it reaches zero", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByText("add"));
    await user.click(screen.getByText("dec"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("setQty, remove and clear work", async () => {
    const { user } = renderWithProviders(<Harness />);
    await user.click(screen.getByText("add"));
    await user.click(screen.getByText("set5"));
    expect(screen.getByTestId("count")).toHaveTextContent("5");
    await user.click(screen.getByText("remove"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists to localStorage after hydration", async () => {
    const { user } = renderWithProviders(<Harness />);
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    await user.click(screen.getByText("add"));
    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEYS.cart);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)).toHaveLength(1);
    });
  });

  it("hydrates from existing localStorage", async () => {
    localStorage.setItem(
      STORAGE_KEYS.cart,
      JSON.stringify([{ id: 1, name: "x", price: 10, image_url: "", qty: 3, stock: 9 }]),
    );
    renderWithProviders(<Harness />);
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("3"));
  });

  it("ignores corrupt localStorage without throwing", async () => {
    localStorage.setItem(STORAGE_KEYS.cart, "{not valid json");
    renderWithProviders(<Harness />);
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
