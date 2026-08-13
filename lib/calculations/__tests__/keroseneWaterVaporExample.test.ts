import { describe, expect, it } from "vitest";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { KEROSENE_WATER_VAPOR_EXAMPLE_INPUTS } from "@/lib/keroseneWaterVaporExample";

describe("kerosene / water-vapor example", () => {
  it("converges and lands right at the edge of the calibrated Reynolds range", () => {
    const r = runCalculation(KEROSENE_WATER_VAPOR_EXAMPLE_INPUTS, "conservative");
    expect(r.converged).toBe(true);
    // Numerically tuned as close as this app's discrete geometry space
    // allows - reTube just under the 7,000 floor, reShell just over the
    // 10,000 ceiling, so it's still flagged as extrapolated. See the
    // comment in lib/keroseneWaterVaporExample.ts for why this is the
    // closest achievable, not a tuning miss.
    expect(r.tubeSide.re).toBeCloseTo(6951, -1);
    expect(r.shellSide.re).toBeCloseTo(10006, -1);
    expect(r.verdicts.reynoldsOutOfCalibratedRange).toBe(true);
  });
});
