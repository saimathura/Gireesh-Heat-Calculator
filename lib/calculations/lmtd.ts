/**
 * Log-mean temperature difference (counter-current).
 */
export function calculateLmtd(
  shellInC: number,
  shellOutC: number,
  tubeInC: number,
  tubeOutC: number,
): number {
  const dT1 = shellInC - tubeOutC;
  const dT2 = shellOutC - tubeInC;
  if (dT1 <= 0 || dT2 <= 0) {
    throw new Error(
      "Non-physical temperature approach: shell/tube temperatures cross (dT1 or dT2 <= 0). Check inlet/outlet temperature inputs.",
    );
  }
  if (dT1 === dT2) return dT1;
  return (dT1 - dT2) / Math.log(dT1 / dT2);
}

export function calculateRS(
  shellInC: number,
  shellOutC: number,
  tubeInC: number,
  tubeOutC: number,
): { r: number; s: number } {
  const tubeRise = tubeOutC - tubeInC;
  const shellApproach = shellInC - tubeInC;
  if (tubeRise === 0 || shellApproach === 0) {
    throw new Error(
      "Cannot compute R/S: tube-side temperature rise or shell-inlet/tube-inlet approach is zero.",
    );
  }
  const r = (shellInC - shellOutC) / tubeRise;
  const s = tubeRise / shellApproach;
  return { r, s };
}

/**
 * LMTD correction factor F, analytical Bowman/Mueller/Nagle form for
 * 1 shell pass, 2+ tube passes. Replaces manual R/S chart-reading.
 */
export function calculateF(r: number, s: number): number {
  let f: number;

  if (r === 1) {
    // Degenerate case of the Bowman/Mueller/Nagle form (R -> 1 limit).
    const denomArg = 2 - s * (2 - Math.SQRT2);
    const numArg = 2 - s * (2 + Math.SQRT2);
    f = (Math.SQRT2 * s) / (1 - s) / Math.log(denomArg / numArg);
  } else {
    const sqrtTerm = Math.sqrt(r * r + 1);
    const numerator = sqrtTerm * Math.log((1 - s) / (1 - r * s));
    const denomNumerator = 2 - s * (r + 1 - sqrtTerm);
    const denomDenominator = 2 - s * (r + 1 + sqrtTerm);
    const denominator = (r - 1) * Math.log(denomNumerator / denomDenominator);
    f = numerator / denominator;
  }

  // The Bowman/Mueller/Nagle form has several log() terms that go negative
  // (producing NaN) or blow up once R/S approach a temperature cross that
  // a 1-shell-pass/2+-tube-pass exchanger cannot physically achieve. Catch
  // that here rather than letting NaN/Infinity silently propagate through
  // area, tube count, and every downstream calculation.
  if (!Number.isFinite(f) || f <= 0 || f > 1) {
    throw new Error(
      `R=${r.toFixed(3)}, S=${s.toFixed(3)} is not achievable with a single-shell-pass exchanger (the LMTD correction factor is undefined or non-physical for this temperature combination) — this typically means a temperature cross that requires 2+ shell passes. Check inlet/outlet temperatures.`,
    );
  }

  return f;
}

export function calculateCorrectedLmtd(lmtd: number, f: number): number {
  return lmtd * f;
}
