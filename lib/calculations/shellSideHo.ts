/**
 * Shell-side heat transfer coefficient, Kern/McAdams correlation.
 * Validated against the source sheet at Re=9471 (<3% error vs. its
 * hand-read chart value), replacing manual Jh-chart reading.
 *
 * @param gs shell-side mass velocity, kg/s.m^2
 * @param deMm equivalent diameter, mm
 * @param muMNsM2 viscosity, mN.s/m^2
 * @param cpKjKgK specific heat, kJ/kg.K
 * @param kfWmC thermal conductivity, W/m.degC
 * @param muWallRatio (mu / mu_wall), viscosity correction; defaults to 1
 *   (no wall-temperature data available in the standard input set)
 * @returns ho, W/m^2.degC
 */
export function calculateHo(
  gs: number,
  deMm: number,
  muMNsM2: number,
  cpKjKgK: number,
  kfWmC: number,
  muWallRatio = 1,
): number {
  const deM = deMm / 1000;
  const nuShell =
    0.36 *
    Math.pow(calculateShellReynolds(gs, deM, muMNsM2), 0.55) *
    Math.pow(calculateShellPrandtl(cpKjKgK, muMNsM2, kfWmC), 1 / 3) *
    Math.pow(muWallRatio, 0.14);
  return (nuShell * kfWmC) / deM;
}

/**
 * Re_shell = Gs * de / mu. Note mu is in mN.s/m^2 = 1e-3 Pa.s, matching the
 * source sheet's convention (Gs already in kg/s.m^2, de in m).
 */
export function calculateShellReynolds(
  gs: number,
  deM: number,
  muMNsM2: number,
): number {
  const muPaS = muMNsM2 / 1000;
  return (gs * deM) / muPaS;
}

/** Pr_shell = Cp * mu / kf, with Cp converted from kJ to J. */
export function calculateShellPrandtl(
  cpKjKgK: number,
  muMNsM2: number,
  kfWmC: number,
): number {
  const cpJKgK = cpKjKgK * 1000;
  const muPaS = muMNsM2 / 1000;
  return (cpJKgK * muPaS) / kfWmC;
}
