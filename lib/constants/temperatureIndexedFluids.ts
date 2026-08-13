import type { FluidPreset } from "@/lib/constants/fluidLibrary";
import type { UCategory } from "@/lib/constants/uValueTable";

export interface FluidPropertyRow {
  tempC: number;
  cpKjKgK: number;
  rhoKgM3: number;
  kfWmC: number;
  muMNsM2: number;
}

export type TempIndexedCategory = "gas" | "liquid";

export interface TempIndexedFluidPreset {
  key: string;
  label: string;
  category: TempIndexedCategory;
  /** Drives the overall-U suggestion lookup in uValueTable.ts. */
  uCategory: UCategory;
  sourceNote: string;
  table: FluidPropertyRow[];
}

// Air: dry air at 1 atm (0.987 atm), -50..1200degC.
// Source: AIR PROPERTIES table, AB&CO / TT Boilers (user-supplied Air_Properties.pdf,
// cross-checked against the same table embedded in air heater.xls columns Q:V).
const AIR_TABLE: FluidPropertyRow[] = [
  { tempC: -50, rhoKgM3: 1.57, cpKjKgK: 1.006, kfWmC: 0.02, muMNsM2: 0.0145 },
  { tempC: -30, rhoKgM3: 1.43, cpKjKgK: 1.006, kfWmC: 0.022, muMNsM2: 0.0155 },
  { tempC: -20, rhoKgM3: 1.377, cpKjKgK: 1.006, kfWmC: 0.023, muMNsM2: 0.01615 },
  { tempC: -10, rhoKgM3: 1.326, cpKjKgK: 1.006, kfWmC: 0.024, muMNsM2: 0.01663 },
  { tempC: 0, rhoKgM3: 1.275, cpKjKgK: 1.006, kfWmC: 0.025, muMNsM2: 0.0171 },
  { tempC: 5, rhoKgM3: 1.254, cpKjKgK: 1.006, kfWmC: 0.025, muMNsM2: 0.01728 },
  { tempC: 10, rhoKgM3: 1.232, cpKjKgK: 1.007, kfWmC: 0.025, muMNsM2: 0.0175 },
  { tempC: 15, rhoKgM3: 1.21, cpKjKgK: 1.007, kfWmC: 0.026, muMNsM2: 0.01772 },
  { tempC: 20, rhoKgM3: 1.188, cpKjKgK: 1.007, kfWmC: 0.026, muMNsM2: 0.01798 },
  { tempC: 25, rhoKgM3: 1.169, cpKjKgK: 1.007, kfWmC: 0.026, muMNsM2: 0.01819 },
  { tempC: 30, rhoKgM3: 1.15, cpKjKgK: 1.008, kfWmC: 0.027, muMNsM2: 0.0184 },
  { tempC: 35, rhoKgM3: 1.131, cpKjKgK: 1.008, kfWmC: 0.027, muMNsM2: 0.0186 },
  { tempC: 40, rhoKgM3: 1.112, cpKjKgK: 1.008, kfWmC: 0.028, muMNsM2: 0.01881 },
  { tempC: 45, rhoKgM3: 1.095, cpKjKgK: 1.008, kfWmC: 0.028, muMNsM2: 0.01904 },
  { tempC: 50, rhoKgM3: 1.079, cpKjKgK: 1.009, kfWmC: 0.028, muMNsM2: 0.01927 },
  { tempC: 55, rhoKgM3: 1.062, cpKjKgK: 1.009, kfWmC: 0.029, muMNsM2: 0.0195 },
  { tempC: 60, rhoKgM3: 1.045, cpKjKgK: 1.009, kfWmC: 0.029, muMNsM2: 0.01973 },
  { tempC: 65, rhoKgM3: 1.03, cpKjKgK: 1.009, kfWmC: 0.029, muMNsM2: 0.01998 },
  { tempC: 70, rhoKgM3: 1.016, cpKjKgK: 1.01, kfWmC: 0.03, muMNsM2: 0.02023 },
  { tempC: 75, rhoKgM3: 1.001, cpKjKgK: 1.01, kfWmC: 0.03, muMNsM2: 0.02048 },
  { tempC: 80, rhoKgM3: 0.986, cpKjKgK: 1.01, kfWmC: 0.03, muMNsM2: 0.02073 },
  { tempC: 85, rhoKgM3: 0.973, cpKjKgK: 1.011, kfWmC: 0.031, muMNsM2: 0.02095 },
  { tempC: 90, rhoKgM3: 0.959, cpKjKgK: 1.011, kfWmC: 0.031, muMNsM2: 0.02117 },
  { tempC: 100, rhoKgM3: 0.933, cpKjKgK: 1.012, kfWmC: 0.032, muMNsM2: 0.0216 },
  { tempC: 110, rhoKgM3: 0.909, cpKjKgK: 1.013, kfWmC: 0.033, muMNsM2: 0.02202 },
  { tempC: 120, rhoKgM3: 0.885, cpKjKgK: 1.014, kfWmC: 0.033, muMNsM2: 0.02243 },
  { tempC: 130, rhoKgM3: 0.864, cpKjKgK: 1.016, kfWmC: 0.034, muMNsM2: 0.02281 },
  { tempC: 140, rhoKgM3: 0.843, cpKjKgK: 1.017, kfWmC: 0.035, muMNsM2: 0.02319 },
  { tempC: 150, rhoKgM3: 0.823, cpKjKgK: 1.019, kfWmC: 0.035, muMNsM2: 0.0236 },
  { tempC: 160, rhoKgM3: 0.804, cpKjKgK: 1.02, kfWmC: 0.036, muMNsM2: 0.02401 },
  { tempC: 170, rhoKgM3: 0.786, cpKjKgK: 1.022, kfWmC: 0.037, muMNsM2: 0.02446 },
  { tempC: 180, rhoKgM3: 0.768, cpKjKgK: 1.023, kfWmC: 0.038, muMNsM2: 0.02491 },
  { tempC: 190, rhoKgM3: 0.752, cpKjKgK: 1.025, kfWmC: 0.038, muMNsM2: 0.02531 },
  { tempC: 200, rhoKgM3: 0.736, cpKjKgK: 1.026, kfWmC: 0.039, muMNsM2: 0.0257 },
  { tempC: 250, rhoKgM3: 0.666, cpKjKgK: 1.035, kfWmC: 0.043, muMNsM2: 0.02741 },
  { tempC: 300, rhoKgM3: 0.607, cpKjKgK: 1.046, kfWmC: 0.046, muMNsM2: 0.0292 },
  { tempC: 350, rhoKgM3: 0.557, cpKjKgK: 1.057, kfWmC: 0.05, muMNsM2: 0.03139 },
  { tempC: 400, rhoKgM3: 0.517, cpKjKgK: 1.069, kfWmC: 0.053, muMNsM2: 0.03255 },
  { tempC: 450, rhoKgM3: 0.481, cpKjKgK: 1.081, kfWmC: 0.056, muMNsM2: 0.034 },
  { tempC: 500, rhoKgM3: 0.45, cpKjKgK: 1.093, kfWmC: 0.058, muMNsM2: 0.0355 },
  { tempC: 600, rhoKgM3: 0.399, cpKjKgK: 1.116, kfWmC: 0.064, muMNsM2: 0.0383 },
  { tempC: 800, rhoKgM3: 0.324, cpKjKgK: 1.155, kfWmC: 0.071, muMNsM2: 0.04332 },
  { tempC: 1000, rhoKgM3: 0.273, cpKjKgK: 1.185, kfWmC: 0.077, muMNsM2: 0.04788 },
  { tempC: 1200, rhoKgM3: 0.235, cpKjKgK: 1.22, kfWmC: 0.095, muMNsM2: 0.055 },
];

