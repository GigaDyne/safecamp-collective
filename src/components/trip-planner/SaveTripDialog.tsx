
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SaveTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripName: string;
  onTripNameChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isAuthenticated: boolean;
}

const SaveTripDialog: React.FC<SaveTripDialogProps> = ({
  open,
  onOpenChange,
  tripName,
  onTripNameChange,
  onSave,
  isSaving,
  isAuthenticated
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Trip</DialogTitle>
          <DialogDescription>
            {isAuthenticated 
              ? "Save this trip to your account." 
              : "Save this trip locally. Sign in to sync your trips across devices."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="trip-name" className="text-sm font-medium">
              Trip Name
            </label>
            <Input
              id="trip-name"
              placeholder="Enter trip name"
              value={tripName}
              onChange={(e) => onTripNameChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={isSaving || !tripName.trim()}
          >
            {isSaving ? "Saving..." : "Save Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTripDialog;
