
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubscriptionPlan } from "@/lib/community/types";
import { useAuth } from "@/providers/AuthProvider";
import { createSubscriptionPlan, updateSubscriptionPlan } from "@/lib/community/api";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: SubscriptionPlan) => void;
  existingPlan?: SubscriptionPlan;
}

export default function SubscriptionPlanForm({
  isOpen,
  onClose,
  onSuccess,
  existingPlan
}: SubscriptionPlanFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing plan data if provided
  useEffect(() => {
    if (existingPlan) {
      setName(existingPlan.name);
      setDescription(existingPlan.description);
      setPrice(existingPlan.price.toString());
    } else {
      // Reset form for new plan
      setName("");
      setDescription("");
      setPrice("");
    }
  }, [existingPlan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create subscription plans.",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim() || !description.trim() || !price) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (existingPlan) {
        // Update existing plan
        result = await updateSubscriptionPlan(existingPlan.id, {
          name,
          description,
          price: priceValue,
        });
      } else {
        // Create new plan
        result = await createSubscriptionPlan({
          creator_id: user.id,
          name,
          description,
          price: priceValue,
          stripe_price_id: null // This would be set after creating a price in Stripe
        });
      }

      if (result) {
        toast({
          title: existingPlan ? "Plan updated" : "Plan created",
          description: existingPlan 
            ? "Your subscription plan has been updated successfully." 
            : "Your subscription plan has been created successfully.",
        });
        onSuccess(result);
        onClose();
      } else {
        throw new Error("Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      toast({
        title: "Error",
        description: `Failed to ${existingPlan ? 'update' : 'create'} subscription plan. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}</DialogTitle>
          <DialogDescription>
            {existingPlan 
              ? "Update your subscription plan details below." 
              : "Create a new subscription plan for your supporters."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium, Basic, etc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What subscribers will get with this plan..."
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Monthly Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                min="0.99"
                step="0.01"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (existingPlan ? "Updating..." : "Creating...") 
                : (existingPlan ? "Update Plan" : "Create Plan")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
