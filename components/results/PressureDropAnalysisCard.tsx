"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResultCard } from "@/components/results/ResultCard";
import { runBaffleSpacingSweep } from "@/lib/calculations/baffleSpacingSweep";
import { runMaterialSweep } from "@/lib/calculations/materialSweep";
import { PRESSURE_DROP_WARNING_THRESHOLD_BAR } from "@/lib/constants/physicalConstants";
import { fmt } from "@/lib/format";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";

interface Props {
  inputs: HeatExchangerInputs;
  hiSelectionMode: HiSelectionMode;
}

export function PressureDropAnalysisCard({ inputs, hiSelectionMode }: Props) {
  const baffleSweep = useMemo(
    () => runBaffleSpacingSweep(inputs, hiSelectionMode).filter((p) => !p.failed),
    [inputs, hiSelectionMode],
  );
  const materialSweep = useMemo(
    () => runMaterialSweep(inputs, hiSelectionMode),
    [inputs, hiSelectionMode],
  );

  return (
    <ResultCard title="Pressure-drop analysis" contentClassName="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Both charts re-run the full convergence loop per point (baffle
        spacing and metal both feed geometry, not just the friction-factor
        formula directly). Results outside the ~7,000-10,000 calibrated
        Reynolds range are extrapolated — see the pressure-drop card above
        for this design&apos;s own flag.
      </p>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Shell-side pressure drop vs. number of baffles
        </span>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={baffleSweep}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="baffleCount"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                label={{
                  value: "Number of baffles",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 11,
                }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                width={60}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => fmt(v, 3)}
                label={{ value: "bar", angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => [`${fmt(Number(value), 4)} bar`, String(name)]}
                labelFormatter={(label) => `${label} baffles`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="shellSideDeltaPBar"
                name="Shell-side ΔP"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="tubeSideDeltaPBar"
                name="Tube-side ΔP"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground/70">
          Sweeps baffle spacing from 0.2-1.0x shell ID at your current
          selected material; typical liquid limit ~
          {PRESSURE_DROP_WARNING_THRESHOLD_BAR}-1 bar.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Pressure drop by tube material
        </span>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={materialSweep}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
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
                width={60}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => fmt(v, 3)}
                label={{ value: "bar", angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => [`${fmt(Number(value), 4)} bar`, String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="shellSideDeltaPBar"
                name="Shell-side ΔP"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="tubeSideDeltaPBar"
                name="Tube-side ΔP"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground/70">
          Metal affects ΔP only indirectly, through the geometry it forces
          (lower Kw -&gt; more area -&gt; different velocities/Re) — it does not
          appear in the friction-factor formulas directly.
        </p>
      </div>
    </ResultCard>
  );
}
