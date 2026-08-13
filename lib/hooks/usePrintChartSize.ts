"use client";

import { flushSync } from "react-dom";
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Recharts' <ResponsiveContainer> measures its box via ResizeObserver and
 * bakes that exact pixel size into its child <svg>'s viewBox (not a
 * rescalable design-space value - Recharts' own Surface component sets
 * viewBox={`0 0 ${width} ${height}`} using literally the same numbers as
 * the width/height it measured). Browsers frequently don't re-fire
 * ResizeObserver for the print rasterization pass, so on print the chart
 * ends up drawing against whatever size it last measured on screen - a
 * mismatch with the actual print-page box that renders as a
 * shrunk-and-centered, degenerate, or occasionally garbage-scaled chart.
 *
 * Recharts documents the fix in its own source: passing NUMERIC (not
 * percentage) width/height to ResponsiveContainer skips the
 * ResizeObserver/measurement path entirely, so there is nothing to go
 * stale. This hook measures the real container element the instant
 * `beforeprint` fires - by which point print CSS (e.g. print:grid-cols-1)
 * has already been applied - and returns fixed pixel dimensions for that
 * pass; on screen (and after `afterprint`) it returns the normal
 * responsive "100%" strings. The state update is wrapped in flushSync so
 * the new dimensions are actually painted to the DOM before this handler
 * returns, rather than being merely scheduled - without that, a Bar/Line
 * dataKey wrapper's CSS height and the numeric height fed to Recharts
 * could momentarily disagree, and with Card's overflow-hidden turned off
 * for print (needed so tall cards can flow across a page break instead of
 * being clipped), that disagreement isn't hidden anymore - it shows up as
 * the chart bleeding past its box and overlapping the caption below it.
 */
type ChartDimension = number | `${number}%`;

export function usePrintChartSize(): {
  ref: RefObject<HTMLDivElement | null>;
  width: ChartDimension;
  height: ChartDimension;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: ChartDimension; height: ChartDimension }>({
    width: "100%",
    height: "100%",
  });

  useEffect(() => {
    const onBeforePrint = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        flushSync(() => {
          setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
        });
      }
    };
    const onAfterPrint = () => flushSync(() => setSize({ width: "100%", height: "100%" }));

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  return { ref, ...size };
}
