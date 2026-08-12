import { describe, expect, it } from "vitest";
import { calculateOverallU } from "@/lib/calculations/overallU";

describe("calculateOverallU", () => {
  it("reproduces the sheet's overall U (689.729133 W/m2.C) when fed the sheet's own hi Method A value", () => {
    // Pure formula-correctness anchor: feeding the sheet's own hi (Method A,
    // 2351.79395 - the value the sheet actually carried into its U calc)
    // and all its other resistance inputs reproduces the sheet's U exactly.
    // Our app's real pipeline defaults to the conservative (lower) hi
    // instead, per the approved design decision, so production U values
    // will generally differ from this anchor - see iterate.test.ts.
    const u = calculateOverallU({
      doMm: 15.8,
      diMm: 13.972,
      hi: 2351.79395,
      hid: 3000,
      hod: 3000,
      ho: 5050.008498,
      kw: 16,
    });
    expect(u).toBeCloseTo(689.729133, 2);
  });

  it("is monotonically decreasing as any individual resistance term increases (lower hi -> lower U)", () => {
    const base = {
      doMm: 20,
      diMm: 17,
      hi: 2000,
      hid: 3000,
      hod: 3000,
      ho: 4000,
      kw: 16,
    };
    const uBase = calculateOverallU(base);
    const uLowerHi = calculateOverallU({ ...base, hi: 1000 });
    const uLowerHo = calculateOverallU({ ...base, ho: 2000 });
    const uLowerHod = calculateOverallU({ ...base, hod: 1500 });
    expect(uLowerHi).toBeLessThan(uBase);
    expect(uLowerHo).toBeLessThan(uBase);
    expect(uLowerHod).toBeLessThan(uBase);
  });

  it("matches a hand-computed simple case (do=di, no wall/fouling resistance)", () => {
    // do=di collapses the wall-conduction log term to ln(1)=0, and infinite
    // fouling coefficients collapse those terms to 0, leaving 1/U = 1/hi + 1/ho.
    const u = calculateOverallU({
      doMm: 20,
      diMm: 20,
      hi: 1000,
      hid: Infinity,
      hod: Infinity,
      ho: 1000,
      kw: 16,
    });
    // 1/U = 1/1000 + 1/1000 = 0.002 -> U = 500
    expect(u).toBeCloseTo(500, 6);
  });
});
