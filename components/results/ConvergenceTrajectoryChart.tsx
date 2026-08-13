"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt } from "@/lib/format";
import { usePrintChartSize } from "@/lib/hooks/usePrintChartSize";
import type { IterationStep } from "@/lib/types/results";

interface Props {
  iterations: IterationStep[];
  tolerance: number;
}

interface TooltipPayloadEntry {
  color?: string;
  name?: string;
  value?: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">Iteration {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5 tabular-nums">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {fmt(entry.value ?? 0)} W/m²°C
        </p>
      ))}
    </div>
  );
}

export function ConvergenceTrajectoryChart({ iterations, tolerance }: Props) {
  const chartSize = usePrintChartSize();
  const finalU = iterations[iterations.length - 1]?.uCalculatedWM2C ?? 0;
  const bandLow = finalU * (1 - tolerance);
  const bandHigh = finalU * (1 + tolerance);

  const data = iterations.map((step) => ({
    iteration: step.iteration,
    "U guess": step.uGuessWM2C,
    "U calculated": step.uCalculatedWM2C,
  }));

  return (
    <div ref={chartSize.ref} className="h-64 w-full">
      <ResponsiveContainer width={chartSize.width} height={chartSize.height}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="iteration"
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            label={{ value: "Iteration", position: "insideBottom", offset: -2, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            width={70}
            className="fill-muted-foreground"
            tickFormatter={(v: number) => fmt(v, 0)}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceArea
            y1={bandLow}
            y2={bandHigh}
            fill="var(--color-chart-1)"
            fillOpacity={0.08}
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="U guess"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={{ r: 4 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="U calculated"
            stroke="var(--color-chart-2)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={{ r: 4 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
