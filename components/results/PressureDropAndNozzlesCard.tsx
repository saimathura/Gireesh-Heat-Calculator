import { ResultCard } from "@/components/results/ResultCard";
import { StatusBadge } from "@/components/results/StatusBadge";
import { Stat } from "@/components/results/Stat";
import { fmt } from "@/lib/format";
import { PRESSURE_DROP_WARNING_THRESHOLD_BAR } from "@/lib/constants/physicalConstants";
import type { CalculationResult } from "@/lib/types/results";

export function PressureDropAndNozzlesCard({ result }: { result: CalculationResult }) {
  return (
    <ResultCard title="Pressure drops & nozzles">
      <div className="flex flex-col gap-1.5">
        <Stat
          label="Tube-side ΔP"
          value={fmt(result.pressureDrops.tubeSideBar, 4)}
          unit="bar"
        />
        <StatusBadge status={result.verdicts.tubeDeltaPOk ? "ok" : "warn"} className="w-fit">
          {result.verdicts.tubeDeltaPOk ? "within limit" : "review"}
        </StatusBadge>
      </div>
      <div className="flex flex-col gap-1.5">
        <Stat
          label="Shell-side ΔP"
          value={fmt(result.pressureDrops.shellSideBar, 4)}
          unit="bar"
        />
        <StatusBadge status={result.verdicts.shellDeltaPOk ? "ok" : "warn"} className="w-fit">
          {result.verdicts.shellDeltaPOk ? "within limit" : "review"}
        </StatusBadge>
      </div>
      <Stat label="Tube-side nozzle" value={fmt(result.nozzles.tubeSideMm, 0)} unit="mm" />
      <Stat label="Shell-side nozzle" value={fmt(result.nozzles.shellSideMm, 0)} unit="mm" />
      <p className="col-span-full text-xs text-muted-foreground">
        Typical liquid pressure-drop limit: ~{PRESSURE_DROP_WARNING_THRESHOLD_BAR}-1 bar.
        {result.verdicts.reynoldsOutOfCalibratedRange
          ? " One or more results fall outside the correlations' calibrated Reynolds range (~7,000-10,000) — treat as extrapolated and verify manually."
          : ""}
      </p>
    </ResultCard>
  );
}
