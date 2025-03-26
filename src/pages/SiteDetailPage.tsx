import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  Wifi, 
  Volume2, 
  Shield, 
  MessageSquare,
  Image,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCampSites } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCampSiteReviews } from "@/hooks/useCampSites";
import ReviewsList from "@/components/reviews/ReviewsList";
import FlagSiteDialog from "@/components/flags/FlagSiteDialog";

const SiteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  
  const site = mockCampSites.find(site => site.id === id);
  
  const { reviews } = useCampSiteReviews(id || "");
  
  const averageSafetyRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.safetyRating, 0) / reviews.length
    : site?.safetyRating || 0;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p>Campsite not found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  const getSafetyClass = (rating: number) => {
    if (rating >= 4) return "bg-safe text-white";
    if (rating >= 2.5) return "bg-caution text-white";
    return "bg-danger text-white";
  };

  const handleAddReview = () => {
    navigate(`/add-review/${id}`);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      <div className="relative w-full h-64">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${site.images[0]})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="absolute top-0 left-0 right-0 flex justify-between p-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/40"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/40"
              onClick={() => {}}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full backdrop-blur-md",
                isFavorite 
                  ? "bg-danger/80 text-white hover:bg-danger/90" 
                  : "bg-black/30 text-white hover:bg-black/40"
              )}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {site.images.map((_, index) => (
            <div 
              key={index} 
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === 0 ? "bg-white" : "bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
      
      <Tabs 
        defaultValue="details" 
        className="flex-1 flex flex-col"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="px-4 pt-2">
          <TabsList className="grid grid-cols-2 h-10">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews" className="relative">
              Reviews
              {reviews.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {reviews.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent 
          value="details" 
          className="flex-1 overflow-auto no-scrollbar px-4 pb-20 pt-2"
          forceMount
          hidden={activeTab !== "details"}
        >
          {isLoading ? (
            <div className="space-y-4 pt-2">
              <div className="h-8 bg-muted animate-pulse rounded-md w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded-md w-1/2" />
              <div className="h-20 bg-muted animate-pulse rounded-md" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded-md w-1/3" />
                <div className="h-12 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="space-y-1.5">
                <h1 className="text-2xl font-semibold leading-tight">{site.name}</h1>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{site.location}</span>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex gap-2">
                <span className="safety-tag bg-nature-light bg-opacity-10 text-nature-light">
                  {site.landType}
                </span>
                <span className={`safety-tag ${getSafetyClass(averageSafetyRating)}`}>
                  Safety: {averageSafetyRating.toFixed(1)}
                </span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <h2 className="text-base font-medium">About this site</h2>
                <p className="text-sm text-muted-foreground">
                  {site.description}
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-base font-medium">Site Information</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center">
                        <Shield className="h-3.5 w-3.5 mr-1.5 text-safe" />
                        <span className="font-medium">Safety</span>
                      </div>
                      <div className="flex items-center">
                        <span>{averageSafetyRating.toFixed(1)}</span>
                        <Star className="h-3 w-3 ml-0.5 text-muted-foreground" fill="currentColor" />
                      </div>
                    </div>
                    <Progress value={averageSafetyRating * 20} className="h-1.5" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center">
                        <Wifi className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="font-medium">Cell Signal</span>
                      </div>
                      <div className="flex items-center">
                        <span>{site.cellSignal.toFixed(1)}</span>
                        <Star className="h-3 w-3 ml-0.5 text-muted-foreground" fill="currentColor" />
                      </div>
                    </div>
                    <Progress value={site.cellSignal * 20} className="h-1.5" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="font-medium">Accessibility</span>
                      </div>
                      <div className="flex items-center">
                        <span>{site.accessibility.toFixed(1)}</span>
                        <Star className="h-3 w-3 ml-0.5 text-muted-foreground" fill="currentColor" />
                      </div>
                    </div>
                    <Progress value={site.accessibility * 20} className="h-1.5" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center">
                        <Volume2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span className="font-medium">Quietness</span>
                      </div>
                      <div className="flex items-center">
                        <span>{site.quietness.toFixed(1)}</span>
                        <Star className="h-3 w-3 ml-0.5 text-muted-foreground" fill="currentColor" />
                      </div>
                    </div>
                    <Progress value={site.quietness * 20} className="h-1.5" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-base font-medium">Features & Amenities</h2>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {site.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {site && (
                <motion.div variants={itemVariants} className="flex justify-center">
                  <FlagSiteDialog siteId={site.id} siteName={site.name} />
                </motion.div>
              )}
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent 
          value="reviews" 
          className="flex-1 overflow-auto no-scrollbar px-4 pb-20 pt-2"
          forceMount
          hidden={activeTab !== "reviews"}
        >
          {isLoading ? (
            <div className="space-y-4 pt-2">
              <div className="h-20 bg-muted animate-pulse rounded-md" />
              <div className="h-20 bg-muted animate-pulse rounded-md" />
              <div className="h-20 bg-muted animate-pulse rounded-md" />
            </div>
          ) : (
            <ReviewsList 
              reviews={reviews} 
              averageSafety={averageSafetyRating}
              onAddReview={handleAddReview}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
        <Button 
          className="w-full h-12 rounded-full shadow-lg"
          onClick={() => navigate(`/directions/${id}`)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Navigate to this spot
        </Button>
      </div>
    </div>
  );
};

export default SiteDetailPage;
