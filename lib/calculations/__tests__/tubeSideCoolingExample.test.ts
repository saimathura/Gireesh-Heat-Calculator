import { describe, expect, it } from "vitest";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";
import { TUBE_SIDE_COOLING_EXAMPLE_INPUTS } from "@/lib/tubeSideCoolingExample";

describe("tube-side cooling example (light-oil cooler)", () => {
  it("passes schema validation", () => {
    expect(() =>
      heatExchangerInputsSchema.parse(TUBE_SIDE_COOLING_EXAMPLE_INPUTS),
    ).not.toThrow();
  });

  it("runs the coolingSide: tube path and converges to a sensible design", () => {
    const r = runCalculation(TUBE_SIDE_COOLING_EXAMPLE_INPUTS, "conservative");

    expect(r.coolingSide).toBe("tube");
    expect(r.isSteam).toBe(false);
    expect(r.converged).toBe(true);

    // Duty from the entered tube-side flow: 15000/3600 * 2.05 * (80-45) = 299.0 kW
    expect(r.heatDutyKw).toBeCloseTo(299.0, 1);
    // Shell-side coolant flow derived: 299.0 / (4.18 * 10) -> ~25,748 kg/hr
    expect(r.shellFlowRateKgHr).toBeCloseTo(25748, -2);

    // R/S are the shell<->tube-swapped form; F stays a valid 0<F<=1.
    expect(r.r).toBeCloseTo(0.286, 2);
    expect(r.s).toBeCloseTo(0.7, 2);
    expect(r.f).toBeGreaterThan(0);
    expect(r.f).toBeLessThanOrEqual(1);

    // Converged U lands inside the light-oil / water cooler band (350-700).
    expect(r.finalUWM2C).toBeGreaterThan(350);
    expect(r.finalUWM2C).toBeLessThan(700);

    expect(r.pressureDrops.tubeSideBar).toBeGreaterThan(0);
    expect(r.pressureDrops.shellSideBar).toBeGreaterThan(0);
    expect(r.nozzles.tubeSideMm).toBeGreaterThan(0);
    expect(r.nozzles.shellSideMm).toBeGreaterThan(0);

    expect(
      r.verdicts.messages.some((m) => m.includes("Tube-side cooling")),
    ).toBe(true);
  });
});
