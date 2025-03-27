
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
              "h-12 w-12 rounded-full p-0 absolute z-10 bg-white dark:bg-slate-800 shadow-lg",
              "border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700",
              enabled ? "text-primary" : "text-foreground",
              className
            )}
            aria-label="Toggle crime data"
          >
            {enabled ? (
              <BarChart3 className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-white dark:bg-slate-800 shadow-lg">
          <p>{enabled ? "Hide" : "Show"} crime data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CrimeDataToggle;
