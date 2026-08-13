import { ResultCard } from "@/components/results/ResultCard";
import { Stat } from "@/components/results/Stat";
import { fmt, fmtInt } from "@/lib/format";
import type { CalculationResult } from "@/lib/types/results";

export function GeometryCard({ result }: { result: CalculationResult }) {
  return (
    <ResultCard title="Geometry">
      <Stat
        label="Heat transfer area"
        value={fmt(result.areaM2)}
        animateValue={result.areaM2}
        unit="m²"
        size="lg"
        className="col-span-2 sm:col-span-1"
      />
      <Stat label="Tube count" value={fmtInt(result.tubeCount)} />
      <Stat label="Tube length" value={fmt(result.tubeLengthMm, 0)} unit="mm" />
      <Stat label="Bundle diameter" value={fmt(result.bundleDiameterMm, 0)} unit="mm" />
      <Stat label="Shell diameter (standard)" value={fmt(result.shellDiameterMm, 0)} unit="mm" />
      <Stat label="Number of baffles" value={fmtInt(result.baffleCount)} />
      <Stat label="Baffle spacing" value={fmt(result.baffleSpacingMm, 0)} unit="mm" />
      <Stat label="K1 / n1 (from pass count)" value={`${result.k1} / ${result.n1}`} />
      <p className="col-span-full text-xs text-muted-foreground">
        Shell diameter is rounded to a placeholder standard-pipe-size table, not a
        fabricator-verified schedule — confirm against your supplier&apos;s actual pipe
        sizes before procurement. Number of baffles = ceil(tube length / baffle
        spacing), matching your source design sheet&apos;s convention — these two
        figures (tube length, baffle count) are production-facing build
        instructions, not just intermediate calc values.
      </p>
    </ResultCard>
  );
}
