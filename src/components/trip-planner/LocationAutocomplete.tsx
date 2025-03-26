
import { useState, useEffect, useRef } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: { placeName: string; coordinates: string }) => void;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

const LocationAutocomplete = ({
  placeholder,
  value,
  onChange,
  onLocationSelect,
  icon,
  onIconClick
}: LocationAutocompleteProps) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    const mapboxToken = localStorage.getItem("mapbox_token");
    if (!mapboxToken) {
      toast({
        title: "Missing Mapbox Token",
        description: "Please set your Mapbox token in settings",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxToken}&types=place,address,poi&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location suggestions");
      }

      const data = await response.json();
      setSuggestions(data.features);
      setIsOpen(data.features.length > 0);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch location suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce API calls
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const coordinates = `${suggestion.center[0]},${suggestion.center[1]}`;
    onChange(suggestion.place_name);
    onLocationSelect({
      placeName: suggestion.place_name,
      coordinates: coordinates
    });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onClick={() => value && suggestions.length > 0 && setIsOpen(true)}
            className="w-full pr-10"
          />
          {icon && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={onIconClick}
              type="button"
            >
              {icon}
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ul className="max-h-[300px] overflow-auto py-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left px-3 py-2 h-auto"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{suggestion.place_name}</span>
                </Button>
              </li>
            ))}
            {suggestions.length === 0 && value.length >= 3 && (
              <li className="px-3 py-2 text-muted-foreground text-sm">
                No suggestions found
              </li>
            )}
            {value.length < 3 && (
              <li className="px-3 py-2 text-muted-foreground text-sm">
                Type at least 3 characters to search
              </li>
            )}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default LocationAutocomplete;
