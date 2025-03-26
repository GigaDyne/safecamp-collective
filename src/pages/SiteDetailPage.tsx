
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
import { mockCampSites, mockReviews } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const SiteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real app, we'd fetch this from an API
  const site = mockCampSites.find(site => site.id === id);
  const reviews = mockReviews.filter(review => review.siteId === id);
  
  useEffect(() => {
    // Simulate loading
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
  
  // Determine site safety class
  const getSafetyClass = (rating: number) => {
    if (rating >= 4) return "bg-safe text-white";
    if (rating >= 2.5) return "bg-caution text-white";
    return "bg-danger text-white";
  };
  
  // Animation variants
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
      {/* Header/Image Gallery */}
      <div className="relative w-full h-64">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${site.images[0]})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        {/* Top action bar */}
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
        
        {/* Image gallery indicator */}
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
      
      {/* Content Tabs */}
      <Tabs 
        defaultValue="details" 
        className="flex-1 flex flex-col"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="px-4 pt-2">
          <TabsList className="grid grid-cols-2 h-10">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
              {/* Title section */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <h1 className="text-2xl font-semibold leading-tight">{site.name}</h1>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{site.location}</span>
                </div>
              </motion.div>
              
              {/* Land Type */}
              <motion.div variants={itemVariants} className="flex gap-2">
                <span className="safety-tag bg-nature-light bg-opacity-10 text-nature-light">
                  {site.landType}
                </span>
                <span className={`safety-tag ${getSafetyClass(site.safetyRating)}`}>
                  Safety: {site.safetyRating.toFixed(1)}
                </span>
              </motion.div>
              
              {/* Description */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h2 className="text-base font-medium">About this site</h2>
                <p className="text-sm text-muted-foreground">
                  {site.description}
                </p>
              </motion.div>
              
              {/* Ratings */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-base font-medium">Site Information</h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Safety Rating */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center">
                        <Shield className="h-3.5 w-3.5 mr-1.5 text-safe" />
                        <span className="font-medium">Safety</span>
                      </div>
                      <div className="flex items-center">
                        <span>{site.safetyRating.toFixed(1)}</span>
                        <Star className="h-3 w-3 ml-0.5 text-muted-foreground" fill="currentColor" />
                      </div>
                    </div>
                    <Progress value={site.safetyRating * 20} className="h-1.5" />
                  </div>
                  
                  {/* Cell Signal */}
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
                  
                  {/* Accessibility */}
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
                  
                  {/* Quietness */}
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
              
              {/* Features */}
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
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* Reviews Summary */}
              <motion.div variants={itemVariants} className="bg-secondary/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">{site.safetyRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">
                      Based on {reviews.length} reviews
                    </p>
                  </div>
                  
                  <Button 
                    variant="default" 
                    className="h-9"
                    onClick={() => navigate(`/add-review/${id}`)}
                  >
                    Add Review
                  </Button>
                </div>
              </motion.div>
              
              {/* Review List */}
              <div className="space-y-5">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    variants={itemVariants}
                    className="bg-card/50 border border-border/50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          {review.userAvatar ? (
                            <img 
                              src={review.userAvatar} 
                              alt={review.userName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {review.userName.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium leading-none mb-1">{review.userName}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center safety-tag ${getSafetyClass(review.safetyRating)}`}>
                        <span>{review.safetyRating.toFixed(1)}</span>
                        <Star className="h-3 w-3 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    
                    <p className="text-sm mt-3">{review.comment}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((image, idx) => (
                          <div 
                            key={idx} 
                            className="w-16 h-16 rounded-md overflow-hidden bg-muted"
                          >
                            <img 
                              src={image} 
                              alt={`User upload ${idx}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Bottom action button */}
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
