
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/lib/community/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { createCheckoutSession, checkSubscription } from "@/lib/community/payment";
import { reactivateSubscription, cancelSubscription } from "@/lib/community/api";
import { useNavigate } from "react-router-dom";
import { CreditCard, Edit, Trash, X, RefreshCcw } from "lucide-react";
import { useState } from "react";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isOwner: boolean;
  isSubscribed?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  subscription?: UserSubscription;
}

export default function SubscriptionPlanCard({ 
  plan, 
  isOwner,
  isSubscribed = false,
  onEdit,
  onDelete,
  subscription
}: SubscriptionPlanCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to subscribe to this plan.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    try {
      const priceId = plan.stripe_price_id || `price_sub_${plan.id}`;
      
      const url = await createCheckoutSession(
        priceId,
        "subscription",
        plan.id,
        plan.creator_id
      );

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Payment error",
        description: "There was an error initiating the payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    setIsProcessing(true);
    try {
      const result = await cancelSubscription(subscription.stripe_subscription_id);
      
      if (result) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled.",
        });
        // Optional: Trigger a refresh of subscription status
      } else {
        toast({
          title: "Cancellation Failed",
          description: "Could not cancel subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsProcessing(true);
    try {
      const url = await reactivateSubscription(plan.id, plan.creator_id);
      
      if (url) {
        window.location.href = url;
      } else {
        toast({
          title: "Reactivation Failed",
          description: "Could not reactivate subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden border shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          ${plan.price.toFixed(2)}/month
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm">{plan.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-muted/20">
        {isOwner ? (
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            {subscription?.status === 'active' ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleCancelSubscription}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel Subscription
              </Button>
            ) : subscription?.status === 'cancelled' ? (
              <Button 
                onClick={handleReactivateSubscription}
                disabled={isProcessing}
              >
                <RefreshCcw className="h-4 w-4 mr-1" />
                Reactivate Subscription
              </Button>
            ) : (
              <Button 
                onClick={handleSubscribe}
                disabled={isSubscribed || isProcessing}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : (isSubscribed ? "Subscribed" : "Subscribe")}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
