import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumCampsite } from "@/lib/types/premium-campsite";
import { Sparkles, LockKeyhole, Lock, MapPin, DollarSign, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { createCheckoutSession } from "@/lib/community/payment";
import { useNavigate } from "react-router-dom";

interface PremiumCampsiteCardProps {
  premiumCampsite: PremiumCampsite;
  canAccess: boolean;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PremiumCampsiteCard({ 
  premiumCampsite, 
  canAccess,
  isOwner,
  onEdit,
  onDelete
}: PremiumCampsiteCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to purchase this premium campsite.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const url = await createCheckoutSession(
        "price_premium_campsite", // This would come from your Stripe setup
        "premium_campsite",
        premiumCampsite.id,
        premiumCampsite.user_id
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
    <Card className="w-full max-w-md overflow-hidden border-2 border-amber-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-50 relative">
        <Badge className="absolute top-2 right-2 bg-amber-500 text-white flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>Premium</span>
        </Badge>
        <CardTitle className="flex items-center gap-2">
          {premiumCampsite.title}
        </CardTitle>
        <CardDescription>
          {premiumCampsite.campsite ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {premiumCampsite.campsite.location}
            </span>
          ) : "Premium campsite information"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {canAccess ? (
          <div className="space-y-4">
            <p className="text-sm">{premiumCampsite.description}</p>
            {premiumCampsite.campsite && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Campsite Details:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Safety: {premiumCampsite.campsite.safetyRating}/5</div>
                  <div>Cell Signal: {premiumCampsite.campsite.cellSignal}/5</div>
                  <div>Quietness: {premiumCampsite.campsite.quietness}/5</div>
                  <div>Access: {premiumCampsite.campsite.accessibility}/5</div>
                </div>
                {premiumCampsite.campsite.features && premiumCampsite.campsite.features.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {premiumCampsite.campsite.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
            <Lock className="h-12 w-12 text-amber-500 opacity-50" />
            <h3 className="font-medium">Premium Content</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to access detailed information about this premium campsite.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-muted/20">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">${premiumCampsite.price.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <>
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
            </>
          )}
          {!canAccess && !isOwner && (
            <Button onClick={handlePurchase}>
              <LockKeyhole className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
