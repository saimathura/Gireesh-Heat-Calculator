"use client";

import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";
import { MaterialSelect } from "@/components/calculator/MaterialSelect";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  setValue: UseFormSetValue<HeatExchangerInputs>;
}

export function FoulingAndMaterialFields({ register, errors, setValue }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <NumberField
        name="hodWM2C"
        label="Shell-side fouling (hod)"
        unit="W/m²°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="hidWM2C"
        label="Tube-side fouling (hid)"
        unit="W/m²°C"
        register={register}
        errors={errors}
      />
      <MaterialSelect setValue={setValue} />
      <NumberField
        name="kwWM_C"
        label="Tube wall conductivity (Kw)"
        unit="W/m°C"
        register={register}
        errors={errors}
      />
    </div>
  );
}
