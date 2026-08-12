import { describe, expect, it } from "vitest";
import { calculateHiMethodB } from "@/lib/calculations/hiMethodB";

describe("calculateHiMethodB", () => {
  it("reproduces the spec's own validation figure (Jh~0.00385, hi~2155 W/m2.C) at the reference case Re/Pr", () => {
    // Re=7454.018882, Pr=4.845697, kf=0.62079, di=13.972mm (reference case).
    // The spec explicitly validates this analytical Dittus-Boelter formula
    // against the sheet's Re=7454 anchor and reports Jh~0.00385 (not the
    // sheet's own hand-read chart value of 0.0033) — a ~17% variance,
    // called out in the spec as expected tolerance between an analytical
    // fit and a coarse hand-read chart, not a bug to fix. This is why the
    // reference hi (1839.747055, computed with the sheet's fixed Jh=0.0033)
    // is intentionally NOT what this function reproduces.
    const hi = calculateHiMethodB(7454.018882, 4.845697, 0.62079, 13.972);
    expect(hi).toBeCloseTo(2155.23, 1);

    const sheetHi = 1839.747055;
    const percentDiff = (hi - sheetHi) / sheetHi;
    expect(percentDiff).toBeGreaterThan(0.1);
    expect(percentDiff).toBeLessThan(0.25);
  });
});
