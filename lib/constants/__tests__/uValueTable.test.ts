import { describe, expect, it } from "vitest";
import { estimateInitialU } from "@/lib/constants/uValueTable";

describe("estimateInitialU", () => {
  it("uses the literal Water/Water range", () => {
    const u = estimateInitialU("water", "water");
    expect(u.minWM2C).toBe(800);
    expect(u.maxWM2C).toBe(1500);
    expect(u.midWM2C).toBe(1150);
  });

  it("uses the literal Steam/Water range (steam heaters)", () => {
    const u = estimateInitialU("steam", "water");
    expect(u.minWM2C).toBe(1500);
    expect(u.maxWM2C).toBe(4000);
  });

  it("uses the literal Light oils/Water Coolers range regardless of pair order", () => {
    const a = estimateInitialU("light-oil", "water");
    const b = estimateInitialU("water", "light-oil");
    expect(a).toEqual(b);
    expect(a.minWM2C).toBe(350);
    expect(a.maxWM2C).toBe(700);
  });

  it("falls back to the limiting (lower-performing) side when no literal row exists", () => {
    // organic-solvent hot / heavy-oil cold has no literal row - heavy-oil
    // (mid 175) is worse than organic-solvent (mid 200), so it should win.
    const u = estimateInitialU("organic-solvent", "heavy-oil");
    expect(u.minWM2C).toBe(50);
    expect(u.maxWM2C).toBe(300);
    expect(u.source).toMatch(/Heavy oil/);
  });

  it("falls back to the cold side for steam pairings with no literal row", () => {
    const u = estimateInitialU("steam", "heat-transfer-oil");
    expect(u.minWM2C).toBe(50);
    expect(u.maxWM2C).toBe(300);
    expect(u.source).toMatch(/Steam/);
  });

  it("always returns a finite positive midpoint", () => {
    const categories = ["water", "brine", "organic-solvent", "light-oil", "heavy-oil", "heat-transfer-oil", "gas"] as const;
    for (const hot of [...categories, "steam" as const]) {
      for (const cold of categories) {
        const u = estimateInitialU(hot, cold);
        expect(u.midWM2C).toBeGreaterThan(0);
        expect(Number.isFinite(u.midWM2C)).toBe(true);
      }
    }
  });
});
