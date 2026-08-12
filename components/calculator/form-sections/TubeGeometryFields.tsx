"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { HeatExchangerInputs, PassCount } from "@/lib/types/inputs";
import { PASS_COUNTS } from "@/lib/types/inputs";
import { NumberField } from "@/components/calculator/NumberField";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  control: Control<HeatExchangerInputs>;
}

export function TubeGeometryFields({ register, errors, control }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      <NumberField name="tubeOdMm" label="Tube OD" unit="mm" register={register} errors={errors} />
      <NumberField
        name="tubeWallThicknessMm"
        label="Wall thickness"
        unit="mm"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubeLengthMm"
        label="Tube length"
        unit="mm"
        register={register}
        errors={errors}
      />
      <NumberField
        name="tubePitchRatio"
        label="Pitch ratio"
        unit="pitch/OD"
        register={register}
        errors={errors}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Number of tube passes</Label>
        <Controller
          name="passCount"
          control={control}
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(v) => field.onChange(Number(v) as PassCount)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PASS_COUNTS.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count} pass{count === 1 ? "" : "es"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.passCount ? (
          <p className="text-xs text-destructive">{errors.passCount.message}</p>
        ) : null}
      </div>
    </div>
  );
}
