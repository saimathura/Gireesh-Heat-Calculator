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
import type { UCategory } from "@/lib/constants/uValueTable";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  setValue: UseFormSetValue<HeatExchangerInputs>;
  getValues: UseFormGetValues<HeatExchangerInputs>;
  watch: UseFormWatch<HeatExchangerInputs>;
  /** Tube side never selects "steam" - the FluidPresetSelect UI doesn't offer it here. */
  onCategoryChange?: (category: UCategory | null) => void;
}

export function TubeSideFluidFields({ register, errors, setValue, getValues, watch, onCategoryChange }: Props) {
  const isTubeCooling =
    watch("coolingSide") === "tube" && !watch("shellIsSteam");
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <FluidPresetSelect
        side="tube"
        setValue={setValue}
        getValues={getValues}
        onCategoryChange={onCategoryChange}
      />
      {isTubeCooling ? (
        <NumberField
          name="tubeFlowRateKgHrInput"
          label="Flow rate (process fluid)"
          unit="kg/hr"
          register={register}
          errors={errors}
        />
      ) : null}
      <NumberField
        name="tubeInletTempC"
        label={isTubeCooling ? "Process inlet temperature" : "Inlet temperature"}
        unit="°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeOutletTempC"
        label={isTubeCooling ? "Process outlet temperature" : "Outlet temperature"}
        unit="°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeCpKjKgK"
        label="Cp @ mean temp"
        unit="kJ/kg·K"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeRhoKgM3"
        label="Density @ mean temp"
        unit="kg/m³"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeKfWmC"
        label="Thermal conductivity"
        unit="W/m·°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeMuMNsM2"
        label="Viscosity @ mean temp"
        unit="mN·s/m²"
        register={register}
        errors={errors}
      />
      <p className="col-span-full text-xs text-muted-foreground">
        {isTubeCooling
          ? "Tube-side cooling: the tube side carries the hot process fluid being cooled (outlet must be lower than inlet). Its flow rate sets the heat duty; the shell-side coolant flow is derived."
          : "Tube-side flow rate is derived from the energy balance, not entered directly."}
      </p>
    </div>
  );
}
