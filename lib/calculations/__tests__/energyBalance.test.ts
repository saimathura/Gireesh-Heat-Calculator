import { describe, expect, it } from "vitest";
import {
  calculateHeatDuty,
  calculateTubeFlowRate,
} from "@/lib/calculations/energyBalance";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

describe("calculateHeatDuty", () => {
  it("reproduces the reference case heat duty (115.694444 kW)", () => {
    const q = calculateHeatDuty(
      REFERENCE_EXAMPLE_INPUTS.shellFlowRateKgHr,
      REFERENCE_EXAMPLE_INPUTS.shellCpKjKgK,
      REFERENCE_EXAMPLE_INPUTS.shellInletTempC -
        REFERENCE_EXAMPLE_INPUTS.shellOutletTempC,
    );
    expect(q).toBeCloseTo(115.694444, 4);
  });
});

describe("calculateTubeFlowRate", () => {
  it("reproduces the reference case tube-side flow rate (5.538269 kg/s)", () => {
    const q = calculateHeatDuty(
      REFERENCE_EXAMPLE_INPUTS.shellFlowRateKgHr,
      REFERENCE_EXAMPLE_INPUTS.shellCpKjKgK,
      REFERENCE_EXAMPLE_INPUTS.shellInletTempC -
        REFERENCE_EXAMPLE_INPUTS.shellOutletTempC,
    );
    const tubeFlow = calculateTubeFlowRate(
      q,
      REFERENCE_EXAMPLE_INPUTS.tubeCpKjKgK,
      REFERENCE_EXAMPLE_INPUTS.tubeOutletTempC -
        REFERENCE_EXAMPLE_INPUTS.tubeInletTempC,
    );
    expect(tubeFlow).toBeCloseTo(5.538269, 4);
    expect(tubeFlow * 3600).toBeCloseTo(19937.769268, 1);
  });
});
