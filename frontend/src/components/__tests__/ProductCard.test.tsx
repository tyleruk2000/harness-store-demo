import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { ProductCard } from "@/components/product/ProductCard";
import { renderWithProviders } from "@/test/utils";
import { outOfStockProduct, sampleProduct } from "@/test/fixtures";

describe("ProductCard", () => {
  it("renders the product name, price and a link to the detail page", () => {
    renderWithProviders(<ProductCard product={sampleProduct} />);
    expect(screen.getByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText("£89.00")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: sampleProduct.name });
    expect(link).toHaveAttribute("href", `/products/${sampleProduct.id}`);
  });

  it("adds to the cart and confirms", async () => {
    const { user } = renderWithProviders(<ProductCard product={sampleProduct} />);
    await user.click(screen.getByRole("button", { name: /add to rack/i }));
    await waitFor(() => expect(screen.getByText("Added")).toBeInTheDocument());
  });

  it("disables the CTA for an out-of-stock product", () => {
    renderWithProviders(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByRole("button", { name: /sold out/i })).toBeDisabled();
  });
});
