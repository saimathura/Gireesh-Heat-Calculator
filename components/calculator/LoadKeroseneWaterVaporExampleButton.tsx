"use client";

import { Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  onClick: () => void;
}

export function LoadKeroseneWaterVaporExampleButton({ onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button type="button" variant="outline" size="sm" onClick={onClick}>
            <Wind className="size-3.5" />
            Load kerosene / water-vapor example
          </Button>
        }
      />
      <TooltipContent>
        Numerically tuned as close as this app&apos;s geometry allows to the
        calibrated Reynolds range for a light-oil/gas pairing - still lands
        just outside it (reTube ~1% low, reShell ~0.1% high). Demonstrates
        how tight that window really is.
      </TooltipContent>
    </Tooltip>
  );
}
