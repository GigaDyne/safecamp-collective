
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
  showCrimeData?: boolean;
  onToggleCrimeData?: (enabled: boolean) => void;
}

const TripFilterOptions = ({
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
}: TripFilterOptionsProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Include:</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-campsites" className="flex items-center gap-2">
              Campsites
            </Label>
            <Switch 
              id="include-campsites" 
              checked={includeCampsites}
              onCheckedChange={setIncludeCampsites}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-gas" className="flex items-center gap-2">
              Gas Stations
            </Label>
            <Switch 
              id="include-gas" 
              checked={includeGasStations}
              onCheckedChange={setIncludeGasStations}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-water" className="flex items-center gap-2">
              Water Stations
            </Label>
            <Switch 
              id="include-water" 
              checked={includeWaterStations}
              onCheckedChange={setIncludeWaterStations}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-dump" className="flex items-center gap-2">
              Dump Stations
            </Label>
            <Switch 
              id="include-dump" 
              checked={includeDumpStations}
              onCheckedChange={setIncludeDumpStations}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-walmart" className="flex items-center gap-2">
              Walmarts
            </Label>
            <Switch 
              id="include-walmart" 
              checked={includeWalmarts}
              onCheckedChange={setIncludeWalmarts}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-propane" className="flex items-center gap-2">
              Propane Stations
            </Label>
            <Switch 
              id="include-propane" 
              checked={includePropaneStations}
              onCheckedChange={setIncludePropaneStations}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-repair" className="flex items-center gap-2">
              Repair Shops
            </Label>
            <Switch 
              id="include-repair" 
              checked={includeRepairShops}
              onCheckedChange={setIncludeRepairShops}
            />
          </div>
          
          {onToggleCrimeData && (
            <div className="flex items-center justify-between">
              <Label htmlFor="include-crime-data" className="flex items-center gap-2">
                <span>Crime Data</span>
                <span className="text-xs text-muted-foreground">(beta)</span>
              </Label>
              <Switch 
                id="include-crime-data" 
                checked={showCrimeData}
                onCheckedChange={onToggleCrimeData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripFilterOptions;
