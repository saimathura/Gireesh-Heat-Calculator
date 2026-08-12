import { describe, expect, it } from "vitest";
import {
  calculateShellSideDeltaP,
  calculateTubeSideDeltaP,
} from "@/lib/calculations/pressureDrop";

describe("calculateTubeSideDeltaP", () => {
  it("reproduces the reference case tube-side pressure drop (~926.4 N/m2, 0.009264 bar)", () => {
    const result = calculateTubeSideDeltaP(
      7454.018882,
      2,
      2000,
      13.972,
      1000,
      0.384118,
    );
    expect(result.nM2).toBeCloseTo(926.35, 1);
    expect(result.bar).toBeCloseTo(0.009264, 4);
    expect(result.extrapolated).toBe(false);
  });

  it("flags results outside the calibrated Re~7,000-10,000 range as extrapolated", () => {
    const result = calculateTubeSideDeltaP(500, 2, 2000, 13.972, 1000, 0.1);
    expect(result.extrapolated).toBe(true);
  });
});

describe("calculateShellSideDeltaP", () => {
  it("reproduces the reference case shell-side pressure drop (~25821.3 N/m2, 0.258213 bar)", () => {
    const result = calculateShellSideDeltaP(
      9471.475269,
      338,
      11.21879,
      2000,
      169,
      1000,
      0.607861,
    );
    expect(result.nM2).toBeCloseTo(25821.36, 0);
    expect(result.bar).toBeCloseTo(0.258214, 3);
    expect(result.extrapolated).toBe(false);
  });

  it("flags results outside the calibrated Re~7,000-10,000 range as extrapolated", () => {
    const result = calculateShellSideDeltaP(
      50000,
      338,
      11.21879,
      2000,
      169,
      1000,
      2,
    );
    expect(result.extrapolated).toBe(true);
  });
});
