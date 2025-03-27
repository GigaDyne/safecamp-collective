
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddSiteForm from "./AddSiteForm";

interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: { latitude: number; longitude: number } | null;
  onSubmit: (formData: any) => void;
}

const AddSiteDialog = ({ open, onOpenChange, location, onSubmit }: AddSiteDialogProps) => {
  if (!location) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a New Location</DialogTitle>
        </DialogHeader>
        
        <AddSiteForm 
          initialLocation={location}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSiteDialog;
