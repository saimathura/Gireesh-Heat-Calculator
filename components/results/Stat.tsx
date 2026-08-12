import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  className?: string;
  size?: "default" | "lg";
}

export function Stat({ label, value, unit, className, size = "default" }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          size === "lg" ? "text-2xl" : "text-sm",
        )}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  );
}
