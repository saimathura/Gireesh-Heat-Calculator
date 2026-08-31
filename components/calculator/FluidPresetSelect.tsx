"use client";

import { useState } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { FLUID_PRESETS } from "@/lib/constants/fluidLibrary";
import {
  interpolateFluidProperties,
  TEMP_INDEXED_FLUID_PRESETS,
} from "@/lib/constants/temperatureIndexedFluids";
import { interpolateSteamSaturation } from "@/lib/calculations/steamProperties";
import type { UCategory } from "@/lib/constants/uValueTable";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  side: "shell" | "tube";
  setValue: UseFormSetValue<HeatExchangerInputs>;
  getValues: UseFormGetValues<HeatExchangerInputs>;
  /** Only the shell side currently supports condensing steam. */
  allowSteam?: boolean;
  /** Reports the selected preset's U-lookup category, for the initial-U suggestion. */
  onCategoryChange?: (category: UCategory | null) => void;
}

const FIELD_NAMES = {
  shell: {
    flow: "shellFlowRateKgHr",
    inlet: "shellInletTempC",
    outlet: "shellOutletTempC",
    cp: "shellCpKjKgK",
    rho: "shellRhoKgM3",
    kf: "shellKfWmC",
    mu: "shellMuMNsM2",
  },
  tube: {
    flow: undefined,
    inlet: "tubeInletTempC",
    outlet: "tubeOutletTempC",
    cp: "tubeCpKjKgK",
    rho: "tubeRhoKgM3",
    kf: "tubeKfWmC",
    mu: "tubeMuMNsM2",
  },
} as const;

const TEMP_INDEXED_KEYS = new Set(TEMP_INDEXED_FLUID_PRESETS.map((p) => p.key));
const GAS_PRESETS = TEMP_INDEXED_FLUID_PRESETS.filter((p) => p.category === "gas");
const TEMP_INDEXED_LIQUID_PRESETS = TEMP_INDEXED_FLUID_PRESETS.filter(
  (p) => p.category === "liquid",
);

const STEAM_DEFAULT_PRESSURE_BARA = 6;

/**
 * One-shot autofill (same pattern for every category): picking a preset
 * writes the property fields once and doesn't stay live-bound, so the user
 * can freely edit afterwards. Temperature-indexed presets (Air and other
 * gases, the thermal oil) interpolate at the side's current mean
 * inlet/outlet temperature at the moment of selection - change the preset
 * again after editing temperatures if you want it refreshed.
 */
export function FluidPresetSelect({ side, setValue, getValues, allowSteam, onCategoryChange }: Props) {
  const [selected, setSelected] = useState("custom");
  const fields = FIELD_NAMES[side];

  const meanTempC = () => {
    const inlet = getValues(fields.inlet as keyof HeatExchangerInputs) as number;
    const outlet = getValues(fields.outlet as keyof HeatExchangerInputs) as number;
    if (typeof inlet === "number" && typeof outlet === "number" && Number.isFinite(inlet) && Number.isFinite(outlet)) {
      return (inlet + outlet) / 2;
    }
    return 25;
  };

  const applyFixedPreset = (cp: number, rho: number, kf: number, mu: number) => {
    setValue(fields.cp, cp, { shouldValidate: true });
    setValue(fields.rho, rho, { shouldValidate: true });
    setValue(fields.kf, kf, { shouldValidate: true });
    setValue(fields.mu, mu, { shouldValidate: true });
  };

  const handleChange = (key: string | null) => {
    if (!key) return;
    setSelected(key);

    if (key === "steam") {
      if (side !== "shell") return;
      const saturation = interpolateSteamSaturation(STEAM_DEFAULT_PRESSURE_BARA);
      setValue("shellIsSteam", true, { shouldValidate: true });
      // Steam is a heating arrangement (process fluid in the tubes) - it
      // can't coexist with tube-side cooling, so force the arrangement back.
      setValue("coolingSide", "shell", { shouldValidate: true });
      setValue("shellSteamPressureBarA", STEAM_DEFAULT_PRESSURE_BARA, { shouldValidate: true });
      setValue("shellInletTempC", saturation.tempC, { shouldValidate: true });
      setValue("shellOutletTempC", saturation.tempC, { shouldValidate: true });
      // Placeholders only - unused for energy balance/ho once shellIsSteam
      // is true, but the schema still expects positive numbers here.
      applyFixedPreset(4.2, 1, 0.02, 0.01);
      if (getValues("tubeFlowRateKgHrInput" as keyof HeatExchangerInputs) === undefined) {
        setValue("tubeFlowRateKgHrInput", 20000, { shouldValidate: true });
      }
      onCategoryChange?.("steam");
      return;
    }

    if (side === "shell" && allowSteam) {
      setValue("shellIsSteam", false, { shouldValidate: true });
    }

    if (key === "custom") {
      onCategoryChange?.(null);
      return;
    }

    const fixedPreset = FLUID_PRESETS.find((p) => p.key === key);
    if (fixedPreset) {
      applyFixedPreset(fixedPreset.cpKjKgK, fixedPreset.rhoKgM3, fixedPreset.kfWmC, fixedPreset.muMNsM2);
      onCategoryChange?.(fixedPreset.uCategory);
      return;
    }

    const tempIndexedPreset = TEMP_INDEXED_FLUID_PRESETS.find((p) => p.key === key);
    if (tempIndexedPreset) {
      const { row } = interpolateFluidProperties(tempIndexedPreset.table, meanTempC());
      applyFixedPreset(row.cpKjKgK, row.rhoKgM3, row.kfWmC, row.muMNsM2);
      onCategoryChange?.(tempIndexedPreset.uCategory);
    }
  };

  return (
    <div className="col-span-full flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">Fluid</Label>
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom / enter manually</SelectItem>
          <SelectGroup>
            <SelectLabel>Liquid</SelectLabel>
            {FLUID_PRESETS.map((preset) => (
              <SelectItem key={preset.key} value={preset.key}>
                {preset.label}
              </SelectItem>
            ))}
            {TEMP_INDEXED_LIQUID_PRESETS.map((preset) => (
              <SelectItem key={preset.key} value={preset.key}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Gas</SelectLabel>
            {GAS_PRESETS.map((preset) => (
              <SelectItem key={preset.key} value={preset.key}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectGroup>
          {allowSteam ? (
            <SelectGroup>
              <SelectLabel>Steam</SelectLabel>
              <SelectItem value="steam">Steam (condensing)</SelectItem>
            </SelectGroup>
          ) : null}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground/70">
        {selected === "steam"
          ? "Saturation temperature and latent heat are interpolated from the steam pressure you enter below."
          : TEMP_INDEXED_KEYS.has(selected)
            ? "Interpolated at your current mean temperature — reselect after changing inlet/outlet temperatures to refresh."
            : "Typical values near 20-25°C — adjust for your actual mean temperature."}
      </p>
    </div>
  );
}
