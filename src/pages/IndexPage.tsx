import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Search, Navigation, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useFeaturedCampsites } from "@/hooks/useFeaturedCampsites";
import { createCheckoutSession } from "@/lib/community/payment";

interface CampCardProps {
  title: string;
  description: string;
  image: string;
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

interface MonetizationCardProps {
  title: string;
  description: string;
  image: string;
  icon?: React.ReactNode;
}

const MonetizationCard: React.FC<MonetizationCardProps> = ({
  title,
  description,
  image,
  icon,
}) => {
  return (
    <div className="mb-8">
      <div className="relative rounded-lg overflow-hidden mb-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-40 object-cover"
        />
        {icon && (
          <div className="absolute bottom-3 right-3">
            {icon}
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const IndexPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/map?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const { data: featuredCampsites = [] } = useFeaturedCampsites();

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b border-border/50 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg 
                className="h-8 w-8 text-blue-500" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 21V3L12 12L21 3V21" 
                  fill="currentColor" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <span className="ml-2 text-xl font-bold">SafeCamp</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link 
              to="/map"
              className={cn(
                "flex items-center text-muted-foreground hover:text-foreground",
              )}
            >
              <MapPin className="mr-1 h-4 w-4" />
              Discover
            </Link>
            <Link 
              to="/messages"
              className="text-muted-foreground hover:text-foreground"
            >
              Messages
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/map")}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/profile">
              <Avatar>
                <AvatarImage src="/lovable-uploads/e227a530-8933-42cb-94f2-a78a64261f5c.png" />
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search campsites"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="mb-8">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/trip-planner")}
              >
                <Navigation className="mr-2 h-4 w-4 text-blue-500" />
                Plan a Trip
              </Button>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Popular Campsites</h2>
              
              <div className="space-y-4">
                {featuredCampsites.map((campsite) => (
                  <div key={campsite.id} className="mb-4">
                    <div className="overflow-hidden rounded-md mb-2">
                      {campsite.image_url ? (
                        <img 
                          src={campsite.image_url} 
                          alt={campsite.name} 
                          className="w-full h-48 object-cover rounded-md transition-transform hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null; 
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold">{campsite.name}</h3>
                    <p className="text-sm text-muted-foreground">provided by SafeCamp</p>
                  </div>
                ))}
              </div>
              
              <Button variant="link" className="mt-4 px-0" onClick={() => navigate("/map")}>
                View all
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h1 className="text-2xl font-bold mb-6">Recent Campsites</h1>
            
            <CampCard 
              title="Secluded Riverbank"
              description="A quiet, hidden spot by the river. Great for a peaceful night's sleep. Good cell service here too!"
              image=""
              author="Madison R"
              price={3.00}
              days={3}
              avatarSrc="https://i.pravatar.cc/150?img=25"
            />
            
            <CampCard 
              title="Mountain Meadow"
              description="A safe, open field with stunning mountain views. Stayed here last weekend."
              image=""
              author="Luke H"
              price="Free"
              days={5}
              avatarSrc="https://i.pravatar.cc/150?img=52"
            />
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Monetization</h2>
            
            <MonetizationCard 
              title="Share Your Spots"
              description="Post your top camping locations and earn from others unlocking them."
              image="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600"
            />
            
            <MonetizationCard 
              title="Subscribers"
              description="Share exclusive content with your subscribers for a monthly fee."
              image="/lovable-uploads/e227a530-8933-42cb-94f2-a78a64261f5c.png"
            />
            
            <MonetizationCard 
              title="Request Aid"
              description="Reach out to the community for support when you need it."
              image="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=600"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndexPage;
