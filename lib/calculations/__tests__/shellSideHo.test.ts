import { describe, expect, it } from "vitest";
import {
  calculateHo,
  calculateShellPrandtl,
  calculateShellReynolds,
} from "@/lib/calculations/shellSideHo";

describe("calculateShellReynolds / calculateShellPrandtl", () => {
  it("reproduces the reference case shell-side Re (9471.475269) and Pr (4.830619)", () => {
    const re = calculateShellReynolds(607.860758, 0.01121879, 0.72);
    const pr = calculateShellPrandtl(4.165, 0.72, 0.62079);
    expect(re).toBeCloseTo(9471.475269, 2);
    expect(pr).toBeCloseTo(4.830619, 5);
  });
});

describe("calculateHo", () => {
  it("computes ho within the spec's stated <3% tolerance of the reference case (5050.008498 W/m2.C)", () => {
    // Kern/McAdams analytical correlation vs. the sheet's hand-read Jh=0.0057
    // chart value -> ho~5050.01. The spec validates this formula gives
    // ~2.6% variance at this Re, not an exact match.
    const ho = calculateHo(607.860758, 11.21879, 0.72, 4.165, 0.62079, 1);
    const sheetHo = 5050.008498;
    expect(ho).toBeCloseTo(5180.02, 1);
    const percentDiff = Math.abs(ho - sheetHo) / sheetHo;
    expect(percentDiff).toBeLessThan(0.03);
  });
});
