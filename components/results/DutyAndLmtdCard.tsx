import { ResultCard } from "@/components/results/ResultCard";
import { Stat } from "@/components/results/Stat";
import { fmt } from "@/lib/format";
import type { CalculationResult } from "@/lib/types/results";

export function DutyAndLmtdCard({ result }: { result: CalculationResult }) {
  return (
    <ResultCard title="Duty & LMTD">
      <Stat
        label="Heat duty"
        value={fmt(result.heatDutyKw)}
        animateValue={result.heatDutyKw}
        unit="kW"
        size="lg"
        className="col-span-2 sm:col-span-1"
      />
      <Stat
        label="Tube-side flow (derived)"
        value={fmt(result.tubeFlowRateKgHr, 0)}
        unit="kg/hr"
      />
      <Stat label="LMTD" value={fmt(result.lmtd)} unit="°C" />
      <Stat label="R / S" value={`${fmt(result.r, 2)} / ${fmt(result.s, 2)}`} />
      <Stat label="Correction factor F" value={fmt(result.f, 3)} />
      <Stat label="LMTD corrected" value={fmt(result.lmtdCorrected)} unit="°C" />
    </ResultCard>
  );
}
