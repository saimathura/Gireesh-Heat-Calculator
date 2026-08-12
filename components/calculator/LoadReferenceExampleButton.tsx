"use client";

import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  onClick: () => void;
}

export function LoadReferenceExampleButton({ onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button type="button" variant="outline" size="sm" onClick={onClick}>
            <FlaskConical className="size-3.5" />
            Load reference example (116kW, 2-pass)
          </Button>
        }
      />
      <TooltipContent>
        Populates the form with a known validation case for training/demo use.
      </TooltipContent>
    </Tooltip>
  );
}
