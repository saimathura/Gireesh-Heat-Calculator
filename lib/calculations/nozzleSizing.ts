import {
  IN_TO_MM,
  M3_S_TO_GPM,
  MS_TO_FTPS,
} from "@/lib/constants/physicalConstants";

/**
 * Nozzle pipe diameter, sized from the stream's own mass flow and the
 * already-computed process velocity for that side (not a separately
 * assumed nozzle velocity): Diameter(in) = sqrt(0.408 * q_gpm / v_ftps).
 * @param flowRateKgS mass flow rate, kg/s
 * @param rhoKgM3 fluid density, kg/m^3
 * @param velocityMs process-side velocity for this stream, m/s
 * @returns nozzle diameter, mm
 */
export function calculateNozzleSize(
  flowRateKgS: number,
  rhoKgM3: number,
  velocityMs: number,
): number {
  const flowM3S = flowRateKgS / rhoKgM3;
  const flowGpm = flowM3S * M3_S_TO_GPM;
  const velocityFtps = velocityMs * MS_TO_FTPS;
  const diameterIn = Math.sqrt((0.408 * flowGpm) / velocityFtps);
  return diameterIn * IN_TO_MM;
}
