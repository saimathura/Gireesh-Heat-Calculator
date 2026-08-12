/**
 * Tube-side heat transfer coefficient, Method A: empirical water-film
 * correlation hi = 4200(1.35+0.02t)u^0.8/di^0.2. Already analytical in the
 * source sheet, no chart needed.
 * @param tMeanC tube-side mean fluid temperature, degC
 * @param velocityMs tube-side liquid velocity, m/s
 * @param diMm tube inner diameter, mm
 * @returns hi, W/m^2.degC
 */
export function calculateHiMethodA(
  tMeanC: number,
  velocityMs: number,
  diMm: number,
): number {
  return (
    (4200 * (1.35 + 0.02 * tMeanC) * Math.pow(velocityMs, 0.8)) /
    Math.pow(diMm, 0.2)
  );
}
