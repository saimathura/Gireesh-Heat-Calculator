import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status: "ok" | "warn";
  children: React.ReactNode;
  className?: string;
}

/** Shared ok/warn badge styling, so the two states can't drift between the
 * places they're used (convergence status, pressure-drop checks, etc). */
export function StatusBadge({ status, children, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "ok"
          ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      {children}
    </Badge>
  );
}
