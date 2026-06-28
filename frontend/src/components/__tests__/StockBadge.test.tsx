import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StockBadge } from "@/components/product/StockBadge";

describe("StockBadge", () => {
  it("shows out of stock with text (not colour alone)", () => {
    render(<StockBadge stock={0} />);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("shows a low-stock warning with the count", () => {
    render(<StockBadge stock={3} />);
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("shows in stock when plentiful", () => {
    render(<StockBadge stock={40} />);
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });
});
