"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { DutyAndLmtdCard } from "@/components/results/DutyAndLmtdCard";
import { GeometryCard } from "@/components/results/GeometryCard";
import { HeatTransferCoefficientsCard } from "@/components/results/HeatTransferCoefficientsCard";
import { OverallUAndConvergenceCard } from "@/components/results/OverallUAndConvergenceCard";
import { PressureDropAndNozzlesCard } from "@/components/results/PressureDropAndNozzlesCard";
import { VerdictBadges } from "@/components/results/VerdictBadges";
import type { HiSelectionMode } from "@/lib/types/inputs";
import type { CalculationResult } from "@/lib/types/results";

interface Props {
  result: CalculationResult;
  hiSelectionMode: HiSelectionMode;
  onHiSelectionModeChange: (mode: HiSelectionMode) => void;
}

export function ResultsPanel({ result, hiSelectionMode, onHiSelectionModeChange }: Props) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <h2 className="text-sm font-medium text-muted-foreground">Results</h2>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="size-3.5" />
          Print / save as PDF
        </Button>
      </div>

      <div className="hidden flex-col gap-1 print:flex">
        <h2 className="text-lg font-semibold">Result summary</h2>
        <p className="text-xs text-muted-foreground">
          Shell &amp; Tube Heat Exchanger Calculator — Kern&apos;s method
        </p>
      </div>

      <VerdictBadges result={result} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <DutyAndLmtdCard result={result} />
        <GeometryCard result={result} />
        <HeatTransferCoefficientsCard
          result={result}
          hiSelectionMode={hiSelectionMode}
          onHiSelectionModeChange={onHiSelectionModeChange}
        />
        <OverallUAndConvergenceCard result={result} />
        <div className="lg:col-span-2">
          <PressureDropAndNozzlesCard result={result} />
        </div>
      </div>
    </section>
  );
}
