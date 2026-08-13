import { describe, expect, it } from "vitest";
import {
  calculateSteamConsumptionKgS,
  interpolateSteamSaturation,
} from "@/lib/calculations/steamProperties";

describe("interpolateSteamSaturation", () => {
  it("returns the exact table row at an exact pressure point (7 bara)", () => {
    const result = interpolateSteamSaturation(7);
    expect(result.tempC).toBeCloseTo(165, 6);
    expect(result.hfgKjKg).toBeCloseTo(2064.94, 6);
    expect(result.clamped).toBe(false);
  });

  it("linearly interpolates between two pressure points", () => {
    // 6.2 bara -> 160degC/2081.3 kJ/kg; 6.5 bara -> 162degC/2074.77 kJ/kg
    const result = interpolateSteamSaturation(6.35);
    expect(result.tempC).toBeCloseTo(161, 6);
    expect(result.hfgKjKg).toBeCloseTo((2081.3 + 2074.77) / 2, 6);
    expect(result.clamped).toBe(false);
  });

  it("clamps below the table's 0.1 bara minimum and flags it", () => {
    const result = interpolateSteamSaturation(0.05);
    expect(result.tempC).toBeCloseTo(45.8, 6);
    expect(result.clamped).toBe(true);
  });

  it("clamps above the table's 50 bara maximum and flags it", () => {
    const result = interpolateSteamSaturation(60);
    expect(result.tempC).toBeCloseTo(264, 6);
    expect(result.clamped).toBe(true);
  });

  it("saturation temperature rises monotonically with pressure", () => {
    const pressures = [0.5, 1, 5, 10, 20, 30, 50];
    const temps = pressures.map((p) => interpolateSteamSaturation(p).tempC);
    for (let i = 1; i < temps.length; i++) {
      expect(temps[i]).toBeGreaterThan(temps[i - 1]);
    }
  });

  it("latent heat falls monotonically as pressure (and saturation temp) rises", () => {
    const pressures = [0.5, 1, 5, 10, 20, 30, 50];
    const hfg = pressures.map((p) => interpolateSteamSaturation(p).hfgKjKg);
    for (let i = 1; i < hfg.length; i++) {
      expect(hfg[i]).toBeLessThan(hfg[i - 1]);
    }
  });
});

describe("calculateSteamConsumptionKgS", () => {
  it("computes mass flow as duty / latent heat", () => {
    expect(calculateSteamConsumptionKgS(100, 2000)).toBeCloseTo(0.05, 9);
  });
});
