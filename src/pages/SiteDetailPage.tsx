
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Signal, Shield, Volume2, Accessibility, Flag, Heart, HeartOff, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReviewsList from "@/components/reviews/ReviewsList";
import { fetchCampSiteById } from "@/lib/campsites";
import { canAccessPremiumCampsite } from "@/lib/premium-campsites";
import { useCampSiteReviews } from "@/hooks/useCampSites";
import FlagSiteDialog from "@/components/flags/FlagSiteDialog";
import PremiumCampsiteSection from "@/components/premium/PremiumCampsiteSection";
import { useAuth } from "@/providers/AuthProvider";

const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const { user } = useAuth();
  
  const siteId = id || "";

  // Fetch the campsite details
  const { data: site, isLoading } = useQuery({
    queryKey: ['campsite', siteId],
    queryFn: () => fetchCampSiteById(siteId),
    enabled: !!siteId
  });

  // Fetch the campsite reviews
  const { reviews, isLoading: isLoadingReviews } = useCampSiteReviews(siteId);

  // Check if can access premium content
  const { data: canAccess = false, isLoading: isCheckingAccess } = useQuery({
    queryKey: ['premiumAccess', siteId],
    queryFn: () => canAccessPremiumCampsite(siteId),
    enabled: !!siteId && !!user
  });

  // Check if the site is in favorites
  useEffect(() => {
    if (!site) return;
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((fav: any) => fav.id === site.id));
  }, [site]);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleFavorite = () => {
    if (!site) return;
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: any) => fav.id !== site.id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      favorites.push(site);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 rounded-lg bg-muted/30 animate-pulse flex flex-col items-center">
          <div className="h-6 w-3/4 bg-muted mb-4 rounded"></div>
          <div className="h-4 w-1/2 bg-muted mb-8 rounded"></div>
          <div className="h-32 w-full bg-muted mb-4 rounded"></div>
          <div className="h-4 w-full bg-muted mb-2 rounded"></div>
          <div className="h-4 w-5/6 bg-muted mb-2 rounded"></div>
          <div className="h-4 w-2/3 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Campsite Not Found</h1>
        </div>
        <p>Sorry, we couldn't find the campsite you're looking for.</p>
        <Button onClick={() => navigate("/map")} className="mt-4">
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      {/* Header with back button and title */}
      <div className="flex items-center mb-2">
        <Button variant="ghost" onClick={handleBack} className="mr-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold truncate">{site.name}</h1>
      </div>

      {/* Location */}
      <div className="flex items-center text-muted-foreground mb-4 text-sm">
        <MapPin className="h-4 w-4 mr-1" />
        <span>{site.location}</span>
      </div>

      {/* Image gallery or placeholder */}
      <div className="rounded-lg overflow-hidden mb-6 bg-muted h-48 md:h-64">
        {site.images && site.images.length > 0 ? (
          <img
            src={site.images[0]}
            alt={site.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <span className="text-muted-foreground">No images available</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex mb-6 space-x-2">
        <Button
          variant={isFavorite ? "destructive" : "outline"}
          onClick={toggleFavorite}
          className="flex-1"
        >
          {isFavorite ? (
            <>
              <HeartOff className="mr-2 h-4 w-4" /> Remove from Saved
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" /> Save Campsite
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFlagDialog(true)}
          className="flex-1"
        >
          <Flag className="mr-2 h-4 w-4" /> Report Issue
        </Button>
      </div>

      {/* Tabs for Info and Reviews */}
      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="info" className="flex-1">
            Info
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">
            Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Premium
          </TabsTrigger>
        </TabsList>

        {/* Info Tab Content */}
        <TabsContent value="info" className="space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-medium mb-2">About</h2>
            <p>{site.description || "No description available for this campsite."}</p>
          </div>

          {/* Ratings */}
          <div>
            <h2 className="text-lg font-medium mb-3">Ratings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <div className="font-medium">Safety</div>
                  <div className="text-sm text-muted-foreground">
                    {site.safetyRating}/5
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Signal className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <div className="font-medium">Cell Signal</div>
                  <div className="text-sm text-muted-foreground">
                    {site.cellSignal}/5
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Volume2 className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <div className="font-medium">Quietness</div>
                  <div className="text-sm text-muted-foreground">
                    {site.quietness}/5
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Accessibility className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <div className="font-medium">Accessibility</div>
                  <div className="text-sm text-muted-foreground">
                    {site.accessibility}/5
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-lg font-medium mb-3">Features</h2>
            {site.features && site.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {site.features.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No features listed for this campsite.</p>
            )}
          </div>

          {/* Write Review CTA */}
          <div className="pt-4">
            <Separator className="my-4" />
            <div className="flex justify-center">
              <Button onClick={() => navigate(`/review/${site.id}`)}>
                Write a Review
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Reviews Tab Content */}
        <TabsContent value="reviews">
          <ReviewsList
            reviews={reviews}
            isLoading={isLoadingReviews}
            onWriteReview={() => navigate(`/review/${site.id}`)}
          />
        </TabsContent>
        
        {/* Premium Tab Content */}
        <TabsContent value="premium">
          <PremiumCampsiteSection campsite={site} />
        </TabsContent>
      </Tabs>

      {/* Flag dialog */}
      <FlagSiteDialog
        isOpen={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        siteId={site.id}
      />
    </div>
  );
};

export default SiteDetailPage;
