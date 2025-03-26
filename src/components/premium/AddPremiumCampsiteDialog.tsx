
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePremiumCampsite } from "@/hooks/usePremiumCampsites";
import { CampSite } from "@/lib/supabase";
import PremiumCampsiteForm from "./PremiumCampsiteForm";
import { useAuth } from "@/providers/AuthProvider";
import { PremiumCampsite } from "@/lib/types/premium-campsite";

interface AddPremiumCampsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campsite: CampSite;
  onSuccess?: (premiumCampsite: PremiumCampsite) => void;
}

export default function AddPremiumCampsiteDialog({
  open,
  onOpenChange,
  campsite,
  onSuccess
}: AddPremiumCampsiteDialogProps) {
  const { user } = useAuth();
  const { mutate: createPremiumCampsite, isPending } = useCreatePremiumCampsite();

  const handleSubmit = (formData: { title: string; description: string; price: number }) => {
    if (!user) return;

    const newPremiumCampsite = {
      user_id: user.id,
      campsite_id: campsite.id,
      title: formData.title,
      description: formData.description,
      price: formData.price
    };

    createPremiumCampsite(newPremiumCampsite, {
      onSuccess: (data) => {
        if (data && onSuccess) {
          onSuccess(data);
        }
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Create Premium Listing</DialogTitle>
          <DialogDescription>
            Share exclusive information about this campsite with subscribers.
          </DialogDescription>
        </DialogHeader>
        <PremiumCampsiteForm
          campsite={campsite}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
