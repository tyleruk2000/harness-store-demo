import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuantitySelector } from "@/components/product/QuantitySelector";

describe("QuantitySelector", () => {
  it("disables the minus button at the minimum", () => {
    render(<QuantitySelector value={1} max={5} onChange={() => {}} />);
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
    expect(screen.getByLabelText("Increase quantity")).not.toBeDisabled();
  });

  it("disables the plus button at max stock", () => {
    render(<QuantitySelector value={5} max={5} onChange={() => {}} />);
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  });

  it("emits the next value on increment/decrement", async () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} max={5} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Increase quantity"));
    expect(onChange).toHaveBeenCalledWith(3);
    await userEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
