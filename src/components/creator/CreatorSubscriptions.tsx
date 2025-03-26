
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { 
  getCreatorSubscriptionPlans, 
  checkUserSubscribedToCreator 
} from "@/lib/community/api";
import { SubscriptionPlan } from "@/lib/community/types";
import SubscriptionPlanCard from "./SubscriptionPlanCard";
import SubscriptionPlanForm from "./SubscriptionPlanForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CreatorSubscriptionsProps {
  creatorId: string;
  isOwner?: boolean;
}

export default function CreatorSubscriptions({
  creatorId,
  isOwner = false
}: CreatorSubscriptionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | undefined>(undefined);

  // Load subscription plans
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      try {
        const plansData = await getCreatorSubscriptionPlans(creatorId);
        setPlans(plansData);
        
        // Check if current user is subscribed to any of this creator's plans
        if (user && creatorId !== user.id) {
          const isUserSubscribed = await checkUserSubscribedToCreator(user.id, creatorId);
          setIsSubscribed(isUserSubscribed);
        }
      } catch (error) {
        console.error("Error loading subscription plans:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [creatorId, user, toast]);

  const handleAddPlan = () => {
    setEditingPlan(undefined);
    setShowPlanForm(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const handlePlanSaved = (plan: SubscriptionPlan) => {
    // Update plans list
    if (editingPlan) {
      setPlans(plans.map(p => p.id === plan.id ? plan : p));
    } else {
      setPlans([...plans, plan]);
    }
  };

  const handleDeletePlan = (planId: string) => {
    // In a real app, you'd call an API to delete the plan
    // and then update the UI
    setPlans(plans.filter(p => p.id !== planId));
    toast({
      title: "Plan deleted",
      description: "The subscription plan has been deleted."
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Subscription Plans</h3>
        {isOwner && (
          <Button onClick={handleAddPlan} size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Plan
          </Button>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="p-6 text-center border rounded-md bg-muted/30">
          <p className="text-muted-foreground">
            {isOwner 
              ? "You haven't created any subscription plans yet." 
              : "This creator doesn't have any subscription plans available."}
          </p>
          {isOwner && (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={handleAddPlan}
            >
              Create your first plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              isOwner={isOwner}
              isSubscribed={isSubscribed}
              onEdit={() => handleEditPlan(plan)}
              onDelete={() => handleDeletePlan(plan.id)}
            />
          ))}
        </div>
      )}

      <SubscriptionPlanForm
        isOpen={showPlanForm}
        onClose={() => setShowPlanForm(false)}
        onSuccess={handlePlanSaved}
        existingPlan={editingPlan}
      />
    </div>
  );
}
