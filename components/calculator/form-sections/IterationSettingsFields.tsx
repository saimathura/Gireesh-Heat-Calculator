"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import type { USuggestion } from "@/lib/constants/uValueTable";
import { NumberField } from "@/components/calculator/NumberField";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  uSuggestion?: USuggestion | null;
}

export function IterationSettingsFields({ register, errors, uSuggestion }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
        <NumberField
          name="initialUGuessWM2C"
          label="Initial assumed U"
          unit="W/m²°C"
          register={register}
          errors={errors}
        />
        {uSuggestion ? (
          <p className="text-xs text-muted-foreground/70">
            Auto-filled from typical range {uSuggestion.minWM2C}–{uSuggestion.maxWM2C} W/m²°C
            ({uSuggestion.source}) — edit freely.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70">
            Select a shell-side and tube-side fluid preset above to auto-fill this from typical
            literature values.
          </p>
        )}
      </div>
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
