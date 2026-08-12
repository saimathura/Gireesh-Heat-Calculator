"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch: theme is undefined on the server, so render a
  // placeholder for the server/first-client-render pass, then the real
  // control once mounted. useSyncExternalStore's server/client snapshot
  // split handles this without an explicit effect + setState.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-7 w-[84px] rounded-lg bg-muted" aria-hidden />;
  }

  return (
    <ToggleGroup
      size="sm"
      variant="outline"
      value={theme ? [theme] : []}
      onValueChange={(groupValue: string[]) => {
        const next = groupValue[0];
        if (next) setTheme(next);
      }}
      aria-label="Theme"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <Tooltip key={value}>
          <TooltipTrigger
            render={
              <ToggleGroupItem value={value} aria-label={label}>
                <Icon className="size-3.5" />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
