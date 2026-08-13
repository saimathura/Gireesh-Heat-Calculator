export interface IterationStep {
  iteration: number;
  uGuessWM2C: number;
  areaM2: number;
  tubeCount: number;
  bundleDiameterMm: number;
  shellDiameterMm: number;
  hiMethodAWM2C: number;
  hiMethodBWM2C: number;
  hiSelectedWM2C: number;
  hiSelectedSource: "A" | "B";
  hoWM2C: number;
  uCalculatedWM2C: number;
  percentDelta: number; // (uCalculated - uGuess) / uGuess
  converged: boolean;
}

export interface CalculationResult {
  // Duty & LMTD
  heatDutyKw: number;
  tubeFlowRateKgS: number;
  tubeFlowRateKgHr: number;
  isSteam: boolean;
  steamTempC: number | null;
  steamHfgKjKg: number | null;
  steamConsumptionKgHr: number | null;
  lmtd: number;
  r: number;
  s: number;
  f: number;
  lmtdCorrected: number;

  // Iteration / convergence
  iterations: IterationStep[];
  converged: boolean;
  finalUWM2C: number;
  iterationCount: number;
  convergenceTolerance: number;

  // Geometry (final, converged)
  areaM2: number;
  tubeCount: number;
  bundleDiameterMm: number;
  shellDiameterMm: number;
  k1: number;
  n1: number;
  tubeLengthMm: number;
  baffleCount: number;
  baffleSpacingMm: number;

  // Flow / heat transfer detail
  tubeSide: { diMm: number; re: number; pr: number; velocityMs: number };
  shellSide: { deMm: number; re: number; pr: number; velocityMs: number };
  hiMethodAWM2C: number;
  hiMethodBWM2C: number;
  hiSelectedWM2C: number;
  hiSelectedSource: "A" | "B";
  hoWM2C: number;

  // Pressure drops & nozzles
  pressureDrops: {
    tubeSideNM2: number;
    tubeSideBar: number;
    shellSideNM2: number;
    shellSideBar: number;
  };
  nozzles: { tubeSideMm: number; shellSideMm: number };

  // Verdicts
  verdicts: {
    convergenceOk: boolean;
    tubeDeltaPOk: boolean;
    shellDeltaPOk: boolean;
    reynoldsOutOfCalibratedRange: boolean;
    messages: string[];
  };
}
