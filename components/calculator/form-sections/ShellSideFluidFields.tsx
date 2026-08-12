"use client";

import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";
import { FluidPresetSelect } from "@/components/calculator/FluidPresetSelect";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  setValue: UseFormSetValue<HeatExchangerInputs>;
}

export function ShellSideFluidFields({ register, errors, setValue }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <FluidPresetSelect side="shell" setValue={setValue} />
      <NumberField
        name="shellFlowRateKgHr"
        label="Flow rate"
        unit="kg/hr"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellInletTempC"
        label="Inlet temperature"
        unit="°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="shellOutletTempC"
        label="Outlet temperature"
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
    </div>
  );
}
