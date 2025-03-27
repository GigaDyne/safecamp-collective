
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { UserSubscription } from "@/lib/community/types";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionsTabProps {
  subscriptions: UserSubscription[];
}

export default function SubscriptionsTab({ subscriptions }: SubscriptionsTabProps) {
  const { toast } = useToast();

  const handleSubscriptionCancel = () => {
    toast({
      title: "Subscription Cancellation",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscriptions</CardTitle>
        <CardDescription>Manage your active subscriptions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Subscriptions Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Support your favorite creators by subscribing to their content for exclusive access to premium campsites and more.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{sub.plan?.name || "Subscription"}</h4>
                    <p className="text-sm text-muted-foreground">{sub.plan?.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Renews on {new Date(sub.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${sub.plan?.price}/month</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleSubscriptionCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
