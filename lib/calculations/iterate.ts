import { calculateHiMethodA } from "@/lib/calculations/hiMethodA";
import { calculateHiMethodB } from "@/lib/calculations/hiMethodB";
import { calculateOverallU } from "@/lib/calculations/overallU";
import {
  calculateHo,
  calculateShellPrandtl,
  calculateShellReynolds,
} from "@/lib/calculations/shellSideHo";
import {
  calculateBundleDiameter,
  calculateTubeCount,
  lookupK1N1,
  roundUpToStandardPipeSize,
} from "@/lib/calculations/tubeGeometry";
import { BUNDLE_SHELL_CLEARANCE_MM } from "@/lib/constants/standardPipeSizes";
import {
  DEFAULT_CONVERGENCE_TOLERANCE,
  DEFAULT_MAX_ITERATIONS,
} from "@/lib/constants/physicalConstants";
import type {
  HeatExchangerInputs,
  HiSelectionMode,
} from "@/lib/types/inputs";
import type { IterationStep } from "@/lib/types/results";

export interface IterationDetail {
  diMm: number;
  tubeVelocityMs: number;
  reTube: number;
  prTube: number;
  shellVelocityMs: number;
  deMm: number;
  reShell: number;
  prShell: number;
  baffleSpacingMm: number;
}

export interface ConvergenceLoopResult {
  iterations: IterationStep[];
  converged: boolean;
  finalStep: IterationStep;
  finalDetail: IterationDetail;
}

interface FixedGeometryInputs {
  odMm: number;
  wallThicknessMm: number;
  lengthMm: number;
  pitchRatio: number;
  passCount: HeatExchangerInputs["passCount"];
  baffleSpacingFraction: number;
}

interface ThermalInputs {
  tubeFlowRateKgS: number;
  tubeMeanTempC: number;
  tubeRhoKgM3: number;
  tubeCpKjKgK: number;
  tubeKfWmC: number;
  tubeMuMNsM2: number;
  shellFlowRateKgS: number;
  shellRhoKgM3: number;
  shellCpKjKgK: number;
  shellKfWmC: number;
  shellMuMNsM2: number;
  hidWM2C: number;
  hodWM2C: number;
  kwWM_C: number;
}

export function selectHi(
  hiMethodA: number,
  hiMethodB: number,
  mode: HiSelectionMode,
): { value: number; source: "A" | "B" } {
  if (mode === "methodA") return { value: hiMethodA, source: "A" };
  if (mode === "methodB") return { value: hiMethodB, source: "B" };
  return hiMethodA <= hiMethodB
    ? { value: hiMethodA, source: "A" }
    : { value: hiMethodB, source: "B" };
}

function runOneIteration(
  iteration: number,
  uGuess: number,
  heatDutyW: number,
  lmtdCorrected: number,
  geometry: FixedGeometryInputs,
  thermal: ThermalInputs,
  hiSelectionMode: HiSelectionMode,
  tolerance: number,
): { step: IterationStep; detail: IterationDetail } {
  const areaM2 = heatDutyW / (uGuess * lmtdCorrected);

  const { k1, n1 } = lookupK1N1(geometry.passCount);
  const tubeCount = calculateTubeCount(
    areaM2,
    geometry.odMm,
    geometry.lengthMm,
    geometry.passCount,
  );
  const bundleDiameterMm = calculateBundleDiameter(
    tubeCount,
    geometry.odMm,
    k1,
    n1,
  );
  const clearanceMm = BUNDLE_SHELL_CLEARANCE_MM.splitRingFloatingHead;
  const shellDiameterMm = roundUpToStandardPipeSize(
    bundleDiameterMm + clearanceMm,
  );

  // Tube-side flow & heat transfer
  const diMm = geometry.odMm - 2 * geometry.wallThicknessMm;
  const diM = diMm / 1000;
  const tubesPerPass = tubeCount / geometry.passCount;
  const tubeCsAreaM2 = (Math.PI / 4) * diM * diM;
  const tubeFlowAreaM2 = tubeCsAreaM2 * tubesPerPass;
  const gt = thermal.tubeFlowRateKgS / tubeFlowAreaM2;
  const tubeVelocityMs = gt / thermal.tubeRhoKgM3;

  const tubeMuPaS = thermal.tubeMuMNsM2 / 1000;
  const reTube = (thermal.tubeRhoKgM3 * tubeVelocityMs * diM) / tubeMuPaS;
  const prTube =
    (thermal.tubeCpKjKgK * 1000 * tubeMuPaS) / thermal.tubeKfWmC;

  const hiMethodAValue = calculateHiMethodA(
    thermal.tubeMeanTempC,
    tubeVelocityMs,
    diMm,
  );
  const hiMethodBValue = calculateHiMethodB(
    reTube,
    prTube,
    thermal.tubeKfWmC,
    diMm,
  );
  const { value: hiSelected, source: hiSelectedSource } = selectHi(
    hiMethodAValue,
    hiMethodBValue,
    hiSelectionMode,
  );

  // Shell-side flow & heat transfer
  const doM = geometry.odMm / 1000;
  const ptM = geometry.pitchRatio * doM;
  const shellIdM = shellDiameterMm / 1000; // shell wall thickness not part of the input contract
  const baffleSpacingM = geometry.baffleSpacingFraction * shellIdM;
  const crossFlowAreaM2 =
    ((ptM - doM) / ptM) * shellIdM * baffleSpacingM;
  const gs = thermal.shellFlowRateKgS / crossFlowAreaM2;
  const shellVelocityMs = gs / thermal.shellRhoKgM3;

  const deM = (1.1 / doM) * (ptM * ptM - 0.917 * doM * doM);
  const deMm = deM * 1000;
  const reShell = calculateShellReynolds(gs, deM, thermal.shellMuMNsM2);
  const prShell = calculateShellPrandtl(
    thermal.shellCpKjKgK,
    thermal.shellMuMNsM2,
    thermal.shellKfWmC,
  );
  const ho = calculateHo(
    gs,
    deMm,
    thermal.shellMuMNsM2,
    thermal.shellCpKjKgK,
    thermal.shellKfWmC,
    1,
  );

  const uCalculated = calculateOverallU({
    doMm: geometry.odMm,
    diMm,
    hi: hiSelected,
    hid: thermal.hidWM2C,
    hod: thermal.hodWM2C,
    ho,
    kw: thermal.kwWM_C,
  });

  const percentDelta = (uCalculated - uGuess) / uGuess;
  const converged = Math.abs(percentDelta) < tolerance;

  const step: IterationStep = {
    iteration,
    uGuessWM2C: uGuess,
    areaM2,
    tubeCount,
    bundleDiameterMm,
    shellDiameterMm,
    hiMethodAWM2C: hiMethodAValue,
    hiMethodBWM2C: hiMethodBValue,
    hiSelectedWM2C: hiSelected,
    hiSelectedSource,
    hoWM2C: ho,
    uCalculatedWM2C: uCalculated,
    percentDelta,
    converged,
  };

  const detail: IterationDetail = {
    diMm,
    tubeVelocityMs,
    reTube,
    prTube,
    shellVelocityMs,
    deMm,
    reShell,
    prShell,
    baffleSpacingMm: baffleSpacingM * 1000,
  };

  return { step, detail };
}

