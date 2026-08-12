"use client";

import { Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/format";
import { CALIBRATED_RE_RANGE, HI_METHOD_B_JH_ANCHOR } from "@/lib/constants/physicalConstants";
import type { HiSelectionMode } from "@/lib/types/inputs";
import type { CalculationResult } from "@/lib/types/results";

interface Props {
  result: CalculationResult;
  hiSelectionMode: HiSelectionMode;
  onHiSelectionModeChange: (mode: HiSelectionMode) => void;
}

export function HiMethodToggle({
  result,
  hiSelectionMode,
  onHiSelectionModeChange,
}: Props) {
  const aIsSelected = result.hiSelectedSource === "A";
  const bIsSelected = result.hiSelectedSource === "B";

  const tubeRe = result.tubeSide.re;
  const reInRange =
    tubeRe >= CALIBRATED_RE_RANGE.min && tubeRe <= CALIBRATED_RE_RANGE.max;
  const percentFromAnchor =
    (Math.abs(tubeRe - HI_METHOD_B_JH_ANCHOR.re) / HI_METHOD_B_JH_ANCHOR.re) *
    100;

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <div className="grid grid-cols-2 gap-3">
        <div
          className={cn(
            "flex flex-col gap-1 rounded-lg border px-3 py-2",
            aIsSelected ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <span className="text-xs text-muted-foreground">
            Method A — Empirical (Eagle &amp; Ferguson-type)
          </span>
          <span className="font-medium tabular-nums">
            {fmt(result.hiMethodAWM2C)}{" "}
            <span className="text-xs font-normal text-muted-foreground">W/m²°C</span>
          </span>
          {aIsSelected ? (
            <Badge variant="outline" className="w-fit text-[10px]">
              selected — {hiSelectionMode === "conservative" ? "lower value" : "pinned"}
            </Badge>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-col gap-1 rounded-lg border px-3 py-2",
            bIsSelected ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Method B — Dittus-Boelter / Kern Jh-chart
            <Tooltip>
              <TooltipTrigger
                render={
                  <Info
                    className={cn(
                      "size-3",
                      reInRange ? "" : "text-amber-600 dark:text-amber-400",
                    )}
                  />
                }
              />
              <TooltipContent>
                Digitized chart correlation, calibrated against a single anchor
                point at Re≈{fmt(HI_METHOD_B_JH_ANCHOR.re, 0)}. This design&apos;s
                tube-side Re is {fmt(tubeRe, 0)} ({percentFromAnchor.toFixed(0)}%
                from the anchor) —{" "}
                {reInRange
                  ? "within the calibrated range."
                  : "outside the calibrated ~7,000-10,000 range; treat as extrapolated, ~15-20%+ variance possible."}
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="font-medium tabular-nums">
            {fmt(result.hiMethodBWM2C)}{" "}
            <span className="text-xs font-normal text-muted-foreground">W/m²°C</span>
          </span>
          {bIsSelected ? (
            <Badge variant="outline" className="w-fit text-[10px]">
              selected — {hiSelectionMode === "conservative" ? "lower value" : "pinned"}
            </Badge>
          ) : null}
        </div>
      </div>

      <RadioGroup
        value={hiSelectionMode}
        onValueChange={(v) => onHiSelectionModeChange(v as HiSelectionMode)}
        className="grid grid-cols-3 gap-2"
      >
        <Label className="flex items-center gap-2 text-xs font-normal">
          <RadioGroupItem value="conservative" />
          Conservative (auto)
        </Label>
        <Label className="flex items-center gap-2 text-xs font-normal">
          <RadioGroupItem value="methodA" />
          Method A
        </Label>
        <Label className="flex items-center gap-2 text-xs font-normal">
          <RadioGroupItem value="methodB" />
          Method B
        </Label>
      </RadioGroup>
    </div>
  );
}
