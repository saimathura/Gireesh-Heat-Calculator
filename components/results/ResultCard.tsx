import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DEFAULT_STAT_GRID = "grid grid-cols-2 gap-4 sm:grid-cols-4";

interface Props {
  title: string;
  headerExtra?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}

/** Shared card chrome for the results panel, so header/title/content
 * layout can't drift between cards the way it did before this existed. */
export function ResultCard({
  title,
  headerExtra,
  contentClassName = DEFAULT_STAT_GRID,
  children,
}: Props) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader
        className={headerExtra ? "flex flex-row items-center justify-between gap-2" : undefined}
      >
        <CardTitle className="text-sm">{title}</CardTitle>
        {headerExtra}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
