
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CrimeDataToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const CrimeDataToggle: React.FC<CrimeDataToggleProps> = ({ 
  enabled, 
  onToggle,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-2 bg-card/80 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm border border-border", className)}>
      <Switch
        id="crime-data-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <label
        htmlFor="crime-data-toggle"
        className="text-sm font-medium cursor-pointer"
      >
        Crime Data
      </label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="sr-only">Crime data info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Shows safety data by region. This feature is in beta and data may
              not be complete for all areas.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CrimeDataToggle;
