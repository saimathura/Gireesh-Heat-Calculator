import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/results/AnimatedNumber";

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  className?: string;
  size?: "default" | "lg";
  /** When provided (alongside `size="lg"`), the number tweens from its
   * previous value instead of popping to `value`'s static string. */
  animateValue?: number;
  animateDecimals?: number;
}

export function Stat({
  label,
  value,
  unit,
  className,
  size = "default",
  animateValue,
  animateDecimals,
}: StatProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          size === "lg" ? "text-2xl" : "text-sm",
        )}
      >
        {animateValue !== undefined ? (
          <AnimatedNumber value={animateValue} decimals={animateDecimals} />
        ) : (
          value
        )}
        {unit ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  );
}
