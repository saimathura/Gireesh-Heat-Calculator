import { describe, expect, it } from "vitest";
import { calculateNozzleSize } from "@/lib/calculations/nozzleSizing";

describe("calculateNozzleSize", () => {
  it("reproduces the reference case tube-side nozzle size (135.408299mm)", () => {
    expect(calculateNozzleSize(5.538269, 1000, 0.384118)).toBeCloseTo(
      135.408,
      1,
    );
  });

  it("reproduces the reference case shell-side nozzle size (120.53333mm)", () => {
    expect(calculateNozzleSize(6.944444, 1000, 0.607861)).toBeCloseTo(
      120.533,
      1,
    );
  });
});
