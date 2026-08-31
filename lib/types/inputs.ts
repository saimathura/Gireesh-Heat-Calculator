export type PassCount = 1 | 2 | 4 | 6 | 8;

export const PASS_COUNTS: PassCount[] = [1, 2, 4, 6, 8];

export type HiSelectionMode = "conservative" | "methodA" | "methodB";

export type CoolingSide = "shell" | "tube";

export interface HeatExchangerInputs {
  // Cooling arrangement. Defaults to "shell" when omitted.
  //   "shell" - the hot process fluid being cooled is on the SHELL side and
  //     the coolant is in the tubes. shellFlowRateKgHr is the entered
  //     process flow; the tube-side coolant flow is back-calculated from the
  //     energy balance. (Original, unchanged behavior.)
  //   "tube" - the mirror image: the hot process fluid being cooled flows
  //     through the TUBES and the coolant is on the shell side. In this mode
  //     tubeFlowRateKgHrInput is required (it is the process-fluid flow) and
  //     the shell-side coolant flow is the one back-calculated from duty.
  //     Tube inlet is hotter than tube outlet; shell outlet is hotter than
  //     shell inlet. Mutually exclusive with shellIsSteam (steam is a
  //     heating arrangement, not a cooling one).
  coolingSide?: CoolingSide;

  // Shell-side fluid
  shellFlowRateKgHr: number;
  shellInletTempC: number;
  shellOutletTempC: number;
  shellCpKjKgK: number;
  shellRhoKgM3: number;
  shellKfWmC: number;
  shellMuMNsM2: number;

  // Shell-side steam mode: when true, the shell side is condensing steam
  // rather than a single-phase sensible-heat fluid. Duty is then computed
  // from the tube side (tubeFlowRateKgHrInput, required in this mode)
  // instead of shell Cp*deltaT, and shellFlowRateKgHr/shellCpKjKgK/
  // shellRhoKgM3/shellKfWmC/shellMuMNsM2 above are ignored - inlet/outlet
  // temp is instead set to the saturation temperature at
  // shellSteamPressureBarA, and the shell-side film coefficient uses a
  // typical published condensing-coefficient estimate instead of Kern's
  // single-phase shell correlation. Only the shell side supports steam.
  shellIsSteam?: boolean;
  shellSteamPressureBarA?: number;
  // Entered tube-side mass flow rate. Required (and used as the process-fluid
  // flow) when shellIsSteam is true OR when coolingSide is "tube"; ignored in
  // the default shell-side-cooling mode, where the tube flow is derived.
  tubeFlowRateKgHrInput?: number;

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
