"use client";

import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  onClick: () => void;
}

export function LoadTubeSideCoolingExampleButton({ onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button type="button" variant="outline" size="sm" onClick={onClick}>
            <Droplets className="size-3.5" />
            Load tube-side cooling example
          </Button>
        }
      />
      <TooltipContent>
        A light-oil cooler: hot oil in the tubes (80→45°C, its flow entered),
        cooling water on the shell side (30→40°C, flow derived from duty).
        Demonstrates the coolingSide: tube arrangement end to end.
      </TooltipContent>
    </Tooltip>
  );
}
