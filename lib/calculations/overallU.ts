export interface OverallUParams {
  doMm: number;
  diMm: number;
  hi: number;
  hid: number;
  hod: number;
  ho: number;
  kw: number;
}

/**
 * Overall heat transfer coefficient from the resistance-in-series sum:
 * 1/U = do/(di*hi) + do*ln(do/di)/(2*Kw) + do/(di*hid) + 1/hod + 1/ho
 *
 * Note: do/di is used as a dimensionless ratio in the film/fouling terms
 * (mm/mm cancels), but the wall-conduction log term needs do in metres to
 * stay dimensionally consistent with Kw (W/m.K) and produce U in W/m^2.K.
 */
export function calculateOverallU({
  doMm,
  diMm,
  hi,
  hid,
  hod,
  ho,
  kw,
}: OverallUParams): number {
  const doOverDi = doMm / diMm;
  const doM = doMm / 1000;

  const tubeSideFilm = doOverDi / hi;
  const wallConduction = (doM * Math.log(doOverDi)) / (2 * kw);
  const tubeSideFouling = doOverDi / hid;
  const shellSideFouling = 1 / hod;
  const shellSideFilm = 1 / ho;

  const inverseU =
    tubeSideFilm +
    wallConduction +
    tubeSideFouling +
    shellSideFouling +
    shellSideFilm;

  return 1 / inverseU;
}
