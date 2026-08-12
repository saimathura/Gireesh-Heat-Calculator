import { describe, expect, it } from "vitest";
import {
  calculateCorrectedLmtd,
  calculateF,
  calculateLmtd,
  calculateRS,
} from "@/lib/calculations/lmtd";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

const {
  shellInletTempC: shellIn,
  shellOutletTempC: shellOut,
  tubeInletTempC: tubeIn,
  tubeOutletTempC: tubeOut,
} = REFERENCE_EXAMPLE_INPUTS;

describe("calculateLmtd", () => {
  it("reproduces the reference case LMTD (5.484815 degC)", () => {
    expect(calculateLmtd(shellIn, shellOut, tubeIn, tubeOut)).toBeCloseTo(
      5.484815,
      4,
    );
  });

  it("throws on a non-physical temperature crossing rather than returning NaN", () => {
    expect(() => calculateLmtd(30, 25, 40, 45)).toThrow();
  });
});

describe("calculateRS", () => {
  it("reproduces the reference case R=0.8, S=0.5", () => {
    const { r, s } = calculateRS(shellIn, shellOut, tubeIn, tubeOut);
    expect(r).toBeCloseTo(0.8, 6);
    expect(s).toBeCloseTo(0.5, 6);
  });
});

describe("calculateF", () => {
  // NOT a sheet-exact-match fixture: the source Excel sheet shows only a
  // hand-read chart value (F=0.9374) with no formula cells behind it. The
  // literal Bowman/Mueller/Nagle formula from the spec, verified here by
  // independent hand calculation (sqrt(R^2+1)=1.280625, ln((1-S)/(1-RS))=
  // -0.182322, numerator=-0.233485, denominator ratio=3.7858, ln=1.331254,
  // denominator=-0.266251 -> F=0.87703), analytically gives F~0.877 for
  // R=0.8, S=0.5, not 0.9374. This is expected variance between an
  // analytical fit and a coarse hand-read F-chart, the same class of
  // divergence the spec explicitly calls out for the Jh chart correlations.
  it("computes F~0.877 for R=0.8, S=0.5 per the analytical formula (diverges from sheet's chart-read 0.9374)", () => {
    expect(calculateF(0.8, 0.5)).toBeCloseTo(0.877, 2);
  });

  it("handles the R=1 degenerate case without dividing by zero", () => {
    const f = calculateF(1, 0.3);
    expect(Number.isFinite(f)).toBe(true);
    expect(f).toBeGreaterThan(0);
    expect(f).toBeLessThanOrEqual(1);
  });

  it("throws instead of returning NaN for an R/S combination requiring 2+ shell passes (R=1, S=0.8)", () => {
    // shellIn=37, shellOut=33, tubeIn=32, tubeOut=36 -> R=1, S=0.8 passes
    // every schema check (dT1/dT2 both positive, no raw temperature
    // crossing) but is thermodynamically infeasible for a single shell
    // pass: the degenerate-case log() argument goes negative and the
    // un-guarded formula silently returns NaN.
    expect(() => calculateF(1, 0.8)).toThrow(/not achievable/);
  });

  it("throws instead of returning NaN for a general-case R/S combination past the feasible limit", () => {
    expect(() => calculateF(0.5, 0.95)).toThrow(/not achievable/);
  });
});

describe("calculateCorrectedLmtd", () => {
  // Follows from the analytically-derived F above, not the sheet's chart-read value.
  it("computes LMTD_corrected ~4.81 degC using the analytical F (diverges from sheet's 5.141466)", () => {
    const lmtd = calculateLmtd(shellIn, shellOut, tubeIn, tubeOut);
    const f = calculateF(0.8, 0.5);
    expect(calculateCorrectedLmtd(lmtd, f)).toBeCloseTo(4.81, 1);
  });
});
