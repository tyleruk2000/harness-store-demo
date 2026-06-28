import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CartSummary, computeTotals } from "@/components/cart/CartSummary";

describe("computeTotals", () => {
  it("charges flat shipping below the free threshold", () => {
    expect(computeTotals(20)).toEqual({ subtotal: 20, shipping: 4.95, total: 24.95 });
  });

  it("gives free shipping at/above the threshold", () => {
    expect(computeTotals(75)).toEqual({ subtotal: 75, shipping: 0, total: 75 });
    expect(computeTotals(200)).toEqual({ subtotal: 200, shipping: 0, total: 200 });
  });

  it("has no shipping for an empty basket", () => {
    expect(computeTotals(0)).toEqual({ subtotal: 0, shipping: 0, total: 0 });
  });
});

describe("CartSummary", () => {
  it("renders Free when shipping is waived", () => {
    render(<CartSummary subtotal={120} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    // subtotal and total are both £120.00 when shipping is free
    expect(screen.getAllByText("£120.00")).toHaveLength(2);
  });

  it("nudges toward free shipping when below the threshold", () => {
    render(<CartSummary subtotal={50} />);
    expect(screen.getByText(/away from free shipping/i)).toBeInTheDocument();
  });
});
