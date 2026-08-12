"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
}

export function BaffleFields({ register, errors }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <NumberField
        name="baffleCutPercent"
        label="Baffle cut"
        unit="%"
        register={register}
        errors={errors}
      />
      <NumberField
        name="baffleSpacingFraction"
        label="Baffle spacing"
        unit="× shell ID, 0.2-1.0"
        register={register}
        errors={errors}
      />
    </div>
  );
}
