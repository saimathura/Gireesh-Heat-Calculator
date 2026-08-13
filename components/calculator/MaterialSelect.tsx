"use client";

import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { TUBE_MATERIALS } from "@/lib/constants/tubeMaterials";
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
  setValue: UseFormSetValue<HeatExchangerInputs>;
}

/**
 * One-shot autofill for tube wall material, same pattern as
 * FluidPresetSelect: picking a metal writes kwWM_C once, then the field
 * stays freely editable so the user isn't fighting a live-bound dropdown.
 */
export function MaterialSelect({ setValue }: Props) {
  const [selected, setSelected] = useState("custom");

  const handleChange = (key: string | null) => {
    if (!key) return;
    setSelected(key);
    if (key === "custom") return;
    const material = TUBE_MATERIALS.find((m) => m.key === key);
    if (!material) return;
    setValue("kwWM_C", material.kwWM_C, { shouldValidate: true });
  };

  return (
    <div className="col-span-full flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">Tube material</Label>
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom / enter Kw manually</SelectItem>
          {TUBE_MATERIALS.map((material) => (
            <SelectItem key={material.key} value={material.key}>
              {material.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground/70">
        Typical published Kw values — adjust for your actual alloy grade if needed.
      </p>
    </div>
  );
}
