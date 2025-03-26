
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Star, 
  MapPin, 
  Wifi, 
  Heart,
  Search,
  Filter,
  Shield,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockCampSites } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// In a real app, we'd get favorites from API/storage
const favoriteSites = mockCampSites.slice(0, 3);

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState(favoriteSites);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredFavorites(
        favoriteSites.filter(
          site => 
            site.name.toLowerCase().includes(query) || 
            site.location.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredFavorites(favoriteSites);
    }
  }, [searchQuery]);
  
  // Determine site safety class
  const getSafetyClass = (rating: number) => {
    if (rating >= 4) return "bg-safe text-white";
    if (rating >= 2.5) return "bg-caution text-white";
    return "bg-danger text-white";
  };
  
  const removeFromFavorites = (e: React.MouseEvent, siteId: string) => {
    e.stopPropagation();
    // In a real app, we'd remove from favorites in API/storage
    setFilteredFavorites(filteredFavorites.filter(site => site.id !== siteId));
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
    <div className="flex flex-col h-full bg-background pb-16">
      {/* Header/Search */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-4 pb-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search saved campsites"
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-11 w-11"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Favorites List */}
      <div className="flex-1 overflow-auto px-4 pt-2 no-scrollbar">
        {isLoading ? (
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-36 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 pb-6"
          >
            {filteredFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No saved campsites</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Sites you save will appear here for quick access
                </p>
                
                <Button 
                  variant="default"
                  className="mt-4"
                  onClick={() => navigate('/')}
                >
                  Browse Map
                </Button>
              </div>
            ) : (
              filteredFavorites.map((site) => (
                <motion.div
                  key={site.id}
                  variants={itemVariants}
                  className="bg-card border border-border/40 rounded-lg overflow-hidden shadow-sm"
                  onClick={() => navigate(`/site/${site.id}`)}
                >
                  <div className="flex h-36">
                    {/* Site Image */}
                    <div className="w-1/3 h-full">
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${site.images[0]})`
                        }}
                      />
                    </div>
                    
                    {/* Site Info */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium line-clamp-1">{site.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 -mr-1 -mt-1 text-danger"
                            onClick={(e) => removeFromFavorites(e, site.id)}
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{site.location}</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {site.description}
                        </p>
                      </div>
                      
                      {/* Ratings */}
                      <div className="flex gap-3 mt-2">
                        <div className={`flex items-center text-xs py-0.5 px-2 rounded-full ${getSafetyClass(site.safetyRating)}`}>
                          <span className="mr-0.5">{site.safetyRating.toFixed(1)}</span>
                          <Star className="h-3 w-3" fill="currentColor" />
                        </div>
                        
                        <div className="flex items-center text-xs">
                          <Wifi className="h-3 w-3 mr-1 text-primary" />
                          <span>{site.cellSignal.toFixed(1)}</span>
                        </div>
                        
                        <div className="text-xs px-1.5 py-0.5 bg-secondary rounded">
                          {site.landType}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
