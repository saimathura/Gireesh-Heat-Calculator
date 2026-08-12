"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
}

export function IterationSettingsFields({ register, errors }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <NumberField
        name="initialUGuessWM2C"
        label="Initial assumed U"
        unit="W/m²°C"
        register={register}
        errors={errors}
      />
      <NumberField
        name="convergenceTolerance"
        label="Convergence tolerance"
        unit="fraction, default 0.02"
        register={register}
        errors={errors}
      />
      <NumberField
        name="maxIterations"
        label="Max iterations"
        unit="default 25"
        step={1}
        register={register}
        errors={errors}
      />
    </div>
  );
}
