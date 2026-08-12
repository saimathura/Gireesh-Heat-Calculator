import {
  CALIBRATED_RE_RANGE,
  NM2_TO_BAR,
  SHELL_JF_COEFFICIENT,
  TUBE_JF_COEFFICIENT,
} from "@/lib/constants/physicalConstants";

export interface PressureDropResult {
  nM2: number;
  bar: number;
  extrapolated: boolean;
}

function isOutsideCalibratedRange(re: number): boolean {
  return re < CALIBRATED_RE_RANGE.min || re > CALIBRATED_RE_RANGE.max;
}

/**
 * Tube-side pressure drop. Jf is a single-anchor-calibrated friction factor
 * (Re=7454 -> Jf=0.0033); flag results outside the calibrated Re range as
 * extrapolated.
 * ΔP = Np * [8*Jf*(L/di) + 2.5] * (rho*u^2/2)
 */
export function calculateTubeSideDeltaP(
  re: number,
  passCount: number,
  lengthMm: number,
  diMm: number,
  rhoKgM3: number,
  velocityMs: number,
): PressureDropResult {
  const jf = TUBE_JF_COEFFICIENT * Math.pow(re, -0.2);
  const lOverDi = lengthMm / diMm;
  const nM2 =
    passCount *
    (8 * jf * lOverDi + 2.5) *
    ((rhoKgM3 * velocityMs * velocityMs) / 2);
  return {
    nM2,
    bar: nM2 * NM2_TO_BAR,
    extrapolated: isOutsideCalibratedRange(re),
  };
}

/**
 * Shell-side pressure drop. jf is a single-anchor-calibrated friction factor
 * (Re=9471, 25% baffle cut -> jf=0.049); flag results outside the
 * calibrated Re range as extrapolated.
 * ΔP = 8*jf*(Ds/de)*(L/Lb)*(rho*ut^2/2)
 */
export function calculateShellSideDeltaP(
  re: number,
  shellDiameterMm: number,
  deMm: number,
  lengthMm: number,
  baffleSpacingMm: number,
  rhoKgM3: number,
  velocityMs: number,
): PressureDropResult {
  const jf = SHELL_JF_COEFFICIENT * Math.pow(re, -0.2);
  const dsOverDe = shellDiameterMm / deMm;
  const lOverLb = lengthMm / baffleSpacingMm;
  const nM2 =
    8 *
    jf *
    dsOverDe *
    lOverLb *
    ((rhoKgM3 * velocityMs * velocityMs) / 2);
  return {
    nM2,
    bar: nM2 * NM2_TO_BAR,
    extrapolated: isOutsideCalibratedRange(re),
  };
}
