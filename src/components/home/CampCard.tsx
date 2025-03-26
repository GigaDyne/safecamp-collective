
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { createCheckoutSession } from "@/lib/community/payment";

interface CampCardProps {
  title: string;
  description: string;
  image?: string;
  author: string;
  price?: number | "Free";
  days?: number;
  avatarSrc?: string;
}

const CampCard: React.FC<CampCardProps> = ({
  title,
  description,
  image,
  author,
  price,
  days,
  avatarSrc,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUnlock = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (typeof price === "number" && price > 0) {
      const priceId = "price_placeholder";
      const checkoutUrl = await createCheckoutSession(priceId, 'premium_campsite');
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } else {
      navigate("/map");
    }
  };

  return (
    <div className="border-b border-border/50 pb-6 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>{author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="font-medium">{author}</div>
          {days !== undefined && <div className="text-sm text-muted-foreground">{days} days ago</div>}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <div>
          {typeof price === "number" ? (
            <div className="text-primary text-lg font-semibold">${price.toFixed(2)}</div>
          ) : (
            <div className="text-muted-foreground">Free</div>
          )}
        </div>
        
        {typeof price === "number" && price > 0 ? (
          <Button onClick={handleUnlock}>Unlock Spot</Button>
        ) : (
          <div className="text-muted-foreground font-medium">Free</div>
        )}
      </div>
    </div>
  );
};

export default CampCard;
