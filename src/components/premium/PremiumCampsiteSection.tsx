
import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { CampSite } from "@/lib/supabase";
import { useUserPremiumCampsites, useDeletePremiumCampsite } from "@/hooks/usePremiumCampsites";
import { PremiumCampsite } from "@/lib/types/premium-campsite";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Plus } from "lucide-react";
import PremiumCampsiteCard from "./PremiumCampsiteCard";
import AddPremiumCampsiteDialog from "./AddPremiumCampsiteDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PremiumCampsiteSectionProps {
  campsite: CampSite;
}

export default function PremiumCampsiteSection({ campsite }: PremiumCampsiteSectionProps) {
  const { user } = useAuth();
  const { data: userPremiumCampsites = [], isLoading } = useUserPremiumCampsites();
  const { mutate: deletePremiumCampsite } = useDeletePremiumCampsite();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [premiumCampsiteToDelete, setPremiumCampsiteToDelete] = useState<string | null>(null);
  
  // Find premium campsite for this campsite if it exists
  const premiumCampsite = userPremiumCampsites.find(pc => pc.campsite_id === campsite.id);
  
  // Check if the current user is the owner of the campsite's premium listing
  const isOwner = premiumCampsite && user?.id === premiumCampsite.user_id;
  
  const canAccess = isOwner; // For now we only show if owner, subscription check is done in backend
  
  const handleDelete = (premiumCampsiteId: string) => {
    setPremiumCampsiteToDelete(premiumCampsiteId);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (premiumCampsiteToDelete) {
      deletePremiumCampsite(premiumCampsiteToDelete);
      setPremiumCampsiteToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-8 bg-muted/30 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading premium content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="text-amber-500 h-5 w-5" />
          Premium Information
        </h2>
        
        {user && !premiumCampsite && (
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-amber-500 text-amber-600"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Add Premium Listing
          </Button>
        )}
      </div>
      
      {premiumCampsite ? (
        <PremiumCampsiteCard 
          premiumCampsite={premiumCampsite}
          canAccess={canAccess}
          isOwner={isOwner}
          onEdit={() => setShowAddDialog(true)}
          onDelete={() => handleDelete(premiumCampsite.id)}
        />
      ) : (
        <div className="p-6 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center space-y-3">
          <Lock className="h-10 w-10 text-muted-foreground/60" />
          <h3 className="font-medium text-lg">No Premium Content Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            {user 
              ? "Create a premium listing to share exclusive information about this campsite with subscribers."
              : "Premium content for this campsite is not available or you need to log in to access it."}
          </p>
          {user && (
            <Button 
              variant="outline" 
              className="mt-2 border-amber-500 text-amber-600 hover:bg-amber-50"
              onClick={() => setShowAddDialog(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create Premium Listing
            </Button>
          )}
        </div>
      )}
      
      {/* Add Premium Campsite Dialog */}
      <AddPremiumCampsiteDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        campsite={campsite}
        existingPremiumCampsite={premiumCampsite}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this premium listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
