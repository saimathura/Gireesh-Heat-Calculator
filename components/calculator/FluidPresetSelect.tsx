"use client";

import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { FLUID_PRESETS } from "@/lib/constants/fluidLibrary";
import type { HeatExchangerInputs } from "@/lib/types/inputs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  side: "shell" | "tube";
  setValue: UseFormSetValue<HeatExchangerInputs>;
}

const FIELD_NAMES = {
  shell: {
    cp: "shellCpKjKgK",
    rho: "shellRhoKgM3",
    kf: "shellKfWmC",
    mu: "shellMuMNsM2",
  },
  tube: {
    cp: "tubeCpKjKgK",
    rho: "tubeRhoKgM3",
    kf: "tubeKfWmC",
    mu: "tubeMuMNsM2",
  },
} as const;

/**
 * One-shot autofill: picking a preset writes the 4 property fields once.
 * It doesn't stay live-bound, so the user can freely edit fields
 * afterwards without the dropdown fighting them.
 */
export function FluidPresetSelect({ side, setValue }: Props) {
  const [selected, setSelected] = useState("custom");
  const fields = FIELD_NAMES[side];

  const handleChange = (key: string | null) => {
    if (!key) return;
    setSelected(key);
    if (key === "custom") return;
    const preset = FLUID_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setValue(fields.cp, preset.cpKjKgK, { shouldValidate: true });
    setValue(fields.rho, preset.rhoKgM3, { shouldValidate: true });
    setValue(fields.kf, preset.kfWmC, { shouldValidate: true });
    setValue(fields.mu, preset.muMNsM2, { shouldValidate: true });
  };

  return (
    <div className="col-span-full flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">Fluid</Label>
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom / enter manually</SelectItem>
          {FLUID_PRESETS.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground/70">
        Typical values near 20-25°C — adjust for your actual mean temperature,
        especially for oils.
      </p>
    </div>
  );
}
