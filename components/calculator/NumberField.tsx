"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type NumericFieldName = {
  [K in keyof HeatExchangerInputs]-?: HeatExchangerInputs[K] extends
    | number
    | undefined
    ? K
    : never;
}[keyof HeatExchangerInputs];

interface NumberFieldProps {
  name: NumericFieldName;
  label: string;
  unit?: string;
  step?: number;
  register: UseFormRegister<HeatExchangerInputs>;
  errors: FieldErrors<HeatExchangerInputs>;
  className?: string;
}

export function NumberField({
  name,
  label,
  unit,
  step = "any" as unknown as number,
  register,
  errors,
  className,
}: NumberFieldProps) {
  const error = errors[name];
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
        {unit ? <span className="text-muted-foreground/70"> ({unit})</span> : null}
      </Label>
      <Input
        id={name}
        type="number"
        step={step}
        aria-invalid={!!error}
        className="tabular-nums"
        {...register(name, {
          setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
        })}
      />
      {error ? (
        <p className="text-xs text-destructive">{error.message as string}</p>
      ) : null}
    </div>
  );
}
