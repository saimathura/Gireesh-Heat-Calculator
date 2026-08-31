"use client";

import type {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";
import { FluidPresetSelect } from "@/components/calculator/FluidPresetSelect";
import { interpolateSteamSaturation } from "@/lib/calculations/steamProperties";
import type { UCategory } from "@/lib/constants/uValueTable";
import { fmt } from "@/lib/format";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  setValue: UseFormSetValue<HeatExchangerInputs>;
  getValues: UseFormGetValues<HeatExchangerInputs>;
  watch: UseFormWatch<HeatExchangerInputs>;
  onCategoryChange?: (category: UCategory | null) => void;
}

export function ShellSideFluidFields({ register, errors, setValue, getValues, watch, onCategoryChange }: Props) {
  const isSteam = watch("shellIsSteam");
  const steamPressure = watch("shellSteamPressureBarA");
  const isTubeCooling = watch("coolingSide") === "tube" && !isSteam;

  const onPressureChange = (pressure: number) => {
    if (!Number.isFinite(pressure) || pressure <= 0) return;
    const saturation = interpolateSteamSaturation(pressure);
    setValue("shellInletTempC", saturation.tempC, { shouldValidate: true });
    setValue("shellOutletTempC", saturation.tempC, { shouldValidate: true });
  };

  if (isSteam) {
    const saturation =
      typeof steamPressure === "number" && Number.isFinite(steamPressure)
        ? interpolateSteamSaturation(steamPressure)
        : null;
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        <FluidPresetSelect
          side="shell"
          setValue={setValue}
          getValues={getValues}
          allowSteam
          onCategoryChange={onCategoryChange}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="shellSteamPressureBarA">
            Steam pressure
          </label>
          <input
            id="shellSteamPressureBarA"
            type="number"
            step="any"
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            {...register("shellSteamPressureBarA", {
              valueAsNumber: true,
              onChange: (e) => onPressureChange(Number(e.target.value)),
            })}
          />
          <span className="text-xs text-muted-foreground/70">bar absolute</span>
          {errors.shellSteamPressureBarA ? (
            <p className="text-xs text-destructive">{errors.shellSteamPressureBarA.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Saturation temperature (both in/out)</span>
          <span className="text-sm font-medium tabular-nums">
            {saturation ? `${fmt(saturation.tempC, 1)} °C` : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Latent heat</span>
          <span className="text-sm font-medium tabular-nums">
            {saturation ? `${fmt(saturation.hfgKjKg, 1)} kJ/kg` : "—"}
          </span>
        </div>
        <NumberField
          name="tubeFlowRateKgHrInput"
          label="Tube-side flow rate"
          unit="kg/hr"
          register={register}
          errors={errors}
        />
        <p className="col-span-full text-xs text-muted-foreground">
          Shell side is condensing steam: heat duty is computed from the
          tube-side flow rate and temperatures above instead of shell
          Cp·ΔT, and steam consumption (kg/hr) is derived from duty ÷
          latent heat — see the Duty &amp; LMTD result card. Shell-side film
          coefficient uses a typical published value, not a correlation
          computed from this design (see the results messages for the exact
          assumption and range).
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <FluidPresetSelect
        side="shell"
        setValue={setValue}
        getValues={getValues}
        allowSteam
        onCategoryChange={onCategoryChange}
      />
      {isTubeCooling ? null : (
        <NumberField
          name="shellFlowRateKgHr"
          label="Flow rate"
          unit="kg/hr"
          register={register}
          errors={errors}
        />
      )}
      <NumberField
        name="shellInletTempC"
        label={isTubeCooling ? "Coolant inlet temperature" : "Inlet temperature"}
        unit="°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellOutletTempC"
        label={isTubeCooling ? "Coolant outlet temperature" : "Outlet temperature"}
        unit="°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellCpKjKgK"
        label="Cp @ mean temp"
        unit="kJ/kg·K"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellRhoKgM3"
        label="Density @ mean temp"
        unit="kg/m³"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellKfWmC"
        label="Thermal conductivity"
        unit="W/m·°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellMuMNsM2"
        label="Viscosity @ mean temp"
        unit="mN·s/m²"
        register={register}
        errors={errors}
      />
      {isTubeCooling ? (
        <p className="col-span-full text-xs text-muted-foreground">
          Tube-side cooling: the shell side is the coolant (outlet must be
          hotter than inlet). Its flow rate is derived from the energy balance,
          not entered — see the Duty &amp; LMTD result card.
        </p>
      ) : null}
    </div>
  );
}
