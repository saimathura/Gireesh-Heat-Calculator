import { describe, expect, it } from "vitest";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

describe("runCalculation - reference case (116kW, 2-pass)", () => {
  const result = runCalculation(REFERENCE_EXAMPLE_INPUTS, "conservative");

  // Sheet-exact-match: duty/LMTD-chain values upstream of the two approved
  // design decisions (K1/n1-by-pass-count, conservative hi selection) and
  // the corrected analytical F formula (see lmtd.test.ts) still hold.
  it("reproduces the sheet's heat duty and tube-side flow rate exactly", () => {
    expect(result.heatDutyKw).toBeCloseTo(115.694444, 3);
    expect(result.tubeFlowRateKgS).toBeCloseTo(5.538269, 3);
    expect(result.tubeFlowRateKgHr).toBeCloseTo(19937.769268, 0);
  });

  it("reproduces the sheet's LMTD and R/S exactly, but uses the analytically-correct F (diverges from sheet's hand-read 0.9374)", () => {
    expect(result.lmtd).toBeCloseTo(5.484815, 3);
    expect(result.r).toBeCloseTo(0.8, 6);
    expect(result.s).toBeCloseTo(0.5, 6);
    expect(result.f).toBeCloseTo(0.877, 2);
    expect(result.lmtdCorrected).toBeCloseTo(4.8098, 2);
  });

  // Downstream of the approved design decisions: intentionally diverges
  // from the sheet's own reported geometry/U/pressure-drop numbers. These
  // assertions pin down the app's own (larger, more conservative) design
  // point rather than trying to reproduce the sheet's under-designed one.
  it("converges to a materially different (larger, lower-U) design than the sheet", () => {
    expect(result.converged).toBe(true);
    expect(result.iterationCount).toBeGreaterThan(0);
    expect(result.iterationCount).toBeLessThanOrEqual(25);
    // Sheet: U=689.7, 188 tubes, 350mm shell. Our corrected pipeline
    // converges much lower/larger for this duty - see iterate.test.ts and
    // the build notes for why (corrected LMTD F, per-pass-count K1/n1,
    // conservative hi selection all push area up).
    expect(result.finalUWM2C).toBeLessThan(689.7);
    expect(result.tubeCount).toBeGreaterThan(188);
    expect(result.shellDiameterMm).toBeGreaterThanOrEqual(350);
  });

  it("selects the conservative (lower) hi and records which method won", () => {
    expect(result.hiSelectedWM2C).toBe(
      Math.min(result.hiMethodAWM2C, result.hiMethodBWM2C),
    );
    expect(["A", "B"]).toContain(result.hiSelectedSource);
  });

  it("produces positive, finite pressure drops and nozzle sizes", () => {
    expect(result.pressureDrops.tubeSideBar).toBeGreaterThan(0);
    expect(result.pressureDrops.shellSideBar).toBeGreaterThan(0);
    expect(Number.isFinite(result.pressureDrops.tubeSideBar)).toBe(true);
    expect(Number.isFinite(result.pressureDrops.shellSideBar)).toBe(true);
    expect(result.nozzles.tubeSideMm).toBeGreaterThan(0);
    expect(result.nozzles.shellSideMm).toBeGreaterThan(0);
  });

  it("produces sign-correct verdict messages (never a hardcoded '% higher' when U is actually lower)", () => {
    const uMessage = result.verdicts.messages.find((m) =>
      m.includes("Converged U is"),
    );
    expect(uMessage).toBeDefined();
    expect(uMessage).toMatch(/below your initial assumed U/);
    expect(uMessage).not.toMatch(/higher/);
  });

  it("flags extrapolated pressure-drop correlations when Reynolds numbers fall outside the calibrated range", () => {
    // The reference case's default 1200 W/m2.C initial guess converges to a
    // much larger, lower-velocity design where both Re fall below the
    // ~7,000-10,000 calibrated range - this should be surfaced, not hidden.
    expect(result.verdicts.reynoldsOutOfCalibratedRange).toBe(true);
    expect(
      result.verdicts.messages.some((m) => m.includes("extrapolated")),
    ).toBe(true);
  });
});
