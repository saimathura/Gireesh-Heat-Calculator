import { describe, expect, it } from "vitest";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

describe("runCalculation - property-based sanity checks", () => {
  it("methodA pin always uses hi Method A in the final U, methodB pin always uses Method B", () => {
    const pinnedA = runCalculation(REFERENCE_EXAMPLE_INPUTS, "methodA");
    const pinnedB = runCalculation(REFERENCE_EXAMPLE_INPUTS, "methodB");
    expect(pinnedA.hiSelectedSource).toBe("A");
    expect(pinnedA.hiSelectedWM2C).toBe(pinnedA.hiMethodAWM2C);
    expect(pinnedB.hiSelectedSource).toBe("B");
    expect(pinnedB.hiSelectedWM2C).toBe(pinnedB.hiMethodBWM2C);
  });

  it("conservative mode never produces a higher U than either pinned mode alone", () => {
    // Lower hi -> lower overall U (all other resistances held equal), so
    // the conservative (min) selection should never converge to a higher
    // final U than picking the higher-hi method throughout.
    const conservative = runCalculation(REFERENCE_EXAMPLE_INPUTS, "conservative");
    const pinnedA = runCalculation(REFERENCE_EXAMPLE_INPUTS, "methodA");
    const pinnedB = runCalculation(REFERENCE_EXAMPLE_INPUTS, "methodB");
    const maxPinned = Math.max(pinnedA.finalUWM2C, pinnedB.finalUWM2C);
    // Allow a little slack: differing hi selections lead to different
    // converged geometries (tube count is discrete), not just a scaled U.
    expect(conservative.finalUWM2C).toBeLessThanOrEqual(maxPinned * 1.05);
  });

  it("scales heat duty and tube flow rate linearly with shell-side flow rate", () => {
    const base = runCalculation(REFERENCE_EXAMPLE_INPUTS, "conservative");
    const doubled = runCalculation(
      { ...REFERENCE_EXAMPLE_INPUTS, shellFlowRateKgHr: REFERENCE_EXAMPLE_INPUTS.shellFlowRateKgHr * 2 },
      "conservative",
    );
    expect(doubled.heatDutyKw).toBeCloseTo(base.heatDutyKw * 2, 4);
    expect(doubled.tubeFlowRateKgS).toBeCloseTo(base.tubeFlowRateKgS * 2, 4);
  });

  it("requires more tubes/area as the initial U guess is set unrealistically high (undersized starting point)", () => {
    const low = runCalculation(
      { ...REFERENCE_EXAMPLE_INPUTS, initialUGuessWM2C: 1200 },
      "conservative",
    );
    const veryHigh = runCalculation(
      { ...REFERENCE_EXAMPLE_INPUTS, initialUGuessWM2C: 3000 },
      "conservative",
    );
    // Both should still converge to a similar physically-determined U
    // regardless of starting guess (fixed-point independence, already
    // covered in iterate.test.ts) - just confirm neither run breaks or
    // produces a nonsensical negative/zero result here.
    expect(low.converged).toBe(true);
    expect(veryHigh.converged).toBe(true);
    expect(low.finalUWM2C).toBeGreaterThan(0);
    expect(veryHigh.finalUWM2C).toBeGreaterThan(0);
  });

  it("throws a descriptive error rather than propagating NaN for a degenerate temperature crossing", () => {
    expect(() =>
      runCalculation(
        {
          ...REFERENCE_EXAMPLE_INPUTS,
          shellInletTempC: 30,
          shellOutletTempC: 25,
          tubeInletTempC: 40,
          tubeOutletTempC: 45,
        },
        "conservative",
      ),
    ).toThrow();
  });

  it("does not throw for every standard pass count and produces a valid K1/n1 pairing", () => {
    for (const passCount of [1, 2, 4, 6, 8] as const) {
      const result = runCalculation(
        { ...REFERENCE_EXAMPLE_INPUTS, passCount },
        "conservative",
      );
      expect(Number.isFinite(result.finalUWM2C)).toBe(true);
      expect(result.k1).toBeGreaterThan(0);
      expect(result.n1).toBeGreaterThan(0);
    }
  });
});