// Nitrogen, carbon dioxide, methane and hydrogen: ideal-gas properties at 1 atm.
// Source: standard heat-transfer textbook gas property tables (Cengel, "Properties
// of Gases at 1 atm Pressure"), converted from SI (J/kg.K, kg/m.s) to this app's
// units (kJ/kg.K, mN.s/m2). Not from your uploaded files - you said internet
// tables were fine for gases beyond air.
const NITROGEN_TABLE: FluidPropertyRow[] = [
  { tempC: -50, rhoKgM3: 1.5299, cpKjKgK: 0.9573, kfWmC: 0.02001, muMNsM2: 0.0139 },
  { tempC: 0, rhoKgM3: 1.2498, cpKjKgK: 1.035, kfWmC: 0.02384, muMNsM2: 0.0164 },
  { tempC: 50, rhoKgM3: 1.0564, cpKjKgK: 1.042, kfWmC: 0.02746, muMNsM2: 0.01874 },
  { tempC: 100, rhoKgM3: 0.9149, cpKjKgK: 1.041, kfWmC: 0.0309, muMNsM2: 0.02094 },
  { tempC: 150, rhoKgM3: 0.8068, cpKjKgK: 1.043, kfWmC: 0.03416, muMNsM2: 0.023 },
  { tempC: 200, rhoKgM3: 0.7215, cpKjKgK: 1.05, kfWmC: 0.03727, muMNsM2: 0.02494 },
  { tempC: 300, rhoKgM3: 0.5956, cpKjKgK: 1.07, kfWmC: 0.04309, muMNsM2: 0.02849 },
  { tempC: 400, rhoKgM3: 0.5072, cpKjKgK: 1.095, kfWmC: 0.04848, muMNsM2: 0.03166 },
  { tempC: 500, rhoKgM3: 0.4416, cpKjKgK: 1.12, kfWmC: 0.05358, muMNsM2: 0.03451 },
  { tempC: 1000, rhoKgM3: 0.2681, cpKjKgK: 1.213, kfWmC: 0.07938, muMNsM2: 0.04594 },
];

