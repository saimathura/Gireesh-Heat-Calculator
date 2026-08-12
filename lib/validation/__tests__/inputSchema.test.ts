import { describe, expect, it } from "vitest";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

describe("heatExchangerInputsSchema", () => {
  it("accepts the reference example inputs", () => {
    expect(() => heatExchangerInputsSchema.parse(REFERENCE_EXAMPLE_INPUTS)).not.toThrow();
  });

  it("rejects a pass count outside {1,2,4,6,8}", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({ ...REFERENCE_EXAMPLE_INPUTS, passCount: 3 }),
    ).toThrow();
  });

  it("rejects baffle spacing fraction outside 0.2-1.0", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...REFERENCE_EXAMPLE_INPUTS,
        baffleSpacingFraction: 0.1,
      }),
    ).toThrow();
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...REFERENCE_EXAMPLE_INPUTS,
        baffleSpacingFraction: 1.5,
      }),
    ).toThrow();
  });

  it("rejects non-positive flow rates", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({ ...REFERENCE_EXAMPLE_INPUTS, shellFlowRateKgHr: 0 }),
    ).toThrow();
    expect(() =>
      heatExchangerInputsSchema.parse({ ...REFERENCE_EXAMPLE_INPUTS, shellFlowRateKgHr: -100 }),
    ).toThrow();
  });

  it("rejects a shell-side outlet temperature that is not below the inlet", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...REFERENCE_EXAMPLE_INPUTS,
        shellInletTempC: 38,
        shellOutletTempC: 42,
      }),
    ).toThrow();
  });

  it("rejects a tube wall thickness that would produce a zero or negative inner diameter", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...REFERENCE_EXAMPLE_INPUTS,
        tubeOdMm: 10,
        tubeWallThicknessMm: 6,
      }),
    ).toThrow();
  });

  it("rejects a degenerate temperature crossing (guards LMTD's ln() from a non-positive argument)", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...REFERENCE_EXAMPLE_INPUTS,
        shellInletTempC: 30,
        shellOutletTempC: 25,
        tubeInletTempC: 40,
        tubeOutletTempC: 45,
      }),
    ).toThrow();
  });
});
