"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConvergenceTrajectoryChart } from "@/components/results/ConvergenceTrajectoryChart";
import { ResultCard } from "@/components/results/ResultCard";
import { Stat } from "@/components/results/Stat";
import { StatusBadge } from "@/components/results/StatusBadge";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CalculationResult } from "@/lib/types/results";

export function OverallUAndConvergenceCard({ result }: { result: CalculationResult }) {
  const [tableOpen, setTableOpen] = useState(false);

  return (
    <ResultCard
      title="Overall U & convergence"
      contentClassName="flex flex-col gap-4"
      headerExtra={
        <StatusBadge status={result.converged ? "ok" : "warn"}>
          {result.converged
            ? `Converged in ${result.iterationCount} iteration${result.iterationCount === 1 ? "" : "s"}`
            : `Did not converge after ${result.iterationCount} iterations`}
        </StatusBadge>
      }
    >
      <Stat
        label="Converged U"
        value={fmt(result.finalUWM2C)}
        animateValue={result.finalUWM2C}
        unit="W/m²°C"
        size="lg"
      />

      <ConvergenceTrajectoryChart
        iterations={result.iterations}
        tolerance={result.convergenceTolerance}
      />

      <Collapsible open={tableOpen} onOpenChange={setTableOpen}>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="sm" className="w-fit print:hidden">
              <ChevronDown
                className={cn("size-3.5 transition-transform", tableOpen ? "rotate-180" : "")}
              />
              {tableOpen ? "Hide" : "Show"} iteration trajectory
            </Button>
          }
        />
        <CollapsibleContent>
          <div className="mt-3 overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="text-right">U guess</TableHead>
                  <TableHead className="text-right">U calc.</TableHead>
                  <TableHead className="text-right">Δ%</TableHead>
                  <TableHead>hi source</TableHead>
                  <TableHead>Converged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.iterations.map((step) => (
                  <TableRow key={step.iteration}>
                    <TableCell className="tabular-nums">{step.iteration}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(step.uGuessWM2C)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(step.uCalculatedWM2C)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(step.percentDelta * 100, 1)}%
                    </TableCell>
                    <TableCell>Method {step.hiSelectedSource}</TableCell>
                    <TableCell>{step.converged ? "Yes" : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ResultCard>
  );
}