const CARBON_DIOXIDE_TABLE: FluidPropertyRow[] = [
  { tempC: -50, rhoKgM3: 2.4035, cpKjKgK: 0.746, kfWmC: 0.01051, muMNsM2: 0.01129 },
  { tempC: 0, rhoKgM3: 1.9635, cpKjKgK: 0.811, kfWmC: 0.01456, muMNsM2: 0.01375 },
  { tempC: 50, rhoKgM3: 1.6597, cpKjKgK: 0.8666, kfWmC: 0.01858, muMNsM2: 0.01612 },
  { tempC: 100, rhoKgM3: 1.4373, cpKjKgK: 0.9148, kfWmC: 0.02257, muMNsM2: 0.01841 },
  { tempC: 150, rhoKgM3: 1.2675, cpKjKgK: 0.9574, kfWmC: 0.02652, muMNsM2: 0.02063 },
  { tempC: 200, rhoKgM3: 1.1336, cpKjKgK: 0.9952, kfWmC: 0.03044, muMNsM2: 0.02276 },
  { tempC: 300, rhoKgM3: 0.9358, cpKjKgK: 1.06, kfWmC: 0.03814, muMNsM2: 0.02682 },
  { tempC: 400, rhoKgM3: 0.7968, cpKjKgK: 1.112, kfWmC: 0.04565, muMNsM2: 0.03061 },
  { tempC: 500, rhoKgM3: 0.6937, cpKjKgK: 1.156, kfWmC: 0.05293, muMNsM2: 0.03416 },
  { tempC: 1000, rhoKgM3: 0.4213, cpKjKgK: 1.292, kfWmC: 0.08491, muMNsM2: 0.04898 },
];

const METHANE_TABLE: FluidPropertyRow[] = [
  { tempC: -50, rhoKgM3: 0.8761, cpKjKgK: 2.243, kfWmC: 0.02367, muMNsM2: 0.008564 },
  { tempC: 0, rhoKgM3: 0.7158, cpKjKgK: 2.217, kfWmC: 0.03042, muMNsM2: 0.01028 },
  { tempC: 50, rhoKgM3: 0.605, cpKjKgK: 2.302, kfWmC: 0.03766, muMNsM2: 0.01191 },
  { tempC: 100, rhoKgM3: 0.524, cpKjKgK: 2.443, kfWmC: 0.04534, muMNsM2: 0.01345 },
  { tempC: 150, rhoKgM3: 0.462, cpKjKgK: 2.611, kfWmC: 0.05344, muMNsM2: 0.01491 },
  { tempC: 200, rhoKgM3: 0.4132, cpKjKgK: 2.791, kfWmC: 0.06194, muMNsM2: 0.0163 },
  { tempC: 300, rhoKgM3: 0.3411, cpKjKgK: 3.158, kfWmC: 0.07996, muMNsM2: 0.01886 },
  { tempC: 400, rhoKgM3: 0.2904, cpKjKgK: 3.51, kfWmC: 0.09918, muMNsM2: 0.02119 },
  { tempC: 500, rhoKgM3: 0.2529, cpKjKgK: 3.836, kfWmC: 0.11933, muMNsM2: 0.02334 },
];

