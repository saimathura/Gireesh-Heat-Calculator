"use client";

import {
  Controller,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import type { CoolingSide, HeatExchangerInputs } from "@/lib/types/inputs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
  control: Control<HeatExchangerInputs>;
  watch: UseFormWatch<HeatExchangerInputs>;
  setValue: UseFormSetValue<HeatExchangerInputs>;
  getValues: UseFormGetValues<HeatExchangerInputs>;
}

const TUBE_COOLING_DEFAULT_FLOW_KG_HR = 20000;

export function CoolingArrangementField({ control, watch, setValue, getValues }: Props) {
  const isSteam = watch("shellIsSteam");

  return (
    <div className="flex flex-col gap-2">
      <Controller
        name="coolingSide"
        control={control}
        render={({ field }) => {
          const value: CoolingSide = field.value === "tube" ? "tube" : "shell";
          return (
            <RadioGroup
              value={value}
              onValueChange={(v) => {
                const next = v as CoolingSide;
                field.onChange(next);
                if (
                  next === "tube" &&
                  getValues("tubeFlowRateKgHrInput") === undefined
                ) {
                  setValue(
                    "tubeFlowRateKgHrInput",
                    TUBE_COOLING_DEFAULT_FLOW_KG_HR,
                    { shouldValidate: true },
                  );
                }
              }}
              className="flex flex-col gap-2 sm:flex-row sm:gap-6"
            >
              <Label className="flex items-start gap-2 text-sm font-normal">
                <RadioGroupItem value="shell" className="mt-0.5" />
                <span className="flex flex-col">
                  <span>Shell-side cooling</span>
                  <span className="text-xs text-muted-foreground">
                    Hot process fluid in the shell, coolant in the tubes. Shell
                    flow is entered; tube-side flow is derived.
                  </span>
                </span>
              </Label>
              <Label
                className="flex items-start gap-2 text-sm font-normal data-[disabled]:opacity-50"
                data-disabled={isSteam ? "" : undefined}
              >
                <RadioGroupItem value="tube" className="mt-0.5" disabled={isSteam} />
                <span className="flex flex-col">
                  <span>Tube-side cooling</span>
                  <span className="text-xs text-muted-foreground">
                    Hot process fluid in the tubes, coolant in the shell. Tube
                    flow is entered; shell-side coolant flow is derived.
                  </span>
                </span>
              </Label>
            </RadioGroup>
          );
        }}
      />
      {isSteam ? (
        <p className="text-xs text-muted-foreground">
          Tube-side cooling is unavailable while the shell side is condensing
          steam (steam is a heating arrangement).
        </p>
      ) : null}
    </div>
  );
}
