
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { SubscriptionPlan, UserSubscription } from "@/lib/community/types";
import { createSubscriptionPlan, updateUserProfile } from "@/lib/community/api";

interface MonetizationTabProps {
  isCreator: boolean;
  setIsCreator: (value: boolean) => void;
  subscriptionPlans: SubscriptionPlan[];
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void;
  subscribers: UserSubscription[];
}

export default function MonetizationTab({
  isCreator,
  setIsCreator,
  subscriptionPlans,
  setSubscriptionPlans,
  subscribers
}: MonetizationTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);

  const toggleCreatorMode = async () => {
    if (!user?.id) return;
    
    try {
      const updatedProfile = await updateUserProfile({
        id: user.id,
        is_creator: !isCreator
      });
      
      if (updatedProfile) {
        setIsCreator(!isCreator);
        toast({
          title: isCreator ? "Creator mode disabled" : "Creator mode enabled",
          description: isCreator 
            ? "You are no longer in creator mode." 
            : "You are now in creator mode and can create subscription plans.",
        });
      }
    } catch (error) {
      console.error("Error toggling creator mode:", error);
      toast({
        title: "Error",
        description: "Failed to update creator status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreatePlan = async () => {
    if (!user?.id) return;
    
    try {
      if (!newPlanName || !newPlanDescription || !newPlanPrice) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields for your subscription plan.",
          variant: "destructive",
        });
        return;
      }
      
      const price = Number(newPlanPrice);
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid price",
          description: "Please enter a valid price.",
          variant: "destructive",
        });
        return;
      }
      
      const newPlan = await createSubscriptionPlan({
        creator_id: user.id,
        name: newPlanName,
        description: newPlanDescription,
        price: price,
        stripe_price_id: null
      });
      
      if (newPlan) {
        setSubscriptionPlans([...subscriptionPlans, newPlan]);
        setNewPlanName("");
        setNewPlanDescription("");
        setNewPlanPrice("");
        setShowNewPlanForm(false);
        toast({
          title: "Plan created",
          description: "Your subscription plan has been created. Note: Stripe integration is not complete yet.",
        });
      }
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monetization</CardTitle>
        <CardDescription>Earn money by sharing your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Creator Mode</h3>
            <p className="text-sm text-muted-foreground">Enable creator features to monetize your content</p>
          </div>
          <Button
            variant={isCreator ? "default" : "outline"}
            onClick={toggleCreatorMode}
          >
            {isCreator ? "Enabled" : "Become a Creator"}
          </Button>
        </div>
        
        {isCreator && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Your Subscription Plans</h3>
              
              {subscriptionPlans.length === 0 ? (
                <p className="text-sm text-muted-foreground">You haven't created any subscription plans yet.</p>
              ) : (
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="font-semibold">${plan.price}/month</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {!showNewPlanForm ? (
                <Button 
                  className="mt-4"
                  onClick={() => setShowNewPlanForm(true)}
                >
                  Add Subscription Plan
                </Button>
              ) : (
                <div className="mt-4 space-y-3 border p-4 rounded-md">
                  <h4 className="font-medium">New Subscription Plan</h4>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Plan Name</label>
                    <Input 
                      value={newPlanName} 
                      onChange={(e) => setNewPlanName(e.target.value)}
                      placeholder="e.g. Basic, Premium, etc."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea 
                      value={newPlanDescription} 
                      onChange={(e) => setNewPlanDescription(e.target.value)}
                      placeholder="Describe what subscribers will get"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Price per month ($)</label>
                    <Input 
                      value={newPlanPrice} 
                      onChange={(e) => setNewPlanPrice(e.target.value)}
                      placeholder="5.99"
                      type="number"
                      min="0.99"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewPlanForm(false);
                        setNewPlanName("");
                        setNewPlanDescription("");
                        setNewPlanPrice("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePlan}
                      className="flex-1"
                    >
                      Create Plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Your Subscribers</h3>
              
              {subscribers.length === 0 ? (
                <p className="text-sm text-muted-foreground">You don't have any subscribers yet.</p>
              ) : (
                <div className="space-y-2">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="border rounded-md p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{sub.subscriber_id}</p>
                        <p className="text-sm text-muted-foreground">{sub.plan?.name || "Unknown plan"}</p>
                      </div>
                      <p className="font-semibold">${sub.plan?.price || "0"}/month</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Premium Campsites</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Monetize your favorite campsites by making them premium content for your subscribers.
              </p>
              
              <Button>Add Premium Campsite</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