export function runConvergenceLoop(
  inputs: HeatExchangerInputs,
  heatDutyW: number,
  lmtdCorrected: number,
  hiSelectionMode: HiSelectionMode,
): ConvergenceLoopResult {
  const tolerance = inputs.convergenceTolerance ?? DEFAULT_CONVERGENCE_TOLERANCE;
  const maxIterations = inputs.maxIterations ?? DEFAULT_MAX_ITERATIONS;

  const geometry: FixedGeometryInputs = {
    odMm: inputs.tubeOdMm,
    wallThicknessMm: inputs.tubeWallThicknessMm,
    lengthMm: inputs.tubeLengthMm,
    pitchRatio: inputs.tubePitchRatio,
    passCount: inputs.passCount,
    baffleSpacingFraction: inputs.baffleSpacingFraction,
  };

  const tubeFlowRateKgS =
    heatDutyW / 1000 / (inputs.tubeCpKjKgK * (inputs.tubeOutletTempC - inputs.tubeInletTempC));

  const thermal: ThermalInputs = {
    tubeFlowRateKgS,
    tubeMeanTempC: (inputs.tubeInletTempC + inputs.tubeOutletTempC) / 2,
    tubeRhoKgM3: inputs.tubeRhoKgM3,
    tubeCpKjKgK: inputs.tubeCpKjKgK,
    tubeKfWmC: inputs.tubeKfWmC,
    tubeMuMNsM2: inputs.tubeMuMNsM2,
    shellFlowRateKgS: inputs.shellFlowRateKgHr / 3600,
    shellRhoKgM3: inputs.shellRhoKgM3,
    shellCpKjKgK: inputs.shellCpKjKgK,
    shellKfWmC: inputs.shellKfWmC,
    shellMuMNsM2: inputs.shellMuMNsM2,
    hidWM2C: inputs.hidWM2C,
    hodWM2C: inputs.hodWM2C,
    kwWM_C: inputs.kwWM_C,
  };

  const iterations: IterationStep[] = [];
  let uGuess = inputs.initialUGuessWM2C;
  let lastDetail: IterationDetail | undefined;

  for (let i = 1; i <= maxIterations; i++) {
    const { step, detail } = runOneIteration(
      i,
      uGuess,
      heatDutyW,
      lmtdCorrected,
      geometry,
      thermal,
      hiSelectionMode,
      tolerance,
    );
    iterations.push(step);
    lastDetail = detail;
    if (step.converged) {
      return { iterations, converged: true, finalStep: step, finalDetail: detail };
    }
    uGuess = step.uCalculatedWM2C;
  }

  return {
    iterations,
    converged: false,
    finalStep: iterations[iterations.length - 1],
    finalDetail: lastDetail as IterationDetail,
  };
}
