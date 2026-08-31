import { describe, expect, it } from "vitest";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { calculateF, calculateLmtd, calculateRS } from "@/lib/calculations/lmtd";
import { resolveStreamFlowsKgS } from "@/lib/calculations/energyBalance";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";
import type { HeatExchangerInputs } from "@/lib/types/inputs";

// Mirror of the 116 kW reference case with the roles flipped: the hot
// process fluid (reference shell fluid, 42->38 C, its own Cp) now flows
// through the TUBES with its flow rate entered directly, and the coolant
// (reference tube fluid, 32->37 C) sits on the SHELL side with its flow
// derived from the energy balance. Duty and the LMTD chain must reproduce
// the reference numbers exactly; geometry/U legitimately differ because the
// hot fluid now runs through tube-side geometry instead of shell-side.
const TUBE_COOLING_INPUTS: HeatExchangerInputs = {
  ...REFERENCE_EXAMPLE_INPUTS,
  coolingSide: "tube",
  tubeFlowRateKgHrInput: 25000,

  // Hot process fluid in the tubes (was the reference's shell fluid).
  tubeInletTempC: 42,
  tubeOutletTempC: 38,
  tubeCpKjKgK: 4.165,
  tubeRhoKgM3: 1000,
  tubeKfWmC: 0.62079,
  tubeMuMNsM2: 0.72,

  // Coolant on the shell side (was the reference's tube fluid).
  shellInletTempC: 32,
  shellOutletTempC: 37,
  shellCpKjKgK: 4.178,
  shellRhoKgM3: 1000,
  shellKfWmC: 0.62079,
  shellMuMNsM2: 0.72,
  // Ignored in tube-side-cooling mode (shell flow is derived), but the
  // schema still wants a positive number here.
  shellFlowRateKgHr: 1,
};

describe("runCalculation - tube-side cooling", () => {
  const result = runCalculation(TUBE_COOLING_INPUTS, "conservative");

  it("reports the cooling side on the result", () => {
    expect(result.coolingSide).toBe("tube");
    expect(result.isSteam).toBe(false);
  });

  it("computes duty from the entered tube-side flow (inlet hotter than outlet)", () => {
    // 25000/3600 kg/s * 4.165 kJ/kgK * (42-38) K = 115.694444 kW
    expect(result.heatDutyKw).toBeCloseTo(115.694444, 3);
  });

  it("derives the shell-side coolant flow from the energy balance", () => {
    // Q / (Cp_shell * dT_shell) = 115.694444 / (4.178 * 5) = 5.538269 kg/s
    expect(result.shellFlowRateKgHr).toBeCloseTo(19937.769268, 0);
  });

  it("reproduces the reference LMTD and corrected LMTD despite the flipped orientation", () => {
    expect(result.lmtd).toBeCloseTo(5.484815, 3);
    // R/S swap to (1/R, R*S) when shell<->tube roles flip, but F is
    // invariant under that transform, so lmtdCorrected matches the
    // reference case's 4.8098.
    expect(result.f).toBeCloseTo(0.877, 2);
    expect(result.lmtdCorrected).toBeCloseTo(4.8098, 2);
  });

  it("converges to a finite, positive design", () => {
    expect(result.converged).toBe(true);
    expect(result.finalUWM2C).toBeGreaterThan(0);
    expect(Number.isFinite(result.finalUWM2C)).toBe(true);
    expect(result.tubeCount).toBeGreaterThan(0);
    expect(result.areaM2).toBeGreaterThan(0);
  });

  it("produces positive, finite pressure drops and nozzle sizes on both sides", () => {
    expect(result.pressureDrops.tubeSideBar).toBeGreaterThan(0);
    expect(result.pressureDrops.shellSideBar).toBeGreaterThan(0);
    expect(Number.isFinite(result.pressureDrops.tubeSideBar)).toBe(true);
    expect(Number.isFinite(result.pressureDrops.shellSideBar)).toBe(true);
    expect(result.nozzles.tubeSideMm).toBeGreaterThan(0);
    expect(result.nozzles.shellSideMm).toBeGreaterThan(0);
  });

  it("surfaces the tube-side-cooling assumption in the verdict messages", () => {
    expect(
      result.verdicts.messages.some((m) => m.includes("Tube-side cooling")),
    ).toBe(true);
  });

  it("scales duty and derived coolant flow linearly with the entered tube-side flow", () => {
    const doubled = runCalculation(
      { ...TUBE_COOLING_INPUTS, tubeFlowRateKgHrInput: 50000 },
      "conservative",
    );
    expect(doubled.heatDutyKw).toBeCloseTo(result.heatDutyKw * 2, 4);
    expect(doubled.shellFlowRateKgHr).toBeCloseTo(result.shellFlowRateKgHr * 2, 4);
  });

  it("throws rather than propagating NaN when the temperatures cross", () => {
    expect(() =>
      runCalculation(
        {
          ...TUBE_COOLING_INPUTS,
          // Tube "cools" 42->38 but shell coolant would have to exceed it.
          shellInletTempC: 45,
          shellOutletTempC: 50,
        },
        "conservative",
      ),
    ).toThrow();
  });
});

