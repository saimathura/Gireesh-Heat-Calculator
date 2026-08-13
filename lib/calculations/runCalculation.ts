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
import { calculateBaffleCount, lookupK1N1 } from "@/lib/calculations/tubeGeometry";
import {
  calculateSteamConsumptionKgS,
  interpolateSteamSaturation,
} from "@/lib/calculations/steamProperties";
import {
  CALIBRATED_RE_RANGE,
  DEFAULT_CONVERGENCE_TOLERANCE,
  PRESSURE_DROP_FAIL_THRESHOLD_BAR,
  PRESSURE_DROP_WARNING_THRESHOLD_BAR,
} from "@/lib/constants/physicalConstants";
import {
  STEAM_CONDENSING_FILM_COEFFICIENT_RANGE,
  STEAM_CONDENSING_FILM_COEFFICIENT_WM2C,
  STEAM_NOZZLE_DESIGN_VELOCITY_MS,
  STEAM_SPECIFIC_GAS_CONSTANT_J_KGK,
} from "@/lib/constants/steamTable";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";
import type { CalculationResult } from "@/lib/types/results";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";

export function runCalculation(
  inputs: HeatExchangerInputs,
  hiSelectionMode: HiSelectionMode,
): CalculationResult {
  heatExchangerInputsSchema.parse(inputs);

  const shellIsSteam = inputs.shellIsSteam ?? false;
  const tubeDtC = inputs.tubeOutletTempC - inputs.tubeInletTempC;

  let heatDutyKw: number;
  let steamTempC: number | null = null;
  let steamHfgKjKg: number | null = null;
  let steamConsumptionKgHr: number | null = null;

  if (shellIsSteam) {
    if (inputs.shellSteamPressureBarA === undefined || inputs.tubeFlowRateKgHrInput === undefined) {
      // Guarded by the zod schema's refine() checks - unreachable in
      // practice, but keeps this function's types honest without a
      // non-null assertion.
      throw new Error("Steam pressure and tube-side flow rate are required when the shell side is steam.");
    }
    const saturation = interpolateSteamSaturation(inputs.shellSteamPressureBarA);
    steamTempC = saturation.tempC;
    steamHfgKjKg = saturation.hfgKjKg;
    // Duty comes from the tube side's own energy balance (mdot*Cp*dT) since
    // the shell side is isothermal condensation, not a Cp*deltaT process.
    heatDutyKw = calculateHeatDuty(
      inputs.tubeFlowRateKgHrInput,
      inputs.tubeCpKjKgK,
      tubeDtC,
    );
    steamConsumptionKgHr = calculateSteamConsumptionKgS(heatDutyKw, steamHfgKjKg) * 3600;
  } else {
    const shellDtC = inputs.shellInletTempC - inputs.shellOutletTempC;
    heatDutyKw = calculateHeatDuty(
      inputs.shellFlowRateKgHr,
      inputs.shellCpKjKgK,
      shellDtC,
    );
  }

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
  // Kern's shell-side friction-factor correlation is for single-phase
  // cross-flow, not condensing vapor - shell-side pressure drop isn't
  // modeled for steam (report zero/not-modeled rather than a number
  // computed from placeholder liquid-like properties).
  const shellDeltaP = shellIsSteam
    ? { nM2: 0, bar: 0, extrapolated: false }
    : calculateShellSideDeltaP(
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
  // Steam nozzle: sized from derived steam consumption, an ideal-gas vapor
  // density estimate at the saturation condition, and a typical steam
  // line design velocity - not from the Kern cross-flow velocity used for
  // single-phase shell-side streams (physically wrong for a vapor).
  const shellNozzleMm = shellIsSteam
    ? calculateNozzleSize(
        (steamConsumptionKgHr as number) / 3600,
        ((inputs.shellSteamPressureBarA as number) * 1e5) /
          (STEAM_SPECIFIC_GAS_CONSTANT_J_KGK * ((steamTempC as number) + 273.15)),
        STEAM_NOZZLE_DESIGN_VELOCITY_MS,
      )
    : calculateNozzleSize(
        inputs.shellFlowRateKgHr / 3600,
        inputs.shellRhoKgM3,
        finalDetail.shellVelocityMs,
      );

  const { k1, n1 } = lookupK1N1(inputs.passCount);
  const baffleCount = calculateBaffleCount(
    inputs.tubeLengthMm,
    finalDetail.baffleSpacingMm,
  );

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
    !shellIsSteam &&
    (finalDetail.reShell < CALIBRATED_RE_RANGE.min ||
      finalDetail.reShell > CALIBRATED_RE_RANGE.max);
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
  if (shellIsSteam) {
    messages.push(
      `Shell side modeled as condensing steam at ${(steamTempC as number).toFixed(1)}°C (${steamHfgKjKg?.toFixed(1)} kJ/kg latent heat) — steam-side film coefficient uses a typical published value (${STEAM_CONDENSING_FILM_COEFFICIENT_WM2C} W/m²°C, literature range ${STEAM_CONDENSING_FILM_COEFFICIENT_RANGE.min}-${STEAM_CONDENSING_FILM_COEFFICIENT_RANGE.max}) rather than a Kern correlation computed from this design, and shell-side pressure drop is not modeled for condensing vapor. Steam consumption: ${steamConsumptionKgHr?.toFixed(1)} kg/hr.`,
    );
  } else if (Math.abs(inputs.baffleCutPercent - 25) > 2) {
    messages.push(
      `Shell-side ho and the shell-side friction factor are only calibrated at a 25% baffle cut anchor point (this design uses ${inputs.baffleCutPercent}%) — baffle cut is not currently modeled as a variable in these correlations, so treat ho and shell-side ΔP as approximate for baffle cuts far from 25%.`,
    );
  }

  return {
    heatDutyKw,
    tubeFlowRateKgS,
    tubeFlowRateKgHr: tubeFlowRateKgS * 3600,
    isSteam: shellIsSteam,
    steamTempC,
    steamHfgKjKg,
    steamConsumptionKgHr,
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
    tubeLengthMm: inputs.tubeLengthMm,
    baffleCount,
    baffleSpacingMm: finalDetail.baffleSpacingMm,

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
