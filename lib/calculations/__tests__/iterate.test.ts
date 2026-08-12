import { describe, expect, it } from "vitest";
import { runConvergenceLoop, selectHi } from "@/lib/calculations/iterate";
import { calculateHeatDuty } from "@/lib/calculations/energyBalance";
import {
  calculateCorrectedLmtd,
  calculateF,
  calculateLmtd,
  calculateRS,
} from "@/lib/calculations/lmtd";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

function referenceHeatDutyAndLmtd() {
  const q = calculateHeatDuty(
    REFERENCE_EXAMPLE_INPUTS.shellFlowRateKgHr,
    REFERENCE_EXAMPLE_INPUTS.shellCpKjKgK,
    REFERENCE_EXAMPLE_INPUTS.shellInletTempC -
      REFERENCE_EXAMPLE_INPUTS.shellOutletTempC,
  );
  const lmtd = calculateLmtd(
    REFERENCE_EXAMPLE_INPUTS.shellInletTempC,
    REFERENCE_EXAMPLE_INPUTS.shellOutletTempC,
    REFERENCE_EXAMPLE_INPUTS.tubeInletTempC,
    REFERENCE_EXAMPLE_INPUTS.tubeOutletTempC,
  );
  const { r, s } = calculateRS(
    REFERENCE_EXAMPLE_INPUTS.shellInletTempC,
    REFERENCE_EXAMPLE_INPUTS.shellOutletTempC,
    REFERENCE_EXAMPLE_INPUTS.tubeInletTempC,
    REFERENCE_EXAMPLE_INPUTS.tubeOutletTempC,
  );
  const f = calculateF(r, s);
  const lmtdCorrected = calculateCorrectedLmtd(lmtd, f);
  return { heatDutyW: q * 1000, lmtdCorrected };
}

describe("selectHi", () => {
  it("picks the lower value in conservative mode", () => {
    expect(selectHi(100, 200, "conservative")).toEqual({ value: 100, source: "A" });
    expect(selectHi(200, 100, "conservative")).toEqual({ value: 100, source: "B" });
  });

  it("pins to Method A or Method B when explicitly selected, regardless of magnitude", () => {
    expect(selectHi(100, 200, "methodA")).toEqual({ value: 100, source: "A" });
    expect(selectHi(200, 100, "methodB")).toEqual({ value: 100, source: "B" });
    expect(selectHi(100, 200, "methodB")).toEqual({ value: 200, source: "B" });
  });
});

describe("runConvergenceLoop", () => {
  it("converges within maxIterations for the reference case, with percentDelta under tolerance", () => {
    const { heatDutyW, lmtdCorrected } = referenceHeatDutyAndLmtd();
    const result = runConvergenceLoop(
      REFERENCE_EXAMPLE_INPUTS,
      heatDutyW,
      lmtdCorrected,
      "conservative",
    );
    expect(result.converged).toBe(true);
    expect(result.iterations.length).toBeLessThanOrEqual(25);
    expect(Math.abs(result.finalStep.percentDelta)).toBeLessThan(0.02);
  });

  it("reaches the same converged U regardless of a deliberately bad starting guess (fixed-point independence)", () => {
    const { heatDutyW, lmtdCorrected } = referenceHeatDutyAndLmtd();
    const fromGoodGuess = runConvergenceLoop(
      { ...REFERENCE_EXAMPLE_INPUTS, initialUGuessWM2C: 1200 },
      heatDutyW,
      lmtdCorrected,
      "conservative",
    );
    const fromBadGuess = runConvergenceLoop(
      { ...REFERENCE_EXAMPLE_INPUTS, initialUGuessWM2C: 50 },
      heatDutyW,
      lmtdCorrected,
      "conservative",
    );
    expect(fromGoodGuess.converged).toBe(true);
    expect(fromBadGuess.converged).toBe(true);
    // Each run only has to land within its own 2% convergence band, and
    // discrete tube-count rounding introduces step discontinuities, so
    // check relative agreement rather than a tight absolute match.
    const relativeDiff =
      Math.abs(
        fromBadGuess.finalStep.uCalculatedWM2C -
          fromGoodGuess.finalStep.uCalculatedWM2C,
      ) / fromGoodGuess.finalStep.uCalculatedWM2C;
    expect(relativeDiff).toBeLessThan(0.05);
  });

  it("flags non-convergence when maxIterations is too small, without throwing", () => {
    const { heatDutyW, lmtdCorrected } = referenceHeatDutyAndLmtd();
    const result = runConvergenceLoop(
      { ...REFERENCE_EXAMPLE_INPUTS, maxIterations: 1 },
      heatDutyW,
      lmtdCorrected,
      "conservative",
    );
    expect(result.converged).toBe(false);
    expect(result.iterations.length).toBe(1);
  });

  it("keeps every iteration's calculated values positive and finite (no NaN/negative propagation)", () => {
    const { heatDutyW, lmtdCorrected } = referenceHeatDutyAndLmtd();
    const result = runConvergenceLoop(
      REFERENCE_EXAMPLE_INPUTS,
      heatDutyW,
      lmtdCorrected,
      "conservative",
    );
    for (const step of result.iterations) {
      expect(Number.isFinite(step.uCalculatedWM2C)).toBe(true);
      expect(step.uCalculatedWM2C).toBeGreaterThan(0);
      expect(step.areaM2).toBeGreaterThan(0);
      expect(step.tubeCount).toBeGreaterThan(0);
    }
  });

  it("re-evaluates the conservative hi selection independently every iteration", () => {
    const { heatDutyW, lmtdCorrected } = referenceHeatDutyAndLmtd();
    const result = runConvergenceLoop(
      REFERENCE_EXAMPLE_INPUTS,
      heatDutyW,
      lmtdCorrected,
      "conservative",
    );
    for (const step of result.iterations) {
      expect(step.hiSelectedWM2C).toBe(
        Math.min(step.hiMethodAWM2C, step.hiMethodBWM2C),
      );
    }
  });
});
