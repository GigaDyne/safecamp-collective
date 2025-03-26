
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

interface MapboxTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenInput: string;
  onTokenInputChange: (value: string) => void;
  onSaveToken: () => void;
}

const MapboxTokenDialog: React.FC<MapboxTokenDialogProps> = ({
  open,
  onOpenChange,
  tokenInput,
  onTokenInputChange,
  onSaveToken
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mapbox API Token</DialogTitle>
          <DialogDescription>
            Enter your Mapbox API token to use the map features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="mapbox-token"
              placeholder="Enter Mapbox token"
              value={tokenInput}
              onChange={(e) => onTokenInputChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSaveToken}>
            Save Token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapboxTokenDialog;
