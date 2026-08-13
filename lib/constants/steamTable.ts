/**
 * Saturated steam table: pressure (bar absolute) -> saturation temperature
 * (degC) and latent heat of evaporation / condensation (kJ/kg).
 * Source: user-supplied "steam heat balance.xlsx" ("Database for vanddamp i
 * torrmaettet tilstand" - saturated steam database), 0.1-50 bara.
 */
export interface SteamSaturationRow {
  pressureBarA: number;
  tempC: number;
  hfgKjKg: number;
}

export const STEAM_SATURATION_TABLE: SteamSaturationRow[] = [
  { pressureBarA: 0.1, tempC: 45.8, hfgKjKg: 2392.97 },
  { pressureBarA: 0.15, tempC: 53.997, hfgKjKg: 2373.2 },
  { pressureBarA: 0.173, tempC: 57, hfgKjKg: 2366 },
  { pressureBarA: 0.2, tempC: 60.1, hfgKjKg: 2358.45 },
  { pressureBarA: 0.25, tempC: 64.992, hfgKjKg: 2346.4 },
  { pressureBarA: 0.3, tempC: 69.5, hfgKjKg: 2334 },
  { pressureBarA: 0.35, tempC: 72.5, hfgKjKg: 2323.5 },
  { pressureBarA: 0.375, tempC: 74.193, hfgKjKg: 2321.25 },
  { pressureBarA: 0.4, tempC: 75.886, hfgKjKg: 2319 },
  { pressureBarA: 0.45, tempC: 78.693, hfgKjKg: 2311.5 },
  { pressureBarA: 0.5, tempC: 81.5, hfgKjKg: 2304 },
  { pressureBarA: 0.65, tempC: 87.5, hfgKjKg: 2289 },
  { pressureBarA: 0.8, tempC: 93.5, hfgKjKg: 2274 },
  { pressureBarA: 1, tempC: 99.63, hfgKjKg: 2257.89 },
  { pressureBarA: 1.06, tempC: 101.3, hfgKjKg: 2254.3 },
  { pressureBarA: 1.1, tempC: 102.32, hfgKjKg: 2250.76 },
  { pressureBarA: 1.3, tempC: 106.81, hfgKjKg: 2238.555 },
  { pressureBarA: 1.5, tempC: 111.3, hfgKjKg: 2226.35 },
  { pressureBarA: 1.75, tempC: 115.75, hfgKjKg: 2213.975 },
  { pressureBarA: 2, tempC: 120.2, hfgKjKg: 2201.6 },
  { pressureBarA: 2.25, tempC: 123.8, hfgKjKg: 2191.35 },
  { pressureBarA: 2.5, tempC: 127.4, hfgKjKg: 2181.1 },
  { pressureBarA: 2.75, tempC: 130.45, hfgKjKg: 2172.185 },
  { pressureBarA: 3, tempC: 133.5, hfgKjKg: 2163.27 },
  { pressureBarA: 3.5, tempC: 138.9, hfgKjKg: 2147.37 },
  { pressureBarA: 4, tempC: 143.6, hfgKjKg: 2132.93 },
  { pressureBarA: 4.5, tempC: 147.9, hfgKjKg: 2119.76 },
  { pressureBarA: 5, tempC: 151.8, hfgKjKg: 2107.38 },
  { pressureBarA: 5.5, tempC: 155.5, hfgKjKg: 2095.9 },
  { pressureBarA: 6, tempC: 158.8, hfgKjKg: 2085.08 },
  { pressureBarA: 6.2, tempC: 160, hfgKjKg: 2081.3 },
  { pressureBarA: 6.5, tempC: 162, hfgKjKg: 2074.77 },
  { pressureBarA: 6.7, tempC: 163, hfgKjKg: 2071.4 },
  { pressureBarA: 7, tempC: 165, hfgKjKg: 2064.94 },
  { pressureBarA: 7.5, tempC: 167.8, hfgKjKg: 2055.5 },
  { pressureBarA: 8, tempC: 170.4, hfgKjKg: 2046.56 },
  { pressureBarA: 8.5, tempC: 172.9, hfgKjKg: 2037.87 },
  { pressureBarA: 9, tempC: 175.4, hfgKjKg: 2029.46 },
  { pressureBarA: 9.5, tempC: 177.7, hfgKjKg: 2021.38 },
  { pressureBarA: 10, tempC: 179.9, hfgKjKg: 2013.59 },
  { pressureBarA: 10.5, tempC: 182, hfgKjKg: 2006.4 },
  { pressureBarA: 11, tempC: 184.1, hfgKjKg: 1998.58 },
  { pressureBarA: 11.5, tempC: 186, hfgKjKg: 1991.3 },
  { pressureBarA: 11.7, tempC: 187, hfgKjKg: 1988.48 },
  { pressureBarA: 12, tempC: 188, hfgKjKg: 1984.27 },
  { pressureBarA: 12.2, tempC: 188.7, hfgKjKg: 1981.57 },
  { pressureBarA: 13, tempC: 191.6, hfgKjKg: 1970.7 },
  { pressureBarA: 13.5, tempC: 193.3, hfgKjKg: 1964.1 },
  { pressureBarA: 14, tempC: 195, hfgKjKg: 1957.73 },
  { pressureBarA: 14.5, tempC: 196.8, hfgKjKg: 1951.6 },
  { pressureBarA: 15, tempC: 198.3, hfgKjKg: 1945.24 },
  { pressureBarA: 15.5, tempC: 199.85, hfgKjKg: 1939.2 },
  { pressureBarA: 16, tempC: 201.4, hfgKjKg: 1933.14 },
  { pressureBarA: 16.5, tempC: 202.86, hfgKjKg: 1927.3 },
  { pressureBarA: 17, tempC: 204.3, hfgKjKg: 1921.56 },
  { pressureBarA: 17.5, tempC: 205.72, hfgKjKg: 1915.9 },
  { pressureBarA: 18, tempC: 207.1, hfgKjKg: 1910.23 },
  { pressureBarA: 18.5, tempC: 208.47, hfgKjKg: 1904.7 },
  { pressureBarA: 19, tempC: 209.8, hfgKjKg: 1899.29 },
  { pressureBarA: 19.5, tempC: 211.1, hfgKjKg: 1893 },
  { pressureBarA: 20, tempC: 212.4, hfgKjKg: 1888.61 },
  { pressureBarA: 21, tempC: 214.8, hfgKjKg: 1878.38 },
  { pressureBarA: 22, tempC: 217.2, hfgKjKg: 1868.15 },
  { pressureBarA: 23, tempC: 219.5, hfgKjKg: 1858.31 },
  { pressureBarA: 24, tempC: 221.8, hfgKjKg: 1848.47 },
  { pressureBarA: 25, tempC: 223.9, hfgKjKg: 1839.075 },
  { pressureBarA: 26, tempC: 226, hfgKjKg: 1829.68 },
  { pressureBarA: 26.5, tempC: 227, hfgKjKg: 1825.1 },
  { pressureBarA: 27, tempC: 228, hfgKjKg: 1820.6 },
  { pressureBarA: 27.5, tempC: 229, hfgKjKg: 1815.8 },
  { pressureBarA: 28, tempC: 230, hfgKjKg: 1811.52 },
  { pressureBarA: 29, tempC: 231.9, hfgKjKg: 1802.71 },
  { pressureBarA: 30, tempC: 233.8, hfgKjKg: 1793.9 },
  { pressureBarA: 31, tempC: 235.7, hfgKjKg: 1785.4 },
  { pressureBarA: 33, tempC: 239.18, hfgKjKg: 1768.6 },
  { pressureBarA: 35, tempC: 242.5, hfgKjKg: 1752.2 },
  { pressureBarA: 37, tempC: 245, hfgKjKg: 1736.2 },
  { pressureBarA: 40, tempC: 250, hfgKjKg: 1712.9 },
  { pressureBarA: 42, tempC: 253, hfgKjKg: 1697.8 },
  { pressureBarA: 45, tempC: 257, hfgKjKg: 1675.6 },
  { pressureBarA: 47, tempC: 260, hfgKjKg: 1661.1 },
  { pressureBarA: 50, tempC: 264, hfgKjKg: 1639.7 },
];

