
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { createCheckoutSession } from "@/lib/community/payment";
import { Share2, MapPin, Clock } from "lucide-react";

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
    <div className="border-b border-border/50 p-6">
      {/* Card Header with Author Info */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>{author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="font-medium">{author}</div>
          {days !== undefined && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" /> {days} days ago
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80";
            }}
          />
        </div>
      )}

      {/* Content */}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div>
          {typeof price === "number" ? (
            <div className="text-primary text-lg font-semibold">${price.toFixed(2)}</div>
          ) : (
            <div className="text-emerald-600 font-medium">Free</div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          {typeof price === "number" && price > 0 ? (
            <Button size="sm" onClick={handleUnlock}>Unlock Spot</Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate("/map")}>
              <MapPin className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampCard;
