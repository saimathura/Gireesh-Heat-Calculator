import type { HeatExchangerInputs } from "@/lib/types/inputs";

// Tube-side cooling demo: a light-oil cooler. The hot process stream (a
// light hydrocarbon oil) runs through the TUBES and is cooled from 80 to
// 45 degC; cooling water on the SHELL side is the utility and is heated
// from 30 to 40 degC. Its flow rate is the one derived from the energy
// balance - only the tube-side (process) flow is entered.
//
// This mirrors the classic "oil cooler" arrangement and exercises the
// coolingSide: "tube" path end to end: duty from the tube side (inlet
// hotter than outlet), shell-side coolant flow back-calculated, and the
// R/S -> (1/R, R*S) role swap in the LMTD correction. Like the reference
// case, the low-velocity converged design puts tube-side Reynolds below
// the ~7,000-10,000 window the digitized correlations were calibrated
// against, so results come back flagged as extrapolated - that is
// expected here, not a tuning miss.
export const TUBE_SIDE_COOLING_EXAMPLE_INPUTS: HeatExchangerInputs = {
  coolingSide: "tube",
  tubeFlowRateKgHrInput: 15000,

  // Shell side = cooling water (utility). Flow rate is derived, so the
  // value below is ignored by the calculation (the schema still wants a
  // positive number here).
  shellFlowRateKgHr: 25000,
  shellInletTempC: 30,
  shellOutletTempC: 40,
  shellCpKjKgK: 4.18,
  shellRhoKgM3: 995,
  shellKfWmC: 0.62,
  shellMuMNsM2: 0.72,

  // Tube side = hot light oil (process fluid being cooled).
  tubeInletTempC: 80,
  tubeOutletTempC: 45,
  tubeCpKjKgK: 2.05,
  tubeRhoKgM3: 800,
  tubeKfWmC: 0.13,
  tubeMuMNsM2: 0.5,

  tubeOdMm: 15.8,
  tubeWallThicknessMm: 0.914,
  tubeLengthMm: 3000,
  tubePitchRatio: 1.25,
  passCount: 4,

  baffleCutPercent: 25,
  baffleSpacingFraction: 0.5,

  hodWM2C: 3000,
  hidWM2C: 3000,
  kwWM_C: 16,

  // Matches this app's U-value suggestion for a light-oil / water cooler
  // (350-700 W/m2C literature range).
  initialUGuessWM2C: 525,
};