describe("calculateLmtd / calculateRS - orientation", () => {
  it("gives the same LMTD whether the hot stream is on the shell or the tube side", () => {
    const shellHot = calculateLmtd(42, 38, 32, 37);
    const tubeHot = calculateLmtd(32, 37, 42, 38);
    expect(tubeHot).toBeCloseTo(shellHot, 10);
  });

  it("still rejects a both-streams-cooling / both-heating pairing", () => {
    // Shell cools 30->25 while tube also 'cools' 45->40: impossible.
    expect(() => calculateLmtd(30, 25, 45, 40)).toThrow();
  });

  it("F is invariant under the shell<->tube role swap (R,S) -> (1/R, R*S)", () => {
    const a = calculateRS(42, 38, 32, 37); // R=0.8, S=0.5
    const b = calculateRS(32, 37, 42, 38); // R=1.25, S=0.4
    expect(b.r).toBeCloseTo(1 / a.r, 6);
    expect(b.s).toBeCloseTo(a.r * a.s, 6);
    expect(calculateF(b.r, b.s)).toBeCloseTo(calculateF(a.r, a.s), 6);
  });
});

describe("resolveStreamFlowsKgS", () => {
  it("keeps the legacy split (shell entered, tube derived) for shell-side cooling", () => {
    const { tubeFlowRateKgS, shellFlowRateKgS } = resolveStreamFlowsKgS(
      REFERENCE_EXAMPLE_INPUTS,
      115.694444,
    );
    expect(shellFlowRateKgS).toBeCloseTo(25000 / 3600, 10);
    expect(tubeFlowRateKgS).toBeCloseTo(5.538269, 4);
  });

  it("flips the split (tube entered, shell derived) for tube-side cooling", () => {
    const { tubeFlowRateKgS, shellFlowRateKgS } = resolveStreamFlowsKgS(
      TUBE_COOLING_INPUTS,
      115.694444,
    );
    expect(tubeFlowRateKgS).toBeCloseTo(25000 / 3600, 10);
    expect(shellFlowRateKgS).toBeCloseTo(5.538269, 4);
  });
});

describe("heatExchangerInputsSchema - tube-side cooling", () => {
  it("accepts a well-formed tube-side-cooling case", () => {
    expect(() => heatExchangerInputsSchema.parse(TUBE_COOLING_INPUTS)).not.toThrow();
  });

  it("requires tubeFlowRateKgHrInput", () => {
    const withoutFlow: Partial<HeatExchangerInputs> = { ...TUBE_COOLING_INPUTS };
    delete withoutFlow.tubeFlowRateKgHrInput;
    expect(() => heatExchangerInputsSchema.parse(withoutFlow)).toThrow();
  });

  it("rejects a tube-side outlet that is not below the inlet (tube must be cooled here)", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...TUBE_COOLING_INPUTS,
        tubeInletTempC: 38,
        tubeOutletTempC: 42,
      }),
    ).toThrow();
  });

  it("rejects a shell-side outlet that is not above the inlet (shell coolant must be heated)", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...TUBE_COOLING_INPUTS,
        shellInletTempC: 37,
        shellOutletTempC: 32,
      }),
    ).toThrow();
  });

  it("rejects combining shell-side steam with tube-side cooling", () => {
    expect(() =>
      heatExchangerInputsSchema.parse({
        ...TUBE_COOLING_INPUTS,
        shellIsSteam: true,
        shellSteamPressureBarA: 6,
      }),
    ).toThrow();
  });

  it("still accepts the unchanged shell-side-cooling reference case", () => {
    expect(() => heatExchangerInputsSchema.parse(REFERENCE_EXAMPLE_INPUTS)).not.toThrow();
  });
});