const HYDROGEN_TABLE: FluidPropertyRow[] = [
  { tempC: -50, rhoKgM3: 0.1101, cpKjKgK: 12.635, kfWmC: 0.1404, muMNsM2: 0.007293 },
  { tempC: 0, rhoKgM3: 0.08995, cpKjKgK: 13.92, kfWmC: 0.1652, muMNsM2: 0.008391 },
  { tempC: 50, rhoKgM3: 0.07603, cpKjKgK: 14.349, kfWmC: 0.1881, muMNsM2: 0.009427 },
  { tempC: 100, rhoKgM3: 0.06584, cpKjKgK: 14.473, kfWmC: 0.2095, muMNsM2: 0.01041 },
  { tempC: 150, rhoKgM3: 0.05806, cpKjKgK: 14.492, kfWmC: 0.2296, muMNsM2: 0.01136 },
  { tempC: 200, rhoKgM3: 0.05193, cpKjKgK: 14.482, kfWmC: 0.2486, muMNsM2: 0.01228 },
  { tempC: 300, rhoKgM3: 0.04287, cpKjKgK: 14.481, kfWmC: 0.2843, muMNsM2: 0.01403 },
  { tempC: 400, rhoKgM3: 0.0365, cpKjKgK: 14.54, kfWmC: 0.318, muMNsM2: 0.0157 },
  { tempC: 500, rhoKgM3: 0.03178, cpKjKgK: 14.653, kfWmC: 0.3509, muMNsM2: 0.0173 },
];

// Superheated water vapor (gas phase, not condensing) - occasionally useful when
// a process stream carries steam that stays fully vaporized (no phase change) at
// low pressure. For condensing steam, use the Steam category instead (fluidType
// "steam"), which models latent heat directly.
const WATER_VAPOR_TABLE: FluidPropertyRow[] = [
  { tempC: -50, rhoKgM3: 0.9839, cpKjKgK: 1.892, kfWmC: 0.01353, muMNsM2: 0.007187 },
  { tempC: 0, rhoKgM3: 0.8038, cpKjKgK: 1.874, kfWmC: 0.01673, muMNsM2: 0.008956 },
  { tempC: 50, rhoKgM3: 0.6794, cpKjKgK: 1.874, kfWmC: 0.02032, muMNsM2: 0.01078 },
  { tempC: 100, rhoKgM3: 0.5884, cpKjKgK: 1.887, kfWmC: 0.02429, muMNsM2: 0.01265 },
  { tempC: 150, rhoKgM3: 0.5189, cpKjKgK: 1.908, kfWmC: 0.02861, muMNsM2: 0.01456 },
  { tempC: 200, rhoKgM3: 0.464, cpKjKgK: 1.935, kfWmC: 0.03326, muMNsM2: 0.0165 },
  { tempC: 300, rhoKgM3: 0.3831, cpKjKgK: 1.997, kfWmC: 0.04345, muMNsM2: 0.02045 },
  { tempC: 400, rhoKgM3: 0.3262, cpKjKgK: 2.066, kfWmC: 0.05467, muMNsM2: 0.02446 },
  { tempC: 500, rhoKgM3: 0.284, cpKjKgK: 2.137, kfWmC: 0.06677, muMNsM2: 0.02847 },
];

// MOL Thermol 46 heat-transfer oil. Source: user-supplied "oil specific heat
// capacity.pdf" (MOL-LUB Ltd. datasheet), converted from kinematic viscosity
// (mm2/s) + density (g/cm3) to dynamic viscosity (mN.s/m2 = mm2/s * g/cm3).
const THERMAL_OIL_TABLE: FluidPropertyRow[] = [
  { tempC: 0, rhoKgM3: 889, cpKjKgK: 1.81, kfWmC: 0.134, muMNsM2: 486.02 },
  { tempC: 20, rhoKgM3: 876, cpKjKgK: 1.88, kfWmC: 0.132, muMNsM2: 110.93 },
  { tempC: 40, rhoKgM3: 863, cpKjKgK: 1.95, kfWmC: 0.131, muMNsM2: 37.63 },
  { tempC: 50, rhoKgM3: 857, cpKjKgK: 1.99, kfWmC: 0.13, muMNsM2: 24.38 },
  { tempC: 100, rhoKgM3: 824, cpKjKgK: 2.17, kfWmC: 0.126, muMNsM2: 5.356 },
  { tempC: 150, rhoKgM3: 790, cpKjKgK: 2.35, kfWmC: 0.123, muMNsM2: 2.165 },
  { tempC: 200, rhoKgM3: 756, cpKjKgK: 2.53, kfWmC: 0.119, muMNsM2: 1.179 },
  { tempC: 250, rhoKgM3: 720, cpKjKgK: 2.71, kfWmC: 0.116, muMNsM2: 0.7416 },
  { tempC: 300, rhoKgM3: 684, cpKjKgK: 2.9, kfWmC: 0.112, muMNsM2: 0.513 },
  { tempC: 310, rhoKgM3: 677, cpKjKgK: 2.93, kfWmC: 0.111, muMNsM2: 0.4807 },
  { tempC: 330, rhoKgM3: 662, cpKjKgK: 3.0, kfWmC: 0.11, muMNsM2: 0.4171 },
];

