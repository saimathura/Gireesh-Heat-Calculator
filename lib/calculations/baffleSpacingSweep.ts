import { runCalculation } from "@/lib/calculations/runCalculation";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";

export interface BaffleSweepPoint {
  baffleSpacingFraction: number;
  baffleCount: number;
  shellSideDeltaPBar: number;
  tubeSideDeltaPBar: number;
  shellDiameterMm: number;
  converged: boolean;
  failed: boolean;
  errorMessage?: string;
}

export const DEFAULT_BAFFLE_SPACING_FRACTIONS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

/**
 * Re-runs the full convergence loop while sweeping baffle spacing (as a
 * fraction of shell ID), holding every other input fixed. Baffle spacing
 * feeds the shell-side cross-flow area -> Gs -> ho -> U -> Area -> geometry,
 * so a full re-convergence (not just re-deriving pressure drop in
 * isolation) is needed for each point to stay physically consistent.
 */
export function runBaffleSpacingSweep(
  inputs: HeatExchangerInputs,
  hiSelectionMode: HiSelectionMode,
  fractions: number[] = DEFAULT_BAFFLE_SPACING_FRACTIONS,
): BaffleSweepPoint[] {
  return fractions.map((baffleSpacingFraction) => {
    const sweepInputs: HeatExchangerInputs = { ...inputs, baffleSpacingFraction };
    try {
      const result = runCalculation(sweepInputs, hiSelectionMode);
      return {
        baffleSpacingFraction,
        baffleCount: result.baffleCount,
        shellSideDeltaPBar: result.pressureDrops.shellSideBar,
        tubeSideDeltaPBar: result.pressureDrops.tubeSideBar,
        shellDiameterMm: result.shellDiameterMm,
        converged: result.converged,
        failed: false,
      };
    } catch (err) {
      return {
        baffleSpacingFraction,
        baffleCount: NaN,
        shellSideDeltaPBar: NaN,
        tubeSideDeltaPBar: NaN,
        shellDiameterMm: NaN,
        converged: false,
        failed: true,
        errorMessage: err instanceof Error ? err.message : "Calculation failed.",
      };
    }
  });
}
