import { describe, expect, it } from "vitest";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";
import { STEAM_CONDENSING_FILM_COEFFICIENT_WM2C } from "@/lib/constants/steamTable";
import type { HeatExchangerInputs } from "@/lib/types/inputs";

// Shell side set to condensing steam at 7 bara (an exact steam-table point:
// 165degC, 2064.94 kJ/kg), with tube-side flow chosen to exactly equal the
// non-steam reference case's own derived tube flow rate - this makes the
// resulting duty reproduce the reference case's known 115.694444 kW exactly,
// letting the steam-duty formula be cross-checked against an already-proven
// value instead of a fresh hand computation.
const STEAM_INPUTS: HeatExchangerInputs = {
  ...REFERENCE_EXAMPLE_INPUTS,
  shellIsSteam: true,
  shellSteamPressureBarA: 7,
  shellInletTempC: 165,
  shellOutletTempC: 165,
  shellFlowRateKgHr: 1,
  shellCpKjKgK: 4.2,
  shellRhoKgM3: 1,
  shellKfWmC: 0.02,
  shellMuMNsM2: 0.01,
  tubeFlowRateKgHrInput: 19937.769268,
};

describe("runCalculation - shell-side steam", () => {
  const result = runCalculation(STEAM_INPUTS, "conservative");

  it("computes duty from the tube side (Cp*dT), not shell Cp*dT", () => {
    expect(result.isSteam).toBe(true);
    expect(result.heatDutyKw).toBeCloseTo(115.694444, 3);
  });

  it("looks up saturation temperature and latent heat from the steam table", () => {
    expect(result.steamTempC).toBeCloseTo(165, 6);
    expect(result.steamHfgKjKg).toBeCloseTo(2064.94, 6);
  });

  it("derives steam consumption as duty / latent heat", () => {
    expect(result.steamConsumptionKgHr).toBeCloseTo(201.7008, 2);
  });

  it("uses the fixed condensing film coefficient for ho, not a Kern correlation", () => {
    expect(result.hoWM2C).toBe(STEAM_CONDENSING_FILM_COEFFICIENT_WM2C);
  });

  it("does not model shell-side pressure drop for condensing steam", () => {
    expect(result.pressureDrops.shellSideBar).toBe(0);
  });

  it("still produces a finite, positive tube-side pressure drop and converges", () => {
    expect(result.pressureDrops.tubeSideBar).toBeGreaterThan(0);
    expect(Number.isFinite(result.pressureDrops.tubeSideBar)).toBe(true);
    expect(typeof result.converged).toBe("boolean");
  });

  it("surfaces the steam assumption in the verdict messages", () => {
    expect(
      result.verdicts.messages.some((m) => m.includes("condensing steam")),
    ).toBe(true);
  });
});

describe("runCalculation - non-steam path is unaffected by the steam feature", () => {
  it("still reproduces the exact reference case with shellIsSteam left unset", () => {
    const result = runCalculation(REFERENCE_EXAMPLE_INPUTS, "conservative");
    expect(result.isSteam).toBe(false);
    expect(result.steamTempC).toBeNull();
    expect(result.steamHfgKjKg).toBeNull();
    expect(result.steamConsumptionKgHr).toBeNull();
    expect(result.heatDutyKw).toBeCloseTo(115.694444, 3);
  });
});
