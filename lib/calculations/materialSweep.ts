import { runCalculation } from "@/lib/calculations/runCalculation";
import { TUBE_MATERIALS } from "@/lib/constants/tubeMaterials";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";

export interface MaterialSweepPoint {
  materialKey: string;
  materialLabel: string;
  kwWM_C: number;
  bundleDiameterMm: number;
  shellDiameterMm: number;
  tubeCount: number;
  baffleCount: number;
  tubeSideDeltaPBar: number;
  shellSideDeltaPBar: number;
  finalUWM2C: number;
  heatDutyKw: number;
  converged: boolean;
  failed: boolean;
  errorMessage?: string;
}

/**
 * Re-runs the full convergence loop once per tube material (holding every
 * other input fixed), so the resulting bundle/shell diameter and pressure
 * drops reflect the real knock-on effect of Kw on U -> Area -> tube count ->
 * geometry -> velocities/Re, not just a cosmetic relabeling.
 */
export function runMaterialSweep(
  inputs: HeatExchangerInputs,
  hiSelectionMode: HiSelectionMode,
): MaterialSweepPoint[] {
  return TUBE_MATERIALS.map((material) => {
    const sweepInputs: HeatExchangerInputs = { ...inputs, kwWM_C: material.kwWM_C };
    try {
      const result = runCalculation(sweepInputs, hiSelectionMode);
      return {
        materialKey: material.key,
        materialLabel: material.label,
        kwWM_C: material.kwWM_C,
        bundleDiameterMm: result.bundleDiameterMm,
        shellDiameterMm: result.shellDiameterMm,
        tubeCount: result.tubeCount,
        baffleCount: result.baffleCount,
        tubeSideDeltaPBar: result.pressureDrops.tubeSideBar,
        shellSideDeltaPBar: result.pressureDrops.shellSideBar,
        finalUWM2C: result.finalUWM2C,
        heatDutyKw: result.heatDutyKw,
        converged: result.converged,
        failed: false,
      };
    } catch (err) {
      return {
        materialKey: material.key,
        materialLabel: material.label,
        kwWM_C: material.kwWM_C,
        bundleDiameterMm: NaN,
        shellDiameterMm: NaN,
        tubeCount: NaN,
        baffleCount: NaN,
        tubeSideDeltaPBar: NaN,
        shellSideDeltaPBar: NaN,
        finalUWM2C: NaN,
        heatDutyKw: NaN,
        converged: false,
        failed: true,
        errorMessage: err instanceof Error ? err.message : "Calculation failed.",
      };
    }
  });
}
