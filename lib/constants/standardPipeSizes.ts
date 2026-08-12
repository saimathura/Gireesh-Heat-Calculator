// Nominal shell OD sizes (mm) — common ANSI/DIN pipe sizes used for TEMA shell courses.
// This is a placeholder table (the source design sheet did not expose its own lookup);
// verify against a fabricator's actual pipe schedule before using for procurement.
export const STANDARD_SHELL_PIPE_SIZES_MM = [
  150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850,
  900, 1000, 1100, 1200, 1400,
] as const;

// TEMA-type bundle-to-shell clearance allowances (mm), added to the calculated
// bundle diameter before rounding up to a standard shell size.
export const BUNDLE_SHELL_CLEARANCE_MM: Record<string, number> = {
  fixedTubesheet: 10,
  splitRingFloatingHead: 12,
  pullThroughFloatingHead: 20,
  uTube: 10,
};

export function roundUpToStandardPipeSize(diameterMm: number): number {
  const match = STANDARD_SHELL_PIPE_SIZES_MM.find((size) => size >= diameterMm);
  if (!match) {
    const largest =
      STANDARD_SHELL_PIPE_SIZES_MM[STANDARD_SHELL_PIPE_SIZES_MM.length - 1];
    throw new Error(
      `Required shell diameter ${diameterMm.toFixed(1)}mm exceeds the largest standard size (${largest}mm). Design may be infeasible with a single shell, or the table needs extending.`,
    );
  }
  return match;
}
