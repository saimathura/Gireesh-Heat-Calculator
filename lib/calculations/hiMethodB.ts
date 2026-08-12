/**
 * Tube-side heat transfer coefficient, Method B: Dittus-Boelter / Kern
 * Jh-chart equivalent, digitized to replace manual chart-reading.
 *
 * Validated against the source sheet at Re=7454, Pr=4.85: gives Jh~0.00385
 * vs. the sheet's hand-read chart value of 0.0033 (~16% variance). This is
 * expected divergence between an analytical fit and a coarse hand-read
 * chart, not a bug - flag results from this method with that tolerance in
 * the UI rather than presenting it as an exact match to the sheet.
 *
 * @param re tube-side Reynolds number
 * @param pr tube-side Prandtl number
 * @param kfWmC tube-side fluid thermal conductivity, W/m.degC
 * @param diMm tube inner diameter, mm
 * @returns hi, W/m^2.degC
 */
export function calculateHiMethodB(
  re: number,
  pr: number,
  kfWmC: number,
  diMm: number,
): number {
  const nu = 0.023 * Math.pow(re, 0.8) * Math.pow(pr, 0.33);
  const diM = diMm / 1000;
  return nu * (kfWmC / diM);
}