export const TEMP_INDEXED_FLUID_PRESETS: TempIndexedFluidPreset[] = [
  {
    key: "air",
    label: "Air",
    category: "gas",
    uCategory: "gas",
    sourceNote:
      "AB&CO / TT Boilers air property table, -50 to 1200degC (user-supplied Air_Properties.pdf).",
    table: AIR_TABLE,
  },
  {
    key: "nitrogen",
    label: "Nitrogen (N2)",
    category: "gas",
    uCategory: "gas",
    sourceNote: "Standard published ideal-gas property table at 1 atm.",
    table: NITROGEN_TABLE,
  },
  {
    key: "flue-gas",
    label: "Flue / combustion gas (approx. as N2)",
    category: "gas",
    uCategory: "gas",
    sourceNote:
      "No direct flue-gas table was available; combustion flue gas is 70-75% nitrogen by mass, so nitrogen's properties are used as a standard sizing approximation - this matches the grouping in your own AB&CO boiler-properties.xls, which lists 'Air / Flue gas / Nitrogen' as one category. For higher accuracy, source your fuel's actual flue-gas analysis (CO2/H2O/O2 fractions vary with excess air).",
    table: NITROGEN_TABLE,
  },
  {
    key: "carbon-dioxide",
    label: "Carbon dioxide (CO2)",
    category: "gas",
    uCategory: "gas",
    sourceNote: "Standard published ideal-gas property table at 1 atm.",
    table: CARBON_DIOXIDE_TABLE,
  },
  {
    key: "methane",
    label: "Methane / natural gas (CH4)",
    category: "gas",
    uCategory: "gas",
    sourceNote: "Standard published ideal-gas property table at 1 atm.",
    table: METHANE_TABLE,
  },
  {
    key: "hydrogen",
    label: "Hydrogen (H2)",
    category: "gas",
    uCategory: "gas",
    sourceNote: "Standard published ideal-gas property table at 1 atm.",
    table: HYDROGEN_TABLE,
  },
  {
    key: "water-vapor",
    label: "Water vapor (superheated, non-condensing)",
    category: "gas",
    uCategory: "gas",
    sourceNote:
      "Standard published ideal-gas property table at 1 atm. For condensing steam use the Steam category instead.",
    table: WATER_VAPOR_TABLE,
  },
  {
    key: "thermal-oil",
    label: "Thermal oil (MOL Thermol 46)",
    category: "liquid",
    uCategory: "heat-transfer-oil",
    sourceNote: "MOL-LUB Ltd. datasheet (user-supplied oil specific heat capacity.pdf).",
    table: THERMAL_OIL_TABLE,
  },
];

/**
 * Linear interpolation of a temperature-indexed property table at tempC.
 * Clamps to the table's endpoints outside its range (flagged via `clamped`)
 * rather than extrapolating silently.
 */
export function interpolateFluidProperties(
  table: FluidPropertyRow[],
  tempC: number,
): { row: Omit<FluidPropertyRow, "tempC">; clamped: boolean } {
  const toRow = (r: FluidPropertyRow): Omit<FluidPropertyRow, "tempC"> => ({
    cpKjKgK: r.cpKjKgK,
    rhoKgM3: r.rhoKgM3,
    kfWmC: r.kfWmC,
    muMNsM2: r.muMNsM2,
  });

  const sorted = [...table].sort((a, b) => a.tempC - b.tempC);
  if (tempC <= sorted[0].tempC) {
    return { row: toRow(sorted[0]), clamped: tempC < sorted[0].tempC };
  }
  const last = sorted[sorted.length - 1];
  if (tempC >= last.tempC) {
    return { row: toRow(last), clamped: tempC > last.tempC };
  }

  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].tempC <= tempC && sorted[i + 1].tempC >= tempC) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }
  const span = upper.tempC - lower.tempC;
  const frac = span === 0 ? 0 : (tempC - lower.tempC) / span;
  const lerp = (a: number, b: number) => a + (b - a) * frac;

  return {
    row: {
      cpKjKgK: lerp(lower.cpKjKgK, upper.cpKjKgK),
      rhoKgM3: lerp(lower.rhoKgM3, upper.rhoKgM3),
      kfWmC: lerp(lower.kfWmC, upper.kfWmC),
      muMNsM2: lerp(lower.muMNsM2, upper.muMNsM2),
    },
    clamped: false,
  };
}

export function findTempIndexedPreset(key: string): TempIndexedFluidPreset | undefined {
  return TEMP_INDEXED_FLUID_PRESETS.find((p) => p.key === key);
}

// Re-exported so callers only need one import for "all presets, fixed or
// temperature-indexed" style UI code.
export type { FluidPreset };
