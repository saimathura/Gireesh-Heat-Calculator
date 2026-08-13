import { STEAM_SATURATION_TABLE } from "@/lib/constants/steamTable";

export interface SteamSaturationResult {
  tempC: number;
  hfgKjKg: number;
  clamped: boolean;
}

/**
 * Linear interpolation of the saturated-steam table at a given absolute
 * pressure (bara), returning saturation temperature and latent heat.
 * Clamps to the table's 0.1-50 bara range rather than extrapolating.
 */
export function interpolateSteamSaturation(pressureBarA: number): SteamSaturationResult {
  const sorted = [...STEAM_SATURATION_TABLE].sort((a, b) => a.pressureBarA - b.pressureBarA);

  if (pressureBarA <= sorted[0].pressureBarA) {
    return {
      tempC: sorted[0].tempC,
      hfgKjKg: sorted[0].hfgKjKg,
      clamped: pressureBarA < sorted[0].pressureBarA,
    };
  }
  const last = sorted[sorted.length - 1];
  if (pressureBarA >= last.pressureBarA) {
    return { tempC: last.tempC, hfgKjKg: last.hfgKjKg, clamped: pressureBarA > last.pressureBarA };
  }

  let lower = sorted[0];
  let upper = last;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].pressureBarA <= pressureBarA && sorted[i + 1].pressureBarA >= pressureBarA) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }
  const span = upper.pressureBarA - lower.pressureBarA;
  const frac = span === 0 ? 0 : (pressureBarA - lower.pressureBarA) / span;

  return {
    tempC: lower.tempC + (upper.tempC - lower.tempC) * frac,
    hfgKjKg: lower.hfgKjKg + (upper.hfgKjKg - lower.hfgKjKg) * frac,
    clamped: false,
  };
}

/**
 * Steam consumption (mass flow, kg/s) needed to deliver heatDutyKw by fully
 * condensing at pressureBarA: mdot = Q / hfg.
 */
export function calculateSteamConsumptionKgS(
  heatDutyKw: number,
  hfgKjKg: number,
): number {
  return heatDutyKw / hfgKjKg;
}
