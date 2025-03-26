
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/lib/community/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { createCheckoutSession } from "@/lib/community/payment";
import { useNavigate } from "react-router-dom";
import { CreditCard, Edit, Trash } from "lucide-react";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isOwner: boolean;
  isSubscribed?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SubscriptionPlanCard({ 
  plan, 
  isOwner,
  isSubscribed = false,
  onEdit,
  onDelete
}: SubscriptionPlanCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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

    try {
      // For now we'll assume the plan has a valid stripe_price_id
      // In a real implementation, you'd make sure this is set when creating plans
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
          <Button 
            onClick={handleSubscribe}
            disabled={isSubscribed}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
