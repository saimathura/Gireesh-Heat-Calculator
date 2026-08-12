import type { PassCount } from "@/lib/types/inputs";

// Kern's standard bundle-diameter constants, triangular pitch, pt/do = 1.25.
// Source: Coulson & Richardson Chemical Engineering Vol. 6 / Sinnott & Towler Table 12.10.
export const KERN_K1_N1_TABLE: Record<PassCount, { k1: number; n1: number }> = {
  1: { k1: 0.319, n1: 2.142 },
  2: { k1: 0.249, n1: 2.207 },
  4: { k1: 0.175, n1: 2.285 },
  6: { k1: 0.0743, n1: 2.499 },
  8: { k1: 0.0365, n1: 2.675 },
};

export function lookupK1N1(passCount: PassCount): { k1: number; n1: number } {
  return KERN_K1_N1_TABLE[passCount];
}
