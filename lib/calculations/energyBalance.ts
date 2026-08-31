import { KG_HR_TO_KG_S } from "@/lib/constants/physicalConstants";
import type { HeatExchangerInputs } from "@/lib/types/inputs";

/**
 * Heat duty from the shell-side energy balance: Q = m_dot * Cp * dT.
 * @param shellFlowKgHr shell-side mass flow rate, kg/hr
 * @param cpKjKgK shell-side specific heat, kJ/kg.K
 * @param dtC shell-side inlet-outlet temperature difference, degC
 * @returns heat duty, kW
 */
export function calculateHeatDuty(
  shellFlowKgHr: number,
  cpKjKgK: number,
  dtC: number,
): number {
  const shellFlowKgS = shellFlowKgHr * KG_HR_TO_KG_S;
  return shellFlowKgS * cpKjKgK * dtC;
}

/**
 * Tube-side mass flow rate, back-calculated from the energy balance once
 * shell-side duty is known (tube-side flow is not an independent input).
 * @param heatDutyKw kW
 * @param tubeCpKjKgK kJ/kg.K
 * @param tubeDtC degC
 * @returns kg/s
 */
export function calculateTubeFlowRate(
  heatDutyKw: number,
  tubeCpKjKgK: number,
  tubeDtC: number,
): number {
  return heatDutyKw / (tubeCpKjKgK * tubeDtC);
}

export interface ResolvedStreamFlowsKgS {
  /** Tube-side mass flow rate, kg/s. */
  tubeFlowRateKgS: number;
  /** Shell-side (single-phase sensible) mass flow rate, kg/s. */
  shellFlowRateKgS: number;
}

/**
 * Resolve both stream mass flow rates from the duty, honoring the cooling
 * arrangement. Exactly one side's flow is a direct user input; the other is
 * back-calculated from Q = m*Cp*dT so the energy balance closes.
 *
 *  - coolingSide "shell" (default) and shell-side steam: shell-side flow is
 *    the entered value, tube-side flow is derived. (Unchanged legacy path -
 *    for steam the shell "flow" is only used for the informational shell
 *    Re/velocity that steam mode already flags as not physically meaningful.)
 *  - coolingSide "tube": the hot process fluid is in the tubes
 *    (tubeFlowRateKgHrInput entered) and the shell-side coolant flow is the
 *    one derived from duty.
 */
export function resolveStreamFlowsKgS(
  inputs: HeatExchangerInputs,
  heatDutyKw: number,
): ResolvedStreamFlowsKgS {
  const tubeSideCooling = inputs.coolingSide === "tube" && !inputs.shellIsSteam;

  if (tubeSideCooling) {
    if (inputs.tubeFlowRateKgHrInput === undefined) {
      // Guarded by the zod schema's refine() checks - unreachable in
      // practice, but keeps this function honest without a non-null assertion.
      throw new Error(
        "Tube-side flow rate is required for tube-side cooling (it is the process-fluid flow; the shell-side coolant flow is derived from duty).",
      );
    }
    const tubeFlowRateKgS = inputs.tubeFlowRateKgHrInput * KG_HR_TO_KG_S;
    // Shell side is the coolant here, being heated: Q = m_shell * Cp_shell *
    // (T_shell,out - T_shell,in).
    const shellFlowRateKgS = calculateTubeFlowRate(
      heatDutyKw,
      inputs.shellCpKjKgK,
      inputs.shellOutletTempC - inputs.shellInletTempC,
    );
    return { tubeFlowRateKgS, shellFlowRateKgS };
  }

  const shellFlowRateKgS = inputs.shellFlowRateKgHr / 3600;
  const tubeFlowRateKgS = calculateTubeFlowRate(
    heatDutyKw,
    inputs.tubeCpKjKgK,
    inputs.tubeOutletTempC - inputs.tubeInletTempC,
  );
  return { tubeFlowRateKgS, shellFlowRateKgS };
}
