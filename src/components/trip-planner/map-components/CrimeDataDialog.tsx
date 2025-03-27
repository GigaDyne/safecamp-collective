
import React from 'react';
import { CountyCrimeData } from '@/lib/trip-planner/crime-data-service';
import CrimeDataTooltip from './CrimeDataTooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CrimeDataDialogProps {
  selectedCrimeData: CountyCrimeData | null;
  setSelectedCrimeData: (data: CountyCrimeData | null) => void;
}

const CrimeDataDialog = ({ 
  selectedCrimeData, 
  setSelectedCrimeData 
}: CrimeDataDialogProps) => {
  return (
    <Dialog open={!!selectedCrimeData} onOpenChange={(open) => !open && setSelectedCrimeData(null)}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Crime Statistics</DialogTitle>
          <DialogDescription>
            {selectedCrimeData?.county_name}, {selectedCrimeData?.state_abbr}
          </DialogDescription>
        </DialogHeader>
        
        {selectedCrimeData && (
          <div className="py-4">
            <CrimeDataTooltip data={selectedCrimeData} />
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => setSelectedCrimeData(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrimeDataDialog;
