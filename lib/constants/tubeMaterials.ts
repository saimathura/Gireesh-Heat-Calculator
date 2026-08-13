export interface TubeMaterial {
  key: string;
  label: string;
  kwWM_C: number;
}

// Typical tube-wall thermal conductivity by material, near room/process
// temperature. Standard published values (Perry's Chemical Engineers'
// Handbook / engineering reference tables), not from your uploaded files -
// actual alloy grade and temperature shift these somewhat (e.g. 304 vs 316
// stainless differ by ~1 W/m.C), so treat as representative, not exact.
export const TUBE_MATERIALS: TubeMaterial[] = [
  { key: "copper", label: "Copper", kwWM_C: 385 },
  { key: "brass", label: "Brass", kwWM_C: 110 },
  { key: "aluminum", label: "Aluminum", kwWM_C: 205 },
  { key: "stainless-steel", label: "Stainless steel", kwWM_C: 16 },
  { key: "carbon-steel", label: "Carbon steel", kwWM_C: 50 },
];

export function findTubeMaterial(key: string): TubeMaterial | undefined {
  return TUBE_MATERIALS.find((m) => m.key === key);
}
