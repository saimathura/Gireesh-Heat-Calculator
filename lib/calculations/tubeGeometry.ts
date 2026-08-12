export { lookupK1N1 } from "@/lib/constants/kernK1N1Table";
export { roundUpToStandardPipeSize } from "@/lib/constants/standardPipeSizes";

/**
 * Number of tubes required to provide at least the given heat transfer
 * area, rounded up to the nearest multiple of passCount so every pass
 * gets a whole number of tubes (a real bundle can't split a tube across
 * passes) - the design is only physically buildable if this holds.
 */
export function calculateTubeCount(
  areaM2: number,
  odMm: number,
  lengthMm: number,
  passCount: number,
): number {
  const odM = odMm / 1000;
  const lengthM = lengthMm / 1000;
  const areaPerTubeM2 = Math.PI * odM * lengthM;
  const rawCount = Math.ceil(areaM2 / areaPerTubeM2);
  return Math.ceil(rawCount / passCount) * passCount;
}

/**
 * Kern's tube bundle diameter correlation: Db = do * (Nt/K1)^(1/n1).
 */
export function calculateBundleDiameter(
  tubeCount: number,
  odMm: number,
  k1: number,
  n1: number,
): number {
  return odMm * Math.pow(tubeCount / k1, 1 / n1);
}
