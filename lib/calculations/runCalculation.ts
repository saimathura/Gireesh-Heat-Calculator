import { calculateHeatDuty, calculateTubeFlowRate } from "@/lib/calculations/energyBalance";
import { runConvergenceLoop } from "@/lib/calculations/iterate";
import {
  calculateCorrectedLmtd,
  calculateF,
  calculateLmtd,
  calculateRS,
} from "@/lib/calculations/lmtd";
import { calculateNozzleSize } from "@/lib/calculations/nozzleSizing";
import {
  calculateShellSideDeltaP,
  calculateTubeSideDeltaP,
} from "@/lib/calculations/pressureDrop";
import { lookupK1N1 } from "@/lib/calculations/tubeGeometry";
import {
  CALIBRATED_RE_RANGE,
  DEFAULT_CONVERGENCE_TOLERANCE,
  PRESSURE_DROP_FAIL_THRESHOLD_BAR,
  PRESSURE_DROP_WARNING_THRESHOLD_BAR,
} from "@/lib/constants/physicalConstants";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";
import type { CalculationResult } from "@/lib/types/results";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";

export function runCalculation(
  inputs: HeatExchangerInputs,
  hiSelectionMode: HiSelectionMode,
): CalculationResult {
  heatExchangerInputsSchema.parse(inputs);

  const shellDtC = inputs.shellInletTempC - inputs.shellOutletTempC;
  const tubeDtC = inputs.tubeOutletTempC - inputs.tubeInletTempC;

  const heatDutyKw = calculateHeatDuty(
    inputs.shellFlowRateKgHr,
    inputs.shellCpKjKgK,
    shellDtC,
  );
  const tubeFlowRateKgS = calculateTubeFlowRate(
    heatDutyKw,
    inputs.tubeCpKjKgK,
    tubeDtC,
  );

  const lmtd = calculateLmtd(
    inputs.shellInletTempC,
    inputs.shellOutletTempC,
    inputs.tubeInletTempC,
    inputs.tubeOutletTempC,
  );
  const { r, s } = calculateRS(
    inputs.shellInletTempC,
    inputs.shellOutletTempC,
    inputs.tubeInletTempC,
    inputs.tubeOutletTempC,
  );
  const f = calculateF(r, s);
  const lmtdCorrected = calculateCorrectedLmtd(lmtd, f);

  const loop = runConvergenceLoop(
    inputs,
    heatDutyKw * 1000,
    lmtdCorrected,
    hiSelectionMode,
  );
  const { finalStep, finalDetail } = loop;

  const tubeDeltaP = calculateTubeSideDeltaP(
    finalDetail.reTube,
    inputs.passCount,
    inputs.tubeLengthMm,
    finalDetail.diMm,
    inputs.tubeRhoKgM3,
    finalDetail.tubeVelocityMs,
  );
  const shellDeltaP = calculateShellSideDeltaP(
    finalDetail.reShell,
    finalStep.shellDiameterMm,
    finalDetail.deMm,
    inputs.tubeLengthMm,
    finalDetail.baffleSpacingMm,
    inputs.shellRhoKgM3,
    finalDetail.shellVelocityMs,
  );

  const tubeNozzleMm = calculateNozzleSize(
    tubeFlowRateKgS,
    inputs.tubeRhoKgM3,
    finalDetail.tubeVelocityMs,
  );
  const shellNozzleMm = calculateNozzleSize(
    inputs.shellFlowRateKgHr / 3600,
    inputs.shellRhoKgM3,
    finalDetail.shellVelocityMs,
  );

  const { k1, n1 } = lookupK1N1(inputs.passCount);

  const tubeDeltaPOk = tubeDeltaP.bar <= PRESSURE_DROP_WARNING_THRESHOLD_BAR;
  const shellDeltaPOk = shellDeltaP.bar <= PRESSURE_DROP_WARNING_THRESHOLD_BAR;
  // hi Method B and ho are single-anchor-calibrated curve fits over the same
  // Reynolds range as the friction factors (see their doc comments) - a
  // design whose Re falls outside that range is extrapolated for ALL of
  // these correlations, not just pressure drop, so check both directly
  // rather than relying only on the pressure-drop functions' own flags.
  const tubeReOutOfRange =
    finalDetail.reTube < CALIBRATED_RE_RANGE.min ||
    finalDetail.reTube > CALIBRATED_RE_RANGE.max;
  const shellReOutOfRange =
    finalDetail.reShell < CALIBRATED_RE_RANGE.min ||
    finalDetail.reShell > CALIBRATED_RE_RANGE.max;
  const reynoldsOutOfCalibratedRange =
    tubeDeltaP.extrapolated ||
    shellDeltaP.extrapolated ||
    tubeReOutOfRange ||
    shellReOutOfRange;

  const messages: string[] = [];
  if (loop.converged) {
    messages.push(
      `Converged in ${loop.iterations.length} iteration${loop.iterations.length === 1 ? "" : "s"}.`,
    );
  } else {
    messages.push(
      `Did not converge after ${loop.iterations.length} iterations — check inputs, geometry may be infeasible.`,
    );
  }

  const percentVsInitial =
    ((finalStep.uCalculatedWM2C - inputs.initialUGuessWM2C) /
      inputs.initialUGuessWM2C) *
    100;
  messages.push(
    percentVsInitial < 0
      ? `Converged U is ${Math.abs(percentVsInitial).toFixed(1)}% below your initial assumed U (${inputs.initialUGuessWM2C} -> ${finalStep.uCalculatedWM2C.toFixed(1)} W/m²°C).`
      : `Converged U is ${percentVsInitial.toFixed(1)}% above your initial assumed U (${inputs.initialUGuessWM2C} -> ${finalStep.uCalculatedWM2C.toFixed(1)} W/m²°C).`,
  );

  if (!tubeDeltaPOk) {
    const failText =
      tubeDeltaP.bar > PRESSURE_DROP_FAIL_THRESHOLD_BAR ? "exceeds" : "approaches";
    messages.push(
      `Tube-side pressure drop (${tubeDeltaP.bar.toFixed(4)} bar) ${failText} the typical ${PRESSURE_DROP_WARNING_THRESHOLD_BAR}-${PRESSURE_DROP_FAIL_THRESHOLD_BAR} bar limit for liquids.`,
    );
  }
  if (!shellDeltaPOk) {
    const failText =
      shellDeltaP.bar > PRESSURE_DROP_FAIL_THRESHOLD_BAR ? "exceeds" : "approaches";
    messages.push(
      `Shell-side pressure drop (${shellDeltaP.bar.toFixed(4)} bar) ${failText} the typical ${PRESSURE_DROP_WARNING_THRESHOLD_BAR}-${PRESSURE_DROP_FAIL_THRESHOLD_BAR} bar limit for liquids.`,
    );
  }
  if (reynoldsOutOfCalibratedRange) {
    messages.push(
      "One or more Reynolds numbers fall outside the ~7,000-10,000 range that the digitized hi (Method B), ho, and friction-factor correlations were calibrated against — treat those results (including tube count, shell diameter, and U, not just pressure drop) as extrapolated and verify manually.",
    );
  }
  if (Math.abs(inputs.baffleCutPercent - 25) > 2) {
    messages.push(
      `Shell-side ho and the shell-side friction factor are only calibrated at a 25% baffle cut anchor point (this design uses ${inputs.baffleCutPercent}%) — baffle cut is not currently modeled as a variable in these correlations, so treat ho and shell-side ΔP as approximate for baffle cuts far from 25%.`,
    );
  }

  return {
    heatDutyKw,
    tubeFlowRateKgS,
    tubeFlowRateKgHr: tubeFlowRateKgS * 3600,
    lmtd,
    r,
    s,
    f,
    lmtdCorrected,

    iterations: loop.iterations,
    converged: loop.converged,
    finalUWM2C: finalStep.uCalculatedWM2C,
    iterationCount: loop.iterations.length,
    convergenceTolerance:
      inputs.convergenceTolerance ?? DEFAULT_CONVERGENCE_TOLERANCE,

    areaM2: finalStep.areaM2,
    tubeCount: finalStep.tubeCount,
    bundleDiameterMm: finalStep.bundleDiameterMm,
    shellDiameterMm: finalStep.shellDiameterMm,
    k1,
    n1,

    tubeSide: {
      diMm: finalDetail.diMm,
      re: finalDetail.reTube,
      pr: finalDetail.prTube,
      velocityMs: finalDetail.tubeVelocityMs,
    },
    shellSide: {
      deMm: finalDetail.deMm,
      re: finalDetail.reShell,
      pr: finalDetail.prShell,
      velocityMs: finalDetail.shellVelocityMs,
    },
    hiMethodAWM2C: finalStep.hiMethodAWM2C,
    hiMethodBWM2C: finalStep.hiMethodBWM2C,
    hiSelectedWM2C: finalStep.hiSelectedWM2C,
    hiSelectedSource: finalStep.hiSelectedSource,
    hoWM2C: finalStep.hoWM2C,

    pressureDrops: {
      tubeSideNM2: tubeDeltaP.nM2,
      tubeSideBar: tubeDeltaP.bar,
      shellSideNM2: shellDeltaP.nM2,
      shellSideBar: shellDeltaP.bar,
    },
    nozzles: { tubeSideMm: tubeNozzleMm, shellSideMm: shellNozzleMm },

    verdicts: {
      convergenceOk: loop.converged,
      tubeDeltaPOk,
      shellDeltaPOk,
      reynoldsOutOfCalibratedRange,
      messages,
    },
  };
}
