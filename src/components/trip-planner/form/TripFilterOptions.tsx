
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TripFilterOptionsProps {
  includeCampsites: boolean;
  setIncludeCampsites: (include: boolean) => void;
  includeGasStations: boolean;
  setIncludeGasStations: (include: boolean) => void;
  includeWaterStations: boolean;
  setIncludeWaterStations: (include: boolean) => void;
  includeDumpStations: boolean;
  setIncludeDumpStations: (include: boolean) => void;
  includeWalmarts: boolean;
  setIncludeWalmarts: (include: boolean) => void;
  includePropaneStations: boolean;
  setIncludePropaneStations: (include: boolean) => void;
  includeRepairShops: boolean;
  setIncludeRepairShops: (include: boolean) => void;
  showCrimeData: boolean;
  onToggleCrimeData: (show: boolean) => void;
}

const TripFilterOptions: React.FC<TripFilterOptionsProps> = ({
  includeCampsites,
  setIncludeCampsites,
  includeGasStations,
  setIncludeGasStations,
  includeWaterStations,
  setIncludeWaterStations,
  includeDumpStations,
  setIncludeDumpStations,
  includeWalmarts,
  setIncludeWalmarts,
  includePropaneStations,
  setIncludePropaneStations,
  includeRepairShops,
  setIncludeRepairShops,
  showCrimeData,
  onToggleCrimeData
}) => {
  return (
    <div className="pt-2">
      <p className="font-medium mb-2">Include:</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="campgrounds"
            checked={includeCampsites}
            onCheckedChange={setIncludeCampsites}
          />
          <Label htmlFor="campgrounds" className="text-sm">Campsites</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="gas-stations"
            checked={includeGasStations}
            onCheckedChange={setIncludeGasStations}
          />
          <Label htmlFor="gas-stations" className="text-sm">Gas Stations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="water-stations"
            checked={includeWaterStations}
            onCheckedChange={setIncludeWaterStations}
          />
          <Label htmlFor="water-stations" className="text-sm">Water Stations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="walmarts"
            checked={includeWalmarts}
            onCheckedChange={setIncludeWalmarts}
          />
          <Label htmlFor="walmarts" className="text-sm">Walmarts</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="dump-stations"
            checked={includeDumpStations}
            onCheckedChange={setIncludeDumpStations}
          />
          <Label htmlFor="dump-stations" className="text-sm">Dump Stations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="propane-stations"
            checked={includePropaneStations}
            onCheckedChange={setIncludePropaneStations}
          />
          <Label htmlFor="propane-stations" className="text-sm">Propane Stations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="repair-shops"
            checked={includeRepairShops}
            onCheckedChange={setIncludeRepairShops}
          />
          <Label htmlFor="repair-shops" className="text-sm">Repair Shops</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="crime-data"
            checked={showCrimeData}
            onCheckedChange={onToggleCrimeData}
          />
          <Label htmlFor="crime-data" className="text-sm flex items-center">
            Crime Data
            <span className="text-xs text-muted-foreground ml-1">(beta)</span>
          </Label>
        </div>
      </div>
    </div>
  );
};

export default TripFilterOptions;
