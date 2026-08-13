import { describe, expect, it } from "vitest";
import {
  DEFAULT_BAFFLE_SPACING_FRACTIONS,
  runBaffleSpacingSweep,
} from "@/lib/calculations/baffleSpacingSweep";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";

describe("runBaffleSpacingSweep", () => {
  const sweep = runBaffleSpacingSweep(REFERENCE_EXAMPLE_INPUTS, "conservative");

  it("returns one point per default fraction, in ascending fraction order", () => {
    expect(sweep).toHaveLength(DEFAULT_BAFFLE_SPACING_FRACTIONS.length);
    expect(sweep.map((p) => p.baffleSpacingFraction)).toEqual(DEFAULT_BAFFLE_SPACING_FRACTIONS);
  });

  it("gives fewer or equal baffles as spacing fraction widens", () => {
    for (let i = 1; i < sweep.length; i++) {
      if (sweep[i].failed || sweep[i - 1].failed) continue;
      expect(sweep[i].baffleCount).toBeLessThanOrEqual(sweep[i - 1].baffleCount);
    }
  });

  it("accepts a custom fraction list", () => {
    const custom = runBaffleSpacingSweep(REFERENCE_EXAMPLE_INPUTS, "conservative", [0.3, 0.6]);
    expect(custom).toHaveLength(2);
    expect(custom[0].baffleSpacingFraction).toBe(0.3);
    expect(custom[1].baffleSpacingFraction).toBe(0.6);
  });
});