// Typical film heat-transfer coefficient for steam condensing on the outside
// of a horizontal tube bundle. Source: general literature range (Kern's
// Process Heat Transfer / Perry's Chemical Engineers' Handbook), cross-
// checked against the "Heaters: Steam / Water" overall-U entry in the
// user-supplied OVER-all-U.pdf (1500-4000 W/m2K overall, which is consistent
// with a much higher condensing FILM coefficient once fouling/wall/other-side
// film resistances are stacked in series). This is an assumed literature
// value, not a Kern correlation computed from this design's own Re/Pr - it
// does not vary with this app's geometry inputs.
export const STEAM_CONDENSING_FILM_COEFFICIENT_WM2C = 8000;
export const STEAM_CONDENSING_FILM_COEFFICIENT_RANGE = { min: 6000, max: 15000 };

// Specific gas constant for steam (R / M = 8314.5 / 18.015 J/kg.K), used for
// an ideal-gas vapor density estimate when sizing the steam inlet nozzle.
export const STEAM_SPECIFIC_GAS_CONSTANT_J_KGK = 461.5;

// Typical design velocity for saturated steam piping (literature range is
// roughly 20-40 m/s depending on pressure/quality; this is a representative
// mid-range value, not computed from this design's own geometry).
export const STEAM_NOZZLE_DESIGN_VELOCITY_MS = 30;
