import { describe, expect, it } from "vitest";
import {
  calculateBaffleCount,
  calculateBundleDiameter,
  calculateTubeCount,
  lookupK1N1,
  roundUpToStandardPipeSize,
} from "@/lib/calculations/tubeGeometry";

describe("lookupK1N1", () => {
  it("returns the full standard Kern table row for each pass count", () => {
    expect(lookupK1N1(1)).toEqual({ k1: 0.319, n1: 2.142 });
    expect(lookupK1N1(2)).toEqual({ k1: 0.249, n1: 2.207 });
    expect(lookupK1N1(4)).toEqual({ k1: 0.175, n1: 2.285 });
    expect(lookupK1N1(6)).toEqual({ k1: 0.0743, n1: 2.499 });
    expect(lookupK1N1(8)).toEqual({ k1: 0.0365, n1: 2.675 });
  });
});

describe("calculateTubeCount", () => {
  it("computes tube count from area, OD and length on clean round numbers", () => {
    // Area = pi * 0.02m * 1m per tube = 0.0628319 m^2/tube; 1 m^2 / that = 15.92 -> 16,
    // already divisible by passCount=2, so no rounding-up-to-a-multiple needed.
    expect(calculateTubeCount(1, 20, 1000, 2)).toBe(16);
  });

  it("rounds the raw tube count up to the nearest multiple of passCount, using true pi", () => {
    // The sheet computed 188 tubes using pi=22/7 (3.142857) instead of true pi;
    // with true pi the raw count is 189 (odd) for this area. 189 isn't evenly
    // divisible by 2 passes (94.5 tubes/pass - not physically buildable), so
    // this must round up to 190, the nearest multiple of passCount=2.
    expect(calculateTubeCount(18.751859, 15.8, 2000, 2)).toBe(190);
  });

  it("gives every pass a whole number of tubes for a non-trivial pass count", () => {
    const tubeCount = calculateTubeCount(18.751859, 15.8, 2000, 4);
    expect(tubeCount % 4).toBe(0);
  });
});

describe("calculateBundleDiameter", () => {
  it("reproduces the sheet's bundle diameter (335.109346mm) given the sheet's own tube count and K1/n1 inputs", () => {
    // Formula-correctness anchor, decoupled from the Area/tube-count cascade:
    // feeding in the sheet's own tubeCount=188 and its (4-pass) K1=0.175/n1=2.285
    // values directly should reproduce the sheet's bundle diameter exactly,
    // proving the Db formula itself is implemented correctly.
    expect(calculateBundleDiameter(188, 15.8, 0.175, 2.285)).toBeCloseTo(
      335.109346,
      2,
    );
  });

  it("gives a different (smaller) bundle diameter for the same tube count using the correct 2-pass K1/n1 (0.249/2.207)", () => {
    // Per the approved design decision: look up K1/n1 from the actual pass
    // count rather than hardcoding the sheet's (incorrect, 4-pass) row.
    // This intentionally diverges from the sheet's 335.109346mm.
    const db = calculateBundleDiameter(188, 15.8, 0.249, 2.207);
    expect(db).toBeCloseTo(318.1, 0);
    expect(db).toBeLessThan(335.109346);
  });

  it("is monotonically increasing in tube count", () => {
    const { k1, n1 } = lookupK1N1(2);
    const dbSmall = calculateBundleDiameter(50, 20, k1, n1);
    const dbLarge = calculateBundleDiameter(200, 20, k1, n1);
    expect(dbLarge).toBeGreaterThan(dbSmall);
  });
});

describe("roundUpToStandardPipeSize", () => {
  it("reproduces the sheet's shell diameter rounding (347.1mm -> 350mm)", () => {
    expect(roundUpToStandardPipeSize(347.109346)).toBe(350);
  });

  it("rounds up to the next standard size, never down", () => {
    expect(roundUpToStandardPipeSize(351)).toBe(400);
    expect(roundUpToStandardPipeSize(150)).toBe(150);
  });

  it("throws a descriptive error when the design exceeds the largest standard size", () => {
    expect(() => roundUpToStandardPipeSize(5000)).toThrow(/exceeds/i);
  });
});

describe("calculateBaffleCount", () => {
  it("reproduces the source sheet's baffle count (2000mm / 169mm -> 11.83 -> 12)", () => {
    expect(calculateBaffleCount(2000, 169)).toBe(12);
  });

  it("rounds up rather than down (never under-specifies baffles)", () => {
    expect(calculateBaffleCount(2000, 200)).toBe(10);
    expect(calculateBaffleCount(2001, 200)).toBe(11);
  });

  it("gives fewer baffles as spacing widens, for a fixed tube length", () => {
    const counts = [150, 200, 250, 300].map((spacing) =>
      calculateBaffleCount(2000, spacing),
    );
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });
});
