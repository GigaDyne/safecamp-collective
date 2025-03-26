
import React from "react";
import { BarChart3, AlertTriangle } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CrimeDataToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const CrimeDataToggle = ({ enabled, onToggle, className }: CrimeDataToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            pressed={enabled}
            onPressedChange={onToggle}
            className={cn(
              "h-10 w-10 rounded-full p-0 absolute z-10 bg-background/90 shadow-md border border-border",
              enabled ? "text-primary" : "text-muted-foreground",
              className
            )}
            aria-label="Toggle crime data"
          >
            {enabled ? (
              <BarChart3 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{enabled ? "Hide" : "Show"} crime data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CrimeDataToggle;
