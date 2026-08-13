"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResultCard } from "@/components/results/ResultCard";
import { runMaterialSweep, type MaterialSweepPoint } from "@/lib/calculations/materialSweep";
import { usePrintChartSize } from "@/lib/hooks/usePrintChartSize";
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
  const chartSize = usePrintChartSize();
  return (
    <div ref={chartSize.ref} className="h-56 w-full">
      <ResponsiveContainer width={chartSize.width} height={chartSize.height}>
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
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} isAnimationActive={false}>
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

function MetalLineChart({
  data,
  dataKey,
  unit,
  decimals,
  color,
}: {
  data: SweepPointWithSelection[];
  dataKey: "heatDutyKw" | "finalUWM2C";
  unit: string;
  decimals: number;
  color: string;
}) {
  // Recharts' default YAxis domain is computed from [min, max] of the
  // data. Heat duty is identical across every material by design (it
  // doesn't depend on tube conductivity) - min===max collapses the scale
  // to zero width, which renders as a degenerate, badly zoomed chart
  // rather than a sane flat line. Padding the domain explicitly (rather
  // than leaving it to 'auto') fixes both this constant case and gives
  // the naturally-varying U chart a bit of breathing room too.
  const values = data.map((d) => d[dataKey]).filter((v): v is number => Number.isFinite(v));
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 1;
  const span = dataMax - dataMin;
  const pad = span > 0 ? span * 0.15 : Math.max(Math.abs(dataMax) * 0.1, 1);
  const domain: [number, number] = [dataMin - pad, dataMax + pad];
  const chartSize = usePrintChartSize();

  return (
    <div ref={chartSize.ref} className="h-56 w-full">
      <ResponsiveContainer width={chartSize.width} height={chartSize.height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            domain={domain}
            tick={{ fontSize: 11 }}
            width={55}
            className="fill-muted-foreground"
            tickFormatter={(v: number) => fmt(v, decimals)}
            label={{ value: unit, angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [`${fmt(Number(value), decimals)} ${unit}`, undefined]}
            labelFormatter={(label) => String(label)}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            isAnimationActive={false}
            dot={(dotProps: { cx?: number; cy?: number; payload?: SweepPointWithSelection }) => {
              const { cx, cy, payload } = dotProps;
              if (cx === undefined || cy === undefined || !payload) return <g key={`${dataKey}-empty`} />;
              return (
                <circle
                  key={payload.materialKey}
                  cx={cx}
                  cy={cy}
                  r={payload.isSelected ? 5 : 3}
                  fill={payload.isSelected ? SELECTED_COLOR : color}
                  fillOpacity={payload.failed ? 0.25 : 1}
                />
              );
            }}
          />
        </LineChart>
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
      title="Design comparison by material"
      contentClassName="flex flex-col gap-4"
    >
      <p className="text-xs text-muted-foreground">
        Same design, re-converged once per tube material (only Kw changes) — a
        lower-conductivity metal needs more surface area, which raises tube
        count, bundle/shell diameter, and overall U, while duty (set by the
        process, not the metal) stays fixed. Highlighted point is your
        current selection.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-1 print:gap-8">
        <div className="flex flex-col gap-1.5 break-inside-avoid">
          <span className="text-xs font-medium text-muted-foreground">
            Tube bundle diameter vs. metal
          </span>
          <DiameterBarChart data={sweep} dataKey="bundleDiameterMm" unit="mm" />
        </div>
        <div className="flex flex-col gap-1.5 break-inside-avoid">
          <span className="text-xs font-medium text-muted-foreground">
            Shell diameter vs. metal
          </span>
          <DiameterBarChart data={sweep} dataKey="shellDiameterMm" unit="mm" />
        </div>
        <div className="flex flex-col gap-1.5 break-inside-avoid">
          <span className="text-xs font-medium text-muted-foreground">
            Heat duty vs. metal
          </span>
          <MetalLineChart data={sweep} dataKey="heatDutyKw" unit="kW" decimals={1} color="var(--color-chart-3)" />
          <p className="text-xs text-muted-foreground/70">
            Duty comes from the process energy balance, not tube material —
            expect a flat line; it&apos;s here to make that explicit rather
            than assumed.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 break-inside-avoid">
          <span className="text-xs font-medium text-muted-foreground">
            Overall U vs. metal
          </span>
          <MetalLineChart data={sweep} dataKey="finalUWM2C" unit="W/m²°C" decimals={0} color="var(--color-chart-4)" />
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
