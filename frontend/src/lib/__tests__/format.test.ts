import { describe, expect, it } from "vitest";

import { formatDate, formatPrice, formatWeight, titleCase } from "@/lib/format";

describe("format helpers", () => {
  it("formats GBP prices", () => {
    expect(formatPrice(89)).toBe("£89.00");
    expect(formatPrice(4.95)).toBe("£4.95");
  });

  it("formats weight in g and kg", () => {
    expect(formatWeight(320)).toBe("320 g");
    expect(formatWeight(4100)).toBe("4.10 kg");
    expect(formatWeight(null)).toBeNull();
  });

  it("title-cases strings", () => {
    expect(titleCase("harnesses")).toBe("Harnesses");
    expect(titleCase("big wall")).toBe("Big wall");
  });

  it("formats ISO dates and passes through invalid input", () => {
    expect(formatDate("2026-01-15T10:00:00Z")).toMatch(/15 Jan 2026/);
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
