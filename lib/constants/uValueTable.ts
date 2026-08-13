/**
 * Typical overall heat-transfer coefficient (U) ranges by fluid pairing.
 * Source: user-supplied "OVER all U.pdf" (shell-and-tube "Typical Overall
 * Heat Transfer Coefficients" table). This app's shell side is always the
 * hot/cooling fluid and the tube side is always the cold/heating fluid
 * (enforced by inputSchema's refine checks), which matches the PDF's own
 * Hot Fluid / Cold Fluid columns - so lookups here are keyed the same way.
 */

export type UCategory =
  | "water"
  | "brine"
  | "organic-solvent"
  | "light-oil"
  | "heavy-oil"
  | "heat-transfer-oil"
  | "gas"
  | "steam";

/** Only the shell side can be condensing steam - the tube side can't. */
export type ColdUCategory = Exclude<UCategory, "steam">;

export const U_CATEGORY_LABELS: Record<UCategory, string> = {
  water: "Water",
  brine: "Brine / seawater",
  "organic-solvent": "Organic solvent",
  "light-oil": "Light oil",
  "heavy-oil": "Heavy oil",
  "heat-transfer-oil": "Heat-transfer oil",
  gas: "Gas",
  steam: "Steam (condensing)",
};

export interface URange {
  minWM2C: number;
  maxWM2C: number;
  source: string;
}

export interface USuggestion extends URange {
  midWM2C: number;
}

// Same-category ("X paired with X") ranges, taken directly from the PDF's
// "Heat Exchangers" section where available. Brine and heat-transfer oil
// have no literal self-paired row in the source table - they're
// approximated from the closest analogous row (noted per entry) and are
// only ever used as a fallback limiting-resistance estimate, never
// presented as a literal table value.
const SELF_PAIR: Record<ColdUCategory, URange> = {
  water: { minWM2C: 800, maxWM2C: 1500, source: "Water/Water — Heat Exchangers" },
  brine: {
    minWM2C: 800,
    maxWM2C: 1500,
    source: "No literal Brine/Brine row — approximated as Water/Water (brine's film coefficient is close to water's)",
  },
  "organic-solvent": {
    minWM2C: 100,
    maxWM2C: 300,
    source: "Organic solvents/Organic solvents — Heat Exchangers",
  },
  "light-oil": { minWM2C: 100, maxWM2C: 400, source: "Light oils/Light oils — Heat Exchangers" },
  "heavy-oil": { minWM2C: 50, maxWM2C: 300, source: "Heavy oils/Heavy oils — Heat Exchangers" },
  "heat-transfer-oil": {
    minWM2C: 50,
    maxWM2C: 300,
    source:
      "No literal self-paired row — approximated as Heavy oils/Heavy oils (heat-transfer oils run similarly viscous)",
  },
  gas: { minWM2C: 5, maxWM2C: 35, source: "Gases (p = atm)/Gases (p = atm) — Heat Exchangers" },
};

// Literal cross-category pairs from the PDF, keyed by an order-independent
// "a|b" pair (categories sorted alphabetically) since the source table's
// hot/cold direction for a fluid pair is really about the fluids involved,
// not which happens to be shell vs. tube.
function pairKey(a: UCategory, b: UCategory): string {
  return [a, b].sort().join("|");
}

const LITERAL_PAIRS = new Map<string, URange>([
  [pairKey("water", "water"), SELF_PAIR.water],
  [pairKey("organic-solvent", "organic-solvent"), SELF_PAIR["organic-solvent"]],
  [pairKey("light-oil", "light-oil"), SELF_PAIR["light-oil"]],
  [pairKey("heavy-oil", "heavy-oil"), SELF_PAIR["heavy-oil"]],
  [pairKey("gas", "gas"), SELF_PAIR.gas],
  [pairKey("organic-solvent", "water"), { minWM2C: 250, maxWM2C: 750, source: "Organic solvents/Water — Coolers" }],
  [pairKey("light-oil", "water"), { minWM2C: 350, maxWM2C: 700, source: "Light oils/Water — Coolers" }],
  [pairKey("heavy-oil", "water"), { minWM2C: 60, maxWM2C: 300, source: "Heavy oils/Water — Coolers" }],
  [pairKey("gas", "water"), { minWM2C: 20, maxWM2C: 300, source: "Gases/Water — Coolers" }],
  [pairKey("brine", "organic-solvent"), { minWM2C: 150, maxWM2C: 500, source: "Organic solvents/Brine — Coolers" }],
  [pairKey("brine", "water"), { minWM2C: 600, maxWM2C: 1200, source: "Water/Brine — Coolers" }],
  [pairKey("brine", "gas"), { minWM2C: 15, maxWM2C: 250, source: "Gases/Brine — Coolers" }],
  [pairKey("steam", "water"), { minWM2C: 1500, maxWM2C: 4000, source: "Steam/Water — Heaters" }],
  [pairKey("steam", "organic-solvent"), { minWM2C: 500, maxWM2C: 1000, source: "Steam/Organic solvents — Heaters" }],
  [pairKey("steam", "light-oil"), { minWM2C: 300, maxWM2C: 900, source: "Steam/Light oils — Heaters" }],
  [pairKey("steam", "heavy-oil"), { minWM2C: 60, maxWM2C: 450, source: "Steam/Heavy oils — Heaters" }],
  [pairKey("steam", "gas"), { minWM2C: 30, maxWM2C: 300, source: "Steam/Gases — Heaters" }],
  [
    pairKey("heat-transfer-oil", "heavy-oil"),
    { minWM2C: 50, maxWM2C: 300, source: "Heat Transfer (hot) Oil/Heavy oils — Heaters" },
  ],
  [pairKey("heat-transfer-oil", "gas"), { minWM2C: 20, maxWM2C: 200, source: "Heat Transfer (hot) Oil/Gases — Heaters" }],
]);

const midpoint = (r: URange): number => Math.round((r.minWM2C + r.maxWM2C) / 2);

/**
 * Suggested initial-U range for a shell(hot)/tube(cold) fluid pairing.
 * Prefers a literal PDF row; falls back to the lower-performing side's own
 * same-fluid range (limiting-resistance heuristic) when no literal row
 * covers this exact pairing, since overall U is dominated by whichever
 * side has the poorer film coefficient.
 */
export function estimateInitialU(hot: UCategory, cold: ColdUCategory): USuggestion {
  const literal = LITERAL_PAIRS.get(pairKey(hot, cold));
  if (literal) {
    return { ...literal, midWM2C: midpoint(literal) };
  }

  if (hot === "steam") {
    const self = SELF_PAIR[cold];
    return {
      ...self,
      midWM2C: midpoint(self),
      source: `Estimated: no literature value for Steam/${U_CATEGORY_LABELS[cold]} — condensing steam's film coefficient is high enough that ${U_CATEGORY_LABELS[cold]} is the limiting side, so its own typical range (${self.source}) is used as the estimate.`,
    };
  }

  const hotSelf = SELF_PAIR[hot];
  const coldSelf = SELF_PAIR[cold];
  const limiting = midpoint(hotSelf) <= midpoint(coldSelf) ? hot : cold;
  const limitingRange = SELF_PAIR[limiting];
  return {
    ...limitingRange,
    midWM2C: midpoint(limitingRange),
    source: `Estimated: no literature value for ${U_CATEGORY_LABELS[hot]}/${U_CATEGORY_LABELS[cold]} — limited by the lower-performing side (${U_CATEGORY_LABELS[limiting]}), using its own typical range (${limitingRange.source}).`,
  };
}
