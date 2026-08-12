import { describe, expect, it } from "vitest";
import { calculateHiMethodA } from "@/lib/calculations/hiMethodA";

describe("calculateHiMethodA", () => {
  it("reproduces the reference case hi Method A (2351.79395 W/m2.C)", () => {
    // t_mean=34.5C, velocity=0.384118 m/s, di=13.972mm (all from the sheet's
    // own reference case).
    const hi = calculateHiMethodA(34.5, 0.384118, 13.972);
    expect(hi).toBeCloseTo(2351.79395, 0);
  });
});
