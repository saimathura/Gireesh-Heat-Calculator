export type PassCount = 1 | 2 | 4 | 6 | 8;

export const PASS_COUNTS: PassCount[] = [1, 2, 4, 6, 8];

export type HiSelectionMode = "conservative" | "methodA" | "methodB";

export interface HeatExchangerInputs {
  // Shell-side fluid
  shellFlowRateKgHr: number;
  shellInletTempC: number;
  shellOutletTempC: number;
  shellCpKjKgK: number;
  shellRhoKgM3: number;
  shellKfWmC: number;
  shellMuMNsM2: number;

  // Tube-side fluid (flow rate is derived, not entered)
  tubeInletTempC: number;
  tubeOutletTempC: number;
  tubeCpKjKgK: number;
  tubeRhoKgM3: number;
  tubeKfWmC: number;
  tubeMuMNsM2: number;

  // Tube geometry
  tubeOdMm: number;
  tubeWallThicknessMm: number;
  tubeLengthMm: number;
  tubePitchRatio: number; // pitch / OD
  passCount: PassCount;

  // Baffles
  baffleCutPercent: number;
  baffleSpacingFraction: number; // fraction of shell ID, 0.2-1.0

  // Fouling & material
  hodWM2C: number;
  hidWM2C: number;
  kwWM_C: number; // tube wall thermal conductivity

  // Iteration
  initialUGuessWM2C: number;
  convergenceTolerance?: number; // default 0.02
  maxIterations?: number; // default 25
}
