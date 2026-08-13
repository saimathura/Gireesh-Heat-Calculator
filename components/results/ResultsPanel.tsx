"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { DutyAndLmtdCard } from "@/components/results/DutyAndLmtdCard";
import { GeometryCard } from "@/components/results/GeometryCard";
import { HeatTransferCoefficientsCard } from "@/components/results/HeatTransferCoefficientsCard";
import { MaterialComparisonCard } from "@/components/results/MaterialComparisonCard";
import { OverallUAndConvergenceCard } from "@/components/results/OverallUAndConvergenceCard";
import { PressureDropAnalysisCard } from "@/components/results/PressureDropAnalysisCard";
import { PressureDropAndNozzlesCard } from "@/components/results/PressureDropAndNozzlesCard";
import { VerdictBadges } from "@/components/results/VerdictBadges";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";
import type { CalculationResult } from "@/lib/types/results";

interface Props {
  result: CalculationResult;
  inputs: HeatExchangerInputs;
  hiSelectionMode: HiSelectionMode;
  onHiSelectionModeChange: (mode: HiSelectionMode) => void;
}

const STAGGER_STEP_S = 0.07;

export function ResultsPanel({ result, inputs, hiSelectionMode, onHiSelectionModeChange }: Props) {
  const reduceMotion = useReducedMotion();

  const enter = (index: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduceMotion ? 0 : index * STAGGER_STEP_S, duration: 0.35 },
  });

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <h2 className="text-sm font-medium text-muted-foreground">Results</h2>
        <motion.div
          className="inline-block"
          whileHover={{ scale: reduceMotion ? 1 : 1.03 }}
          whileTap={{ scale: reduceMotion ? 1 : 0.96 }}
        >
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" />
            Print / save as PDF
          </Button>
        </motion.div>
      </div>

      <div className="hidden flex-col gap-1 print:flex">
        <h2 className="text-lg font-semibold">Result summary</h2>
        <p className="text-xs text-muted-foreground">
          Shell &amp; Tube Heat Exchanger Calculator — Kern&apos;s method
        </p>
      </div>

      <motion.div {...enter(0)} className="break-inside-avoid">
        <VerdictBadges result={result} />
      </motion.div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <motion.div {...enter(1)} className="break-inside-avoid">
          <DutyAndLmtdCard result={result} />
        </motion.div>
        <motion.div {...enter(2)} className="break-inside-avoid">
          <GeometryCard result={result} />
        </motion.div>
        <motion.div {...enter(3)} className="break-inside-avoid">
          <HeatTransferCoefficientsCard
            result={result}
            hiSelectionMode={hiSelectionMode}
            onHiSelectionModeChange={onHiSelectionModeChange}
          />
        </motion.div>
        <motion.div {...enter(4)} className="break-inside-avoid">
          <OverallUAndConvergenceCard result={result} />
        </motion.div>
        <motion.div {...enter(5)} className="break-inside-avoid lg:col-span-2">
          <PressureDropAndNozzlesCard result={result} />
        </motion.div>
        <motion.div {...enter(6)} className="break-inside-avoid lg:col-span-2">
          <MaterialComparisonCard inputs={inputs} hiSelectionMode={hiSelectionMode} />
        </motion.div>
        <motion.div {...enter(7)} className="break-inside-avoid lg:col-span-2">
          <PressureDropAnalysisCard inputs={inputs} hiSelectionMode={hiSelectionMode} />
        </motion.div>
      </div>
    </section>
  );
}
