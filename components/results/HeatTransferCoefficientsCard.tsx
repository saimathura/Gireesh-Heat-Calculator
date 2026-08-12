"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { ResultCard } from "@/components/results/ResultCard";
import { Stat } from "@/components/results/Stat";
import { HiMethodToggle } from "@/components/results/HiMethodToggle";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HiSelectionMode } from "@/lib/types/inputs";
import type { CalculationResult } from "@/lib/types/results";

interface Props {
  result: CalculationResult;
  hiSelectionMode: HiSelectionMode;
  onHiSelectionModeChange: (mode: HiSelectionMode) => void;
}

export function HeatTransferCoefficientsCard({
  result,
  hiSelectionMode,
  onHiSelectionModeChange,
}: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedMethodLabel = result.hiSelectedSource === "A" ? "Method A" : "Method B";

  return (
    <ResultCard title="Heat transfer coefficients" contentClassName="flex flex-col gap-4">
      <HiMethodToggle
        result={result}
        hiSelectionMode={hiSelectionMode}
        onHiSelectionModeChange={onHiSelectionModeChange}
      />
      <div className="hidden grid-cols-2 gap-4 sm:grid-cols-4 print:grid">
        <Stat
          label={`hi (${selectedMethodLabel})`}
          value={fmt(result.hiSelectedWM2C)}
          unit="W/m²°C"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="ho (shell-side)" value={fmt(result.hoWM2C)} unit="W/m²°C" />
        <Stat label="Tube-side Re" value={fmt(result.tubeSide.re, 0)} />
        <Stat label="Shell-side Re" value={fmt(result.shellSide.re, 0)} />
      </div>

      <Collapsible open={detailOpen} onOpenChange={setDetailOpen}>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="sm" className="w-fit print:hidden">
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  detailOpen ? "rotate-180" : "",
                )}
              />
              {detailOpen ? "Hide" : "Show"} intermediate values
            </Button>
          }
        />
        <CollapsibleContent>
          <div className="mt-3 grid grid-cols-2 gap-4 border-t pt-3 sm:grid-cols-4">
            <Stat label="Tube ID (di)" value={fmt(result.tubeSide.diMm, 2)} unit="mm" />
            <Stat label="Tube-side Pr" value={fmt(result.tubeSide.pr, 2)} />
            <Stat
              label="Tube-side velocity"
              value={fmt(result.tubeSide.velocityMs, 3)}
              unit="m/s"
            />
            <Stat
              label="Equivalent diameter (de)"
              value={fmt(result.shellSide.deMm, 2)}
              unit="mm"
            />
            <Stat label="Shell-side Pr" value={fmt(result.shellSide.pr, 2)} />
            <Stat
              label="Shell-side velocity"
              value={fmt(result.shellSide.velocityMs, 3)}
              unit="m/s"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ResultCard>
  );
}
