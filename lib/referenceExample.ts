import type { HeatExchangerInputs } from "@/lib/types/inputs";

// Ground-truth 116kW, 2-pass shell-and-tube design case, extracted from the
// source Excel workbook. Shared by the "Load reference example" UI button
// AND the exact-match fixture tests in lib/calculations/__tests__ — keep
// these in sync by construction (both import this constant).
export const REFERENCE_EXAMPLE_INPUTS: HeatExchangerInputs = {
  shellFlowRateKgHr: 25000,
  shellInletTempC: 42,
  shellOutletTempC: 38,
  shellCpKjKgK: 4.165,
  shellRhoKgM3: 1000,
  shellKfWmC: 0.62079,
  shellMuMNsM2: 0.72,

  tubeInletTempC: 32,
  tubeOutletTempC: 37,
  tubeCpKjKgK: 4.178,
  tubeRhoKgM3: 1000,
  tubeKfWmC: 0.62079,
  tubeMuMNsM2: 0.72,

  tubeOdMm: 15.8,
  tubeWallThicknessMm: 0.914,
  tubeLengthMm: 2000,
  tubePitchRatio: 1.25,
  passCount: 2,

  baffleCutPercent: 25,
  baffleSpacingFraction: 0.5,

  hodWM2C: 3000,
  hidWM2C: 3000,
  kwWM_C: 16,

  initialUGuessWM2C: 1200,
};
