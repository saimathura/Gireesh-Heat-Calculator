"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
}

export function TubeSideFluidFields({ register, errors }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <NumberField
        name="tubeInletTempC"
        label="Inlet temperature"
        unit="°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeOutletTempC"
        label="Outlet temperature"
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
        Tube-side flow rate is derived from the energy balance, not entered directly.
      </p>
    </div>
  );
}
