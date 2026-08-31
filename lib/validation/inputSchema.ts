import { z } from "zod";
import { PASS_COUNTS } from "@/lib/types/inputs";

const positiveNumber = (label: string) =>
  z.number({ error: `${label} must be a number` }).positive({
    error: `${label} must be greater than 0`,
  });

export const heatExchangerInputsSchema = z
  .object({
    coolingSide: z.enum(["shell", "tube"]).optional(),
    shellFlowRateKgHr: positiveNumber("Shell-side flow rate"),
    shellInletTempC: z.number({ error: "Shell inlet temperature must be a number" }),
    shellOutletTempC: z.number({ error: "Shell outlet temperature must be a number" }),
    shellCpKjKgK: positiveNumber("Shell-side Cp"),
    shellRhoKgM3: positiveNumber("Shell-side density"),
    shellKfWmC: positiveNumber("Shell-side thermal conductivity"),
    shellMuMNsM2: positiveNumber("Shell-side viscosity"),

    shellIsSteam: z.boolean().optional(),
    shellSteamPressureBarA: z
      .number({ error: "Steam pressure must be a number" })
      .positive({ error: "Steam pressure must be greater than 0" })
      .optional(),
    tubeFlowRateKgHrInput: z
      .number({ error: "Tube-side flow rate must be a number" })
      .positive({ error: "Tube-side flow rate must be greater than 0" })
      .optional(),

    tubeInletTempC: z.number({ error: "Tube inlet temperature must be a number" }),
    tubeOutletTempC: z.number({ error: "Tube outlet temperature must be a number" }),
    tubeCpKjKgK: positiveNumber("Tube-side Cp"),
    tubeRhoKgM3: positiveNumber("Tube-side density"),
    tubeKfWmC: positiveNumber("Tube-side thermal conductivity"),
    tubeMuMNsM2: positiveNumber("Tube-side viscosity"),

    tubeOdMm: positiveNumber("Tube OD"),
    tubeWallThicknessMm: positiveNumber("Tube wall thickness"),
    tubeLengthMm: positiveNumber("Tube length"),
    tubePitchRatio: z
      .number({ error: "Tube pitch ratio must be a number" })
      .min(1, { error: "Tube pitch ratio must be at least 1 (pitch >= OD)" }),
    passCount: z.union(
      [z.literal(1), z.literal(2), z.literal(4), z.literal(6), z.literal(8)],
      { error: `Number of tube passes must be one of: ${PASS_COUNTS.join(", ")}` },
    ),

    baffleCutPercent: z
      .number({ error: "Baffle cut must be a number" })
      .min(0, { error: "Baffle cut must be at least 0%" })
      .max(100, { error: "Baffle cut cannot exceed 100%" }),
    baffleSpacingFraction: z
      .number({ error: "Baffle spacing fraction must be a number" })
      .min(0.2, { error: "Baffle spacing fraction must be at least 0.2 (of shell ID)" })
      .max(1.0, { error: "Baffle spacing fraction cannot exceed 1.0 (of shell ID)" }),

    hodWM2C: positiveNumber("Shell-side fouling factor (hod)"),
    hidWM2C: positiveNumber("Tube-side fouling factor (hid)"),
    kwWM_C: positiveNumber("Tube wall thermal conductivity (Kw)"),

    initialUGuessWM2C: positiveNumber("Initial assumed U"),
    convergenceTolerance: z
      .number({ error: "Convergence tolerance must be a number" })
      .positive({ error: "Convergence tolerance must be greater than 0" })
      .max(0.5, { error: "Convergence tolerance above 50% is not meaningful" })
      .optional(),
    maxIterations: z
      .number({ error: "Max iterations must be a number" })
      .int({ error: "Max iterations must be a whole number" })
      .positive({ error: "Max iterations must be greater than 0" })
      .max(1000, { error: "Max iterations above 1000 is not practical" })
      .optional(),
  })
  .refine(
    (data) => !(data.shellIsSteam && data.coolingSide === "tube"),
    {
      error:
        "Shell-side steam and tube-side cooling can't be combined — steam mode is a heating arrangement with the process fluid already in the tubes",
      path: ["coolingSide"],
    },
  )
  // Shell-side direction. Default / steam: shell is the hot side (or
  // isothermal), so outlet <= inlet. Tube-side cooling: the shell fluid is
  // the coolant and is heated, so outlet > inlet.
  .refine(
    (data) =>
      data.shellIsSteam ||
      data.coolingSide === "tube" ||
      data.shellOutletTempC < data.shellInletTempC,
    {
      error: "Shell-side outlet temperature must be lower than inlet temperature (shell is being cooled)",
      path: ["shellOutletTempC"],
    },
  )
  .refine(
    (data) =>
      data.coolingSide !== "tube" ||
      data.shellOutletTempC > data.shellInletTempC,
    {
      error:
        "For tube-side cooling the shell-side fluid is the coolant: its outlet temperature must be higher than its inlet temperature (shell is being heated)",
      path: ["shellOutletTempC"],
    },
  )
  // Tube-side direction. Default / steam: the tube fluid is heated, so
  // outlet > inlet. Tube-side cooling: the tube fluid is the hot process
  // stream being cooled, so outlet < inlet.
  .refine(
    (data) => data.coolingSide === "tube" || data.tubeOutletTempC > data.tubeInletTempC,
    {
      error: "Tube-side outlet temperature must be higher than inlet temperature (tube is being heated)",
      path: ["tubeOutletTempC"],
    },
  )
  .refine(
    (data) => data.coolingSide !== "tube" || data.tubeOutletTempC < data.tubeInletTempC,
    {
      error:
        "For tube-side cooling the tube-side fluid is the process stream being cooled: its outlet temperature must be lower than its inlet temperature",
      path: ["tubeOutletTempC"],
    },
  )
  .refine(
    (data) => data.coolingSide !== "tube" || data.tubeFlowRateKgHrInput !== undefined,
    {
      error:
        "Tube-side flow rate is required for tube-side cooling (it is the process-fluid flow; the shell-side coolant flow is derived from duty)",
      path: ["tubeFlowRateKgHrInput"],
    },
  )
  .refine(
    (data) => !data.shellIsSteam || data.shellSteamPressureBarA !== undefined,
    {
      error: "Steam pressure is required when the shell side is set to steam",
      path: ["shellSteamPressureBarA"],
    },
  )
  .refine(
    (data) => !data.shellIsSteam || data.tubeFlowRateKgHrInput !== undefined,
    {
      error: "Tube-side flow rate is required when the shell side is set to steam (duty is derived from the tube side instead of shell Cp*deltaT)",
      path: ["tubeFlowRateKgHrInput"],
    },
  )
  .refine((data) => data.tubeOdMm > 2 * data.tubeWallThicknessMm, {
    error: "Tube wall thickness is too large relative to the OD (inner diameter would be zero or negative)",
    path: ["tubeWallThicknessMm"],
  })
  .refine(
    (data) => {
      // Orient by which stream is hot: tube-side cooling puts the hot stream
      // in the tubes, every other mode keeps it on the shell side.
      const tubeIsHot = data.coolingSide === "tube" && !data.shellIsSteam;
      const hotIn = tubeIsHot ? data.tubeInletTempC : data.shellInletTempC;
      const hotOut = tubeIsHot ? data.tubeOutletTempC : data.shellOutletTempC;
      const coldIn = tubeIsHot ? data.shellInletTempC : data.tubeInletTempC;
      const coldOut = tubeIsHot ? data.shellOutletTempC : data.tubeOutletTempC;
      return hotIn - coldOut > 0 && hotOut - coldIn > 0;
    },
    {
      error:
        "Non-physical temperature approach: shell and tube temperatures cross. Check inlet/outlet values.",
      path: ["shellInletTempC"],
    },
  );

export type HeatExchangerInputsSchema = z.infer<typeof heatExchangerInputsSchema>;
