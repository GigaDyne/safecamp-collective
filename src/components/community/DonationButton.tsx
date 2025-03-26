
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { processDonation } from "@/lib/community/payment";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DonationButtonProps {
  amount: number;
  recipientId: string;
  helpRequestId?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export default function DonationButton({
  amount,
  recipientId,
  helpRequestId,
  variant = "default",
  size = "default",
  disabled = false,
}: DonationButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDonation = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to donate.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user.id === recipientId) {
      toast({
        title: "Cannot donate to yourself",
        description: "You cannot donate to your own help request.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = await processDonation(
        amount,
        recipientId,
        helpRequestId
      );

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      toast({
        title: "Donation error",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleDonation} 
      disabled={disabled || loading}
    >
      <DollarSign className="h-4 w-4 mr-1" />
      Donate ${amount}
    </Button>
  );
}
