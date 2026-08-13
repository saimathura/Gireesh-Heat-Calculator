import type { UCategory } from "@/lib/constants/uValueTable";

export interface FluidPreset {
  key: string;
  label: string;
  category: "liquid";
  /** Drives the overall-U suggestion lookup in uValueTable.ts. */
  uCategory: UCategory;
  cpKjKgK: number;
  rhoKgM3: number;
  kfWmC: number;
  muMNsM2: number;
}

// Typical process-liquid properties near 20-25degC, order-of-magnitude
// figures from standard engineering references (Perry's Chemical
// Engineers' Handbook / Coulson & Richardson). These are a starting
// point, not a substitute for the fluid's actual datasheet - viscosity
// in particular varies strongly with temperature and grade, especially
// for oils. Water's values are tuned close to this app's own 116kW
// reference case for consistency.
export const FLUID_PRESETS: FluidPreset[] = [
  { key: "water", label: "Water", category: "liquid", uCategory: "water", cpKjKgK: 4.18, rhoKgM3: 995, kfWmC: 0.61, muMNsM2: 0.72 },
  { key: "seawater", label: "Seawater", category: "liquid", uCategory: "brine", cpKjKgK: 3.93, rhoKgM3: 1025, kfWmC: 0.60, muMNsM2: 0.95 },
  { key: "glycol50", label: "Ethylene glycol (50% aq.)", category: "liquid", uCategory: "organic-solvent", cpKjKgK: 3.28, rhoKgM3: 1075, kfWmC: 0.38, muMNsM2: 3.4 },
  { key: "kerosene", label: "Kerosene", category: "liquid", uCategory: "light-oil", cpKjKgK: 2.00, rhoKgM3: 810, kfWmC: 0.15, muMNsM2: 1.6 },
  { key: "diesel", label: "Light diesel oil", category: "liquid", uCategory: "light-oil", cpKjKgK: 1.90, rhoKgM3: 840, kfWmC: 0.14, muMNsM2: 3.5 },
  { key: "lube-oil", label: "Light lubricating oil", category: "liquid", uCategory: "heavy-oil", cpKjKgK: 1.88, rhoKgM3: 870, kfWmC: 0.13, muMNsM2: 35 },
  { key: "toluene", label: "Toluene", category: "liquid", uCategory: "organic-solvent", cpKjKgK: 1.70, rhoKgM3: 862, kfWmC: 0.13, muMNsM2: 0.59 },
  { key: "methanol", label: "Methanol", category: "liquid", uCategory: "organic-solvent", cpKjKgK: 2.51, rhoKgM3: 791, kfWmC: 0.20, muMNsM2: 0.54 },
];
