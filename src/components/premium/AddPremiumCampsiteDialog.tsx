
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePremiumCampsite, useUpdatePremiumCampsite } from "@/hooks/usePremiumCampsites";
import { CampSite } from "@/lib/supabase";
import PremiumCampsiteForm from "./PremiumCampsiteForm";
import { useAuth } from "@/providers/AuthProvider";
import { PremiumCampsite } from "@/lib/types/premium-campsite";

interface AddPremiumCampsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campsite: CampSite;
  existingPremiumCampsite?: PremiumCampsite;
  onSuccess?: (premiumCampsite: PremiumCampsite) => void;
}

export default function AddPremiumCampsiteDialog({
  open,
  onOpenChange,
  campsite,
  existingPremiumCampsite,
  onSuccess
}: AddPremiumCampsiteDialogProps) {
  const { user } = useAuth();
  const { mutate: createPremiumCampsite, isPending: isCreating } = useCreatePremiumCampsite();
  const { mutate: updatePremiumCampsite, isPending: isUpdating } = useUpdatePremiumCampsite();
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    price: 0
  });

  // Set initial values if editing an existing premium campsite
  useEffect(() => {
    if (existingPremiumCampsite) {
      setInitialValues({
        title: existingPremiumCampsite.title || "",
        description: existingPremiumCampsite.description || "",
        price: existingPremiumCampsite.price || 0
      });
    }
  }, [existingPremiumCampsite]);

  const handleSubmit = (formData: { title: string; description: string; price: number }) => {
    if (!user) return;

    if (existingPremiumCampsite) {
      // Update existing premium campsite
      updatePremiumCampsite({
        id: existingPremiumCampsite.id,
        updates: {
          title: formData.title,
          description: formData.description,
          price: formData.price
        }
      }, {
        onSuccess: (data) => {
          if (data && onSuccess) {
            onSuccess(data);
          }
          onOpenChange(false);
        }
      });
    } else {
      // Create new premium campsite
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
    }
  };

  const isPending = isCreating || isUpdating;
  const dialogTitle = existingPremiumCampsite ? "Edit Premium Listing" : "Create Premium Listing";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Share exclusive information about this campsite with subscribers.
          </DialogDescription>
        </DialogHeader>
        <PremiumCampsiteForm
          campsite={campsite}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isPending}
          initialValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  );
}
