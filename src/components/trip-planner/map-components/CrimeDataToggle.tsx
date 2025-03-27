
import React from 'react';
import { Shield, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CrimeDataToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const CrimeDataToggle = ({ enabled, onToggle, className = '' }: CrimeDataToggleProps) => {
  return (
    <div className={`absolute z-20 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={enabled ? "destructive" : "secondary"}
              size="sm"
              className={`flex items-center gap-1 shadow-md border ${
                enabled ? 'border-red-400 dark:border-red-700' : 'border-gray-200 dark:border-slate-700'
              }`}
              onClick={() => onToggle(!enabled)}
            >
              {enabled ? (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  <span className="hidden sm:inline">Hide Crime Data</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Show Crime Data</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle crime data overlay</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CrimeDataToggle;
