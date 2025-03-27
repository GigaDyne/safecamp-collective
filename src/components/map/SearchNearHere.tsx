
import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMapContext } from "@/contexts/MapContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CampSite } from "@/lib/supabase";

interface SearchNearHereProps {
  onResultsFound: (results: any[]) => void;
}

const CATEGORIES = [
  "camping", "gas", "water", "dump", "grocery", "repair", "coffee", "rv", "walmart"
];

const SearchNearHere = ({ onResultsFound }: SearchNearHereProps) => {
  const { map, mapboxToken } = useMapContext();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim() && selectedCategories.length === 0) {
      toast({
        title: "Search query empty",
        description: "Please enter a search term or select a category",
        variant: "destructive",
      });
      return;
    }

    if (!map.current) {
      toast({
        title: "Map not initialized",
        description: "Please wait for the map to load before searching.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const center = map.current.getCenter();
      
      // Use the query or default to a category search if only categories are selected
      const searchTerm = query.trim() || (selectedCategories.includes("walmart") ? "walmart" : selectedCategories[0] || "");
      
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchTerm
      )}.json?proximity=${center.lng},${center.lat}&access_token=${mapboxToken}&limit=10`;

      console.log("Searching for:", searchTerm);
      console.log("Selected categories:", selectedCategories);
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        // Filter results by category if categories are selected
        let filteredResults = data.features;
        if (selectedCategories.length > 0) {
          filteredResults = data.features.filter((feature: any) => {
            // Extract potential category information from various sources
            const featureText = feature.text?.toLowerCase() || "";
            const placeName = feature.place_name?.toLowerCase() || "";
            const category = feature.properties?.category?.toLowerCase() || "";
            const placeType = feature.place_type?.map((t: string) => t.toLowerCase()) || [];
            
            // Check if any of the selected categories match
            return selectedCategories.some(cat => {
              const searchCat = cat.toLowerCase();
              return featureText.includes(searchCat) || 
                     placeName.includes(searchCat) || 
                     category.includes(searchCat) || 
                     placeType.includes(searchCat);
            });
          });
        }
        
        console.log("Found features:", data.features.length);
        console.log("Filtered features:", filteredResults.length);
        
        // Transform features to a format compatible with our app
        const formattedResults = filteredResults.map((feature: any) => ({
          id: feature.id,
          name: feature.text || "Unknown",
          description: feature.place_name || "",
          latitude: feature.center[1],
          longitude: feature.center[0],
          safetyRating: 3, // Default value
          cellSignal: 3, // Default value
          quietness: 3, // Default value
          source: "mapbox",
          type: selectedCategories.includes("walmart") ? "walmart" : 
                (feature.properties?.category || selectedCategories[0] || "poi")
        })) as CampSite[];

        onResultsFound(formattedResults);
        
        toast({
          title: "Search results",
          description: `Found ${formattedResults.length} results for "${searchTerm}"`,
        });
      } else {
        toast({
          title: "No results found",
          description: `No results found for "${searchTerm}" near this location.`,
        });
        onResultsFound([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "There was an error processing your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    // Auto search when categories are selected/deselected
    if (selectedCategories.length > 0) {
      handleSearch();
    }
  }, [selectedCategories]);

  return (
    <div className="bg-background/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg rounded-lg p-4 space-y-3 w-full max-w-xl border border-border">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for campsite, gas, coffee, etc."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10 pl-10"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isLoading || (!query.trim() && selectedCategories.length === 0)}
          variant="default"
          size="sm"
          className="shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SearchNearHere;
