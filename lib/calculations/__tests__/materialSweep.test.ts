import { describe, expect, it } from "vitest";
import { runMaterialSweep } from "@/lib/calculations/materialSweep";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";
import { TUBE_MATERIALS } from "@/lib/constants/tubeMaterials";

describe("runMaterialSweep", () => {
  const sweep = runMaterialSweep(REFERENCE_EXAMPLE_INPUTS, "conservative");

  it("returns one point per material, in TUBE_MATERIALS order", () => {
    expect(sweep).toHaveLength(TUBE_MATERIALS.length);
    expect(sweep.map((p) => p.materialKey)).toEqual(TUBE_MATERIALS.map((m) => m.key));
  });

  it("converges every material for the reference design", () => {
    for (const point of sweep) {
      expect(point.failed).toBe(false);
      expect(point.converged).toBe(true);
    }
  });

  it("gives a higher converged U to higher-conductivity metals (less wall resistance)", () => {
    const byKw = [...sweep].sort((a, b) => a.kwWM_C - b.kwWM_C);
    for (let i = 1; i < byKw.length; i++) {
      expect(byKw[i].finalUWM2C).toBeGreaterThanOrEqual(byKw[i - 1].finalUWM2C);
    }
  });

  it("gives a smaller or equal bundle diameter to higher-conductivity metals (less area needed)", () => {
    const byKw = [...sweep].sort((a, b) => a.kwWM_C - b.kwWM_C);
    for (let i = 1; i < byKw.length; i++) {
      expect(byKw[i].bundleDiameterMm).toBeLessThanOrEqual(byKw[i - 1].bundleDiameterMm);
    }
  });

  it("stainless steel (the reference case's own Kw=16) reproduces the reference case's own geometry", () => {
    const stainless = sweep.find((p) => p.materialKey === "stainless-steel")!;
    expect(stainless.kwWM_C).toBe(REFERENCE_EXAMPLE_INPUTS.kwWM_C);
  });

  it("holds heat duty constant across materials (duty comes from the process energy balance, not Kw)", () => {
    for (const point of sweep) {
      expect(point.heatDutyKw).toBeCloseTo(sweep[0].heatDutyKw, 6);
    }
  });
});
