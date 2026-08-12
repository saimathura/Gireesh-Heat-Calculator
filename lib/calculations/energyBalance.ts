import { KG_HR_TO_KG_S } from "@/lib/constants/physicalConstants";

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
