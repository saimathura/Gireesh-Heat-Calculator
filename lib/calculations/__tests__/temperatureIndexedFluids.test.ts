import { describe, expect, it } from "vitest";
import {
  findTempIndexedPreset,
  interpolateFluidProperties,
  TEMP_INDEXED_FLUID_PRESETS,
} from "@/lib/constants/temperatureIndexedFluids";

describe("interpolateFluidProperties", () => {
  const air = findTempIndexedPreset("air")!;

  it("returns the exact table row when the requested temperature is a table point", () => {
    const { row, clamped } = interpolateFluidProperties(air.table, 25);
    expect(row.cpKjKgK).toBeCloseTo(1.007, 6);
    expect(row.rhoKgM3).toBeCloseTo(1.169, 6);
    expect(row.kfWmC).toBeCloseTo(0.026, 6);
    expect(row.muMNsM2).toBeCloseTo(0.01819, 6);
    expect(clamped).toBe(false);
  });

  it("linearly interpolates between two table points", () => {
    // Air table: 20degC -> rho 1.188, mu 0.01798; 25degC -> rho 1.169, mu 0.01819
    const { row, clamped } = interpolateFluidProperties(air.table, 22.5);
    expect(row.rhoKgM3).toBeCloseTo((1.188 + 1.169) / 2, 6);
    expect(row.muMNsM2).toBeCloseTo((0.01798 + 0.01819) / 2, 6);
    expect(clamped).toBe(false);
  });

  it("clamps to the table's lowest row below its range and flags it", () => {
    const { row, clamped } = interpolateFluidProperties(air.table, -100);
    expect(row.rhoKgM3).toBeCloseTo(1.57, 6);
    expect(clamped).toBe(true);
  });

  it("clamps to the table's highest row above its range and flags it", () => {
    const { row, clamped } = interpolateFluidProperties(air.table, 1500);
    expect(row.rhoKgM3).toBeCloseTo(0.235, 6);
    expect(clamped).toBe(true);
  });

  it("does not flag clamping exactly at an endpoint", () => {
    expect(interpolateFluidProperties(air.table, -50).clamped).toBe(false);
    expect(interpolateFluidProperties(air.table, 1200).clamped).toBe(false);
  });
});

describe("TEMP_INDEXED_FLUID_PRESETS", () => {
  it("includes air, the requested gases, and the thermal oil, each with a non-empty, temperature-sorted-safe table", () => {
    const keys = TEMP_INDEXED_FLUID_PRESETS.map((p) => p.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "air",
        "nitrogen",
        "carbon-dioxide",
        "flue-gas",
        "methane",
        "hydrogen",
        "thermal-oil",
      ]),
    );
    for (const preset of TEMP_INDEXED_FLUID_PRESETS) {
      expect(preset.table.length).toBeGreaterThan(1);
      for (const row of preset.table) {
        expect(row.cpKjKgK).toBeGreaterThan(0);
        expect(row.rhoKgM3).toBeGreaterThan(0);
        expect(row.kfWmC).toBeGreaterThan(0);
        expect(row.muMNsM2).toBeGreaterThan(0);
      }
    }
  });
});
