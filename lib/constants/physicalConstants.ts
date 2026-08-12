// Iteration defaults
export const DEFAULT_CONVERGENCE_TOLERANCE = 0.02; // 2%
export const DEFAULT_MAX_ITERATIONS = 25;

// Unit conversions
export const KG_HR_TO_KG_S = 1 / 3600;
export const M3_S_TO_GPM = 15850.3; // 1 m^3/s = 15850.3 US gallons/min
export const MS_TO_FTPS = 3.28084;
export const IN_TO_MM = 25.4;
export const NM2_TO_BAR = 1e-5;

// Tube-side hi Method B (Dittus-Boelter / Jh-chart equivalent) calibration:
// digitized correlation calibrated to the source design sheet's hand-read
// chart anchor at Re=7454 -> Jh=0.0033. Expect ~15-20% variance from other
// hand-read charts outside that Reynolds range.
export const HI_METHOD_B_JH_ANCHOR = { re: 7454, jh: 0.0033 };

// Shell-side ho (Kern/McAdams correlation) calibration anchor:
// Re=9471.475, 25% baffle cut -> Jh=0.0057 (<3% match to the source sheet).
export const HO_JH_ANCHOR = { re: 9471.475, jh: 0.0057 };

// Friction-factor calibration anchors (single-anchor fits — flag results far
// outside this Reynolds range as extrapolated).
export const CALIBRATED_RE_RANGE = { min: 7000, max: 10000 };
export const TUBE_JF_COEFFICIENT = 0.01963; // Jf = coeff * Re^-0.2, anchor Re=7454 -> Jf=0.0033
export const SHELL_JF_COEFFICIENT = 0.30583; // jf = coeff * Re^-0.2, anchor Re=9471, 25% baffle cut -> jf=0.049

// Pressure drop pass/fail threshold for liquids (bar)
export const PRESSURE_DROP_WARNING_THRESHOLD_BAR = 0.5;
export const PRESSURE_DROP_FAIL_THRESHOLD_BAR = 1.0;

// Nozzle sizing assumes water/liquid density-based volumetric flow reused
// from the process-side velocity already computed for the stream.
