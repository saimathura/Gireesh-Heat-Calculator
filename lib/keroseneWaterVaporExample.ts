import type { HeatExchangerInputs } from "@/lib/types/inputs";

// Kerosene (light oil) tube side / superheated water vapor (gas) shell side,
// numerically tuned (8-pass, pitch ratio 1.15, low shell flow rate) to get
// as close as this app's geometry space allows to landing BOTH reTube and
// reShell inside the 7,000-10,000 calibrated Reynolds range simultaneously.
//
// It doesn't quite make it: reTube=6,951 (0.7% short of the 7,000 floor)
// and reShell=10,006 (0.06% over the 10,000 ceiling) - so it still shows as
// "extrapolated." That razor's-edge miss isn't a tuning failure - tube
// count is pinned at a hard floor of 16 (the minimum buildable with 8
// passes) across the whole neighborhood of flow rates/pitches/tube lengths
// that were swept, and no combination of those closed the last ~1% gap on
// both sides at once. This is the closest a light-oil/gas pairing gets with
// this calculator's Kern-chart correlations - contrast with lube-oil (a
// heavy oil), whose tube-side Re maxes out around 700 no matter what, and
// which never comes remotely close.
export const KEROSENE_WATER_VAPOR_EXAMPLE_INPUTS: HeatExchangerInputs = {
  shellFlowRateKgHr: 440,
  shellInletTempC: 250,
  shellOutletTempC: 150,
  shellCpKjKgK: 1.997,
  shellRhoKgM3: 0.464,
  shellKfWmC: 0.03326,
  shellMuMNsM2: 0.0165,

  tubeInletTempC: 40,
  tubeOutletTempC: 90,
  tubeCpKjKgK: 2.0,
  tubeRhoKgM3: 810,
  tubeKfWmC: 0.15,
  tubeMuMNsM2: 1.6,

  tubeOdMm: 15.8,
  tubeWallThicknessMm: 0.914,
  tubeLengthMm: 2000,
  tubePitchRatio: 1.15,
  passCount: 8,

  baffleCutPercent: 25,
  baffleSpacingFraction: 1.0,

  hodWM2C: 3000,
  hidWM2C: 3000,
  kwWM_C: 16,

  // Matches this app's own U-value suggestion for gas(shell)/light-oil(tube):
  // no literal table row for that pairing, so it falls back to the gas
  // side's own typical self-paired range (5-35 W/m2C) since gas is the
  // limiting film resistance.
  initialUGuessWM2C: 20,
};
