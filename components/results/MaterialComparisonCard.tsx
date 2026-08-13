"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResultCard } from "@/components/results/ResultCard";
import { runMaterialSweep, type MaterialSweepPoint } from "@/lib/calculations/materialSweep";
import { fmt } from "@/lib/format";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";

interface Props {
  inputs: HeatExchangerInputs;
  hiSelectionMode: HiSelectionMode;
}

type SweepPointWithSelection = MaterialSweepPoint & { isSelected: boolean };

const SELECTED_COLOR = "var(--color-chart-2)";
const OTHER_COLOR = "var(--color-chart-1)";

interface BarTooltipPayload {
  payload?: SweepPointWithSelection;
}

function DiameterTooltip({
  active,
  payload,
  dataKey,
  unit,
}: {
  active?: boolean;
  payload?: BarTooltipPayload[];
  dataKey: "bundleDiameterMm" | "shellDiameterMm";
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  if (!point) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{point.materialLabel}</p>
      <p>Kw: {fmt(point.kwWM_C, 0)} W/m°C</p>
      {point.failed ? (
        <p className="text-destructive">{point.errorMessage ?? "Calculation failed"}</p>
      ) : (
        <p>
          {dataKey === "bundleDiameterMm" ? "Bundle diameter" : "Shell diameter"}:{" "}
          {fmt(point[dataKey], 0)} {unit}
        </p>
      )}
    </div>
  );
}

function DiameterBarChart({
  data,
  dataKey,
  unit,
}: {
  data: SweepPointWithSelection[];
  dataKey: "bundleDiameterMm" | "shellDiameterMm";
  unit: string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="materialLabel"
            tick={{ fontSize: 10 }}
            className="fill-muted-foreground"
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            width={50}
            className="fill-muted-foreground"
            tickFormatter={(v: number) => fmt(v, 0)}
            label={{ value: unit, angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip content={<DiameterTooltip dataKey={dataKey} unit={unit} />} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((point) => (
              <Cell
                key={point.materialKey}
                fill={point.isSelected ? SELECTED_COLOR : OTHER_COLOR}
                fillOpacity={point.failed ? 0.25 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MaterialComparisonCard({ inputs, hiSelectionMode }: Props) {
  const sweep = useMemo(() => {
    const points = runMaterialSweep(inputs, hiSelectionMode);
    return points.map((point) => ({
      ...point,
      isSelected: Math.abs(point.kwWM_C - inputs.kwWM_C) < 1e-6,
    }));
  }, [inputs, hiSelectionMode]);

  const anyFailed = sweep.some((p) => p.failed);

  return (
    <ResultCard
      title="Tube geometry by material"
      contentClassName="flex flex-col gap-4"
    >
      <p className="text-xs text-muted-foreground">
        Same design, re-converged once per tube material (only Kw changes) — a
        lower-conductivity metal needs more surface area, which raises tube
        count and bundle/shell diameter. Highlighted bar is your current
        selection.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Tube bundle diameter vs. metal
          </span>
          <DiameterBarChart data={sweep} dataKey="bundleDiameterMm" unit="mm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Shell diameter vs. metal
          </span>
          <DiameterBarChart data={sweep} dataKey="shellDiameterMm" unit="mm" />
        </div>
      </div>
      {anyFailed ? (
        <p className="text-xs text-destructive">
          One or more materials could not converge to a feasible design with
          the current inputs — see the tooltip on the affected bar.
        </p>
      ) : null}
    </ResultCard>
  );
}
